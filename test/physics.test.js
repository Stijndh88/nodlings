// One test per physics rule (materials.js, physics.js, world.js fire and decay).
// Run: node test/physics.test.js
'use strict';
const { load, test, eq, ok, done } = require('./harness');

// a small empty land patch in a fresh world, far from anything
const SETUP = `
  world = new World(5);
  for (const c of world.cells){ c.stack = []; c.fire = 0; }
  world.fires = [];
  var LX = 100, LY = 75;
  for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++){ const c = world.at(LX+dx, LY+dy); c.water = false; c.sand = false; }
  var cellAt = (dx, dy) => world.at(LX+dx, LY+dy);
  var mk = () => { const n = new Nodling(world, LX+0.5, LY+0.5, randomGenome(world.rng)); nodlings = [n]; world.buildIndex(nodlings); return n; };
  var OUT = o => Object.assign({moveX:0,moveY:0,grab:0,drop:0,use:0,strike:0,sound:0,mem0:0,mem1:0,mem2:0,mem3:0,learn:0}, o);
`;
const fresh = () => { const s = load(); s.run(SETUP); return s; };

console.log('carry');
test('a heavier load makes a step cost more', () => {
  const { run } = fresh();
  ok(run(`carryFactor(null)`) === 1, 'empty hand costs nothing extra');
  ok(run(`carryFactor('stone') > carryFactor('stick')`), 'stone costs more than a stick');
});

console.log('place');
test('an item that floats makes water walkable; one that does not sinks', () => {
  const { run } = fresh();
  run(`cellAt(1,0).water = true; cellAt(2,0).water = true;`);
  eq(run(`walkable(cellAt(1,0))`), false, 'open water');
  eq(run(`placeItem(world, cellAt(1,0), 'wood')`), 'bridge');
  eq(run(`walkable(cellAt(1,0))`), true, 'bridged water');
  eq(run(`placeItem(world, cellAt(2,0), 'stone')`), 'sink');
  eq(run(`cellAt(2,0).stack.length`), 0, 'the stone is gone');
});
test('a stack of 3 blocks walking; nothing goes on a stack of 4', () => {
  const { run } = fresh();
  run(`for (let i = 0; i < 3; i++) placeItem(world, cellAt(1,0), 'stone');`);
  eq(run(`walkable(cellAt(1,0))`), false, 'wall');
  run(`placeItem(world, cellAt(1,0), 'stone')`);
  eq(run(`placeItem(world, cellAt(1,0), 'stone')`), null, 'fifth item refused');
});
test('a Nodling cannot walk through a wall', () => {
  const { run } = fresh();
  run(`for (let i = 0; i < 3; i++) cellAt(1,0).stack.push('stone'); var n = mk(); n.x = LX + 0.9;
       for (let i = 0; i < 20; i++) act(n, OUT({moveX:1}));`);
  ok(run(`n.x < LX + 1`), 'the Nodling stayed on its side');
});

console.log('strike');
test('a bare hand cannot break wood; a stone in the hand can', () => {
  const { run } = fresh();
  run(`cellAt(1,0).stack.push('wood');`);
  eq(run(`strikeItem(world, LX+1, LY, null)`), null, 'bare hand');
  eq(run(`strikeItem(world, LX+1, LY, 'stone')`), 'break');
  eq(run(`cellAt(1,0).stack[0]`), 'stick', 'wood became its parts');
});
test('a soft loose item is knocked onto a neighbouring cell', () => {
  const { run } = fresh();
  run(`cellAt(1,0).stack.push('clay');`);
  eq(run(`strikeItem(world, LX+1, LY, null)`), 'knock');
  eq(run(`cellAt(1,0).stack.length + [-1,0,1].reduce((s,dy)=>s+[0,1,2].reduce((t,dx)=>t+((dx!==1||dy!==0)&&cellAt(dx,dy).stack.includes('clay')?1:0),0),0)`), 1, 'the clay is one cell away');
});
test('sharpness doubles force against soft targets only', () => {
  const { run } = fresh();
  ok(run(`strikeForce('flake', 0) === 2*strikeForce('flake', 5)`), 'flake vs soft is double flake vs hard');
  ok(run(`strikeForce(null, ANIMAL_HARD) < ANIMAL_HARD && strikeForce('flake', ANIMAL_HARD) >= ANIMAL_HARD`), 'a flake kills an animal, a bare hand does not');
});
test('hard on hard makes a spark that lights fuel nearby', () => {
  const { run } = fresh();
  run(`cellAt(1,0).stack.push('stone'); cellAt(2,0).stack.push('wood');
       var lit = false; for (let i = 0; i < 200 && !lit; i++){ if (cellAt(1,0).stack.length === 0) cellAt(1,0).stack.push('stone'); for (const d of [[0,1],[1,1],[2,1],[0,-1],[1,-1],[2,-1],[0,0]]) cellAt(d[0],d[1]).stack = []; lit = strikeItem(world, LX+1, LY, 'stone') === 'spark' || cellAt(2,0).fire > 0; }`);
  ok(run(`cellAt(2,0).fire > 0`), 'the wood caught fire');
});
test('a Nodling with a stone kills a critter with a strike; with a bare hand it does not', () => {
  const { run } = fresh();
  run(`var n = mk(); critters = [new Critter(world, LX+1.5, LY+0.5)]; updateCritters(world, critters);
       act(n, OUT({strike:1}));`);
  eq(run(`critters[0].dead`), false, 'bare hand');
  run(`n.carrying = 'stone'; act(n, OUT({strike:1}));`);
  eq(run(`critters[0].dead`), true, 'stone');
  ok(run(`[...world.ledger.keys()].includes('strike|hard|animal|kill')`), 'the ledger recorded the technique');
});

