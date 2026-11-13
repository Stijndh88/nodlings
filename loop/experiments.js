#!/usr/bin/env node
// Long evolution experiments, run on GitHub Actions instead of inside the loop's
// 10-minute budget. An experiment is a patch that is NOT applied to master yet:
//
//   loop/experiments/<id>/change.patch   the candidate change (sim files only)
//   loop/experiments/<id>/spec.json      target metric, replicates, ticks
//   loop/experiments/<id>/result.json    copied in by `harvest` when it is done
//
//   submit <id> --target=M [--note=TEXT] [--ticks=N] [--replicates=N]
//       Turn the uncommitted sim change in the working tree into an experiment and
//       restore the working tree. Commit + push: the push starts the workflow.
//   harvest
//       Fetch finished results. Applies the patch of every experiment whose verdict
//       is "keep", updates loop/hypotheses.json, prints one summary line per result.
//   status
//       List experiments and where they stand.
//   run-pending [--quick]      (GitHub Actions) run every experiment without a result
//       and push each result to the `experiment-results` branch.
//   run <id> --out=FILE [--quick]   run one experiment locally.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const EXP = path.join(__dirname, 'experiments');
const SIM_FILES = ['brain.js', 'world.js', 'selftest.js', 'nodling.js', 'critters.js', 'predators.js', 'observer.js', 'sim.js'];
const RESULTS_BRANCH = 'experiment-results';
const [cmd, ...rest] = process.argv.slice(2);
const arg = (name, fallback) => { const m = rest.find(a => a.startsWith(`--${name}=`)); return m ? m.slice(name.length + 3) : fallback; };
const flag = name => rest.includes(`--${name}`);
const git = (args, opts = {}) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'pipe'], ...opts });
const tryGit = (args, opts) => { try { return git(args, opts); } catch (e){ return null; } };
const readJSON = (f, fallback) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e){ return fallback; } };
const ids = () => fs.existsSync(EXP) ? fs.readdirSync(EXP).filter(d => fs.existsSync(path.join(EXP, d, 'spec.json'))).sort() : [];
const summary = r => r.metrics ? Object.entries(r.metrics).filter(([m]) => (r.targets || []).includes(m) || m === 'probes.evolved' || m === 'probes.learningGain' || m === 'probes.memoryGain')
  .map(([m, v]) => `${m} ${Math.round(v.control)} -> ${Math.round(v.treatment)} (${v.pct}%, t=${v.t}, ${v.verdict})`).join('; ') + `; ${r.replicates} replicates x ${r.ticks} ticks` : (r.reasons || []).join('; ');

function setHypothesis(id, patch){
  const file = path.join(__dirname, 'hypotheses.json');
  const ledger = readJSON(file, { hypotheses: [] });
  let h = ledger.hypotheses.find(x => x.id === id);
  if (!h){ h = { id }; ledger.hypotheses.push(h); }
  Object.assign(h, patch);
  fs.writeFileSync(file, JSON.stringify(ledger, null, 2) + '\n');
}

function submit(){
  const id = rest[0];
  if (!id || !/^[a-z0-9][a-z0-9-]{2,50}$/.test(id)) throw new Error('usage: submit <id> --target=METRIC   (id: lowercase letters, digits, dashes)');
  if (ids().includes(id)) throw new Error(`experiment ${id} already exists`);
  const patch = git(['diff', 'HEAD', '--', ...SIM_FILES]);
  if (!patch.trim()) throw new Error('no uncommitted change in the sim files: make the change first, then submit');
  const dir = path.join(EXP, id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'change.patch'), patch);
  const spec = { id, target: arg('target', 'probes.evolved'), note: arg('note', ''), created: new Date().toISOString(), baseCommit: git(['rev-parse', '--short', 'HEAD']).trim() };
  if (arg('ticks')) spec.ticks = +arg('ticks');
  if (arg('replicates')) spec.replicates = +arg('replicates');
  fs.writeFileSync(path.join(dir, 'spec.json'), JSON.stringify(spec, null, 2) + '\n');
  git(['checkout', 'HEAD', '--', ...SIM_FILES]);
  setHypothesis(id, { signal: spec.target, change: spec.note || id, status: 'running', note: `evolution experiment submitted at ${spec.baseCommit}` });
  console.log(JSON.stringify({ submitted: id, files: git(['diff', '--stat', 'HEAD']).trim() || 'loop/experiments/' + id, next: `git add -A && git commit -m "exp: submit ${id}" && git push origin master` }, null, 2));
}

