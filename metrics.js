// Measurements for the autonomous loop. DOM-free; loaded after sim.js in the same
// context, so it reads world/nodlings/predators directly.
//   loopMetrics()   the living world: population, deaths, world health, technique ledger
//   probeCohort()   the exam: a fixed test for a set of genomes, with switched-off tests
'use strict';

// ---- communication probe: does call pitch differ when a predator is near? ----
const comm = { sumNear:0, nNear:0, sumFar:0, nFar:0 };
function commSample(){
  if (!world.sounds || !world.sounds.length || !predators.length) return;
  for (const s of world.sounds){
    let near = false;
    for (const p of predators) if ((p.x-s.x)**2 + (p.y-s.y)**2 < 64){ near = true; break; }
    if (near){ comm.sumNear += s.f; comm.nNear++; } else { comm.sumFar += s.f; comm.nFar++; }
  }
}
function resetComm(){ comm.sumNear = comm.nNear = comm.sumFar = comm.nFar = 0; }

function median(a){
  if (!a.length) return 0;
  const b = a.slice().sort((x,y)=>x-y), m = b.length>>1;
  return b.length & 1 ? b[m] : (b[m-1]+b[m])/2;
}

// ---- world health: can the world still be lived in? (the November 2026 audit found
// the old world sealed off from water by walls nobody built on purpose) ----
function worldHealth(){
  let land = 0, walls = 0, empty = 0, shore = 0, shoreOpen = 0, items = 0;
  for (let y = 0; y < GRID_H; y++) for (let x = 0; x < GRID_W; x++){
    const c = world.at(x, y);
    if (c.water) continue;
    land++; items += c.stack.length;
    if (!c.stack.length) empty++;
    if (c.stack.length >= WALL_HEIGHT) walls++;
    if (world.adjacentWater(x, y)){ shore++; if (c.stack.length < WALL_HEIGHT) shoreOpen++; }
  }
  // flood-fill the walkable cells into regions and note which regions touch water
  const region = new Int32Array(GRID_W*GRID_H).fill(-1), touches = [];
  for (let i = 0; i < region.length; i++){
    if (region[i] >= 0 || !walkable(world.cells[i])) continue;
    const id = touches.length; let touch = false; const q = [i]; region[i] = id;
    while (q.length){
      const j = q.pop(), jx = j % GRID_W, jy = (j / GRID_W)|0;
      if (world.adjacentWater(jx, jy)) touch = true;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++){
        const nx = jx+dx, ny = jy+dy;
        if ((!dx && !dy) || nx < 0 || ny < 0 || nx >= GRID_W || ny >= GRID_H) continue;
        const k = ny*GRID_W + nx;
        if (region[k] < 0 && walkable(world.cells[k])){ region[k] = id; q.push(k); }
      }
    }
    touches.push(touch);
  }
  let reach = 0;
  for (const n of nodlings){ const id = region[(n.y|0)*GRID_W + (n.x|0)]; if (id >= 0 && touches[id]) reach++; }
  const r3 = v => +v.toFixed(3);
  return { wallShare: r3(walls/land), emptyLandShare: r3(empty/land), itemsPerLandCell: r3(items/land),
           openShore: r3(shore ? shoreOpen/shore : 0), canReachWater: r3(nodlings.length ? reach/nodlings.length : 1) };
}

// ---- technique ledger: which (verb, in hand, target, result) types are in use ----
// The ledger is not saved with the world, so in the loop it covers exactly one batch.
// `share` = the part of the Nodlings active in that time that did it at least once.
// `common` = types with a share of at least 20%. Random brains babble: they grab, drop and
// strike by accident, so a type being present means little. Watch the shares over cycles.
const COMMON_SHARE = 0.2;
function isToolUse(key){
  const [verb, held, , result] = key.split('|');
  if ((verb === 'strike' || verb === 'use') && held !== 'none') return true;      // done with something in the hand
  return verb === 'drop' && result !== 'place' && result !== 'sink';              // placed to an effect
}
function ledgerSummary(){
  const actors = Math.max(1, world.ledgerActors.size), types = {};
  let common = 0, tools = 0;
  for (const [key, e] of world.ledger){
    const share = e.users.size/actors;
    types[key] = { share: +share.toFixed(3), perUser: +(e.count/e.users.size).toFixed(1) };
    if (share >= COMMON_SHARE && e.users.size >= 3){ common++; if (isToolUse(key)) tools++; }
  }
  // report the 30 most widespread types (the full ledger stays in world.ledger)
  const top = {};
  for (const k of Object.keys(types).sort((a, b) => types[b].share - types[a].share || (a < b ? -1 : 1)).slice(0, 30)) top[k] = types[k];
  return { common, tools, types: top, total: world.ledger.size, actors: world.ledgerActors.size };
}

