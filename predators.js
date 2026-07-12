// Predators — now with evolving brains of their own (PRED_SCHEMA), so an
// arms race can develop: Nodlings evolve to evade, predators evolve to hunt.
// Same NEAT + plasticity machinery as Nodlings, a smaller sensory schema, and
// their own hall of fame so hunting skill persists across die-offs.
'use strict';

const PRED_CAP = 6;      // a viable predator layer, but capped so it can't crash the prey
const PRED_MIN = 2;
const PRED_SIGHT = 12;
const PRED_SPEED = 0.20; // slower than a sprinting Nodling — evasion still works
const predFame = [];   // best predator genomes ever (by kills + age)

class Predator {
  constructor(world, x, y, genome){
    this.world = world;
    this.x = x; this.y = y;
    this.genome = genome || randomGenome(world.rng, PRED_SCHEMA);
    this.brain = new Brain(this.genome, PRED_SCHEMA);
    this.energy = 70;
    this.age = 0;
    this.kills = 0;
    this.dead = false;
    this.prevPreyD = 0;
    this.buf = new Array(PRED_SCHEMA.nIn).fill(0);
  }

  tick(){
    const w = this.world;
    this.age++;

    // nearest Nodling (prey) and nearest other predator
    let prey = null, pd = PRED_SIGHT*PRED_SIGHT;
    for (const n of w.near(w.nIndex, this.x, this.y)){
      if (n.dead) continue;
      const d = (n.x-this.x)**2 + (n.y-this.y)**2;
      if (d < pd){ pd = d; prey = n; }
    }
    let op = null, od = 1e9;
    for (const q of w.predators){
      if (q === this || q.dead) continue;
      const d = (q.x-this.x)**2 + (q.y-this.y)**2;
      if (d < od){ od = d; op = q; }
    }

    const s = this.buf; s.fill(0);
    s[0] = 1;
    s[1] = this.energy/120;
    if (prey){ const dist = Math.sqrt(pd);
      s[2] = (prey.x-this.x)/PRED_SIGHT; s[3] = (prey.y-this.y)/PRED_SIGHT;
      s[4] = 1 - dist/PRED_SIGHT; s[5] = prey.energy/200; }
    if (op){ s[6] = (op.x-this.x)/PRED_SIGHT; s[7] = (op.y-this.y)/PRED_SIGHT; }
    const ahead = w.at((this.x + (s[2]>0?1:-1))|0, this.y|0);
    s[8] = (!ahead || ahead.water) ? 1 : 0;
    s[9] = Math.min(1, this.age/1500);
    s[10] = w.rng()*2 - 1;

    // reward: close distance to prey (bootstraps hunting) + big bonus on a kill
    let reward = -0.02;
    const preyD = prey ? Math.sqrt(pd) : PRED_SIGHT;
    if (prey && this.prevPreyD) reward += Math.max(-1, Math.min(1, (this.prevPreyD - preyD)*0.6));
    this.prevPreyD = preyD;

    if (prey && pd < 0.8*0.8){                 // caught it
      prey.die(w.at(prey.x|0, prey.y|0));
      this.energy = Math.min(130, this.energy + 45);
      this.kills++;
      reward = 1;
    }
    const out = this.brain.step(s, reward);

    const nx = this.x + out.moveX*PRED_SPEED, ny = this.y + out.moveY*PRED_SPEED;
    const dest = w.at(nx|0, ny|0);
    if (dest && !dest.water && dest.stack.length < 3){
      this.x = Math.max(0, Math.min(GRID_W-0.01, nx));
      this.y = Math.max(0, Math.min(GRID_H-0.01, ny));
    }

    this.energy -= 0.04; // gentler upkeep so predators survive lean stretches
    const amb = w.ambient();
    if (amb < -3) this.energy -= (-3 - amb)*0.015;

    if (this.energy <= 0){ this.dead = true; return null; }
    if (this.age > 250 && this.energy > 80 && w.predCount < PRED_CAP && w.rng() < 0.003){
      this.energy -= 40;
      return new Predator(w, this.x, this.y, mutateGenome(this.genome, w.rng, PRED_SCHEMA));
    }
    return null;
  }
}

function predFameGenome(world){
  if (predFame.length && world.rng() < 0.7)
    return mutateGenome(predFame[(world.rng()*predFame.length)|0].genome, world.rng, PRED_SCHEMA);
  return randomGenome(world.rng, PRED_SCHEMA);
}

function spawnPredators(world, list, n){
  for (let i = 0; i < n; i++){
    const x = (world.rng()*GRID_W)|0, y = (world.rng()*GRID_H)|0;
    const c = world.at(x, y);
    if (!c || c.water){ i--; continue; }
    list.push(new Predator(world, x + 0.5, y + 0.5, predFameGenome(world)));
  }
}

function updatePredators(world, list){
  world.predCount = list.length;
  const born = [];
  for (const p of list){ const b = p.tick(); if (b) born.push(b); }
  for (const p of list){
    if (!p.dead) continue;
    predFame.push({genome:p.genome, score:p.age + 400*p.kills});
    predFame.sort((a,b)=>b.score-a.score);
    predFame.length = Math.min(predFame.length, 10);
  }
  let alive = list.filter(p => !p.dead).concat(born);
  if (alive.length < PRED_MIN && world.pop > 45 && world.rng() < 0.05)
    spawnPredators(world, alive, 1);
  return alive;
}
