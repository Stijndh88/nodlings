// World 2 ecosystem: a grid of cells, each {water, sand, fire, stack:[materialName]}.
// Everything that happens to a material follows from its row in materials.js;
// no rule in this file names a material. Nothing piles up forever: every item
// rots, burns or is eaten, and nature never stacks higher than 2.
'use strict';

const GRID_W = 200, GRID_H = 150, CELL = 1;   // a continent ringed by ocean
const DAY_LEN = 400;                           // ticks per day/night cycle
const DAYS_PER_YEAR = 8;                       // 2 days per season
const YEAR_LEN = DAY_LEN*DAYS_PER_YEAR;        // 3200 ticks: a Nodling lives through several
const SEASONS = ['Spring','Summer','Autumn','Winter'];
const COMFORT = 18;                            // body temp Nodlings do best at
const HASH_B = 12;                             // spatial-index bucket size (>= EARSHOT)
const FIRE_SPREAD = 0.004;                     // per tick, per neighbouring cell with fuel on top
const HEAT_CHANGE = 0.1;                       // per tick chance that an item beside a fire takes its heated form
const DECAY_SAMPLES = 60;                      // cells sampled for decay per tick (x map area factor)
const NATURAL_HEIGHT = 2;                      // nature (seeds, corpses, new supply) never stacks higher than this

// Vital limits. Body temp drifts toward the local cell temperature; discomfort
// drains energy, extremes can kill.
const TEMP_COMFORT_LO = 10, TEMP_COMFORT_HI = 26; // outside this: energy drain
const TEMP_LETHAL_LO  = 0,  TEMP_LETHAL_HI  = 38; // past this: rising death chance

