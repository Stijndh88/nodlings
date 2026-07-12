// Neutral wildlife. Critters are deliberately NOT brain-evolved — they're simple
// scripted fauna (graze flora, flee Nodlings, breed, die). What they *mean* —
// prey, pest, companion — is for the Nodlings' evolved behavior to decide.
'use strict';

const CRITTER_CAP = 90;   // ample prey so hunting/carnivory is a viable niche
const CRITTER_MIN = 20;   // ambient wildlife floor: respawn a few if they crash

class Critter {
  constructor(world, x, y){
    this.world = world;
    this.x = x; this.y = y;
    this.energy = 50;
    this.age = 0;
    this.dead = false;
    this.dir = world.rng()*Math.PI*2;
    this.kind = world.rng() < 0.5 ? 0 : 1; // two cosmetic species
    this.phase = (world.rng()*2)|0;
    this.fleeing = false;
  }

  tick(){
    const w = this.world;
    this.age++;

    // Check for nearby Nodlings to flee only every other tick (predators don't
    // teleport); on off-ticks keep bolting if we were already spooked.
    if (!((w.tick + this.phase) & 1)){
      let fx = 0, fy = 0; this.fleeing = false;
      for (const n of w.near(w.nIndex, this.x, this.y)){
        if (n.dead) continue;
        const dx = this.x - n.x, dy = this.y - n.y, d = dx*dx + dy*dy;
        if (d < 16){ fx += dx/(d+0.2); fy += dy/(d+0.2); this.fleeing = true; }
      }
      if (this.fleeing) this.dir = Math.atan2(fy, fx);
    }
    let sp = 0.11;
    if (this.fleeing) sp = 0.19;                              // bolt away
    else if (w.rng() < 0.06) this.dir += w.rng()*1.6 - 0.8;  // idle wander

    const nx = this.x + Math.cos(this.dir)*sp, ny = this.y + Math.sin(this.dir)*sp;
    const dest = w.at(nx|0, ny|0);
    if (dest && !dest.water && dest.stack.length < 3){
      this.x = Math.max(0, Math.min(GRID_W-0.01, nx));
      this.y = Math.max(0, Math.min(GRID_H-0.01, ny));
    } else this.dir += 1.7; // turn away from walls/water

    // graze flora (competes with Nodlings for the same food)
    const c = w.at(this.x|0, this.y|0);
    if (c && c.stack[c.stack.length-1] === 'flora' && w.rng() < 0.1){
      c.stack.pop();
      this.energy = Math.min(90, this.energy + 16);
    }

    this.energy -= 0.035 + sp*0.08;
    const amb = w.ambient();
    if (amb < -2) this.energy -= (-2 - amb)*0.02; // winter thins the herds

    if (this.energy <= 0){
      this.dead = true;
      if (c && c.stack.length < 3 && w.rng() < 0.3) c.stack.push('meat');
      return null;
    }
    if (this.age > 180 && this.energy > 55 && w.critterCount < CRITTER_CAP && w.rng() < 0.004){
      this.energy -= 28;
      return new Critter(w, this.x, this.y);
    }
    return null;
  }
}

function spawnCritters(world, list, n){
  for (let i = 0; i < n; i++){
    const x = (world.rng()*GRID_W)|0, y = (world.rng()*GRID_H)|0;
    const c = world.at(x, y);
    if (!c || c.water){ i--; continue; }
    list.push(new Critter(world, x + 0.5, y + 0.5));
  }
}

function updateCritters(world, list){
  world.critterCount = list.length;
  world.cIndex.clear();
  for (const cr of list){
    const k = world.key(cr.x, cr.y);
    (world.cIndex.get(k) || world.cIndex.set(k, []).get(k)).push(cr);
  }
  const born = [];
  for (const cr of list){ const b = cr.tick(); if (b) born.push(b); }
  let alive = list.filter(cr => !cr.dead);
  alive = alive.concat(born);
  if (alive.length < CRITTER_MIN && world.rng() < 0.1) spawnCritters(world, alive, 4);
  return alive;
}
