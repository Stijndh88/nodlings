// A Nodling: biological needs + an evolved AST brain. This class only wires
// senses to the brain and the brain's outputs to physics. It contains zero
// behavioral rules — what a Nodling *does* lives entirely in its genome.
'use strict';

const VISION = 6;      // vision disc radius — the per-tick sensing cost driver
const EARSHOT = 12;
const POP_CAP = 250;   // bigger world supports a larger, more diverse gene pool
const MATURITY = 160;  // age below which a Nodling is a juvenile (can't breed, sees less)
const SENESCENCE = 900;// age past which upkeep rises (aging)
const MAX_ENERGY = 240;// higher ceiling → Nodlings can fatten up to buffer winter

class Nodling {
  constructor(world, x, y, genome, gen = 0){
    this.world = world;
    this.x = x; this.y = y;
    this.genome = genome || randomGenome(world.rng);
    this.gen = gen;
    this.energy = 120;         // dies at 0 (max 200)
    this.hydration = 100;      // dies at 0
    this.bodyTemp = 15;
    this.age = 0;
    this.offspring = 0;
    this.dead = false;
    this.carrying = null;      // material name or null
    this.mem = [0, 0];         // recurrent memory, written by the brain itself
    this.facing = [1, 0];
    this.brain = new Brain(this.genome);         // owns per-life plastic weights
    this.brainSize = genomeSize(this.genome);
    this.phase = (world.rng()*2)|0;  // staggers brain re-evaluation across ticks
    this.lastOut = null;
    this.senseBuf = new Array(N_SENSES).fill(0); // reused each eval (no per-tick alloc)
    this.lastWellbeing = this.wellbeing();
    this.bonus = 0;                              // one-shot reward (e.g. reproduction)
    this.foodMem = null;                         // remembered [x,y] of food/water/shelter
    this.waterMem = null;
    this.shelterMem = null;
    this.senseEMA = new Array(N_SENSES).fill(0);  // running sense average → curiosity
    this.behav = new Float64Array(6);             // lifetime behaviour tallies → novelty
    this.behavN = 0;
  }

  // Normalised behaviour signature: rates of move/eat/manipulate/strike/call/swim-edge.
  // Novelty search compares these across the population to reward doing something new.
  signature(){
    const n = this.behavN || 1, s = this.behav;
    return [s[0]/n, s[1]/n, s[2]/n, s[3]/n, s[4]/n, s[5]/n];
  }

  // Scalar "how well am I doing" — its per-tick *change* is the learning signal.
  wellbeing(){
    const comfort = 1 - Math.min(1, Math.abs(this.bodyTemp - COMFORT)/20);
    return this.energy/MAX_ENERGY*0.5 + this.hydration/100*0.3 + comfort*0.2;
  }

