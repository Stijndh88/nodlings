# Autonomous Improvement Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A cloud-scheduled routine that, every 6 hours, runs the Nodlings sim headlessly, checks it against `loop/RULES.md`'s guardrails, makes one autonomous code/tuning change toward the priority signals, keeps or reverts it based on measured regression, and pushes the result to GitHub — with zero human involvement per cycle.

**Architecture:** Two DOM-free files (`sim.js`, `selftest.js`) get extracted from `main.js` so the same tick/persistence logic runs in the browser and in a headless Node `vm` context (`loop/run-headless.js`). The harness resumes state from `loop/storage.json` (a literal mirror of the browser's `localStorage`) and `loop/state.json` (cycle count + resumed in-sim tick), runs a batch, and prints a JSON guardrail verdict. A cloud routine (Anthropic's cron-scheduled agent infrastructure) runs the actual multi-step cycle procedure against the pushed GitHub repo.

**Tech Stack:** Plain JS (no framework, matches existing codebase), Node's built-in `vm`/`fs`/`crypto` modules only (no new npm dependencies), git for the safety/rollback net, Claude Code's `RemoteTrigger` cloud-routine API for scheduling.

## Global Constraints

- No new npm dependencies — Node v24.18.0 is confirmed available; use only `fs`, `path`, `vm`, `crypto`.
- `C:\Nodlings` is already a git repo: local identity set (`user.email sdhondt2@gmail.com`, `user.name Stijn`), remote `origin` = `https://github.com/Stijndh88/nodlings.git`, branch `master`, already pushed through the initial commit (`64ffb96`).
- Cloud environment already provisioned: `environment_id: env_01PazGkRfW8r6Rtv6DLoc2jh` (kind `anthropic_cloud`).
- Do not change existing browser behavior/UX (save format, observation-log-resets-on-reload, self-test console output) — every extraction must be behavior-preserving for `index.html`.
- Every non-trivial script gets a runnable check per this project's existing pattern (assert-based, no test framework) — `selfTest()` already is one; `run-headless.js` is verified by actually running it (Task 3's steps), consistent with it being an integration harness rather than pure logic.

---

## Task 1: Extract `selftest.js` (shared self-check)

**Files:**
- Create: `selftest.js`
- Modify: `main.js` (remove the inline self-test IIFE, call the extracted function instead)
- Modify: `index.html:188-189` (add script tag)

**Interfaces:**
- Produces: global function `selfTest()` — runs brain-math assertions via `console.assert`, returns `true` if all passed, `false` otherwise. Depends only on globals from `brain.js` (`Brain`, `randomGenome`, `mutateGenome`, `crossoverGenome`, `genomeSize`, `N_BODY`, `OUTPUTS`, `N_SENSES`) and `world.js` (`makeRng`).

- [ ] **Step 1: Create `selftest.js`**

```js
// Brain math sanity check — shared by the browser (index.html) and the
// headless loop harness (loop/run-headless.js). Returns true if every
// assertion held; each failure is also logged via console.assert.
'use strict';

function selfTest(){
  let ok = true;
  const assert = (cond, msg) => { console.assert(cond, msg); if (!cond) ok = false; };

  const rng = makeRng(42);
  const s = Array.from({length:N_SENSES}, (_,i)=>Math.sin(i));
  const g = randomGenome(rng);
  const brain = new Brain(g);
  const o = brain.step(s, 0);
  assert(OUTPUTS.every(k=>Number.isFinite(o[k]) && Math.abs(o[k]) <= 1.0001),
    'network outputs finite and bounded');
  const g2 = mutateGenome(g, rng), g3 = crossoverGenome(g, g2, rng);
  assert(genomeSize(g2) > 0 && g3.body.length === N_BODY, 'variation produces valid genomes');
  // plasticity actually changes a synapse under reward
  const gp = randomGenome(rng);
  gp.conns.forEach(c => { c.pl = 1; c.w = 0.5; });
  const bp = new Brain(gp), before = bp.w[0];
  for (let i = 0; i < 20; i++) bp.step(s.map(()=>1), 1);
  assert(bp.w[0] !== before, 'reward-modulated plasticity updates weights');

  if (ok) console.log('Nodlings self-test passed (NEAT + plasticity)');
  return ok;
}
```

