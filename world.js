// Ecosystem: a grid of cells, each {water, sand, stack:[materialName]}.
// Materials are property bags — every outcome (buoyancy, shelter, food)
// derives from properties, never from a recipe table.
'use strict';

const GRID_W = 200, GRID_H = 150, CELL = 1;   // a larger continent ringed by ocean
const DAY_LEN = 1600;                          // ticks per day/night cycle
const DAYS_PER_YEAR = 32;                       // 8 days per season
const SEASONS = ['Spring','Summer','Autumn','Winter'];
const COMFORT = 18;                             // body temp Nodlings do best at
const HASH_B = 12;                              // spatial-index bucket size (>= EARSHOT)

// Vital limits (also surfaced in the sidebar '?' help). Body temp drifts toward
// the local cell temperature; discomfort drains energy, extremes can kill.
const TEMP_COMFORT_LO = 10, TEMP_COMFORT_HI = 26; // outside this: energy drain
const TEMP_LETHAL_LO  = 0,  TEMP_LETHAL_HI  = 38; // past this: rising death chance

// Materials are property bags. `drops` is an optional loot table rolled when the
// material is consumed — that's what turns eating flora into a seed you can plant.
const MATERIALS = {
  wood:  { color:'#8a5a2b', weight:2,   flammable:true,  buoyant:true,  insulation:0.6, nutrition:0  },
  // plank: worked wood. Not spawned — only made by striking wood repeatedly.
  // Better insulation, and buoyant so it can be laid over water as a bridge.
  plank: { color:'#c98f4e', weight:3,   flammable:true,  buoyant:true,  insulation:0.95, nutrition:0 },
  stone: { color:'#9a9aa2', weight:5,   flammable:false, buoyant:false, insulation:0.9, nutrition:0  },
  flora: { color:'#3fa34d', weight:0.5, flammable:true,  buoyant:true,  insulation:0.1, nutrition:42,
           drops:[{item:'seed', chance:0.6}, {item:'fiber', chance:0.15}] },
  seed:  { color:'#d8c36a', weight:0.1, flammable:true,  buoyant:true,  insulation:0,   nutrition:4  },
  meat:  { color:'#b5423f', weight:1,   flammable:false, buoyant:false, insulation:0,   nutrition:70 },
  cooked:{ color:'#d98a4f', weight:1,   flammable:false, buoyant:false, insulation:0,   nutrition:110 }, // meat + fire
  data:  { color:'#c94fd9', weight:0.2, flammable:false, buoyant:true,  insulation:0,   nutrition:6  },
  // clay hardens into brick in fire (a kiln); fiber binds structures vs. strikes
  clay:  { color:'#8a7360', weight:3,   flammable:false, buoyant:false, insulation:0.5, nutrition:0  },
  brick: { color:'#b06a48', weight:4,   flammable:false, buoyant:false, insulation:1.0, nutrition:0  },
  fiber: { color:'#9ab04a', weight:0.2, flammable:true,  buoyant:true,  insulation:0.2, nutrition:0  },
};
const PERISHABLE = { meat:0.012, cooked:0.02 };  // per-sample rot chance