  // Sense index map (N_SENSES = 43):
  //  0 bias | 1 energy | 2 hydration | 3 body temp
  //  4-5 flora | 6-7 water | 8-9 wood | 10-11 stone | 12-13 data   (nearest dx,dy in view)
  //  14-15 nearest nodling | 16 carrying? | 17 carried insulation | 18 stack height here
  //  19 local warmth vs ambient (shelter signal) | 20-21 nearest structure
  //  22 heard freq | 23-24 heard sound dir | 25-26 recurrent memory
  //  27 coldness | 28 noise
  //  -- proprioception --   29-30 facing | 31 maturity(age)
  //  -- spatial memory --   32-33 remembered food dir | 34-35 water dir | 36-37 shelter dir
  //  -- threat --           38-39 nearest predator dir | 40 predator proximity(threat)
  //  -- social --           41 neighbour energy | 42 kinship
  //  -- imitation --        43-44 neighbour's last move | 45 neighbour's last action
  //  -- fire --             46-47 nearest fire dir | 48 on fire / heat here
  sense(){
    const w = this.world, cx = this.x|0, cy = this.y|0;
    const s = this.senseBuf; s.fill(0);
    const vis = this.age < MATURITY ? 4 : VISION;   // juveniles see less far
    const scan = w.senseScan(cx, cy, vis);
    const put = (i, off) => { if (off){ s[i] = off[0]/VISION; s[i+1] = off[1]/VISION; } };
    const memDir = (i, m) => { if (m){ s[i] = Math.max(-1, Math.min(1, (m[0]-this.x)/30));
                                       s[i+1] = Math.max(-1, Math.min(1, (m[1]-this.y)/30)); } };
    s[0] = 1;
    s[1] = this.energy/MAX_ENERGY;
    s[2] = this.hydration/100;
    s[3] = (this.bodyTemp - 15)/20;
    put(4, scan.flora); put(6, scan.water); put(8, scan.wood);
    put(10, scan.stone); put(12, scan.data);

    // update spatial memory from anything currently in view (remember where it was)
    if (scan.flora)     this.foodMem    = [cx + scan.flora[0],     cy + scan.flora[1]];
    if (scan.water)     this.waterMem   = [cx + scan.water[0],     cy + scan.water[1]];
    if (scan.structure) this.shelterMem = [cx + scan.structure[0], cy + scan.structure[1]];

    let bn = null, bd = VISION*VISION;
    for (const o of w.near(w.nIndex, this.x, this.y)){
      if (o === this || o.dead) continue;
      const d = (o.x-this.x)**2 + (o.y-this.y)**2;
      if (d < bd){ bd = d; bn = o; }
    }
    if (bn){ s[14] = (bn.x-this.x)/VISION; s[15] = (bn.y-this.y)/VISION; }

    s[16] = this.carrying ? 1 : 0;
    s[17] = this.carrying ? MATERIALS[this.carrying].insulation : 0;
    const here = w.at(cx, cy);
    s[18] = here ? here.stack.length/4 : 0;
    s[19] = (w.cellTemp(cx, cy) - w.ambient())/20;
    put(20, scan.structure);

    let bs = null, bsd = EARSHOT*EARSHOT;
    for (const snd of w.near(w.sIndex, this.x, this.y)){
      const d = (snd.x-this.x)**2 + (snd.y-this.y)**2;
      if (d < bsd){ bsd = d; bs = snd; }
    }
    if (bs){ s[22] = bs.f; s[23] = (bs.x-this.x)/EARSHOT; s[24] = (bs.y-this.y)/EARSHOT; }

    s[25] = this.mem[0]; s[26] = this.mem[1];
    s[27] = Math.max(0, (COMFORT - this.bodyTemp)/20);
    s[28] = w.rng()*2 - 1;

    s[29] = this.facing[0]; s[30] = this.facing[1];
    s[31] = Math.min(1, this.age/1000);
    memDir(32, this.foodMem); memDir(34, this.waterMem); memDir(36, this.shelterMem);

    // nearest predator (few of them) — direction + how close/threatening
    let bp = null, bpd = 12*12;
    for (const p of w.predators){
      if (p.dead) continue;
      const d = (p.x-this.x)**2 + (p.y-this.y)**2;
      if (d < bpd){ bpd = d; bp = p; }
    }
    if (bp){ s[38] = (bp.x-this.x)/12; s[39] = (bp.y-this.y)/12; s[40] = 1 - Math.sqrt(bpd)/12; }

    // social: neighbour's health, kinship (hue ≈ lineage), and its last action
    // (so imitation can be *learned* — the brain may choose to copy it)
    if (bn){
      s[41] = bn.energy/MAX_ENERGY;
      const hd = Math.abs(((bn.genome.hue - this.genome.hue + 540) % 360) - 180);
      s[42] = 1 - Math.min(1, hd/120);
      const bo = bn.lastOut;
      if (bo){ s[43] = bo.moveX; s[44] = bo.moveY;
               s[45] = Math.max(Math.abs(bo.strike), Math.abs(bo.interact), Math.abs(bo.grab)); }
    }

    memDir(46, scan.fire ? [cx + scan.fire[0], cy + scan.fire[1]] : null);
    s[48] = (here && here.fire) ? 1 : (scan.fire ? 0.4 : 0);
    return s;
  }