- [ ] **Step 2: Replace the inline IIFE in `main.js`**

Find (near the end of `main.js`):

```js
// ---- self-check: fails loudly in the console if the brain math breaks ----
(function selfTest(){
  const rng = makeRng(42);
  const s = Array.from({length:N_SENSES}, (_,i)=>Math.sin(i));
  const g = randomGenome(rng);
  const brain = new Brain(g);
  const o = brain.step(s, 0);
  console.assert(OUTPUTS.every(k=>Number.isFinite(o[k]) && Math.abs(o[k]) <= 1.0001),
    'network outputs finite and bounded');
  const g2 = mutateGenome(g, rng), g3 = crossoverGenome(g, g2, rng);
  console.assert(genomeSize(g2) > 0 && g3.body.length === N_BODY, 'variation produces valid genomes');
  // plasticity actually changes a synapse under reward
  const gp = randomGenome(rng);
  gp.conns.forEach(c => { c.pl = 1; c.w = 0.5; });
  const bp = new Brain(gp), before = bp.w[0];
  for (let i = 0; i < 20; i++) bp.step(s.map(()=>1), 1);
  console.assert(bp.w[0] !== before, 'reward-modulated plasticity updates weights');
  console.log('Nodlings self-test passed (NEAT + plasticity)');
})();
```

Replace with:

```js
// ---- self-check: fails loudly in the console if the brain math breaks ----
selfTest();
```

- [ ] **Step 3: Add the script tag to `index.html`**

Find:

```html
  <script src="brain.js"></script>
  <script src="world.js"></script>
  <script src="sprites.js"></script>
```

Replace with:

```html
  <script src="brain.js"></script>
  <script src="world.js"></script>
  <script src="selftest.js"></script>
  <script src="sprites.js"></script>
```

- [ ] **Step 4: Verify in-browser behavior is unchanged**

Open `index.html` in a browser, open devtools console. Expected: `Nodlings self-test passed (NEAT + plasticity)` logged once, no assertion failures, sim runs normally.

- [ ] **Step 5: Commit**

```bash
git add selftest.js main.js index.html
git commit -m "Extract selfTest() into its own DOM-free file"
```

---

## Task 2: Extract `sim.js` (DOM-free simulation core)

**Files:**
- Create: `sim.js`
- Modify: `main.js` (remove the extracted section, keep everything from `resetWorld` onward)
- Modify: `index.html` (add script tag before `main.js`)

**Interfaces:**
- Consumes: `World` (world.js), `Nodling` (nodling.js), `updateCritters`/`spawnCritters` (critters.js), `updatePredators`/`spawnPredators`/`predFame` (predators.js), `observerTick` (observer.js) — all pre-existing globals.
- Produces: globals `world`, `nodlings`, `critters`, `predators`, `START_POP`, `START_CRITTERS`, `START_PREDATORS`, `LIFE_SUPPORT`, `hallOfFame`, `births`, `deaths`, `popHist`, `serialize()`, `saveProgress()`, `applySave(d)`, `loadProgress()`, `seed(n)`, `simTick()`, `flashSaved()` (no-op default). These are exactly what `main.js` (browser) and `loop/run-headless.js` (headless) both call.

- [ ] **Step 1: Create `sim.js`** (moved verbatim from the top of `main.js`, plus one addition: a no-op `flashSaved()` default that `main.js` overrides in the browser)

