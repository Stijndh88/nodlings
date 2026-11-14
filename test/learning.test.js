// Can the learning rule do its job at all? A hand-built brain with ONE plastic
// connection (the look of the plant underfoot -> the `use` output) must learn
// from its own body which plant kind is good, and relearn after the yearly swap.
// Evolution has to find such wiring itself; this test only proves it is findable.
// Run: node test/learning.test.js
'use strict';
const { load, test, ok, done } = require('./harness');

const { run } = load();
const SETUP = `
  world = new World(5);
  for (const c of world.cells){ c.stack = []; c.fire = 0; c.water = false; }
  ENV.flora = 0; for (const m of MATERIAL_LIST) m.wild = 0;
  var LX = 100, LY = 75, here = world.at(LX, LY);
  var useOut = N_SENSES + 1 + OUTPUTS.indexOf('use');
  var genome = { conns: [], mem: {}, hue: 0, body: [0,0,0,0,0,0,0,0], drive: [1,1,1,1] };
  addConn(genome.conns, N_SENSES, useOut, 1.0, 0);          // bias -> use: eats whatever is underfoot
  addConn(genome.conns, S.underLook, useOut, 0, 1);         // look -> use: starts at 0, plastic
  var n = new Nodling(world, LX+0.5, LY+0.5, genome); n.phase = 0; nodlings = [n];
  var kinds = PLANT_KINDS.map(m => m.name);
  // Offer a plant of a random kind just before the Nodling thinks (so it sees it before it
  // acts), let it live 4 ticks, report whether it ate. Energy is reset so it never fills up.
  var offer = () => { const k = kinds[(world.rng()*2)|0]; here.stack = [k]; const bad = foodValue(world, k) < 0;
    n.energy = 100; n.hydration = 100; n.lastWellbeing = n.wellbeing();
    if (world.tick % 2 === 0) world.tick++;
    for (let i = 0; i < 4; i++){ world.tick++; n.tick(); }
    const ate = here.stack.length === 0; here.stack = []; return { bad, ate }; };
  var phase = meals => { let good = 0, bad = 0, goodAte = 0, badAte = 0;
    for (let i = 0; i < meals; i++){ const r = offer(); if (r.bad){ bad++; if (r.ate) badAte++; } else { good++; if (r.ate) goodAte++; } }
    return { badAte: badAte/bad, goodAte: goodAte/good }; };
`;
run(SETUP);

console.log('learning');
test('before learning it eats both kinds alike', () => {
  const r = run(`phase(10)`);
  ok(r.badAte > 0.5 || r.goodAte > 0.5, 'it eats');
});
test('after some meals it eats the good kind and leaves the bad one', () => {
  run(`phase(60)`);
  const r = run(`phase(60)`);
  ok(r.goodAte > 0.9 && r.badAte < 0.2, `good eaten ${r.goodAte.toFixed(2)}, bad eaten ${r.badAte.toFixed(2)}`);
});
test('with learning switched off nothing is learned', () => {
  const s2 = load();
  s2.run(SETUP + '; ENV.plasticity = 0; phase(120);');
  const r = s2.run(`phase(60)`);
  ok(r.badAte > 0.9, `still eats the bad kind (${r.badAte.toFixed(2)})`);
});
test('after the yearly swap it relearns', () => {
  run(`world.goodKind = 1 - world.goodKind;`);
  const first = run(`phase(12)`);
  run(`phase(150)`);
  const r = run(`phase(60)`);
  ok(first.badAte > 0.5, `right after the swap it still eats the old favourite (${first.badAte.toFixed(2)})`);
  ok(r.goodAte > 0.9 && r.badAte < 0.2, `relearned: good eaten ${r.goodAte.toFixed(2)}, bad eaten ${r.badAte.toFixed(2)}`);
});
done();
