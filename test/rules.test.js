// The rule files must not name a material: they may only read properties.
// Run: node test/rules.test.js
'use strict';
const fs = require('fs');
const path = require('path');
const { load, test, ok, done, ROOT } = require('./harness');

const RULE_FILES = ['physics.js', 'actions.js', 'nodling.js', 'world.js', 'critters.js', 'predators.js', 'senses.js', 'brain.js', 'sim.js'];
const names = load().run(`Object.keys(MATERIALS)`);

console.log('rules');
for (const f of RULE_FILES) test(`${f} names no material`, () => {
  const code = fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  for (const n of names){
    const hit = code.match(new RegExp(`['"\`]${n}['"\`]|MATERIALS\\.${n}\\b`));
    ok(!hit, `found ${hit && hit[0]}: rules read properties, never names`);
  }
});
test('the learning signal has no term but the body', () => {
  const code = fs.readFileSync(path.join(ROOT, 'nodling.js'), 'utf8');
  ok(!/bonus/i.test(code.replace(/\/\/.*$/gm, '')), 'no bonus anywhere in nodling.js');
  ok(/const gain = Math\.max\(-1, Math\.min\(1, \(wb - this\.lastWellbeing\)\*8\)\);/.test(code), 'gain is the change in wellbeing and nothing else');
});
done();
