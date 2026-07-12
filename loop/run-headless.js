#!/usr/bin/env node
// Headless batch runner for the Nodlings autonomous loop. Loads the DOM-free
// sim files into a vm context, resumes loop/storage.json + loop/state.json,
// runs a batch of ticks, writes results, and prints a guardrail verdict.
// See loop/RULES.md for the guardrail thresholds this checks against.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const LOOP = __dirname;

function arg(name, fallback){
  const m = process.argv.find(a => a.startsWith(`--${name}=`));
  return m ? m.slice(name.length + 3) : fallback;
}

function readJSON(file, fallback){
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch(e){ return fallback; }
}

function loadRules(){
  const text = fs.readFileSync(path.join(LOOP, 'RULES.md'), 'utf8');
  const m = text.match(/```json\n([\s\S]*?)\n```/);
  if (!m) throw new Error('RULES.md: no ```json config block found');
  return JSON.parse(m[1]);
}

// ---- localStorage shim, backed by loop/storage.json ----
const storagePath = path.join(LOOP, 'storage.json');
const store = readJSON(storagePath, {});
const localStorage = {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
};

const rules = loadRules();
const ticks = +arg('ticks', rules.batch_ticks);
const comparePath = arg('compare', null);
// Read the baseline now, before this run overwrites loop/metrics.json below —
// the CLI contract is --compare=loop/metrics.json (this run's own output
// file), so the read has to happen before the write or it'd compare a run
// against itself.
const baseline = comparePath ? readJSON(comparePath, null) : null;

// ---- build the sandbox and load the DOM-free sim files in dependency order ----
const context = vm.createContext({ console, localStorage, Date, Math, JSON });
for (const file of ['brain.js', 'world.js', 'selftest.js', 'nodling.js', 'critters.js', 'predators.js', 'observer.js', 'sim.js']){
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  vm.runInContext(src, context, { filename: file });
}

if (!context.selfTest()){
  console.log(JSON.stringify({ pass: false, reasons: ['self-test failed'] }, null, 2));
  process.exit(1);
}

context.loadProgress();
context.loadObserver();

const state = readJSON(path.join(LOOP, 'state.json'), { cycle: 0, lastRun: null, tick: 0 });

// NOTE: world/nodlings/critters/predators/START_* are declared with let/const
// in sim.js, so — unlike function declarations — they do NOT become
// properties of `context` and can't be touched via `context.world` etc. from
// host code. Anything that reads/writes them has to run *inside* the
// context, hence this one bootstrap snippet instead of separate host-side
// calls. context.simTick()/observerMetrics()/observerMarkdown()/etc. below
// are fine as direct calls — those are `function` declarations, which DO
// attach to `context`, and their bodies already run inside the sandbox
// where world/nodlings/etc. are directly visible.
vm.runInContext(`
  world.tick = ${state.tick};
  seed(START_POP);
  spawnCritters(world, critters, START_CRITTERS);
  spawnPredators(world, predators, START_PREDATORS);
`, context, { filename: 'bootstrap' });

for (let i = 0; i < ticks; i++) context.simTick();

context.saveProgress();
context.saveObserver();
fs.writeFileSync(storagePath, JSON.stringify(store, null, 2));

// world is `let`-declared in sim.js (see NOTE above) — context.world doesn't
// exist, so read world.tick via runInContext rather than a direct property.
const worldTick = vm.runInContext('world.tick', context);
fs.writeFileSync(path.join(LOOP, 'state.json'), JSON.stringify({
  cycle: state.cycle + 1, lastRun: new Date().toISOString(), tick: worldTick,
}, null, 2));

fs.writeFileSync(path.join(LOOP, 'observations.md'), context.observerMarkdown());

const m = context.observerMetrics();
const metrics = { population: m.pop, fitness: m.fame, maxGen: m.maxGen, avgBrain: m.avgBrain, built: m.built, day: m.day };
fs.writeFileSync(path.join(LOOP, 'metrics.json'), JSON.stringify(metrics, null, 2));

const reasons = [];
if (!Number.isFinite(metrics.fitness) || !Number.isFinite(metrics.population)) reasons.push('non-finite metric (NaN)');
if (metrics.population < rules.guardrails.min_population) reasons.push(`population ${metrics.population} < min ${rules.guardrails.min_population}`);
if (comparePath){
  if (baseline){
    const fitnessDropPct = baseline.fitness > 0 ? 100 * (baseline.fitness - metrics.fitness) / baseline.fitness : 0;
    const popDropPct = baseline.population > 0 ? 100 * (baseline.population - metrics.population) / baseline.population : 0;
    if (fitnessDropPct > rules.guardrails.max_fitness_drop_pct) reasons.push(`fitness dropped ${fitnessDropPct.toFixed(1)}% (max ${rules.guardrails.max_fitness_drop_pct}%)`);
    if (popDropPct > rules.guardrails.max_population_drop_pct) reasons.push(`population dropped ${popDropPct.toFixed(1)}% (max ${rules.guardrails.max_population_drop_pct}%)`);
  }
}

const verdict = { pass: reasons.length === 0, reasons, metrics };
console.log(JSON.stringify(verdict, null, 2));
process.exit(verdict.pass ? 0 : 1);