function loopMetrics(){
  const fit = nodlings.map(fitnessOf);
  const mean = a => a.length ? a.reduce((s,x)=>s+x,0)/a.length : 0;
  const cNear = comm.nNear ? comm.sumNear/comm.nNear : 0, cFar = comm.nFar ? comm.sumFar/comm.nFar : 0;
  const meals = nodlings.reduce((s,n)=>s+n.meals,0), bad = nodlings.reduce((s,n)=>s+n.badMeals,0);
  const led = ledgerSummary();
  return Object.assign({
    day: +(world.tick/DAY_LEN).toFixed(2),
    year: +(world.tick/YEAR_LEN).toFixed(2),
    population: nodlings.length,
    medianFitness: Math.round(median(fit)),
    meanFitness: Math.round(mean(fit)),
    medianAge: Math.round(median(nodlings.map(n=>n.age))),
    maxGen: nodlings.reduce((m,n)=>Math.max(m,n.gen),0),
    avgBrain: +mean(nodlings.map(n=>n.brainSize)).toFixed(1),
    meanEnergy: Math.round(mean(nodlings.map(n=>n.energy))),
    plantCount: world.cells.reduce((s,c)=>s+(c.stack.length && MATERIALS[c.stack[c.stack.length-1]].spreads ? 1 : 0),0),
    badMealShare: meals ? +(bad/meals).toFixed(3) : null,       // 0.5 = eats both plant kinds alike
    carrying: +mean(nodlings.map(n=>n.carrying ? 1 : 0)).toFixed(3),
    critters: critters.length, predators: predators.length, fires: world.fires.length,
    deaths: Object.assign({}, world.deathCauses),
    commSeparation: comm.nNear > 20 && comm.nFar > 20 ? +Math.abs(cNear-cFar).toFixed(4) : null,
    techniques: led.common, toolTechniques: led.tools, techniqueTypes: led.total, ledger: led.types,
  }, worldHealth());
}

// ---- the exam: a fixed test for a set of genomes ----
// A cohort is dropped into a fresh fixed-seed world with births switched off, on
// the first day of spring, and lives for `ticks` (the standard exam is 1.5 years:
// it contains a winter and one swap of the nourishing and the poisonous plant).
// Score = mean lifetime fitness (age + 500 x offspring) at the end.
//   base    the standard world
//   scarce  little food: 40% of the starting plants, 40% regrowth
//   thirst  water runs out three times as fast
// Switched-off tests rerun `base` without one faculty; the drop is what it is worth:
//   noLearning  within-lifetime learning off          -> learningGain
//   noMemory    memory senses blanked                 -> memoryGain
//   noHands     grab, drop and strike forced to 0     -> handsGain
//   noSocial    senses about other Nodlings blanked   -> socialGain
const PROBE_TASKS = {
  base:       {},
  scarce:     { flora:0.4, thin:0.4 },
  thirst:     { thirst:3 },
  noLearning: { plasticity:0 },
  noMemory:   { senseMask:MEMORY_SENSES },
  noHands:    { outMask:['grab','drop','strike'] },
  noSocial:   { senseMask:SOCIAL_SENSES },
};
let lastProbe = null;   // details of the most recent probe (survival, meals), for the caller
function probeCohort(genomes, wseed, ticks, size, task){
  const t = PROBE_TASKS[task] || {};
  Object.assign(ENV, EXAM, t);
  delete ENV.thin;
  world = new World(wseed);
  nodlings = []; critters = []; predators = [];
  if (t.thin){ // thin the starting plants with a private RNG so the world stream is untouched
    const r = makeRng(wseed ^ 0x5eed);
    for (const c of world.cells) if (c.stack.length && MATERIALS[c.stack[0]].spreads && r() > t.thin) c.stack.pop();
  }
  spawnCritters(world, critters, START_CRITTERS);
  spawnPredators(world, predators, START_PREDATORS);
  const cohort = [];
  for (let i = 0; i < size; i++){
    let x, y, c;
    do { x = (world.rng()*GRID_W)|0; y = (world.rng()*GRID_H)|0; c = world.at(x, y); } while (!c || c.water);
    const g = genomes ? genomes[i % genomes.length] : randomGenome(world.rng);
    const n = new Nodling(world, x+0.5, y+0.5, g, 0);
    n.age = MATURITY;                 // the cohort are young adults: the exam tests living, not growing up
    nodlings.push(n); cohort.push(n);
  }
  for (let k = 0; k < ticks && nodlings.length; k++) simTick();
  delete ENV.thin; Object.assign(ENV, ENV_LIVE);
  const meals = cohort.reduce((s,n)=>s+n.meals,0), bad = cohort.reduce((s,n)=>s+n.badMeals,0);
  lastProbe = { alive: cohort.filter(n=>!n.dead).length/cohort.length, badMealShare: meals ? bad/meals : null,
                drinks: cohort.reduce((s,n)=>s+n.drinks,0)/cohort.length };
  return cohort.reduce((s,n)=>s + (n.age - MATURITY) + 500*n.offspring, 0) / cohort.length;
}
