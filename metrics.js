// Progress metrics for the autonomous loop. DOM-free; loaded after sim.js in the
// same context, so it reads world/nodlings/predators directly. These measure
// what the project is for (living-population quality, construction,
// communication) — unlike observerMetrics().fame, a peak that can only rise.
'use strict';

const DURABLE = ['wood','plank','stone','brick'];

// ---- communication probe: does call frequency differ when a predator is near? ----
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

// Largest 4-connected cluster of cells holding durable material — a village
// is many adjacent built tiles, not scattered stacking.
function largestCluster(){
  const seen = new Uint8Array(GRID_W*GRID_H);
  const durable = i => { const st = world.cells[i].stack; for (const m of st) if (DURABLE.includes(m)) return true; return false; };
  let best = 0, total = 0, bricks = 0;
  for (let i = 0; i < seen.length; i++){
    if (seen[i] || !durable(i)) continue;
    let size = 0; const q = [i]; seen[i] = 1;
    while (q.length){
      const j = q.pop(); size++;
      if (world.cells[j].stack.includes('brick')) bricks++;
      const x = j % GRID_W, y = (j / GRID_W)|0;
      for (const k of [x>0?j-1:-1, x<GRID_W-1?j+1:-1, y>0?j-GRID_W:-1, y<GRID_H-1?j+GRID_W:-1])
        if (k >= 0 && !seen[k] && durable(k)){ seen[k] = 1; q.push(k); }
    }
    total += size; if (size > best) best = size;
  }
  return { largest: best, builtCells: total, brickCells: bricks };
}

function loopMetrics(){
  const fit = nodlings.map(n => n.age + 250*n.offspring);
  const cl = largestCluster();
  const mean = a => a.length ? a.reduce((s,x)=>s+x,0)/a.length : 0;
  const cNear = comm.nNear ? comm.sumNear/comm.nNear : 0, cFar = comm.nFar ? comm.sumFar/comm.nFar : 0;
  return {
    day: +(world.tick/DAY_LEN).toFixed(2),
    population: nodlings.length,
    medianFitness: Math.round(median(fit)),
    meanFitness: Math.round(mean(fit)),
    peakFitness: hallOfFame[0] ? hallOfFame[0].score|0 : 0,   // kept for reference only; never use for guardrails
    maxGen: nodlings.reduce((m,n)=>Math.max(m,n.gen),0),
    avgBrain: +mean(nodlings.map(n=>n.brainSize)).toFixed(1),
    largestCluster: cl.largest, builtCells: cl.builtCells, brickCells: cl.brickCells,
    commSeparation: comm.nNear > 20 && comm.nFar > 20 ? +Math.abs(cNear-cFar).toFixed(4) : null,
  };
}

// ---- benchmark: how much better is the evolved gene pool than random genomes? ----
// Run inside a *fresh* context (see loop/run-headless.js). A cohort starts at
// tick 0 in a fixed-seed world; its score is mean lifetime fitness at the
// horizon (dead: final; alive: so far), so the evolved−random gap is a
// reproducible, ceiling-free measure of what evolution has accumulated.
function benchCohort(genomes, wseed, ticks, size){
  world = new World(wseed);
  nodlings = []; critters = []; predators = [];
  spawnCritters(world, critters, START_CRITTERS);
  spawnPredators(world, predators, START_PREDATORS);
  const cohort = [];
  for (let i = 0; i < size; i++){
    let x, y, c;
    do { x = (world.rng()*GRID_W)|0; y = (world.rng()*GRID_H)|0; c = world.at(x, y); } while (!c || c.water);
    const g = genomes ? genomes[i % genomes.length] : randomGenome(world.rng);
    const n = new Nodling(world, x+0.5, y+0.5, g, 0);
    nodlings.push(n); cohort.push(n);
  }
  for (let t = 0; t < ticks; t++) simTick();
  return cohort.reduce((s,n)=>s+n.age+250*n.offspring, 0) / cohort.length;
}