// mulberry32 — seedable, so runs are reproducible
function makeRng(seed){
  let a = seed >>> 0;
  return function(){
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Shared scratch for senseScan — reused every eval to keep the hot path GC-free.
const _scanBest = {}, _scanDist = {};

class World {
  constructor(seed = Date.now()){
    this.seed = seed >>> 0;
    this.rng = makeRng(seed);
    this.tick = 0;
    this.sounds = [];        // sounds emitted last tick (what Nodlings hear now)
    this.nextSounds = [];    // sounds being emitted this tick
    this.nIndex = new Map(); // spatial hash of living Nodlings, rebuilt each tick
    this.sIndex = new Map(); // spatial hash of audible sounds
    this.cIndex = new Map(); // spatial hash of critters (for hunting lookups)
    this.pop = 0;            // set each tick by the driver
    this.critterCount = 0;
    this.predators = [];     // live predator list (for Nodling threat sensing)
    this.predCount = 0;
    this.cells = Array.from({length:GRID_W*GRID_H}, ()=>({water:false, sand:false, fire:0, stack:[]}));
    this.fires = [];         // indices of currently-burning cells
    this.genContinent();
    this.genLakes();
    this.markSand();
    this.depositClay();
    this.scatter('flora', 1000);
    this.scatter('wood', 440);
    this.scatter('stone', 280);
    this.scatter('data', 48);
  }

  at(x, y){
    if (x < 0 || y < 0 || x >= GRID_W || y >= GRID_H) return null;
    return this.cells[y*GRID_W + x];
  }

  // Carve an irregular landmass ringed by ocean: everything past a wobbly
  // radial coastline is sea. Water is a hard barrier — the ocean bounds the
  // playable continent (and makes natural firebreaks).
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

  // clay deposits along shorelines — raw material for brick (needs fire to fire it)
  depositClay(){
    for (const c of this.cells)
      if (c.sand && !c.stack.length && this.rng() < 0.06) c.stack.push('clay');
  }

  scatter(mat, count){
    for (let i = 0; i < count; i++){
      const c = this.at((this.rng()*GRID_W)|0, (this.rng()*GRID_H)|0);
      if (c && !c.water && !c.stack.length) c.stack.push(mat);
    }
  }

  // Drop an item on or near (cx,cy) — used by loot tables and dying critters.
  scatterItem(cx, cy, item){
    for (let a = 0; a < 6; a++){
      const x = cx + ((this.rng()*3)|0) - 1, y = cy + ((this.rng()*3)|0) - 1;
      const c = this.at(x, y);
      if (c && !c.water && c.stack.length < 3){ c.stack.push(item); return; }
    }
  }

  // --- time & climate ---
  yearFrac(){ return (this.tick / (DAY_LEN*DAYS_PER_YEAR)) % 1; }
  dayFrac(){ return (this.tick % DAY_LEN) / DAY_LEN; }
  // Season labels track the temperature curve: coldest at yearFrac 0 (Winter),
  // warmest at 0.5 (Summer), rising Spring and falling Autumn between.
  season(){
    const p = this.yearFrac();
    if (p < 0.125 || p >= 0.875) return 'Winter';
    if (p < 0.375) return 'Spring';
    if (p < 0.625) return 'Summer';
    return 'Autumn';
  }

  // Seasonal baseline plus a colder-at-night swing. Milder than before: winters
  // stress the population but don't mass-cull it to the reseed floor, so the
  // gene pool persists and evolution can actually accumulate.
  ambient(){
    const seasonal = 16 + 10*Math.sin(this.yearFrac()*Math.PI*2 - Math.PI/2); // 6°..26°
    const daily = 5*Math.sin(this.dayFrac()*Math.PI*2 - Math.PI/2);           // ±5°
    return seasonal + daily; // winter is now a lean, cool season — not a mass-killer,
                             // so the population is limited by FOOD (carrying capacity),
                             // which is the competition that rewards being smarter.
  }
  isNight(){ const t = this.dayFrac(); return t < 0.22 || t > 0.78; }

  // Shelter physics, now a *gradient*: any stacked material warms its cell
  // toward COMFORT; a wall (stack height >= 2) counts fully, a loose block
  // partially. This is what turns "drop wood near wood" into a survival edge —
  // and it pays off incrementally, so evolution has a slope to climb.
  cellTemp(x, y){
    let ins = 0, fire = false;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++){
      const c = this.at(x+dx, y+dy);
      if (!c) continue;
      if (c.fire) fire = true;
      if (!c.stack.length) continue;
      const w = c.stack.length >= 2 ? 1 : 0.4;
      ins += w * c.stack.reduce((t,m)=>t+MATERIALS[m].insulation, 0);
    }
    const a = this.ambient();
    let t = a + (COMFORT - a)*Math.min(1, ins*0.16);
    if (fire) t += (38 - t)*0.6;   // a nearby fire is a strong heat source
    return t;
  }

  adjacentWater(x, y){
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++){
      const c = this.at(x+dx, y+dy);
      if (c && c.water) return true;
    }
    return false;
  }

  // One pass over the vision disc: nearest [dx,dy] per target kind, incl. any
  // structure (stack >= 2) so brains can perceive existing shelter.
  // Uses shared scratch objects (consumed synchronously) to avoid per-eval GC.
  senseScan(cx, cy, r){
    const best = _scanBest, dist = _scanDist;
    best.flora = best.water = best.wood = best.stone = best.data = best.structure = best.fire = null;
    dist.flora = dist.water = dist.wood = dist.stone = dist.data = dist.structure = dist.fire = 1e9;
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++){
      const d = dx*dx + dy*dy;
      if (d > r*r) continue;
      const c = this.at(cx+dx, cy+dy);
      if (!c) continue;
      if (c.water && d < dist.water){ dist.water = d; best.water = [dx,dy]; }
      if (c.fire && d < dist.fire){ dist.fire = d; best.fire = [dx,dy]; }
      if (c.stack.length >= 2 && d < dist.structure){ dist.structure = d; best.structure = [dx,dy]; }
      const top = c.stack[c.stack.length-1];
      if (top && d < dist[top]){ dist[top] = d; best[top] = [dx,dy]; }
    }
    return best;
  }


  // --- spatial index (rebuilt each tick from the live population) ---
  key(x, y){ return ((x/HASH_B)|0) + ',' + ((y/HASH_B)|0); }

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

  *near(index, x, y){
    const gx = (x/HASH_B)|0, gy = (y/HASH_B)|0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++){
      const list = index.get((gx+dx) + ',' + (gy+dy));
      if (list) yield* list;
    }
  }

  step(){
    this.tick++;
    // Flora spreads near flora/water; growth tracks warmth, so winter starves
    // the map and rewards Nodlings that stored energy or built shelter.
    // Per-cell rates must scale with map area, or a bigger world starves as the
    // fixed sample count is spread thinner. `af` = area relative to the base map.
    const af = (GRID_W*GRID_H)/12288;
    const warmth = Math.max(0, Math.min(1, (this.ambient() + 5)/30));
    const tries = ((16 + warmth*70)*af)|0;   // resilient regrowth so booms don't crash food
    for (let i = 0; i < tries; i++){
      const x = (this.rng()*GRID_W)|0, y = (this.rng()*GRID_H)|0;
      const c = this.at(x, y);
      if (c && !c.water && !c.stack.length && this.rng() < 0.42 && this.floraCanGrow(x, y))
        c.stack.push('flora');
    }

    // Seeds germinate (faster when warm) and perishables (meat/cooked) rot away.
    for (let i = 0, n = (60*af)|0; i < n; i++){
      const c = this.at((this.rng()*GRID_W)|0, (this.rng()*GRID_H)|0);
      if (!c || !c.stack.length || c.water) continue;
      const top = c.stack[c.stack.length-1];
      if (top === 'seed' && this.rng() < 0.03 + warmth*0.07) c.stack[c.stack.length-1] = 'flora';
      else if (PERISHABLE[top] && this.rng() < PERISHABLE[top]) c.stack.pop();
    }

    // Weathering: unmaintained tall stacks slowly shed a block, so the map
    // doesn't clog with abandoned structures and shelter stays meaningful.
    // Brick and fiber-bound stacks endure — a real reward for proper building.
    for (let i = 0, n = (40*af)|0; i < n; i++){
      const c = this.at((this.rng()*GRID_W)|0, (this.rng()*GRID_H)|0);
      if (!c || c.water || c.stack.length < 2) continue;
      const top = c.stack[c.stack.length-1];
      if (top !== 'brick' && !c.stack.includes('fiber') && this.rng() < 0.02) c.stack.pop();
    }

    this.stepFire(warmth);

    // Wind-blown flora so the food supply can never permanently hit zero and
    // can recolonise burned/grazed ground.
    this.scatter('flora', (2*af)|0 || 1);
    if (this.rng() < 0.05*af) this.scatter('data', 1);
    if (this.rng() < 0.12*af) this.scatter('wood', 1);
  }

  ignite(idx){
    const c = this.cells[idx];
    const top = c.stack[c.stack.length-1];
    if (c.fire || c.water || !top || !MATERIALS[top].flammable) return false;
    c.fire = 5 + (this.rng()*4|0);
    this.fires.push(idx);
    return true;
  }

  // Fire: rare dry-season ignition, spreads to flammable neighbours, cooks meat,
  // fires clay into brick, then consumes what it burns. Deliberately kept
  // subcritical (low spread + short life) so it burns a patch and dies out —
  // water and stone are natural firebreaks — rather than wiping the map.
  stepFire(warmth){
    if (this.rng() < 0.002*warmth){                       // lightning / dry spark
      this.ignite((this.rng()*this.cells.length)|0);
    }
    if (!this.fires.length) return;
    const next = [];
    for (const idx of this.fires){
      const c = this.cells[idx];
      if (!c.fire) continue;
      const x = idx % GRID_W, y = (idx / GRID_W)|0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++){
        if (!dx && !dy) continue;
        const nc = this.at(x+dx, y+dy); if (!nc) continue;
        const nt = nc.stack[nc.stack.length-1];
        if (nt === 'meat' && this.rng() < 0.25) nc.stack[nc.stack.length-1] = 'cooked';
        else if (nt === 'clay' && this.rng() < 0.2) nc.stack[nc.stack.length-1] = 'brick'; // kiln heat
        if (nt && MATERIALS[nt].flammable && !nc.fire && this.rng() < 0.04)
          this.ignite((y+dy)*GRID_W + (x+dx));
      }
      if (--c.fire <= 0){
        const top = c.stack[c.stack.length-1];
        if (top && MATERIALS[top].flammable) c.stack.pop();   // burned away
        c.fire = 0;
      } else next.push(idx);
    }
    this.fires = next;
  }

  floraCanGrow(x, y){
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++){
      const c = this.at(x+dx, y+dy);
      if (c && (c.water || c.stack[c.stack.length-1] === 'flora')) return true;
    }
    return false;
  }
}
