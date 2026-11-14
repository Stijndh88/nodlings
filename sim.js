// Simulation core: world/population state, hall-of-fame persistence, and the
// tick loop. No DOM — shared by the browser (via main.js) and the headless
// loop harness (loop/run-headless.js).
'use strict';

let world = new World();
let nodlings = [];
let critters = [];
let predators = [];
const START_POP = 120, START_CRITTERS = 60, START_PREDATORS = 3;
const LIFE_SUPPORT = 40;  // extinction guard only: below this, one Nodling at a time trickles in from the gene bank
const fitnessOf = n => n.age + 500*n.offspring;   // lifetime score: survival plus offspring
const hallOfFame = []; // best genomes ever, by lifetime fitness — the "progress"
let births = 0, deaths = 0;
const popHist = [];

// UI hook — main.js overrides this in the browser; no-op in the headless harness.
function flashSaved(){}

// ---------- persistence ----------
const SAVE_KEY = 'nodlings.save.w2'; // World 2 genomes (new senses and outputs: old saves do not fit)

function serialize(){
  return JSON.stringify({
    v:4, tick:world.tick, births, deaths, popHist,
    fame: hallOfFame.map(h => ({score:h.score, genome:h.genome, gen:h.gen|0})),
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
    hallOfFame.push({genome:n.genome, score:fitnessOf(n), gen:n.gen});
    hallOfFame.sort((a,b)=>b.score-a.score);
    hallOfFame.length = Math.min(hallOfFame.length, 40); // deeper, more diverse seed bank
  }
  births += born.length;
  nodlings = nodlings.filter(n=>!n.dead).concat(ENV.noBirths ? [] : born); // probes score a fixed cohort
  critters = updateCritters(world, critters);
  // gentle life-support: trickle in one gene-bank Nodling at a time toward a
  // minimum, instead of dumping a crowd of clones — keeps a diverse standing
  // population without the reseed treadmill that reset the gene pool.
  if (!ENV.noBirths && nodlings.length < LIFE_SUPPORT && world.rng() < 0.04) seed(1);
  // Also enrol the best *living* Nodling periodically — in a stable population
  // the elite may never die, so death-only fame would lag and understate progress.
  if (world.tick % 300 === 0 && nodlings.length){
    let best = null, bs = -1;
    for (const n of nodlings){ const f = fitnessOf(n); if (f > bs){ bs = f; best = n; } }
    if (best){
      hallOfFame.push({genome:best.genome, score:bs, gen:best.gen});
      hallOfFame.sort((a,b)=>b.score-a.score);
      hallOfFame.length = Math.min(hallOfFame.length, 40);
    }
  }
  world.sounds = world.nextSounds;
  if (typeof commSample === 'function' && world.tick % 20 === 0) commSample();
  observerTick();

  if (world.tick % 150 === 0){
    popHist.push(nodlings.length);
    if (popHist.length > 220) popHist.shift();
  }
}


// ---------- whole-world snapshot (the loop's continuous world) ----------
// The hall of fame alone is a seed bank; this captures the *world itself* —
// terrain, structures, living creatures, RNG stream — so a headless batch
// resumes the same world instead of regenerating a new one each process.
// Per-life plastic weights are kept too (a Nodling mid-life stays mid-life).
const NODLING_SNAP = ['id','x','y','gen','energy','hydration','bodyTemp','pain','age','offspring','carrying',
                      'mem','facing','phase','foodMem','waterMem','rewardAvg','meals','badMeals','drinks'];
function snapNodling(n){
  const o = { genome:n.genome };
  for (const k of NODLING_SNAP) o[k] = n[k];
  o.w = Array.from(n.brain.w);
  return o;
}
function snapshotWorld(){
  const cells = world.cells.map(c => {
    const flags = (c.water?1:0) | (c.sand?2:0);
    return (flags || c.fire || c.stack.length) ? [flags, c.fire|0, c.stack] : 0;
  });
  return JSON.stringify({
    v:2, seed:world.seed, tick:world.tick, rng:world.rng.getState(), goodKind:world.goodKind, nextId:world.nextId,
    cells, fires:world.fires,
    nodlings: nodlings.map(snapNodling),
    critters: critters.map(c => ({x:c.x,y:c.y,energy:c.energy,age:c.age,dir:c.dir,kind:c.kind,phase:c.phase})),
    predators: predators.map(p => ({genome:p.genome,x:p.x,y:p.y,energy:p.energy,age:p.age,kills:p.kills,biteWait:p.biteWait})),
  });
}
function restoreWorld(json){
  const d = typeof json === 'string' ? JSON.parse(json) : json;
  world = new World(d.seed);
  if (d.v !== 2) throw new Error('this is not a World 2 snapshot');
  world.tick = d.tick; world.goodKind = d.goodKind|0;
  d.cells.forEach((v, i) => {
    const c = world.cells[i];
    if (!v){ c.water = false; c.sand = false; c.fire = 0; c.stack = []; return; }
    c.water = !!(v[0] & 1); c.sand = !!(v[0] & 2); c.fire = v[1]; c.stack = v[2];
  });
  world.fires = d.fires;
  nodlings = d.nodlings.map(o => {
    const n = new Nodling(world, o.x, o.y, o.genome, o.gen);
    for (const k of NODLING_SNAP) n[k] = o[k];
    if (o.w && o.w.length === n.brain.w.length) n.brain.w.set(o.w);
    n.lastWellbeing = n.wellbeing();
    return n;
  });
  critters = d.critters.map(o => { const c = new Critter(world, o.x, o.y); Object.assign(c, o); return c; });
  predators = d.predators.map(o => { const p = new Predator(world, o.x, o.y, o.genome); Object.assign(p, o); return p; });
  world.nextId = d.nextId || nodlings.length + 1;
  world.rng.setState(d.rng);
}