  // Returns a newborn Nodling or null.
  tick(){
    const w = this.world;
    this.age++;
    // Think every other tick (a ~2-tick reaction time), but still act every
    // tick with the last decision — halves the dominant sensing cost. On each
    // think, feed the brain a reward (change in well-being + any bonus) so its
    // plastic synapses learn within this lifetime.
    let out = this.lastOut;
    if (!out || !((w.tick + this.phase) & 1)){
      const s = this.sense();
      // curiosity: reward for how novel the current situation is vs. its running
      // average — an intrinsic drive to explore, which speeds up discovery
      let nov = 0;
      for (let i = 0; i < N_SENSES; i++){
        nov += Math.abs(s[i] - this.senseEMA[i]);
        this.senseEMA[i] = this.senseEMA[i]*0.98 + s[i]*0.02;
      }
      const wb = this.wellbeing();
      // alarm-call seed: reward the *previous* sound emission if a predator
      // turns out to be nearby now — a proxy for "called near danger", which
      // gives calling near threats a fitness edge to select for even though
      // callers get no direct benefit from listeners' reactions.
      const alarmBonus = (out && Math.abs(out.sound) > 0.15) ? s[40]*0.3 : 0;
      const reward = Math.max(-1, Math.min(1,
        (wb - this.lastWellbeing)*8 + this.bonus + (nov/N_SENSES)*0.3 + alarmBonus));
      this.lastWellbeing = wb; this.bonus = 0;
      out = this.brain.step(s, reward);
      this.lastOut = out;
      this.mem = [out.mem0, out.mem1];
      // accumulate behaviour signature (what this individual actually does)
      const b = this.behav;
      b[0] += Math.hypot(out.moveX, out.moveY);
      b[1] += out.interact > 0.5 ? 1 : 0;
      b[2] += (out.grab > 0.5 || out.drop > 0.5) ? 1 : 0;
      b[3] += out.strike > 0.5 ? 1 : 0;
      b[4] += Math.abs(out.sound) > 0.15 ? 1 : 0;
      b[5] += w.at(this.x|0, this.y|0)?.water ? 1 : 0;
      this.behavN++;
    }

    // -- move: water is a hard barrier (no swimming) unless it's been bridged
    //    (a water cell carrying dropped material is walkable). Stacks of 3+ are
    //    solid walls. --
    const nx = Math.max(0, Math.min(GRID_W - 0.01, this.x + out.moveX*0.25));
    const ny = Math.max(0, Math.min(GRID_H - 0.01, this.y + out.moveY*0.25));
    const dest = w.at(nx|0, ny|0);
    if (dest && dest.stack.length < 3 && (!dest.water || dest.stack.length > 0)){
      this.x = nx; this.y = ny;
    }
    const fx = out.moveX > 0.3 ? 1 : out.moveX < -0.3 ? -1 : 0;
    const fy = out.moveY > 0.3 ? 1 : out.moveY < -0.3 ? -1 : 0;
    if (fx || fy) this.facing = [fx, fy];

    const cx = this.x|0, cy = this.y|0;
    const cell = w.at(cx, cy);

    // -- grab / drop --
    if (out.grab > 0.5 && !this.carrying && cell.stack.length)
      this.carrying = cell.stack.pop();
    // -- drop: onto a faced water cell with buoyant cargo, it lays a bridge
    //    tile (walkable); otherwise it drops on the current cell as usual --
    if (out.drop > 0.5 && this.carrying){
      const fc = w.at(cx + this.facing[0], cy + this.facing[1]);
      if (fc && fc.water && !fc.stack.length && MATERIALS[this.carrying].buoyant){
        fc.stack.push(this.carrying); // bridge
      } else {
        cell.stack.push(this.carrying);
      }
      this.carrying = null;
    }

    // -- interact: outcome depends on what's actually here, not on a verb menu --
    if (out.interact > 0.5){
      const top = cell.stack[cell.stack.length-1];
      if (this.carrying && MATERIALS[this.carrying].nutrition){
        this.eat(this.carrying); this.carrying = null;
      } else if (top && MATERIALS[top].nutrition){
        this.eat(cell.stack.pop());
      } else if (cell.water || w.adjacentWater(cx, cy)){
        this.hydration = 100;
      }
    }

    // -- strike: hunt a critter in the faced cell (drops meat), or knock the
    //    top material off it. Hunting is a learnable food source: face + strike. --
    if (out.strike > 0.5 && (this.facing[0] || this.facing[1])){
      const tx = cx + this.facing[0], ty = cy + this.facing[1];
      const t = w.at(tx, ty);
      for (const cr of w.near(w.cIndex, tx + 0.5, ty + 0.5)){
        if (cr.dead) continue;
        if ((cr.x-(tx+0.5))**2 + (cr.y-(ty+0.5))**2 < 0.9){
          cr.dead = true;
          (t || cell).stack.push('meat');
          break;
        }
      }
      if (t && t.stack.length && !t.stack.includes('fiber')){ // fiber binds a stack vs. strikes
        const top = t.stack[t.stack.length-1];
        if (top === 'wood' && w.rng() < 0.25){
          t.stack[t.stack.length-1] = 'plank';   // working the wood hardens it
        } else {
          t.stack.pop();
          const n = w.at(cx + ((w.rng()*3)|0) - 1, cy + ((w.rng()*3)|0) - 1);
          (n || cell).stack.push(top);
        }
      }
      this.energy -= 1;
    }

    // -- sound: a frequency in [0,1]; meaning, if any, must be evolved. Calling
    //    *while something matters nearby* (food underfoot, or a predator close)
    //    earns a small reward, so informative signalling can bootstrap. --
    if (Math.abs(out.sound) > 0.15){
      w.nextSounds.push({x:this.x, y:this.y, f:(out.sound+1)/2});
      this.energy -= 0.1;
      const topNut = cell.stack.length && MATERIALS[cell.stack[cell.stack.length-1]].nutrition;
      let predNear = false;
      for (const p of w.predators) if (!p.dead && (p.x-this.x)**2+(p.y-this.y)**2 < 36){ predNear = true; break; }
      if (topNut || predNear) this.bonus += 0.25;
    }

    // -- metabolism: thinking, moving, swimming, aging, and buggy code cost energy --
    const moving = Math.hypot(out.moveX, out.moveY);
    this.energy -= 0.035 + this.brainSize*0.0001 + moving*0.04
                 + (cell.water ? 0.08 : 0) + (out.glitch ? 0.5 : 0)
                 + (this.age > SENESCENCE ? (this.age - SENESCENCE)*0.0004 : 0); // senescence
    this.hydration -= 0.045 + (this.bodyTemp > 28 ? 0.05 : 0);

    // -- fire: standing in it burns; a real hazard to learn to avoid --
    if (cell.fire){ this.energy -= 4; if (w.rng() < 0.06){ this.die(cell); return null; } }

    // -- temperature: body drifts toward local temp. Ideal is COMFORT (18°).
    //    Outside the comfort band energy drains; past the lethal band a per-tick
    //    death roll grows with how far past the limit you are (shelter mitigates). --
    this.bodyTemp += (w.cellTemp(cx, cy) - this.bodyTemp)*0.03;
    if (this.bodyTemp < TEMP_COMFORT_LO) this.energy -= (TEMP_COMFORT_LO - this.bodyTemp)*0.05;
    if (this.bodyTemp > TEMP_COMFORT_HI) this.energy -= (this.bodyTemp - TEMP_COMFORT_HI)*0.04;
    let mortal = 0;
    if (this.bodyTemp < TEMP_LETHAL_LO) mortal = (TEMP_LETHAL_LO - this.bodyTemp)*0.004;
    else if (this.bodyTemp > TEMP_LETHAL_HI) mortal = (this.bodyTemp - TEMP_LETHAL_HI)*0.004;

    if (this.energy <= 0 || this.hydration <= 0 || (mortal > 0 && w.rng() < mortal)){
      this.die(cell); return null;
    }

    // -- reproduction: thrive long enough and the genome propagates. Crowding
    //    suppresses it (density dependence damps the boom-bust swings). The
    //    crowd scan only runs for breeding-eligible Nodlings — a big saving. --
    const eligible = this.energy > 130 && this.hydration > 50 && this.age > 140 && w.pop < POP_CAP;
    // Speciation via fitness sharing: you compete for breeding mostly with your
    // OWN kind (similar colour, diet, brain size), so a novel or rare lineage
    // isn't smothered by the dominant one — this preserves diversity.
    let crowd = 0;
    if (eligible)
      for (const o of w.near(w.nIndex, this.x, this.y)){
        if (o === this || o.dead || (o.x-this.x)**2 + (o.y-this.y)**2 >= 25) continue;
        const hd = Math.abs(((o.genome.hue - this.genome.hue + 540) % 360) - 180)/180;
        const dd = Math.abs((o.genome.diet ?? 0.5) - (this.genome.diet ?? 0.5));
        const db = Math.abs(o.brainSize - this.brainSize)/120;
        crowd += Math.max(0, 1 - (hd + dd + db)*1.5); // ~1 for kin, ~0 for a different species
      }
    // Novelty search: behaving differently from the population earns extra
    // breeding chance, pushing the world to keep discovering instead of converging.
    const nov = eligible ? behaviorNovelty(this.signature()) : 0;
    if (eligible && w.rng() < 0.008*(1 - Math.min(0.92, crowd*0.16))*(1 + nov*1.5)){
      this.energy -= 60;
      this.offspring++;
      this.bonus = 1;   // reproduction is strongly rewarding to the learner
      let mate = null;
      for (const o of w.near(w.nIndex, this.x, this.y))
        if (o !== this && !o.dead && o.energy > 100
            && (o.x-this.x)**2 + (o.y-this.y)**2 < 4){ mate = o; break; }
      const g = mutateGenome(
        mate ? crossoverGenome(this.genome, mate.genome, w.rng) : this.genome, w.rng);
      const child = new Nodling(w, this.x, this.y, g, this.gen + 1);
      // nest bonus: breeding inside a cluster of structures gives the newborn a
      // head start, so settling and building together pays off (drives villages)
      let nest = 0;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++){
        const nc = w.at(cx+dx, cy+dy); if (nc && nc.stack.length >= 2) nest++;
      }
      if (nest >= 4) child.energy += 45;
      archiveBehavior(this.signature()); // record what a *successful* breeder did
      return child;
    }
    return null;
  }

  eat(mat){
    // Diet niche (evolved gene, 0 herbivore .. 1 carnivore): herbivores get more
    // from plants, carnivores more from meat. This splits the population into
    // niches that exploit different foods — more diversity, higher total capacity.
    const d = this.genome.diet ?? 0.5;
    const plant = mat === 'flora' || mat === 'seed';
    const flesh = mat === 'meat' || mat === 'cooked';
    const mult = plant ? 1.3 - d*0.9 : flesh ? 0.5 + d*0.9 : 1;
    this.energy = Math.min(MAX_ENERGY, this.energy + MATERIALS[mat].nutrition*mult);
    if (mat === 'data') this.brain.boost = 6;   // plasticity surge: learn fast for a while
    const drops = MATERIALS[mat].drops;         // e.g. flora → a plantable seed
    if (drops) for (const d of drops)
      if (this.world.rng() < d.chance) this.world.scatterItem(this.x|0, this.y|0, d.item);
  }

  die(cell){
    this.dead = true;
    if (this.carrying){ cell.stack.push(this.carrying); this.carrying = null; }
    // Leave a corpse: mostly meat (so scavenging can emerge), sometimes biomass.
    if (cell.stack.length < 3) cell.stack.push(this.world.rng() < 0.6 ? 'meat' : 'flora');
  }
}
