// A Nodling: a body with needs and an evolved brain. This file wires senses to
// the brain, hands the brain's outputs to actions.js, and runs the body
// (metabolism, temperature, death, breeding). It contains no behaviour and no
// reward except the change in the body's own state.
'use strict';

const VISION = 6;        // vision disc radius
const EARSHOT = 12;
const POP_CAP = 250;     // crowding starts to cost energy at 80% of this; hard stop at 130%
const MATURITY = 400;    // one day: below this a Nodling is a child (cannot breed, sees less far)
const SENESCENCE = 6400; // two years: past this upkeep rises
const MAX_ENERGY = 240;
const START_ENERGY = 100;
const BREED_ENERGY = 130, BREED_COST = 80, BREED_RATE = 0.0015;   // slow breeding: long lives, generations of about a year
const THIRST_RATE = 0.06;   // hydration lost per tick: a drink lasts about 1650 ticks (4 days)
const THINK_EVERY = 2;      // the brain decides every other tick; the body acts every tick

class Nodling {
  constructor(world, x, y, genome, gen = 0){
    this.world = world;
    this.id = world.nextId++;
    this.x = x; this.y = y;
    this.genome = genome || randomGenome(world.rng);
    this.gen = gen;
    this.energy = START_ENERGY;   // dies at 0
    this.hydration = 100;         // dies at 0
    this.bodyTemp = COMFORT;
    this.pain = 0;                // recent damage (burns, bites), fades
    this.age = 0;
    this.offspring = 0;
    this.dead = false;
    this.carrying = null;         // material name or null
    this.mem = [0, 0, 0, 0];      // memory outputs, fed back as senses
    this.facing = [1, 0];
    this.brain = new Brain(this.genome);         // owns this life's learned weights
    this.brainSize = genomeSize(this.genome);
    this.drive = this.genome.drive || [1, 1, 1, 1];
    this.phase = (world.rng()*THINK_EVERY)|0;    // staggers thinking across ticks
    this.lastOut = null;
    this.senseBuf = new Array(N_SENSES).fill(0);
    this.lastWellbeing = this.wellbeing();
    this.rewardAvg = 0;           // what this body has come to expect
    this.lastGain = 0;            // last change in wellbeing (others can see it)
    this.waterMem = null;         // where it last drank
    this.foodMem = null;          // where it last ate something good
    this.meals = 0; this.badMeals = 0; this.drinks = 0;   // life tallies (metrics only)
  }

  // How good the body feels. Its CHANGE is the only learning signal there is.
  // The four drive genes set how much energy, water, comfort and pain count.
  wellbeing(){
    const comfort = 1 - Math.min(1, Math.abs(this.bodyTemp - COMFORT)/20), d = this.drive;
    return d[0]*this.energy/MAX_ENERGY*0.5 + d[1]*this.hydration/100*0.3 + d[2]*comfort*0.2 - d[3]*this.pain*0.3;
  }