```js
// Simulation core: world/population state, hall-of-fame persistence, and the
// tick loop. No DOM — shared by the browser (via main.js) and the headless
// loop harness (loop/run-headless.js).
'use strict';

let world = new World();
let nodlings = [];
let critters = [];
let predators = [];
const START_POP = 70, START_CRITTERS = 60, START_PREDATORS = 4;
const LIFE_SUPPORT = 60;  // gently top up toward this from the diverse gene bank
const hallOfFame = []; // best genomes ever, by lifetime fitness — the "progress"
let births = 0, deaths = 0;
const popHist = [];

// UI hook — main.js overrides this in the browser; no-op in the headless harness.
function flashSaved(){}

// ---------- novelty search ----------
// A rolling archive of behaviour signatures; novelty = distance to the nearest
// stored behaviours. Rewarding novel behaviour keeps the world exploring.
const behaviorArchive = [];
const ARCHIVE_MAX = 200;
function archiveBehavior(sig){
  behaviorArchive.push(sig);
  if (behaviorArchive.length > ARCHIVE_MAX)
    behaviorArchive.splice((Math.random()*ARCHIVE_MAX)|0, 1); // random eviction keeps it varied
}
function behaviorNovelty(sig){
  const A = behaviorArchive;
  if (A.length < 10) return 0.5; // early on, everything is novel
  const best = [1e9,1e9,1e9];    // 3 nearest sq-distances
  for (let i = 0; i < A.length; i++){
    const a = A[i]; let d = 0;
    for (let k = 0; k < 6; k++){ const e = sig[k]-a[k]; d += e*e; }
    if (d < best[2]){ best[2] = d; best.sort((x,y)=>x-y); }
  }
  return Math.min(1, Math.sqrt((best[0]+best[1]+best[2])/3));
}

// ---------- persistence ----------
const SAVE_KEY = 'nodlings.save.v6'; // v6: speciation + novelty + bigger world (fresh start)

function serialize(){
  return JSON.stringify({
    v:4, tick:world.tick, births, deaths, popHist,
    fame: hallOfFame.map(h => ({score:h.score, genome:h.genome})),
    predFame: predFame.map(h => ({score:h.score, genome:h.genome})),
  });
}
function saveProgress(){
  try { localStorage.setItem(SAVE_KEY, serialize()); flashSaved(); } catch (e){}
}
function applySave(d){
  if (!d || !d.fame) return false;
  hallOfFame.length = 0;
  for (const h of d.fame) hallOfFame.push(h);
  predFame.length = 0;
  if (Array.isArray(d.predFame)) for (const h of d.predFame) predFame.push(h);
  reindexFromGenomes(hallOfFame.concat(predFame).map(h => h.genome)); // keep NEAT ids consistent
  births = d.births|0; deaths = d.deaths|0;
  popHist.length = 0; if (Array.isArray(d.popHist)) popHist.push(...d.popHist);
  return true;
}
function loadProgress(){
  try { const s = localStorage.getItem(SAVE_KEY); return s ? applySave(JSON.parse(s)) : false; }
  catch (e){ return false; }
}

// ---------- population ----------
// A reseed draws mostly from the (deep, diverse) hall of fame with extra
// mutation, but a healthy fraction fresh-random — injecting diversity instead of
// re-cloning the monoculture that stalled evolution. It also carries the source
// lineage's generation, so topping up doesn't reset the population's gen depth.
function fameEntry(){
  if (hallOfFame.length && world.rng() < 0.6){
    const e = hallOfFame[(world.rng()*hallOfFame.length)|0];
    return { genome: mutateGenome(mutateGenome(e.genome, world.rng), world.rng), gen: e.gen || 0 };
  }
  return { genome: randomGenome(world.rng), gen: 0 };
}
function seed(n){
  for (let i = 0; i < n; i++){
    const x = (world.rng()*GRID_W)|0, y = (world.rng()*GRID_H)|0;
    const c = world.at(x, y);
    if (!c || c.water){ i--; continue; }
    const e = fameEntry();
    nodlings.push(new Nodling(world, x + 0.5, y + 0.5, e.genome, e.gen));
  }
}

function simTick(){
  world.pop = nodlings.length;
  world.predators = predators;         // so Nodlings can sense them this tick
  world.nextSounds = [];
  world.buildIndex(nodlings);
  world.step();
  const born = [];
  for (const n of nodlings){ const child = n.tick(); if (child) born.push(child); }
  predators = updatePredators(world, predators); // hunt (may kill Nodlings) after they act
  for (const n of nodlings){
    if (!n.dead) continue;
    deaths++;
    hallOfFame.push({genome:n.genome, score:n.age + 250*n.offspring, gen:n.gen});
    hallOfFame.sort((a,b)=>b.score-a.score);
    hallOfFame.length = Math.min(hallOfFame.length, 40); // deeper, more diverse seed bank
  }
  births += born.length;
  nodlings = nodlings.filter(n=>!n.dead).concat(born);
  critters = updateCritters(world, critters);
  // gentle life-support: trickle in one gene-bank Nodling at a time toward a
  // minimum, instead of dumping a crowd of clones — keeps a diverse standing
  // population without the reseed treadmill that reset the gene pool.
  if (nodlings.length < LIFE_SUPPORT && world.rng() < 0.04) seed(1);
  // Also enrol the best *living* Nodling periodically — in a stable population
  // the elite may never die, so death-only fame would lag and understate progress.
  if (world.tick % 300 === 0 && nodlings.length){
    let best = null, bs = -1;
    for (const n of nodlings){ const f = n.age + 250*n.offspring; if (f > bs){ bs = f; best = n; } }
    if (best){
      hallOfFame.push({genome:best.genome, score:bs, gen:best.gen});
      hallOfFame.sort((a,b)=>b.score-a.score);
      hallOfFame.length = Math.min(hallOfFame.length, 40);
    }
  }
  world.sounds = world.nextSounds;
  observerTick();

  if (world.tick % 150 === 0){
    popHist.push(nodlings.length);
    if (popHist.length > 220) popHist.shift();
  }
}
```

