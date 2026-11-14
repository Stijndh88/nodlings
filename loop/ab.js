#!/usr/bin/env node
// Replicated paired A/B for one code change. See loop/RULES.md.
//
//   control   = the sim files at --base (default HEAD)
//   treatment = the sim files in the working tree
//
// Two kinds of test:
//   --instant    0 ticks. The SAME living gene pool sits the skill probes under both
//                code versions (replicate r uses its own probe seeds). Answers "does
//                this change help or hurt today's Nodlings right now?" in ~3 minutes.
//   (default)    evolution test. Both arms resume the same world snapshot, replicate r
//                shifts the RNG stream by the same amount in both (--perturb=r), runs
//                --ticks, then sits the probes. Answers "does evolution under this
//                change produce better Nodlings?" It needs many generations, so the
//                real ones run on GitHub Actions (see loop/experiments.js).
//
// One run of each arm tells you nothing: identical code on a shifted stream moves
// most metrics by 5-55% (run --aa to see). So the verdict comes from the paired
// differences across replicates: t = mean / standard error. A metric is "better"
// or "worse" only when |t| clears the one-sided 5% critical value for the number
// of replicates AND the change is at least min_effect_pct; otherwise "no-effect".
//
//   node loop/ab.js --instant --target=probes.evolved
//   node loop/ab.js --aa                               (noise floor: control vs control)
//   flags: --base=REF --treatment-code=DIR --replicates=N --ticks=N --jobs=N
//          --work=DIR --out=FILE --quick
//
// Finished runs are cached in --work, keyed by the code and snapshot of both arms:
// if the command is cut off, run the same command again and it resumes.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawn, execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const { SIM_FILES } = require('./sim-files');
const arg = (name, fallback) => { const m = process.argv.find(a => a.startsWith(`--${name}=`)); return m ? m.slice(name.length + 3) : fallback; };
const flag = name => process.argv.includes(`--${name}`);

const rules = JSON.parse(fs.readFileSync(path.join(__dirname, 'RULES.md'), 'utf8').match(/```json\n([\s\S]*?)\n```/)[1]);
const cfg = rules.ab || {};
const instant = flag('instant');
const R = +arg('replicates', instant ? (cfg.instant_replicates || 4) : (cfg.replicates || 5));
const ticks = instant ? 0 : +arg('ticks', cfg.ticks || 60000);
const minEffect = +arg('min-effect', cfg.min_effect_pct ?? 2);
// one-sided 5% critical t for df = R - 1
const T_CRIT = [null, 6.31, 2.92, 2.35, 2.13, 2.02, 1.94, 1.89, 1.86, 1.83];
const keepT = R - 1 < T_CRIT.length ? (T_CRIT[R - 1] || Infinity) : 1.8;
const base = arg('base', 'HEAD');
const treatDir = path.resolve(arg('treatment-code', ROOT));
const aa = flag('aa'), quick = flag('quick');
// --simplify: for changes that REMOVE something (a reward bonus, a special case). Kept unless measurably worse.
const simplify = flag('simplify');
const targets = arg('target', 'probes.evolved').split(',');
const jobs = +arg('jobs', Math.max(1, Math.min(os.cpus().length, 2 * R)));
const PRIMARY = 'probes.evolved';

// ---- the two arms ----
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const treatSrc = SIM_FILES.map(f => fs.readFileSync(path.join(f === 'metrics.js' ? ROOT : treatDir, f), 'utf8'));
const ctrlSrc = SIM_FILES.map((f, i) => {
  if (aa) return treatSrc[i];
  try { return execFileSync('git', ['show', `${base}:${f}`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26 }); }
  catch (e){ return treatSrc[i]; } // file is new in the treatment
});
const changed = SIM_FILES.filter((f, i) => f !== 'metrics.js' && ctrlSrc[i] !== treatSrc[i]);
const snapshot = fs.readFileSync(path.join(__dirname, 'world.json.gz'));
const key = crypto.createHash('sha1').update(JSON.stringify([ctrlSrc, treatSrc, ticks, quick, aa, instant, cfg.probe_cohort, read('loop/run-headless.js'), JSON.stringify(rules.probes)])).update(snapshot).digest('hex').slice(0, 12);
const work = path.resolve(arg('work', path.join(os.tmpdir(), 'nodlings-ab')), key);
const ctrlDir = path.join(work, 'control-code');
fs.mkdirSync(ctrlDir, { recursive: true });
SIM_FILES.forEach((f, i) => fs.writeFileSync(path.join(ctrlDir, f), ctrlSrc[i]));

