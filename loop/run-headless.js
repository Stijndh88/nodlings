#!/usr/bin/env node
// Headless batch runner for the Nodlings autonomous loop. Loads the DOM-free
// sim files into a vm context, resumes the *continuous world* (world.json) plus
// the hall of fame (storage.json), runs a batch of ticks, then measures, appends
// to history.jsonl and prints a guardrail verdict. See loop/RULES.md.
//
// Flags:  --ticks=N  --dir=PATH (state dir, default loop/)  --dry (write nothing)
//         --out=FILE (write metrics JSON)  --compare=FILE (guardrail baseline)
//         --bench / --no-bench (skill probes; default on unless --dry)
//         --perturb=N (shift the RNG stream after resume: replicate N of an A/B)
//         --code=DIR (load the sim files from another checkout: the A/B control arm)
//         --seed-shift=N (probe on seeds + N*1000)
//         --no-random (skip the random-genome reference cohorts)  --quick (tiny probes, CI only)
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const zlib = require('zlib');
const { execSync } = require('child_process');
const { renderProgress, renderDashboard, renderMarkdown } = require('./report');

const ROOT = path.join(__dirname, '..');
const LOOP = __dirname;
const SIM_FILES = ['brain.js', 'world.js', 'selftest.js', 'nodling.js', 'critters.js', 'predators.js', 'observer.js', 'sim.js', 'metrics.js'];

function arg(name, fallback){
  const m = process.argv.find(a => a.startsWith(`--${name}=`));
  return m ? m.slice(name.length + 3) : fallback;
}
const flag = name => process.argv.includes(`--${name}`);
const readJSON = (file, fallback) => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch(e){ return fallback; } };

function loadRules(){
  const text = fs.readFileSync(path.join(LOOP, 'RULES.md'), 'utf8');
  const m = text.match(/```json\n([\s\S]*?)\n```/);
  if (!m) throw new Error('RULES.md: no ```json config block found');
  return JSON.parse(m[1]);
}

// A fresh sandbox with the sim loaded. `store` backs localStorage.
function makeContext(store){
  const localStorage = {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
  };
  const context = vm.createContext({ console, localStorage, Date, Math, JSON });
  // metrics.js (the exam) always comes from this checkout, so both A/B arms sit the same exam
  for (const file of SIM_FILES) vm.runInContext(fs.readFileSync(path.join(file === 'metrics.js' ? ROOT : CODE, file), 'utf8'), context, { filename: file });
  return context;
}

const CODE = path.resolve(arg('code', ROOT));
const rules = loadRules();
const dir = path.resolve(arg('dir', LOOP));
fs.mkdirSync(dir, { recursive: true });
const dry = flag('dry');
const ticks = +arg('ticks', rules.batch_ticks);
const comparePath = arg('compare', null);
const wantBench = flag('bench') || (!dry && !flag('no-bench'));
const baseline = comparePath ? readJSON(comparePath, null) : null; // read before any write

const storagePath = path.join(dir, 'storage.json');
const worldPath = path.join(dir, 'world.json.gz');
const statePath = path.join(dir, 'state.json');
// first run in a fresh --dir: seed from the committed loop state
const seedFrom = f => { const t = path.join(dir, f), s = path.join(LOOP, f); if (dir !== LOOP && !fs.existsSync(t) && fs.existsSync(s)) fs.copyFileSync(s, t); };
['storage.json', 'world.json.gz', 'state.json'].forEach(seedFrom);

const store = readJSON(storagePath, {});
const context = makeContext(store);

if (!context.selfTest()){
  console.log(JSON.stringify({ pass: false, reasons: ['self-test failed'] }, null, 2));
  process.exit(1);
}
context.loadProgress();
context.loadObserver();
const state = readJSON(statePath, { cycle: 0, lastRun: null, tick: 0 });

// world/nodlings/... are let-declared in sim.js: not properties of `context`, so
// anything touching them runs inside the context. Function declarations
// (simTick, snapshotWorld, loopMetrics...) do attach and are called directly.
if (fs.existsSync(worldPath)){
  context.restoreWorld(zlib.gunzipSync(fs.readFileSync(worldPath)).toString('utf8'));
} else {
  vm.runInContext(`
    world = new World(${+rules.world_seed});
    world.tick = ${state.tick};
    seed(START_POP);
    spawnCritters(world, critters, START_CRITTERS);
    spawnPredators(world, predators, START_PREDATORS);
  `, context, { filename: 'bootstrap' });
}

const perturb = +arg('perturb', 0);
if (perturb) vm.runInContext(`world.rng.setState((world.rng.getState() + ${perturb} * 0x9E3779B9) >>> 0)`, context);

for (let i = 0; i < ticks; i++) context.simTick();

const metrics = context.loopMetrics();
metrics.worldTick = vm.runInContext('world.tick', context);