  // Fill the sense vector. Index names are in senses.js.
  sense(){
    const w = this.world, cx = this.x|0, cy = this.y|0;
    const s = this.senseBuf; s.fill(0);
    const vis = this.age < MATURITY ? 4 : VISION;
    const scan = w.senseScan(cx, cy, vis);
    const put = (i, off) => { if (off){ s[i] = off[0]/VISION; s[i+1] = off[1]/VISION; } };
    const far = (i, m) => { if (m){ s[i] = Math.max(-1, Math.min(1, (m[0]-this.x)/30));
                                    s[i+1] = Math.max(-1, Math.min(1, (m[1]-this.y)/30)); } };
    s[S.bias] = 1;
    s[S.energy] = this.energy/MAX_ENERGY;
    s[S.hydration] = this.hydration/100;
    s[S.bodyTemp] = (this.bodyTemp - COMFORT)/20;
    s[S.pain] = this.pain;
    s[S.age] = Math.min(1, this.age/SENESCENCE);
    s[S.cold] = Math.max(0, (TEMP_COMFORT_LO - this.bodyTemp)/10);

    const held = propsOf(this.carrying);
    if (held){
      s[S.heldMass] = held.mass/5;
      s[S.handHard] = held.hard/5; s[S.handFuel] = held.fuel/40; s[S.handSmell] = held.smell;
      s[S.handLook] = held.look; s[S.handSharp] = held.sharp;
    }
    const ahead = w.at(cx + this.facing[0], cy + this.facing[1]), under = w.at(cx, cy);
    if (ahead){
      const m = propsOf(topOf(ahead));
      if (m){ s[S.aheadHard] = m.hard/5; s[S.aheadFuel] = m.fuel/40; s[S.aheadSmell] = m.smell; s[S.aheadLook] = m.look; }
      s[S.aheadHeat] = ahead.fire ? 1 : 0;
      s[S.aheadHeight] = ahead.stack.length/MAX_HEIGHT;
      s[S.aheadWater] = ahead.water ? 1 : 0;
    } else s[S.aheadHeight] = 1;      // the edge of the world reads as a wall
    const um = propsOf(topOf(under));
    if (um){ s[S.underHard] = um.hard/5; s[S.underFuel] = um.fuel/40; s[S.underSmell] = um.smell; s[S.underLook] = um.look; }
    s[S.underHeat] = under.fire ? 1 : 0;
    s[S.underHeight] = under.stack.length/MAX_HEIGHT;

    put(S.waterX, scan.water); put(S.heatX, scan.heat);
    put(S.plantAX, scan.plantA); put(S.plantBX, scan.plantB);
    put(S.fleshX, scan.flesh); put(S.hardX, scan.hard); put(S.fuelX, scan.fuel); put(S.wallX, scan.wall);

    let bc = null, bcd = vis*vis;
    for (const cr of w.near(w.cIndex, this.x, this.y)){
      if (cr.dead) continue;
      const d = (cr.x-this.x)**2 + (cr.y-this.y)**2;
      if (d < bcd){ bcd = d; bc = cr; }
    }
    if (bc){ s[S.animalX] = (bc.x-this.x)/VISION; s[S.animalY] = (bc.y-this.y)/VISION; }

    let bn = null, bd = VISION*VISION;
    for (const o of w.near(w.nIndex, this.x, this.y)){
      if (o === this || o.dead) continue;
      const d = (o.x-this.x)**2 + (o.y-this.y)**2;
      if (d < bd){ bd = d; bn = o; }
    }
    if (bn){
      s[S.nodlingX] = (bn.x-this.x)/VISION; s[S.nodlingY] = (bn.y-this.y)/VISION;
      const bo = bn.lastOut;
      if (bo){ s[S.otherMoveX] = bo.moveX; s[S.otherMoveY] = bo.moveY;
               s[S.otherAct] = Math.max(bo.use, bo.grab, bo.strike, bo.drop); }
      s[S.otherGain] = Math.max(-1, Math.min(1, bn.lastGain*4));
      s[S.otherAdult] = bn.age >= MATURITY ? 1 : -1;
      const hd = Math.abs(((bn.genome.hue - this.genome.hue + 540) % 360) - 180);
      s[S.kinship] = 1 - Math.min(1, hd/120);
      const oh = propsOf(bn.carrying);
      if (oh){ s[S.otherHoldsFood] = oh.smell; s[S.otherHoldsHard] = oh.hard/5; }
    }

    let bp = null, bpd = 12*12;
    for (const p of w.predators){
      if (p.dead) continue;
      const d = (p.x-this.x)**2 + (p.y-this.y)**2;
      if (d < bpd){ bpd = d; bp = p; }
    }
    if (bp){ s[S.predatorX] = (bp.x-this.x)/12; s[S.predatorY] = (bp.y-this.y)/12; s[S.threat] = 1 - Math.sqrt(bpd)/12; }

    let bs = null, bsd = EARSHOT*EARSHOT;
    for (const snd of w.near(w.sIndex, this.x, this.y)){
      const d = (snd.x-this.x)**2 + (snd.y-this.y)**2;
      if (d < bsd && d > 0.01){ bsd = d; bs = snd; }     // not its own call
    }
    if (bs){ s[S.heardPitch] = bs.f; s[S.heardX] = (bs.x-this.x)/EARSHOT; s[S.heardY] = (bs.y-this.y)/EARSHOT; }

    s[S.mem0] = this.mem[0]; s[S.mem1] = this.mem[1]; s[S.mem2] = this.mem[2]; s[S.mem3] = this.mem[3];
    s[S.noise] = w.rng()*2 - 1;
    s[S.facingX] = this.facing[0]; s[S.facingY] = this.facing[1];
    s[S.daylight] = Math.sin(w.dayFrac()*Math.PI*2 - Math.PI/2);
    s[S.season] = -Math.cos(w.yearPhase()*Math.PI*2);          // -1 midwinter .. +1 midsummer
    s[S.shelter] = (w.cellTemp(cx, cy) - w.ambient())/20;
    far(S.knownWaterX, this.waterMem); far(S.knownFoodX, this.foodMem);
    if (ENV.senseMask) for (const i of ENV.senseMask) s[i] = 0; // switched-off tests only
    return s;
  }