// In --aa mode the "treatment" is the same code on a different stream (replicate r + R),
// which measures how far two runs of identical code drift apart.
const runs = [];
for (let r = 1; r <= R; r++){
  runs.push({ arm: 'control', r, perturb: r, code: ctrlDir });
  runs.push({ arm: 'treatment', r, perturb: aa ? r + R : r, code: aa ? ctrlDir : treatDir });
}
const outOf = run => path.join(work, `${run.arm}-${run.r}.json`);

function exec(run){
  return new Promise(resolve => {
    if (fs.existsSync(outOf(run))) return resolve();
    const dir = path.join(work, `state-${run.arm}-${run.r}`);
    const args = [path.join(__dirname, 'run-headless.js'), '--dry', '--bench', '--no-random', `--ticks=${ticks}`,
      instant ? `--seed-shift=${run.r}` : `--perturb=${run.perturb}`, `--code=${run.code}`, `--dir=${dir}`, `--out=${outOf(run)}.tmp`];
    if (quick) args.push('--quick');
    else if (!instant && cfg.probe_cohort) args.push(`--probe-cohort=${cfg.probe_cohort}`); // long runs: a bigger sample, so the verdict is not sampling noise
    const t0 = Date.now();
    const child = spawn(process.execPath, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    child.stderr.on('data', d => { err += d; });
    child.on('close', () => {
      if (fs.existsSync(`${outOf(run)}.tmp`)) fs.renameSync(`${outOf(run)}.tmp`, outOf(run));
      else run.error = err.slice(-400) || 'no metrics written';
      fs.rmSync(dir, { recursive: true, force: true });
      console.error(`  ${run.arm} #${run.r} ${run.error ? 'FAILED' : 'done'} in ${Math.round((Date.now() - t0) / 1000)}s`);
      resolve();
    });
  });
}

const get = (o, k) => k.split('.').reduce((v, p) => (v == null ? v : v[p]), o);
const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
const sd = a => { if (a.length < 2) return 0; const m = mean(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1)); };
const METRICS = ['probes.evolved', 'probes.base', 'probes.scarce', 'probes.thirst', 'probes.learningGain', 'probes.memoryGain',
  'probes.handsGain', 'probes.socialGain', 'probes.alive', 'probes.badMealShare',
  'population', 'medianFitness', 'avgBrain', 'badMealShare', 'techniques', 'toolTechniques', 'wallShare', 'canReachWater'];