// ---- skill probes: fixed seeds, fresh sandbox per cohort (see metrics.js) ----
// The evolved cohort is a fitness-stratified sample of the CURRENT living gene pool.
// `skill` (evolved minus random, averaged over the exam tasks) is the headline;
// learningGain / memoryGain say what plasticity and memory are worth to these brains.
if (wantBench){
  const p = Object.assign({}, flag('quick') ? { ticks: 300, cohort: 8, seeds: [101] } : rules.probes);
  const shift = +arg('seed-shift', 0);            // instant A/B: replicate r sits the exam on its own seeds
  if (shift) p.seeds = p.seeds.map(s => s + shift * 1000);
  const genomes = JSON.stringify(vm.runInContext(`(function(){ const L = nodlings.slice().sort((a,b)=>(a.age+250*a.offspring)-(b.age+250*b.offspring)); const K = Math.min(${p.cohort}, L.length), out = []; for (let i = 0; i < K; i++) out.push(L[Math.floor((i+0.5)*L.length/K)].genome); return out; })()`, context) || []);
  const score = (useGenomes, wseed, task) => {
    const c = makeContext({});
    return vm.runInContext(`(function(){
      ${useGenomes ? `const G = ${genomes}; reindexFromGenomes(G);` : 'const G = null;'}
      return probeCohort(G, ${wseed}, ${p.ticks}, ${p.cohort}, '${task}');
    })()`, c);
  };
  const avg = (useGenomes, task) => Math.round(p.seeds.reduce((s, seed) => s + score(useGenomes, seed, task), 0) / p.seeds.length);
  const TASKS = ['base', 'scarce', 'thirst'], withRandom = !flag('no-random');
  const pr = {};
  for (const t of TASKS) pr[t] = avg(true, t);
  pr.noLearning = avg(true, 'noLearning');
  pr.noMemory = avg(true, 'noMemory');
  pr.evolved = Math.round(TASKS.reduce((s, t) => s + pr[t], 0) / TASKS.length);
  if (withRandom){
    pr.random = Math.round(TASKS.reduce((s, t) => s + avg(false, t), 0) / TASKS.length);
    pr.skill = pr.evolved - pr.random;
  }
  pr.learningGain = pr.base - pr.noLearning;
  pr.memoryGain = pr.base - pr.noMemory;
  metrics.probes = pr;
}

// ---- guardrails ----
const g = rules.guardrails, reasons = [];
const finite = Object.values(metrics).every(v => v === null || typeof v === 'object' || Number.isFinite(v));
if (!finite) reasons.push('non-finite metric (NaN)');
if (metrics.population < g.min_population) reasons.push(`population ${metrics.population} < min ${g.min_population}`);
const dropPct = (before, after) => before > 0 ? 100 * (before - after) / before : 0;
if (baseline){
  // Median fitness of the living population is age-driven and swings with turnover,
  // so it is only a guardrail in paired --dry A/B runs (same snapshot), never across batches.
  if (dry && baseline.medianFitness != null && dropPct(baseline.medianFitness, metrics.medianFitness) > g.max_fitness_drop_pct)
    reasons.push(`median fitness dropped ${dropPct(baseline.medianFitness, metrics.medianFitness).toFixed(1)}% (max ${g.max_fitness_drop_pct}%)`);
  const bp = baseline.population;
  if (bp != null && dropPct(bp, metrics.population) > g.max_population_drop_pct)
    reasons.push(`population dropped ${dropPct(bp, metrics.population).toFixed(1)}% (max ${g.max_population_drop_pct}%)`);
  if (baseline.probes && metrics.probes && dropPct(baseline.probes.evolved, metrics.probes.evolved) > g.max_skill_drop_pct)
    reasons.push(`probe score dropped ${dropPct(baseline.probes.evolved, metrics.probes.evolved).toFixed(1)}% (max ${g.max_skill_drop_pct}%)`);
}

const outFile = arg('out', null);
if (outFile) fs.writeFileSync(outFile, JSON.stringify(metrics, null, 2));

if (!dry){
  context.saveProgress();
  context.saveObserver();
  fs.writeFileSync(storagePath, JSON.stringify(store, null, 2));
  fs.writeFileSync(worldPath, zlib.gzipSync(context.snapshotWorld(), { level: 9 }));
  fs.writeFileSync(statePath, JSON.stringify({ cycle: state.cycle + 1, lastRun: new Date().toISOString(), tick: metrics.worldTick }, null, 2));
  fs.writeFileSync(path.join(dir, 'observations.md'), context.observerMarkdown());
  fs.writeFileSync(path.join(dir, 'metrics.json'), JSON.stringify(metrics, null, 2));
  let commit = null;
  try { commit = execSync('git rev-parse --short HEAD', { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch(e){}
  const histPath = path.join(dir, 'history.jsonl');
  fs.appendFileSync(histPath, JSON.stringify({ cycle: state.cycle + 1, commit, at: new Date().toISOString(), ticks, ...metrics }) + '\n');
  const history = fs.readFileSync(histPath, 'utf8').trim().split('\n').map(l => JSON.parse(l));
  const svg = renderProgress(history);
  fs.writeFileSync(path.join(dir, 'progress.svg'), svg);
  fs.writeFileSync(path.join(dir, 'dashboard.md'), renderMarkdown(history, readJSON(path.join(LOOP, 'hypotheses.json'), {})));
  fs.writeFileSync(path.join(dir, 'dashboard.html'), renderDashboard(history, svg,
    fs.readFileSync(path.join(LOOP, 'CHANGELOG.md'), 'utf8'), readJSON(path.join(LOOP, 'hypotheses.json'), {})));
}

const verdict = { pass: reasons.length === 0, reasons, metrics };
console.log(JSON.stringify(verdict, null, 2));
process.exit(verdict.pass ? 0 : 1);
