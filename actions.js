// Brain outputs -> physics. This file decides nothing: each output above its
// threshold calls a rule in physics.js with whatever is in the hand, ahead and
// underfoot. Every outcome is written to the technique ledger (counted, never rewarded).
'use strict';

const MOVE_SPEED = 0.25;     // cells per tick at full output
const STRIKE_COST = 0.5;     // energy per strike
const SOUND_COST = 0.05;     // energy per call

// The technique ledger: (verb, class of item in hand, class of target, result).
// `users` are the Nodlings that did it, so a habit of many can be told from one accident.
function ledger(world, n, verb, held, target, result){
  const key = verb + '|' + held + '|' + target + '|' + result;
  let e = world.ledger.get(key);
  if (!e){ e = { count:0, users:new Set(), first:world.tick }; world.ledger.set(key, e); }
  e.count++; e.users.add(n.id); world.ledgerActors.add(n.id);
}
// What a cell looks like as the target of an action.
function targetClass(cell){
  if (!cell) return 'none';
  if (cell.fire) return 'fire';
  if (!cell.stack.length) return cell.water ? 'water' : 'none';
  if (cell.stack.length >= WALL_HEIGHT - 1) return 'pile';
  return classOf(topOf(cell));
}

function act(n, out){
  const w = n.world;

  // -- move: open water and walls block; a bridged water cell is walkable --
  const nx = Math.max(0, Math.min(GRID_W - 0.01, n.x + out.moveX*MOVE_SPEED));
  const ny = Math.max(0, Math.min(GRID_H - 0.01, n.y + out.moveY*MOVE_SPEED));
  if (walkable(w.at(nx|0, ny|0))){ n.x = nx; n.y = ny; }
  const fx = out.moveX > 0.3 ? 1 : out.moveX < -0.3 ? -1 : 0;
  const fy = out.moveY > 0.3 ? 1 : out.moveY < -0.3 ? -1 : 0;
  if (fx || fy) n.facing = [fx, fy];

  const cx = n.x|0, cy = n.y|0, ax = cx + n.facing[0], ay = cy + n.facing[1];
  const under = w.at(cx, cy), ahead = w.at(ax, ay);

  // -- grab: the top item underfoot, else the top item ahead (so walls can be taken down) --
  if (out.grab > 0.5 && !n.carrying){
    const from = under.stack.length && !under.fire ? under : (ahead && ahead.stack.length && !ahead.fire ? ahead : null);
    if (from){
      n.carrying = from.stack.pop();
      n.grabTick = w.tick;
      ledger(w, n, 'grab', 'none', classOf(n.carrying), 'take');
    }
  }

  // -- drop: onto the cell ahead, else underfoot. Not in the tick it was picked up. --
  if (out.drop > 0.5 && n.carrying && n.grabTick !== w.tick){
    let target = ahead || under, tc = targetClass(target);
    let res = placeItem(w, target, n.carrying);
    if (res === null && target !== under){ target = under; tc = targetClass(under); res = placeItem(w, under, n.carrying); }
    if (res !== null){
      ledger(w, n, 'drop', classOf(n.carrying), tc, res);
      n.carrying = null;
    }
  }

  // -- use: eat what is in the hand, else what lies underfoot, else drink --
  if (out.use > 0.5){
    const top = topOf(under);
    if (n.carrying && edible(n.carrying)){ const item = n.carrying; n.carrying = null; n.eat(item); }
    else if (top && edible(top) && !under.fire){ under.stack.pop(); n.eat(top); }
    else if (under.water || w.adjacentWater(cx, cy)){
      if (n.hydration < 90){ ledger(w, n, 'use', classOf(n.carrying), 'water', 'drink'); n.drinks++; n.waterMem = [n.x, n.y]; }
      n.hydration = 100;
    }
  }

  // -- strike the cell ahead: an animal there, else the top item --
  if (out.strike > 0.5 && ahead){
    n.energy -= STRIKE_COST;
    const held = n.carrying, hc = classOf(held);
    let hit = false;
    for (const cr of w.near(w.cIndex, ax + 0.5, ay + 0.5)){
      if (cr.dead || (cr.x-(ax+0.5))**2 + (cr.y-(ay+0.5))**2 >= 0.9) continue;
      hit = true;
      if (strikeForce(held, ANIMAL_HARD) >= ANIMAL_HARD){
        cr.dead = true;
        if (!w.scatterItem(ax, ay, CARCASS)) w.scatterItem(cx, cy, CARCASS);
        ledger(w, n, 'strike', hc, 'animal', 'kill');
      }
      break;
    }
    if (!hit) for (const p of w.predators){
      if (p.dead || (p.x-(ax+0.5))**2 + (p.y-(ay+0.5))**2 >= 0.9) continue;
      hit = true;
      if (strikeForce(held, PREDATOR_HARD) >= PREDATOR_HARD){
        p.dead = true;
        w.scatterItem(ax, ay, CARCASS);
        ledger(w, n, 'strike', hc, 'predator', 'kill');
      }
      break;
    }
    if (!hit){
      const tc = targetClass(ahead), res = strikeItem(w, ax, ay, held);
      if (res) ledger(w, n, 'strike', hc, tc, res);
    }
  }

  // -- sound: a pitch; any meaning must be evolved or learned --
  if (Math.abs(out.sound) > 0.15){
    w.nextSounds.push({x:n.x, y:n.y, f:(out.sound+1)/2});
    n.energy -= SOUND_COST;
  }
}