// Build the treatment code (current sim files + patch) in a temp dir and run the A/B.
function runOne(id, outFile){
  const dir = path.join(EXP, id), spec = readJSON(path.join(dir, 'spec.json'), null);
  if (!spec) throw new Error(`no such experiment: ${id}`);
  const stamp = { id, target: spec.target, note: spec.note, ranAt: tryGit(['rev-parse', '--short', 'HEAD'])?.trim() || null, finished: null };
  const tdir = fs.mkdtempSync(path.join(os.tmpdir(), `nodlings-exp-${id}-`));
  for (const f of SIM_FILES) fs.copyFileSync(path.join(ROOT, f), path.join(tdir, f));
  fs.copyFileSync(path.join(ROOT, 'metrics.js'), path.join(tdir, 'metrics.js'));
  const applied = spawnSync('git', ['apply', '--unsafe-paths', `--directory=${tdir}`, path.join(dir, 'change.patch')], { cwd: os.tmpdir(), encoding: 'utf8' });
  let result;
  if (applied.status !== 0){
    result = { decision: 'revert', pass: false, why: 'patch no longer applies to master', reasons: [applied.stderr.trim().slice(-300)] };
  } else {
    const args = [path.join(__dirname, 'ab.js'), `--treatment-code=${tdir}`, '--base=HEAD', `--target=${spec.target}`, `--out=${outFile}`];
    if (spec.ticks) args.push(`--ticks=${spec.ticks}`);
    if (spec.replicates) args.push(`--replicates=${spec.replicates}`);
    if (flag('quick')) args.push('--quick', '--ticks=300', '--replicates=2');
    const r = spawnSync(process.execPath, args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'], maxBuffer: 1 << 26 });
    result = readJSON(outFile, null) || { decision: 'revert', pass: false, why: 'A/B crashed', reasons: [String(r.stdout).trim().slice(-600)] };
  }
  Object.assign(result, stamp, { finished: new Date().toISOString() });
  fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
  return result;
}

function runPending(){
  const wt = path.join(os.tmpdir(), 'nodlings-results');
  fs.rmSync(wt, { recursive: true, force: true });
  tryGit(['worktree', 'prune']);
  const hasRemote = tryGit(['fetch', 'origin', `${RESULTS_BRANCH}:refs/remotes/origin/${RESULTS_BRANCH}`]) !== null;
  const g = (args) => execFileSync('git', args, { cwd: wt, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  if (hasRemote) git(['worktree', 'add', '-B', RESULTS_BRANCH, wt, `origin/${RESULTS_BRANCH}`]);
  else { git(['worktree', 'add', '--detach', wt]); g(['checkout', '--orphan', RESULTS_BRANCH]); g(['rm', '-rf', '-q', '.']); }
  const pending = ids().filter(id => !fs.existsSync(path.join(wt, `${id}.json`)));
  console.log(`pending experiments: ${pending.join(', ') || 'none'}`);
  const lines = [];
  for (const id of pending){
    const r = runOne(id, path.join(wt, `${id}.json`));
    const line = `**${id}**: ${r.decision} (${r.why}). ${summary(r)}`;
    lines.push(line); console.log(line);
    g(['add', '-A']);
    g(['-c', 'user.name=nodlings-experiments', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com', 'commit', '-q', '-m', `result: ${id} ${r.decision}`]);
    let pushed = false;
    for (let i = 0; i < 4 && !pushed; i++){
      try { g(['push', 'origin', `HEAD:${RESULTS_BRANCH}`]); pushed = true; }
      catch (e){ console.error(`push failed (${i + 1}/4): ${String(e.stderr || e).slice(-200)}`); try { g(['pull', '--rebase', 'origin', RESULTS_BRANCH]); } catch (e2){} }
    }
    if (!pushed){ console.error('could not push results'); process.exitCode = 1; }
  }
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Experiment results\n\n${lines.map(l => '- ' + l).join('\n') || 'Nothing pending.'}\n`);
}

function harvest(){
  tryGit(['fetch', 'origin', `${RESULTS_BRANCH}:refs/remotes/origin/${RESULTS_BRANCH}`]);
  const out = [];
  for (const id of ids()){
    const dir = path.join(EXP, id), spec = readJSON(path.join(dir, 'spec.json'), {});
    if (fs.existsSync(path.join(dir, 'result.json'))) continue;
    const raw = tryGit(['show', `origin/${RESULTS_BRANCH}:${id}.json`]);
    if (!raw){
      const hours = (Date.now() - Date.parse(spec.created)) / 36e5;
      out.push({ id, status: hours > 12 ? 'overdue: no result after 12h, check the "experiments" workflow run on GitHub' : 'running', hours: +hours.toFixed(1) });
      continue;
    }
    const r = JSON.parse(raw);
    let status = r.decision === 'keep' ? 'kept' : 'reverted', applied = false;
    if (r.decision === 'keep'){
      const a = spawnSync('git', ['apply', '--3way', path.join(dir, 'change.patch')], { cwd: ROOT, encoding: 'utf8' });
      applied = a.status === 0;
      if (!applied){ status = 'untested'; tryGit(['checkout', 'HEAD', '--', ...SIM_FILES]); }
    }
    fs.writeFileSync(path.join(dir, 'result.json'), JSON.stringify(r, null, 2) + '\n');
    const line = `${id}: ${status}${r.decision === 'keep' && !applied ? ' (verdict keep, but the patch conflicts with master now: resubmit it)' : ''}. ${r.why}. ${summary(r)}`;
    setHypothesis(id, { status, note: summary(r).slice(0, 400) });
    out.push({ id, status, applied, changelog: line });
  }
  console.log(JSON.stringify({ harvested: out, running: out.filter(x => x.status === 'running').length }, null, 2));
}

function status(){
  tryGit(['fetch', 'origin', `${RESULTS_BRANCH}:refs/remotes/origin/${RESULTS_BRANCH}`]);
  for (const id of ids()){
    const r = readJSON(path.join(EXP, id, 'result.json'), null);
    const remote = !r && tryGit(['show', `origin/${RESULTS_BRANCH}:${id}.json`]);
    console.log(`${id}: ${r ? r.decision + ' (harvested)' : remote ? JSON.parse(remote).decision + ' (ready to harvest)' : 'running'}`);
  }
}

try {
  if (cmd === 'submit') submit();
  else if (cmd === 'harvest') harvest();
  else if (cmd === 'status') status();
  else if (cmd === 'run-pending') runPending();
  else if (cmd === 'run') console.log(JSON.stringify(runOne(rest[0], path.resolve(arg('out', path.join(os.tmpdir(), `${rest[0]}.json`)))), null, 2));
  else { console.error('usage: node loop/experiments.js submit|harvest|status|run-pending|run   (see the header of this file)'); process.exit(2); }
} catch (e){ console.error(String(e.message || e)); process.exit(1); }