- [ ] **Step 2: Remove the moved section from `main.js`**

Find the block at the top of `main.js`, from the header comment through the end of `simTick()`:

```js
// Simulation driver: tick loop, population bookkeeping, hall of fame, sidebar,
// and persistence (auto-saves the evolved genomes so progress survives reloads).
'use strict';

let world = new World();
```

... (everything through the closing `}` of `simTick()`, i.e. through the `if (world.tick % 150 === 0){ ... }` block) ...

Replace the whole thing with just:

```js
// Browser UI driver: reset/import handlers, sidebar stats, sparkline, help
// tips, and persistence wiring. Simulation state and simTick() itself live in
// sim.js (shared with the headless loop harness).
'use strict';
```

`main.js` now starts directly with `function resetWorld(keepFame){` after that header.

- [ ] **Step 3: Give `main.js`'s `flashSaved` real behavior back**

Find (in `main.js`'s UI section):

```js
let savedFlashUntil = 0;
function flashSaved(){ savedFlashUntil = performance.now() + 1200; }
```

This stays exactly as-is — it already redeclares the global `flashSaved` (a plain `function` redeclaration across script tags is legal and this one runs after `sim.js`, so it wins). No change needed here; just confirm it's still present after Step 2's edit (it's further down in the file, untouched by that edit).

- [ ] **Step 4: Add the script tag to `index.html`**

Find:

```html
  <script src="observer.js"></script>
  <script src="main.js"></script>
```

Replace with:

```html
  <script src="observer.js"></script>
  <script src="sim.js"></script>
  <script src="main.js"></script>
```

- [ ] **Step 5: Verify in-browser behavior is unchanged**

Open `index.html`. Expected: sim runs exactly as before (population grows, sidebar stats update, save/export/reset buttons work, self-test still logs on load). This is the regression check for the whole extraction — if anything is undefined, the console will show a `ReferenceError` immediately on load.

- [ ] **Step 6: Commit**

```bash
git add sim.js main.js index.html
git commit -m "Extract sim.js: DOM-free simulation core shared with the headless harness"
```

---

## Task 3: `loop/run-headless.js` — the Node harness

**Files:**
- Create: `loop/run-headless.js`
- Create: `loop/RULES.md`
- Create: `loop/CHANGELOG.md`

**Interfaces:**
- Consumes: `brain.js`, `world.js`, `selftest.js`, `nodling.js`, `critters.js`, `predators.js`, `observer.js`, `sim.js` (loaded as source text, run in a `vm` context) — specifically `selfTest()`, `loadProgress()`, `loadObserver()` (already exists in `observer.js`), `saveProgress()`, `saveObserver()` (already exists in `observer.js`), `observerMetrics()` (already exists in `observer.js`), `observerMarkdown()` (already exists in `observer.js`), `seed()`, `spawnCritters()`, `spawnPredators()`, `simTick()`, `world`, `nodlings`, `hallOfFame`.
- Produces (CLI contract): `node loop/run-headless.js --ticks=N [--compare=<path/to/metrics.json>]` — writes `loop/storage.json`, `loop/state.json`, `loop/observations.md`, `loop/metrics.json`; prints a JSON verdict `{pass, reasons, metrics}` to stdout; exits `0` on pass, `1` on any guardrail failure.

- [ ] **Step 1: Create `loop/RULES.md`**

````markdown
# Nodlings loop rules

```json
{
  "batch_ticks": 80000,
  "validation_ticks": 16000,
  "guardrails": {
    "min_population": 15,
    "max_fitness_drop_pct": 25,
    "max_population_drop_pct": 40
  },
  "tunable_params": [
    {"file": "nodling.js", "const": "REPRO_THRESHOLD", "range": [0.4, 0.9]},
    {"file": "world.js", "const": "FIRE_SPREAD_RATE", "range": [0.01, 0.2]},
    {"file": "brain.js", "const": "LEARN_RATE", "range": [0.005, 0.05]}
  ]
}
```

## Guardrails (hard revert, no exceptions)
- Population must not crash below `min_population`.
- No NaN/non-finite metric.
- `selfTest()` must still pass.
- Best fitness must not drop more than `max_fitness_drop_pct` vs the pre-change baseline.
- Population must not drop more than `max_population_drop_pct` vs the pre-change baseline.

## Priority signals (push toward, in this order)
1. **Multi-step construction / villages** — durable-structure clusters,
   brick/kiln chains, bridges used for territory, not just scattered
   stacking. Target: beat the current best (`built >= 25` milestone) by an
   order of magnitude, sustained, not a one-off spike.
2. **Communication** — the sound channel exists but carries no evolved
   meaning yet. Look for correlation between sound emission and nearby
   Nodling behavior (alarm→flee, food-found→approach) as a signal it's
   being used; bias reward/sensory wiring to make that correlation
   learnable if it isn't showing up.
3. **Sustained open-ended growth** — break the repeated fitness/generation
   plateaus the observation log shows (day 235, day 413 pattern in
   `nodlings-observations-day513.md`). Prefer changes that widen the fitness
   landscape (new affordances, sensory inputs, reward shaping) over
   re-tuning existing knobs once this pattern recurs.

## Change policy
- Exactly ONE change per cycle, small and falsifiable, tied to one priority
  signal above.
- Check `loop/CHANGELOG.md` first — don't retry a hypothesis already marked
  `reverted` for the same reason.
- Anything in `tunable_params` needs no special flag. Anything else (new
  mechanic, new sense/output, structural rewiring, new file) is still
  applied autonomously but logged with a `STRUCTURAL:` prefix in
  `CHANGELOG.md` for easy review.
- Grow `tunable_params` over time as safe knobs are identified — edit this
  file's JSON block directly when that happens (that edit is itself exempt
  from the "one change per cycle" cap, since it's meta/policy, not sim
  behavior).
- If the *baseline* batch (before any new change) fails a guardrail, that
  means an earlier cycle's "kept" change was actually bad and only showed it
  now. Don't try to auto-locate and revert that old commit — commit the
  batch output as-is, log an `INCIDENT:` entry in CHANGELOG with the
  guardrail reasons, push, and skip making a new change this cycle. A human
  reviewing CHANGELOG decides what to do about incidents.
````

- [ ] **Step 2: Create `loop/CHANGELOG.md`**

```markdown
# Nodlings loop changelog

One entry per cycle: hypothesis, before/after metrics, `kept`/`reverted`/`INCIDENT`.
Newest entries at the top.
```

- [ ] **Step 3: Create `loop/run-headless.js`**

```js
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

fs.writeFileSync(path.join(LOOP, 'state.json'), JSON.stringify({
  cycle: state.cycle + 1, lastRun: new Date().toISOString(), tick: context.world.tick,
}, null, 2));

fs.writeFileSync(path.join(LOOP, 'observations.md'), context.observerMarkdown());

const m = context.observerMetrics();
const metrics = { population: m.pop, fitness: m.fame, maxGen: m.maxGen, avgBrain: m.avgBrain, built: m.built, day: m.day };
fs.writeFileSync(path.join(LOOP, 'metrics.json'), JSON.stringify(metrics, null, 2));

const reasons = [];
if (!Number.isFinite(metrics.fitness) || !Number.isFinite(metrics.population)) reasons.push('non-finite metric (NaN)');
if (metrics.population < rules.guardrails.min_population) reasons.push(`population ${metrics.population} < min ${rules.guardrails.min_population}`);
if (comparePath){
  const baseline = readJSON(comparePath, null);
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
```

- [ ] **Step 4: Run it fresh (no prior state) for a small batch**

Run: `node loop/run-headless.js --ticks=500`

Expected: prints `Nodlings self-test passed (NEAT + plasticity)` then a JSON verdict with `"pass": true`, `metrics.population` roughly 60-70 (close to `START_POP`, only 500 ticks in), `metrics.day` ≈ `0.3`. Confirms `loop/storage.json`, `loop/state.json` (`cycle: 1`), `loop/observations.md`, `loop/metrics.json` were created.

- [ ] **Step 5: Run it again, resuming state, with `--compare`**

Run: `node loop/run-headless.js --ticks=2000 --compare=loop/metrics.json`

Expected: `"pass": true`, `metrics.day` continues upward from where it left off (≈`1.6`), `state.json`'s `cycle` becomes `2`. This proves resumption (tick continuity) and the compare/guardrail path both work.

- [ ] **Step 6: Prove the guardrail actually fires**

Run: `node loop/run-headless.js --ticks=100 --compare=loop/metrics.json` — but first temporarily edit the just-written `loop/metrics.json`'s `population` field to `100000` (a baseline no real run could match), to force a population-drop failure.

Expected: exit code `1`, verdict JSON has `"pass": false` with a `population dropped ...%` reason. Revert `loop/metrics.json` back afterward (or just re-run Step 5 to regenerate it correctly).

- [ ] **Step 7: Commit**

```bash
git add loop/run-headless.js loop/RULES.md loop/CHANGELOG.md loop/storage.json loop/state.json loop/observations.md loop/metrics.json
git commit -m "Add headless loop harness: run-headless.js, RULES.md, CHANGELOG.md"
git push origin master
```

---

## Task 4: Stand up the cloud routine

**Files:** none (this task configures Anthropic's cloud scheduling via the `RemoteTrigger` tool, not local files).

**Interfaces:**
- Consumes: `RemoteTrigger` tool (load via `ToolSearch select:RemoteTrigger` first), repo `https://github.com/Stijndh88/nodlings`, `environment_id: env_01PazGkRfW8r6Rtv6DLoc2jh`.

- [ ] **Step 1: Load the `RemoteTrigger` tool**

Call `ToolSearch` with `query: "select:RemoteTrigger"`.

- [ ] **Step 2: Generate a UUID for the routine's event**

Run: `node -e "console.log(require('crypto').randomUUID())"`

Save the output — it goes in `job_config.ccr.events[0].data.uuid` below.

- [ ] **Step 3: Create the routine**

Call `RemoteTrigger` with `action: "create"` and this body (substitute the generated UUID; pick a cron minute that isn't `:00` or `:30` — e.g. `23 */6 * * *`):

```json
{
  "name": "nodlings-loop",
  "cron_expression": "23 */6 * * *",
  "enabled": true,
  "job_config": {
    "ccr": {
      "environment_id": "env_01PazGkRfW8r6Rtv6DLoc2jh",
      "session_context": {
        "model": "claude-sonnet-5",
        "sources": [
          {"git_repository": {"url": "https://github.com/Stijndh88/nodlings"}}
        ],
        "allowed_tools": ["Bash", "Read", "Write", "Edit", "Glob", "Grep"]
      },
      "events": [
        {"data": {
          "uuid": "<generated-uuid>",
          "session_id": "",
          "type": "user",
          "parent_tool_use_id": null,
          "message": {"role": "user", "content": "You are running one cycle of the Nodlings autonomous improvement loop.\n\nFirst read loop/RULES.md (guardrails, priority signals, change policy) and the last ~20 entries of loop/CHANGELOG.md for history.\n\nSteps:\n1. Run: node loop/run-headless.js --ticks=<batch_ticks from RULES.md>\n   This resumes loop/storage.json + loop/state.json, runs the batch, and writes loop/observations.md + loop/metrics.json.\n   - If it prints \"pass\": false (a guardrail tripped on the RESUMED state, before you've made any change): still `git add -A && git commit -m \"cycle: INCIDENT at day X\"` (the data is real, keep it), append a CHANGELOG.md entry prefixed `INCIDENT:` with the printed reasons, `git push origin master`, and STOP — do not proceed to steps 2-6 this cycle.\n   - If it prints \"pass\": true: `git add -A && git commit -m \"cycle: batch to day X\"` — this is your baseline commit for this cycle.\n2. Pick exactly ONE hypothesis from RULES.md's priority signals, skipping anything CHANGELOG.md already marks `reverted` for the same reason.\n3. Make ONE small code change implementing that hypothesis. If it's one of RULES.md's tunable_params, stay within its declared range. Structural changes (new mechanic, new sense/output, new file) are also fine to apply directly — just prefix the CHANGELOG entry with `STRUCTURAL:`.\n4. Run: node loop/run-headless.js --ticks=<validation_ticks from RULES.md> --compare=loop/metrics.json\n5. If it prints \"pass\": false: `git reset --hard HEAD` (discard the change and its batch output, back to this cycle's baseline commit). Append a CHANGELOG.md entry: hypothesis, the printed reasons, marked `reverted`. Commit and push just the CHANGELOG update.\n   If it prints \"pass\": true: append a CHANGELOG.md entry: hypothesis, before/after metrics from loop/metrics.json, marked `kept` (or `STRUCTURAL: kept`). `git add -A && git commit -m \"cycle: <one-line change summary>\"`.\n6. `git push origin master`.\n\nThis loop is fully autonomous per the project owner's instruction — never stop to ask for confirmation. Keep each CHANGELOG entry to a few lines."}
        }}
      ]
    }
  }
}
```

- [ ] **Step 4: Trigger one manual run to verify the push path works end-to-end**

Call `RemoteTrigger` with `{action: "run", trigger_id: "<id from Step 3's response>"}`.

- [ ] **Step 5: Verify on GitHub**

Check `https://github.com/Stijndh88/nodlings/commits/master` after the run completes. Expected: one or two new commits (`cycle: batch to day X`, and either a change commit or nothing if it happened to find no new hypothesis) authored by the cloud agent. If nothing appears, the routine's git write access needs troubleshooting before trusting the 6-hour cadence — check the run's transcript via `RemoteTrigger {action: "get", trigger_id: ...}` for the failure.

