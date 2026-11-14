// World 2 physics: the rules for carrying, placing, striking, eating. Pure
// functions of the world and of material PROPERTIES (materials.js). No rule here
// names a material and none knows what a Nodling "should" do (heat and decay,
// which need no actor, live in world.js: stepFire and step).
'use strict';

const propsOf = name => (name ? MATERIALS[name] : null);
const topOf = cell => (cell && cell.stack.length ? cell.stack[cell.stack.length-1] : null);

// CARRY. A load makes every step cost more, in proportion to its mass.
function carryFactor(held){ return held ? 1 + MATERIALS[held].mass*0.15 : 1; }

// A cell can be walked on unless it is open water or a wall. Material lying on
// water (it floated when placed) makes the cell walkable: a bridge.
function walkable(cell){
  return !!cell && cell.stack.length < WALL_HEIGHT && (!cell.water || cell.stack.length > 0);
}

// PLACE an item on a cell. Returns what happened, or null if it cannot go there:
//   'sink'    onto open water and it does not float: gone
//   'bridge'  onto open water and it floats: the cell becomes walkable
//   'feed'    onto a burning cell and it has fuel: it will burn next
//   'stack'   onto a cell that already holds something
//   'place'   onto empty ground
function placeItem(world, cell, name){
  if (!cell || cell.stack.length >= MAX_HEIGHT) return null;
  const m = MATERIALS[name];
  if (cell.water && !cell.stack.length){
    if (!m.floats) return 'sink';
    cell.stack.push(name); return 'bridge';
  }
  const result = cell.fire && m.fuel ? 'feed' : cell.stack.length ? 'stack' : 'place';
  cell.stack.push(name);
  return result;
}

// STRIKE force of a blow with `held` in the hand (null = bare hand).
// A sharp item doubles the force against soft targets.
function strikeForce(held, targetHard){
  if (!held) return 1;
  const m = MATERIALS[held];
  const f = 1 + m.mass*m.hard;
  return m.sharp && targetHard <= SOFT_MAX ? f*2 : f;
}

// STRIKE the top item of a cell. (x,y) is the cell's position. Returns:
//   'break'  the item was hard enough to need force and the force was enough: it is now its parts
//   'knock'  the item gave way and has no parts: it is knocked onto a neighbouring cell
//   'spark'  hard on hard, and something with fuel caught fire
//   null     nothing there, or the blow was too weak
function strikeItem(world, x, y, held){
  const cell = world.at(x, y), top = topOf(cell);
  if (!top) return null;
  const m = MATERIALS[top];
  let result = null;
  if (held && MATERIALS[held].hard >= SPARK_HARD && m.hard >= SPARK_HARD && world.rng() < SPARK_CHANCE){
    // the spark lights fuel in the struck cell, or else in a cell next to it
    let lit = world.ignite(y*GRID_W + x);
    for (let dy = -1; dy <= 1 && !lit; dy++) for (let dx = -1; dx <= 1 && !lit; dx++){
      const nx = x+dx, ny = y+dy;
      if (nx >= 0 && ny >= 0 && nx < GRID_W && ny < GRID_H) lit = world.ignite(ny*GRID_W + nx);
    }
    if (lit) result = 'spark';
  }
  if (strikeForce(held, m.hard) < m.hard || cell.fire) return result;
  cell.stack.pop();
  if (m.broken){
    cell.stack.push(m.broken[0]);
    for (let i = 1; i < m.broken.length; i++) world.scatterItem(x, y, m.broken[i]);
    return result || 'break';
  }
  if (!world.scatterItem(x, y, top)) cell.stack.push(top);   // nowhere to go: it stays
  return result || 'knock';
}

// EAT. What an item is worth to a body. The two plant kinds trade places each year.
function foodValue(world, name){
  const m = MATERIALS[name];
  if (m.kind === null) return m.food;
  return !ENV.flip || m.kind === world.goodKind ? PLANT_FOOD : BAD_FOOD;
}
const edible = name => { const m = MATERIALS[name]; return m.food !== 0 || m.kind !== null; };
