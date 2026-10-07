#!/usr/bin/env node
// Headless batch runner for the Nodlings autonomous loop. Loads the DOM-free
// sim files into a vm context, resumes the *continuous world* (world.json) plus
// the hall of fame (storage.json), runs a batch of ticks, then measures, appends
// to history.jsonl and prints a guardrail verdict. See loop/RULES.md.
//
// Flags:  --ticks=N  --dir=PATH (state dir, default loop/)  --dry (write nothing)
//         --out=FILE (write metrics JSON)  --compare=FILE (guardrail baseline)
//         --bench / --no-bench (benchmark; default on unless --dry)
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const zlib = require('zlib');
const { execSync } = require('child_process');
const { renderProgress, renderDashboard } = require('./report');

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
  for (const file of SIM_FILES) vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), context, { filename: file });
  return context;
}

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

for (let i = 0; i < ticks; i++) context.simTick();

const metrics = context.loopMetrics();
metrics.worldTick = vm.runInContext('world.tick', context);

// ---- benchmark: fixed seeds, fresh sandbox per cohort, evolved vs random genomes ----
if (wantBench){
  const b = rules.benchmark;
  const genomes = JSON.stringify(vm.runInContext('hallOfFame.slice(0, 20).map(h => h.genome)', context) || []);
  const score = (useGenomes, wseed) => {
    const c = makeContext({});
    return vm.runInContext(`(function(){
      ${useGenomes ? `const G = ${genomes}; reindexFromGenomes(G);` : 'const G = null;'}
      return benchCohort(G, ${wseed}, ${b.ticks}, ${b.cohort});
    })()`, c);
  };
  let ev = 0, rd = 0;
  for (const s of b.seeds){ ev += score(true, s); rd += score(false, s); }
  ev /= b.seeds.length; rd /= b.seeds.length;
  metrics.benchmark = { evolved: Math.round(ev), random: Math.round(rd), gap: Math.round(ev - rd) };
}

// ---- guardrails ----
const g = rules.guardrails, reasons = [];
const finite = Object.values(metrics).every(v => v === null || typeof v === 'object' || Number.isFinite(v));
if (!finite) reasons.push('non-finite metric (NaN)');
if (metrics.population < g.min_population) reasons.push(`population ${metrics.population} < min ${g.min_population}`);
const dropPct = (before, after) => before > 0 ? 100 * (before - after) / before : 0;
if (baseline){
  if (baseline.medianFitness != null && dropPct(baseline.medianFitness, metrics.medianFitness) > g.max_fitness_drop_pct)
    reasons.push(`median fitness dropped ${dropPct(baseline.medianFitness, metrics.medianFitness).toFixed(1)}% (max ${g.max_fitness_drop_pct}%)`);
  const bp = baseline.population;
  if (bp != null && dropPct(bp, metrics.population) > g.max_population_drop_pct)
    reasons.push(`population dropped ${dropPct(bp, metrics.population).toFixed(1)}% (max ${g.max_population_drop_pct}%)`);
  if (baseline.benchmark && metrics.benchmark && dropPct(baseline.benchmark.gap, metrics.benchmark.gap) > g.max_benchmark_drop_pct)
    reasons.push(`benchmark gap dropped ${dropPct(baseline.benchmark.gap, metrics.benchmark.gap).toFixed(1)}% (max ${g.max_benchmark_drop_pct}%)`);
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
  fs.writeFileSync(path.join(dir, 'dashboard.html'), renderDashboard(history, svg,
    fs.readFileSync(path.join(LOOP, 'CHANGELOG.md'), 'utf8'), readJSON(path.join(LOOP, 'hypotheses.json'), {})));
}

const verdict = { pass: reasons.length === 0, reasons, metrics };
console.log(JSON.stringify(verdict, null, 2));
process.exit(verdict.pass ? 0 : 1);