console.log('heat');
test('fire burns for fuel x BURN_TICKS ticks, then the item is gone', () => {
  const { run } = fresh();
  run(`cellAt(0,0).stack.push('stick'); world.ignite(LY*GRID_W + LX);`);
  eq(run(`cellAt(0,0).fire`), run(`MATERIALS.stick.fuel*BURN_TICKS`), 'burn time');
  run(`for (let i = 0; i < MATERIALS.stick.fuel*BURN_TICKS + 2; i++) world.stepFire(0);`);
  eq(run(`[cellAt(0,0).fire, cellAt(0,0).stack.length]`), [0, 0], 'burned out and gone');
});
test('fuel placed on a burning cell burns next: a fire can be fed', () => {
  const { run } = fresh();
  run(`cellAt(0,0).stack.push('stick'); world.ignite(LY*GRID_W + LX);`);
  eq(run(`placeItem(world, cellAt(0,0), 'stick')`), 'feed');
  run(`for (let i = 0; i < MATERIALS.stick.fuel*BURN_TICKS + 2; i++) world.stepFire(0);`);
  ok(run(`cellAt(0,0).fire > 0 && cellAt(0,0).stack.length === 1`), 'still burning on the second stick');
});
test('an item beside a fire takes its heated form', () => {
  const { run } = fresh();
  run(`cellAt(0,0).stack.push('wood'); cellAt(1,0).stack.push('meat'); cellAt(-1,0).stack.push('clay'); world.ignite(LY*GRID_W + LX);
       for (let i = 0; i < 150; i++) world.stepFire(0);`);
  eq(run(`[cellAt(1,0).stack[0], cellAt(-1,0).stack[0]]`), ['cooked', 'brick']);
});
test('a fire warms the cells around it', () => {
  const { run } = fresh();
  run(`world.tick = YEAR_LEN*0.75|0; cellAt(0,0).stack.push('wood');`);
  const cold = run(`world.cellTemp(LX+1, LY)`);
  run(`world.ignite(LY*GRID_W + LX);`);
  ok(run(`world.cellTemp(LX+1, LY)`) > cold + 5, 'warmer beside the fire');
});
test('standing in fire hurts', () => {
  const { run } = fresh();
  run(`var n = mk(); cellAt(0,0).stack.push('wood'); world.ignite(LY*GRID_W + LX); n.lastOut = OUT({}); n.phase = 1; world.tick = 2; var e0 = n.energy; n.tick();`);
  ok(run(`n.pain === 1 && n.energy < e0 - 3`), 'pain and damage');
});

console.log('eat');
test('the two plant kinds trade places each year', () => {
  const { run } = fresh();
  eq(run(`[foodValue(world,'flora'), foodValue(world,'berry')]`), [42, -10]);
  run(`world.tick = YEAR_LEN - 1; world.step();`);
  eq(run(`[foodValue(world,'flora'), foodValue(world,'berry')]`), [-10, 42]);
});
test('eating is felt by the body and nothing else is rewarded', () => {
  const { run } = fresh();
  run(`var n = mk(); cellAt(0,0).stack.push('flora'); var w0 = n.wellbeing(); act(n, OUT({use:1}));`);
  ok(run(`n.wellbeing() > w0 && n.meals === 1`), 'a good meal raises wellbeing');
  run(`cellAt(0,0).stack = ['berry']; var w1 = n.wellbeing(); act(n, OUT({use:1}));`);
  ok(run(`n.wellbeing() < w1 && n.badMeals === 1`), 'a bad meal lowers it');
});
test('drinking needs water underfoot or beside', () => {
  const { run } = fresh();
  run(`var n = mk(); n.hydration = 20; act(n, OUT({use:1}));`);
  eq(run(`n.hydration`), 20, 'no water near');
  run(`cellAt(1,1).water = true; act(n, OUT({use:1}));`);
  eq(run(`n.hydration`), 100, 'drank');
});

console.log('hands');
test('grab takes the top item; drop puts it on the cell ahead; never both in one tick', () => {
  const { run } = fresh();
  run(`var n = mk(); cellAt(0,0).stack.push('wood'); act(n, OUT({grab:1, drop:1}));`);
  eq(run(`n.carrying`), 'wood', 'still in hand after a grab+drop tick');
  run(`world.tick++; act(n, OUT({drop:1}));`);
  eq(run(`[n.carrying, cellAt(1,0).stack[0]]`), [null, 'wood'], 'placed ahead');
});
test('a wall ahead can be taken down by hand', () => {
  const { run } = fresh();
  run(`var n = mk(); cellAt(1,0).stack = ['stone','stone','stone']; act(n, OUT({grab:1}));`);
  eq(run(`[n.carrying, cellAt(1,0).stack.length]`), ['stone', 2]);
});

console.log('decay');
test('everything rots: a pile left alone is gone after a while', () => {
  const { run } = fresh();
  ok(run(`MATERIAL_LIST.every(m => m.rot > 0)`), 'every material has a rot rate');
  run(`ENV.flora = 0; for (const m of MATERIAL_LIST) m.wild = 0; cellAt(0,0).stack = ['meat','meat','flora']; for (let i = 0; i < 12000; i++) world.step();`);
  ok(run(`cellAt(0,0).stack.length`) <= 1, 'the meat rotted away');
});
test('nature never stacks above 2: scattering cannot make a wall', () => {
  const { run } = fresh();
  run(`for (let i = 0; i < 500; i++) world.scatterItem(LX, LY, 'seed');`);
  eq(run(`Math.max(...world.cells.map(c => c.stack.length))`), 2);
});

done();
