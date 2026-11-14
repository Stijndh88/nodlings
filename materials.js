// World 2 materials: one row of numbers per material. DATA ONLY.
// No rule anywhere in the simulation may mention a material by name: physics.js,
// actions.js, nodling.js and world.js read these properties and nothing else
// (test/rules.test.js enforces it). Adding a material is adding a row.
//
//   mass    how heavy it is: carrying it makes every step cost more
//   hard    how hard it is: a strike must reach this force to affect it
//   fuel    how long it burns (x BURN_TICKS ticks). 0 = does not burn
//   food    energy gained by eating it. Plants use `kind` instead (see below)
//   kind    0 or 1 for the two plant kinds. Each year the world makes one kind
//           nourishing and the other mildly poisonous (world.goodKind)
//   look    what an eye sees of it: +1 / -1 tells the plant kinds apart, 0 otherwise
//   smell   how food-like it smells (1 flesh, 0.5 plant, 0.2 seed)
//   insul   how well a stack of it insulates the neighbouring cells
//   floats  dropped on water it stays up and makes the cell walkable
//   sharp   doubles strike force against soft targets (hard <= SOFT_MAX)
//   rot     chance to vanish each time decay samples it (about once per 200 ticks)
//   heated  what it turns into next to a fire
//   broken  what it breaks into when a strike beats its hardness
//   spreads a living plant: new ones grow next to it and next to water
//   sprouts what it may grow into when it lies on top of a cell
//   drops   left behind when eaten
//   wild    how many the untouched world keeps in stock (re-supplied as they rot)
//   shore   wild ones appear on sand only
'use strict';

const MATERIALS = {
  wood:   { color:'#8a5a2b', mass:2,   hard:2, fuel:40, insul:0.6, floats:true, rot:0.004, broken:['stick','stick'], wild:450 },
  stick:  { color:'#b08a52', mass:1,   hard:1, fuel:15, insul:0.2, floats:true, rot:0.01 },
  stone:  { color:'#9a9aa2', mass:5,   hard:5, insul:0.9, rot:0.001, broken:['flake','flake'], wild:280 },
  flake:  { color:'#c9cbd6', mass:1,   hard:5, sharp:1, rot:0.002 },
  clay:   { color:'#8a7360', mass:3,   hard:1, insul:0.5, rot:0.002, heated:'brick', wild:150, shore:true },
  brick:  { color:'#b06a48', mass:4,   hard:4, insul:1.0, rot:0.0005 },
  flora:  { color:'#3fa34d', mass:0.5, hard:0, fuel:5, kind:0, look:1,  smell:0.5, insul:0.1, floats:true, rot:0.01,
            spreads:true, drops:[{ item:'seed', chance:0.5 }] },
  berry:  { color:'#7a5fc0', mass:0.5, hard:0, fuel:5, kind:1, look:-1, smell:0.5, insul:0.1, floats:true, rot:0.01,
            spreads:true, drops:[{ item:'seed', chance:0.5 }] },
  seed:   { color:'#d8c36a', mass:0.1, hard:0, fuel:2, food:4, smell:0.2, floats:true, rot:0.03, sprouts:['flora','berry'] },
  meat:   { color:'#b5423f', mass:1,   hard:0, food:70,  smell:1, rot:0.25, heated:'cooked' },
  cooked: { color:'#d98a4f', mass:1,   hard:0, food:110, smell:1, rot:0.08 },
};

// fill in defaults so every rule can read every property of every material
const MATERIAL_DEFAULTS = { mass:1, hard:0, fuel:0, food:0, kind:null, look:0, smell:0, insul:0, floats:false,
  sharp:0, rot:0.01, heated:null, broken:null, spreads:false, sprouts:null, drops:null, wild:0, shore:false };
for (const name of Object.keys(MATERIALS)){
  const m = MATERIALS[name];
  for (const k in MATERIAL_DEFAULTS) if (m[k] === undefined) m[k] = MATERIAL_DEFAULTS[k];
  m.name = name;
  m.insulation = m.insul;   // name kept for the renderer
}
const MATERIAL_LIST = Object.values(MATERIALS);
const PLANT_KINDS = MATERIAL_LIST.filter(m => m.spreads);   // the living plants, by kind

// Physics constants (see physics.js for the rules that use them)
const PLANT_FOOD = 42;      // energy from the nourishing plant kind
const BAD_FOOD = -10;       // energy from the other kind this year
const BURN_TICKS = 5;       // ticks of fire per point of fuel
const SOFT_MAX = 2;         // "soft" targets: hardness up to this (sharpness counts against these)
const WALL_HEIGHT = 3;      // a stack this high blocks movement
const MAX_HEIGHT = 4;       // nothing can be placed on a stack this high
const ANIMAL_HARD = 3;      // strike force needed to kill a critter
const PREDATOR_HARD = 20;   // strike force needed to kill a predator
const SPARK_HARD = 4;       // hard item on hard target: both at least this hard to make a spark
const SPARK_CHANCE = 0.25;

const CARCASS = 'meat';       // what a dead animal or Nodling leaves behind (data, like the table above)

// Bucket an item by its properties: used by the technique ledger and nowhere in the rules.
function classOf(name){
  if (!name) return 'none';
  const m = MATERIALS[name];
  if (m.food > 0 || m.kind !== null) return 'food';
  if (m.sharp) return 'sharp';
  if (m.hard >= SPARK_HARD) return 'hard';
  if (m.fuel >= 10) return 'fuel';
  return 'soft';
}