  // Returns a newborn Nodling or null.
  tick(){
    const w = this.world;
    this.age++;
    this.pain *= 0.9;

    // -- think: senses in, outputs out, and learn from how the body's state changed --
    let out = this.lastOut;
    if (!out || (w.tick + this.phase) % THINK_EVERY === 0){
      const s = this.sense();
      const wb = this.wellbeing();
      const gain = Math.max(-1, Math.min(1, (wb - this.lastWellbeing)*8));
      this.lastWellbeing = wb;
      const surprise = gain - this.rewardAvg;            // better or worse than expected
      this.rewardAvg += 0.02*(gain - this.rewardAvg);
      this.lastGain = gain;
      out = this.brain.step(s, surprise);
      if (ENV.outMask) for (const k of ENV.outMask) out[k] = 0;
      this.lastOut = out;
      this.mem = [out.mem0, out.mem1, out.mem2, out.mem3];
    }

    act(this, out);

    const cx = this.x|0, cy = this.y|0, cell = w.at(cx, cy);

    // -- metabolism: living, thinking, moving (more with a load), ageing, crowding --
    const moving = Math.hypot(out.moveX, out.moveY);
    const crowd = Math.max(0, w.pop - POP_CAP*0.8)/(POP_CAP*0.2);
    this.energy -= 0.04 + this.brainSize*0.0001 + moving*0.04*carryFactor(this.carrying)
                 + crowd*0.03 + (out.glitch ? 0.5 : 0)
                 + (this.age > SENESCENCE ? (this.age - SENESCENCE)*0.00008 : 0);
    this.hydration -= THIRST_RATE*(this.bodyTemp > 28 ? 1.5 : 1)*ENV.thirst;

    // -- fire burns --
    if (cell.fire){ this.energy -= 4; this.pain = 1; }

    // -- temperature: the body drifts toward the temperature of its cell --
    this.bodyTemp += (w.cellTemp(cx, cy) - this.bodyTemp)*0.03;
    if (this.bodyTemp < TEMP_COMFORT_LO) this.energy -= (TEMP_COMFORT_LO - this.bodyTemp)*0.03*ENV.cold;
    if (this.bodyTemp > TEMP_COMFORT_HI) this.energy -= (this.bodyTemp - TEMP_COMFORT_HI)*0.03*ENV.cold;
    let mortal = 0;
    if (this.bodyTemp < TEMP_LETHAL_LO) mortal = (TEMP_LETHAL_LO - this.bodyTemp)*0.004;
    else if (this.bodyTemp > TEMP_LETHAL_HI) mortal = (this.bodyTemp - TEMP_LETHAL_HI)*0.004;

    if (this.energy <= 0 || this.hydration <= 0 || (mortal > 0 && w.rng() < mortal)){
      this.die(this.hydration <= 0 ? 'thirst' : this.energy > 0 ? 'temp' : cell.fire ? 'burned'
               : this.age > SENESCENCE ? 'age' : this.bodyTemp < TEMP_COMFORT_LO ? 'cold' : 'starved');
      return null;
    }

    // -- breeding: a well-fed adult breeds, and the better fed, the more often --
    if (this.age > MATURITY && this.energy > BREED_ENERGY && this.hydration > 40 && w.pop < POP_CAP*1.3){
      const surplus = 0.5 + 1.5*Math.min(1, (this.energy - BREED_ENERGY)/(MAX_ENERGY - BREED_ENERGY - 20));
      if (w.rng() < BREED_RATE*surplus){
        this.energy -= BREED_COST;
        this.offspring++;
        this.lastWellbeing = this.wellbeing();   // the cost of a child is not felt as a loss
        let mate = null, md = 4;
        for (const o of w.near(w.nIndex, this.x, this.y)){
          if (o === this || o.dead || o.age <= MATURITY || o.energy <= 100) continue;
          const d = (o.x-this.x)**2 + (o.y-this.y)**2;
          if (d < md){ md = d; mate = o; }
        }
        const g = mutateGenome(mate ? crossoverGenome(this.genome, mate.genome, w.rng) : this.genome, w.rng);
        const child = new Nodling(w, this.x, this.y, g, this.gen + 1);
        child.energy = START_ENERGY;
        child.bodyTemp = this.bodyTemp;
        return child;
      }
    }
    return null;
  }

  eat(item){
    const w = this.world, v = foodValue(w, item), m = MATERIALS[item];
    this.energy = Math.min(MAX_ENERGY, this.energy + v);
    this.meals++;
    if (v < 0) this.badMeals++; else this.foodMem = [this.x, this.y];
    ledger(w, this, 'use', 'none', m.smell >= 1 ? 'flesh' : m.kind !== null ? 'plant' : 'food', v < 0 ? 'eat-bad' : 'eat');
    if (m.drops) for (const d of m.drops)
      if (w.rng() < d.chance) w.scatterItem(this.x|0, this.y|0, d.item);
  }

  die(cause){
    if (this.dead) return;
    const w = this.world, cell = w.at(this.x|0, this.y|0);
    this.dead = true;
    w.deathCauses[cause] = (w.deathCauses[cause] || 0) + 1;
    if (this.carrying){ w.scatterItem(this.x|0, this.y|0, this.carrying); this.carrying = null; }
    if (cell.stack.length < NATURAL_HEIGHT && !cell.water) cell.stack.push(CARCASS);
  }
}