- [ ] **Step 6: Report the routine link to the user**

Output `https://claude.ai/code/routines/<id>` so the user can monitor/pause it from the web UI (routines can't be deleted via the API — that page is also where they'd do that).

---

## Self-review notes

- **Spec coverage:** headless harness ✓ (Task 3), RULES.md schema ✓ (Task 3 Step 1), git safety net ✓ (already initialized + push/revert steps embedded in the Task 4 routine prompt), cron mechanism ✓ (Task 4), observations.md / CHANGELOG.md separation ✓ (Task 3), selfTest reuse ✓ (Task 1).
- **Deviation from the approved design doc:** the design assumed `simTick()`/`seed()`/persistence already lived in the six DOM-free files; they actually lived in `main.js` mixed with DOM/UI code. Task 2 extracts them into a 7th DOM-free file (`sim.js`) to preserve DRY reuse between the browser and the headless harness — same architecture, one extra file, noted here rather than re-running brainstorming since it's an implementation-level fix, not a scope change.
- **Type/name consistency check:** `run-headless.js` (Task 3) calls exactly the function names `sim.js` (Task 2) and `observer.js` (pre-existing) produce — `loadProgress`, `loadObserver`, `saveProgress`, `saveObserver`, `observerMetrics`, `observerMarkdown`, `seed`, `spawnCritters`, `spawnPredators`, `simTick`, `selfTest` — verified against actual current source, not assumed names.