(async () => {
  const todo = runs.filter(run => !fs.existsSync(outOf(run)));
  console.error(`A/B ${key}: ${aa ? 'A/A noise floor' : `${base} vs ${treatDir === ROOT ? 'working tree' : treatDir} (${changed.join(', ') || 'no sim change'})`}, ${instant ? 'instant, ' : ''}${R} replicates x ${ticks} ticks, ${todo.length}/${runs.length} runs to do, ${jobs} at a time`);
  const queue = todo.slice();
  await Promise.all(Array.from({ length: jobs }, async () => { while (queue.length) await exec(queue.shift()); }));
  const failed = runs.filter(run => run.error || !fs.existsSync(outOf(run)));
  if (failed.length){
    console.log(JSON.stringify({ decision: 'revert', pass: false, reasons: failed.map(f => `${f.arm} #${f.r} crashed: ${f.error || 'no output'}`) }, null, 2));
    process.exit(1);
  }
  const load = arm => runs.filter(x => x.arm === arm).map(x => JSON.parse(fs.readFileSync(outOf(x), 'utf8')));
  const C = load('control'), T = load('treatment');

  const table = {};
  for (const m of METRICS){
    const c = C.map(x => get(x, m)), t = T.map(x => get(x, m));
    if (![...c, ...t].every(Number.isFinite)) continue;
    const d = t.map((v, i) => v - c[i]);
    const se = sd(d) / Math.sqrt(d.length), md = mean(d);
    const tstat = se > 0 ? md / se : (md === 0 ? 0 : Math.sign(md) * Infinity);
    table[m] = { control: +mean(c).toFixed(4), treatment: +mean(t).toFixed(4), diff: +md.toFixed(4),
      pct: mean(c) ? +(100 * md / Math.abs(mean(c))).toFixed(1) : null,
      noise: +sd(c).toFixed(4), t: Number.isFinite(tstat) ? +tstat.toFixed(2) : (tstat > 0 ? 99 : -99),
      verdict: Math.abs(100 * md / (Math.abs(mean(c)) || 1)) < minEffect ? 'no-effect' : tstat >= keepT ? 'better' : tstat <= -keepT ? 'worse' : 'no-effect' };
  }

  // ---- guardrails (hard revert) ----
  const g = rules.guardrails, reasons = [];
  for (const [i, x] of T.entries()){
    if (x.population < g.min_population) reasons.push(`treatment #${i + 1}: population ${x.population} < min ${g.min_population}`);
    if (!Object.values(x).every(v => v === null || typeof v === 'object' || Number.isFinite(v))) reasons.push(`treatment #${i + 1}: non-finite metric`);
  }
  const drop = m => table[m] ? -table[m].pct : 0;
  if (drop('population') > g.max_population_drop_pct) reasons.push(`population dropped ${drop('population')}% (max ${g.max_population_drop_pct}%)`);
  if (table[PRIMARY] && table[PRIMARY].verdict === 'worse' && drop(PRIMARY) > g.max_skill_drop_pct) reasons.push(`probe score dropped ${drop(PRIMARY)}% (max ${g.max_skill_drop_pct}%)`);

  // keep = every target measurably better, nothing broken, the primary score not measurably worse
  const missing = targets.filter(m => !table[m]);
  const targetsBetter = !missing.length && targets.every(m => table[m].verdict === 'better');
  const primaryWorse = table[PRIMARY] && table[PRIMARY].verdict === 'worse';
  const pass = reasons.length === 0;
  const targetsWorse = targets.some(m => table[m] && table[m].verdict === 'worse');
  const decision = aa ? 'n/a (noise floor)' : simplify ? (pass && !primaryWorse && !targetsWorse ? 'keep' : 'revert') : (pass && targetsBetter && !primaryWorse ? 'keep' : 'revert');
  const why = aa ? 'identical code on shifted streams: read the noise column' :
    !pass ? 'guardrail tripped' : missing.length ? `unknown target metric ${missing.join(', ')}` :
    primaryWorse ? `${PRIMARY} is measurably worse` :
    simplify ? (targetsWorse ? 'the simplification measurably hurts the target' : 'simplification: nothing got measurably worse, so the simpler rules win') :
    targetsBetter ? `target ${targets.join(', ')} is measurably better (t >= ${keepT})` :
    `no measurable gain on ${targets.join(', ')}: a change that cannot show its effect is not kept`;

  // An instant test is only a screen: evolution has had no time to exploit the change.
  const screen = instant && !aa;
  const finalDecision = screen ? (pass ? 'submit' : 'revert') : decision;
  const finalWhy = screen ? (pass ? `screen passed (immediate effect on ${targets.join(', ')}: ${targets.map(m => table[m] ? table[m].verdict : 'n/a').join(', ')}); submit it as an evolution experiment` : 'guardrail tripped') : why;
  const result = { key, mode: instant ? 'instant' : 'evolution', base: aa ? 'A/A' : base, changed, replicates: R, ticks, tCritical: keepT, targets, decision: finalDecision, why: finalWhy, pass, reasons, metrics: table };
  const outFile = arg('out', path.join(work, 'result.json'));
  fs.writeFileSync(outFile, JSON.stringify(result, null, 2));

  const pad = (s, n) => String(s).padEnd(n);
  console.log(`\n${pad('metric', 22)}${pad('control', 11)}${pad('treatment', 11)}${pad('diff', 10)}${pad('%', 8)}${pad('noise(sd)', 11)}${pad('t', 8)}verdict`);
  for (const [m, v] of Object.entries(table))
    console.log(`${pad(m, 22)}${pad(v.control, 11)}${pad(v.treatment, 11)}${pad(v.diff, 10)}${pad(v.pct ?? '', 8)}${pad(v.noise, 11)}${pad(v.t, 8)}${v.verdict}${targets.includes(m) ? '  <- target' : ''}`);
  console.log(`\nCHANGELOG line: ${Object.entries(table).filter(([m]) => targets.includes(m) || m === PRIMARY || m === 'probes.learningGain').map(([m, v]) => `${m} ${v.control} -> ${v.treatment} (${v.pct}%, t=${v.t}, ${v.verdict})`).join('; ')}; ${R} replicates x ${ticks} ticks.`);
  console.log(JSON.stringify({ decision: finalDecision, why: finalWhy, pass, reasons, result: outFile }, null, 2));
})();