// mulberry32 — seedable, so runs are reproducible
function makeRng(seed){
  let a = seed >>> 0;
  const rng = function(){
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  rng.getState = () => a;
  rng.setState = s => { a = s >>> 0; };
  return rng;
}

// Shared scratch for senseScan — reused every eval to keep the hot path GC-free.
const SCAN_KINDS = ['water','heat','plantA','plantB','flesh','hard','fuel','wall'];
const _scanBest = {}, _scanDist = {};
const _nearBuf = [];

class World {
  constructor(seed = Date.now()){
    this.seed = seed >>> 0;
    this.rng = makeRng(seed);
    this.tick = 0;
    this.goodKind = 0;       // which plant kind is nourishing this year
    this.nextId = 1;         // Nodling ids (for the technique ledger)
    this.sounds = [];        // sounds emitted last tick (what Nodlings hear now)
    this.nextSounds = [];
    this.nIndex = new Map(); // spatial hash of living Nodlings, rebuilt each tick
    this.sIndex = new Map(); // spatial hash of audible sounds
    this.cIndex = new Map(); // spatial hash of critters
    this.pop = 0;
    this.deathCauses = {};   // per-process tally of why Nodlings died
    this.ledger = new Map(); // technique ledger: what was done with what, to what (see actions.js)
    this.ledgerActors = new Set();   // every Nodling that did anything since the ledger started (not saved: one batch)
    this.critterCount = 0;
    this.predators = [];
    this.predCount = 0;
    this.cells = Array.from({length:GRID_W*GRID_H}, ()=>({water:false, sand:false, fire:0, stack:[]}));
    this.fires = [];         // indices of currently-burning cells
    this.genContinent();
    this.genLakes();
    this.markSand();
    this.sandCells = []; this.cells.forEach((c, i) => { if (c.sand) this.sandCells.push(i); });
    for (const m of MATERIAL_LIST){
      if (m.wild) for (let i = 0; i < m.wild; i++) this.supply(m);
      if (m.spreads) this.scatter(m.name, 500);
    }
  }

  at(x, y){
    if (x < 0 || y < 0 || x >= GRID_W || y >= GRID_H) return null;
    return this.cells[y*GRID_W + x];
  }

  // An irregular landmass ringed by ocean. Water is a hard barrier.
  genContinent(){
    const cx = GRID_W/2, cy = GRID_H/2;
    const p1 = this.rng()*6.28, p2 = this.rng()*6.28, p3 = this.rng()*6.28;
    for (let y = 0; y < GRID_H; y++) for (let x = 0; x < GRID_W; x++){
      const dx = (x-cx)/(GRID_W*0.5), dy = (y-cy)/(GRID_H*0.5);
      const r = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
      const coast = 0.80 + 0.13*Math.sin(a*3+p1) + 0.07*Math.sin(a*5+p2) + 0.05*Math.sin(a*8+p3);
      if (r > coast) this.cells[y*GRID_W + x].water = true;
    }
  }

  genLakes(){
    for (let l = 0; l < 12; l++){
      let x = (this.rng()*GRID_W)|0, y = (this.rng()*GRID_H)|0;
      const len = 40 + (this.rng()*70|0);
      for (let i = 0; i < len; i++){
        for (const [dx,dy] of [[0,0],[1,0],[0,1],[1,1],[-1,0],[0,-1]]){
          const c = this.at(x+dx, y+dy);
          if (c) c.water = true;
        }
        x += ((this.rng()*3)|0) - 1;
        y += ((this.rng()*3)|0) - 1;
      }
    }
  }

  markSand(){
    for (let y = 0; y < GRID_H; y++) for (let x = 0; x < GRID_W; x++){
      const c = this.cells[y*GRID_W + x];
      if (c.water) continue;
      if (this.adjacentWater(x, y)) c.sand = true;
    }
  }

  scatter(mat, count){
    for (let i = 0; i < count; i++){
      const c = this.at((this.rng()*GRID_W)|0, (this.rng()*GRID_H)|0);
      if (c && !c.water && !c.stack.length) c.stack.push(mat);
    }
  }

  // Natural supply of a wild material: one item on a random empty land cell
  // (a sand cell for shore materials). A few tries, then give up for this tick.
  supply(m){
    for (let a = 0; a < 12; a++){
      const c = m.shore ? this.cells[this.sandCells[(this.rng()*this.sandCells.length)|0]]
                        : this.at((this.rng()*GRID_W)|0, (this.rng()*GRID_H)|0);
      if (c && !c.water && !c.stack.length){ c.stack.push(m.name); return true; }
    }
    return false;
  }

  // Drop an item on or near (cx,cy): loot, corpses, broken parts, knocked-off tops.
  // Nature never stacks above NATURAL_HEIGHT, so walls only come from deliberate placing.
  scatterItem(cx, cy, item){
    for (let a = 0; a < 8; a++){
      const x = cx + ((this.rng()*3)|0) - 1, y = cy + ((this.rng()*3)|0) - 1;
      const c = this.at(x, y);
      if (c && !c.water && c.stack.length < NATURAL_HEIGHT){ c.stack.push(item); return true; }
    }
    return false;   // nowhere to put it: it is lost
  }

  // --- time & climate ---
  // The year starts on the first day of Spring. Coldest in the middle of Winter.
  yearFrac(){ return (this.tick / YEAR_LEN) % 1; }
  dayFrac(){ return (this.tick % DAY_LEN) / DAY_LEN; }
  yearPhase(){ return (this.yearFrac() + 0.125) % 1; }   // 0 = midwinter
  season(){
    const p = this.yearPhase();
    if (p < 0.125 || p >= 0.875) return 'Winter';
    if (p < 0.375) return 'Spring';
    if (p < 0.625) return 'Summer';
    return 'Autumn';
  }
  ambient(){
    if (this._ambTick === this.tick) return this._amb;                 // asked many times per tick
    const seasonal = 16 - 12*Math.cos(this.yearPhase()*Math.PI*2);     // 4°..28°
    const daily = 4*Math.sin(this.dayFrac()*Math.PI*2 - Math.PI/2);    // ±4°
    this._ambTick = this.tick;
    return (this._amb = seasonal + daily);
  }
  isNight(){ const t = this.dayFrac(); return t < 0.22 || t > 0.78; }

  // Shelter physics: stacked material warms (or cools) the cells around it toward
  // COMFORT in proportion to its insulation; a nearby fire is a strong heat source.
  cellTemp(x, y){
    let ins = 0, fire = false;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++){
      const c = this.at(x+dx, y+dy);
      if (!c) continue;
      if (c.fire) fire = true;
      const st = c.stack;
      if (!st.length) continue;
      const w = st.length >= 2 ? 1 : 0.4;
      for (let i = 0; i < st.length; i++) ins += w * MATERIALS[st[i]].insul;
    }
    const a = this.ambient();
    let t = a + (COMFORT - a)*Math.min(1, ins*0.16);
    if (fire) t += (38 - t)*0.6;
    return t;
  }

  adjacentWater(x, y){
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++){
      const c = this.at(x+dx, y+dy);
      if (c && c.water) return true;
    }
    return false;
  }

  // One pass over the vision disc: nearest [dx,dy] per kind of thing, by PROPERTY:
  // water, heat (a burning cell), the two plant looks, flesh (smells strongly of
  // food), something hard, something that burns well, a wall.
  senseScan(cx, cy, r){
    const best = _scanBest, dist = _scanDist;
    for (const k of SCAN_KINDS){ best[k] = null; dist[k] = 1e9; }
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++){
      const d = dx*dx + dy*dy;
      if (d > r*r) continue;
      const c = this.at(cx+dx, cy+dy);
      if (!c) continue;
      if (c.water && d < dist.water){ dist.water = d; best.water = [dx,dy]; }
      if (c.fire && d < dist.heat){ dist.heat = d; best.heat = [dx,dy]; }
      const n = c.stack.length;
      if (!n) continue;
      if (n >= WALL_HEIGHT && d < dist.wall){ dist.wall = d; best.wall = [dx,dy]; }
      const m = MATERIALS[c.stack[n-1]];
      if (m.look > 0){ if (d < dist.plantA){ dist.plantA = d; best.plantA = [dx,dy]; } }
      else if (m.look < 0){ if (d < dist.plantB){ dist.plantB = d; best.plantB = [dx,dy]; } }
      else if (m.smell >= 1){ if (d < dist.flesh){ dist.flesh = d; best.flesh = [dx,dy]; } }
      if (m.hard >= SPARK_HARD && d < dist.hard){ dist.hard = d; best.hard = [dx,dy]; }
      if (m.fuel >= 10 && d < dist.fuel){ dist.fuel = d; best.fuel = [dx,dy]; }
    }
    return best;
  }

  // --- spatial index (rebuilt each tick from the live population) ---
  key(x, y){ return ((x/HASH_B)|0)*1024 + ((y/HASH_B)|0); }

  buildIndex(nodlings){
    this.nIndex.clear();
    for (const n of nodlings){
      const k = this.key(n.x, n.y);
      (this.nIndex.get(k) || this.nIndex.set(k, []).get(k)).push(n);
    }
    this.sIndex.clear();
    for (const s of this.sounds){
      const k = this.key(s.x, s.y);
      (this.sIndex.get(k) || this.sIndex.set(k, []).get(k)).push(s);
    }
  }

  // Everything in the 3x3 buckets around (x,y). Returns a shared array: use it
  // before the next call (no generator: this is one of the hottest paths).
  near(index, x, y){
    const out = _nearBuf; out.length = 0;
    const gx = (x/HASH_B)|0, gy = (y/HASH_B)|0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++){
      const list = index.get((gx+dx)*1024 + (gy+dy));
      if (list) for (let i = 0; i < list.length; i++) out.push(list[i]);
    }
    return out;
  }

  step(){
    this.tick++;
    // A new year: the nourishing and the poisonous plant kind swap. Nothing a
    // Nodling is born knowing tells it which is which; it has to find out.
    if (this.tick % YEAR_LEN === 0 && ENV.flip) this.goodKind = 1 - this.goodKind;

    const af = (GRID_W*GRID_H)/12288;                       // rates scale with map area
    const warmth = Math.max(0, Math.min(1, (this.ambient() + 2)/28));

    // Plants spread onto empty land beside water or beside another plant (and
    // then take that plant's kind, so each kind forms patches). Growth follows warmth.
    const tries = ((3 + warmth*22)*af*ENV.flora)|0;
    for (let i = 0; i < tries; i++){
      const x = (this.rng()*GRID_W)|0, y = (this.rng()*GRID_H)|0;
      const c = this.at(x, y);
      if (!c || c.water || c.stack.length || this.rng() >= 0.4) continue;
      const kind = this.plantSource(x, y);
      if (kind) c.stack.push(kind);
    }

    // Decay: sampled cells lose one item to rot (any layer, so buried things go too);
    // a sprouting item on top may grow instead.
    for (let i = 0, n = (DECAY_SAMPLES*af)|0; i < n; i++){
      const c = this.cells[(this.rng()*this.cells.length)|0];
      const len = c.stack.length;
      if (!len) continue;
      const li = (this.rng()*len)|0, m = MATERIALS[c.stack[li]];
      if (m.sprouts && li === len-1 && !c.water && this.rng() < 0.03 + warmth*0.07)
        c.stack[li] = m.sprouts[(this.rng()*m.sprouts.length)|0];
      else if (this.rng() < m.rot) c.stack.splice(li, 1);
    }

    // Supply: wild materials are replaced at the rate they rot away, so the
    // untouched world holds about `wild` of each.
    const period = this.cells.length/((DECAY_SAMPLES*af)|0);   // ticks between two samples of one cell
    for (const m of MATERIAL_LIST)
      if (m.wild && this.rng() < m.wild*m.rot/period) this.supply(m);
    // a little wind-blown seed so plants can recolonise burned or grazed ground
    if (this.rng() < 0.5*af*ENV.flora) this.scatter(PLANT_KINDS[(this.rng()*PLANT_KINDS.length)|0].name, 1);

    this.stepFire(warmth);
  }

  // Which plant would grow at (x,y)? The kind of a neighbouring plant, or a random
  // kind beside water. null if neither is near.
  plantSource(x, y){
    let water = false, found = null, seen = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++){
      const c = this.at(x+dx, y+dy);
      if (!c) continue;
      if (c.water) water = true;
      const top = c.stack[c.stack.length-1];
      if (top && MATERIALS[top].spreads && this.rng() < 1/(++seen)) found = top;   // uniform pick among neighbours
    }
    if (found) return found;
    return water ? PLANT_KINDS[(this.rng()*PLANT_KINDS.length)|0].name : null;
  }

  // The topmost item with fuel decides whether and how long a cell burns.
  ignite(idx){
    const c = this.cells[idx];
    if (c.fire) return false;
    for (let i = c.stack.length-1; i >= 0; i--){
      const f = MATERIALS[c.stack[i]].fuel;
      if (f){ c.fire = f*BURN_TICKS; this.fires.push(idx); return true; }
    }
    return false;
  }

  // Fire: burns the top item for as long as it has fuel, spreads to neighbouring
  // fuel, and turns neighbouring items into their heated form. Fuel placed on a
  // burning cell burns next, so a fire can be kept alive by feeding it.
  stepFire(warmth){
    if (this.rng() < 0.004*warmth) this.ignite((this.rng()*this.cells.length)|0);   // lightning
    if (!this.fires.length) return;
    const next = [];
    for (const idx of this.fires){
      const c = this.cells[idx];
      if (!c.fire) continue;
      const x = idx % GRID_W, y = (idx / GRID_W)|0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++){
        if (!dx && !dy) continue;
        const nc = this.at(x+dx, y+dy);
        if (!nc || !nc.stack.length) continue;
        const nm = MATERIALS[nc.stack[nc.stack.length-1]];
        if (nm.heated && this.rng() < HEAT_CHANGE) nc.stack[nc.stack.length-1] = nm.heated;
        else if (nm.fuel && !nc.fire && this.rng() < FIRE_SPREAD) this.ignite((y+dy)*GRID_W + (x+dx));
      }
      if (--c.fire <= 0){
        c.fire = 0;
        // the topmost item with fuel has burned away; if more fuel lies in the stack, it burns next
        let burned = false;
        for (let i = c.stack.length-1; i >= 0; i--){
          const f = MATERIALS[c.stack[i]].fuel;
          if (!f) continue;
          if (!burned){ c.stack.splice(i, 1); burned = true; }
          else { c.fire = f*BURN_TICKS; next.push(idx); break; }
        }
      } else next.push(idx);
    }
    this.fires = next;
  }
}
