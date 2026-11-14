// Tiny test harness: loads the sim files into a fresh vm context (as the loop does).
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');
const { SIM_FILES } = require('../loop/sim-files');

function load(){
  const store = {};
  const context = vm.createContext({ console: { log(){}, assert: console.assert, error: console.error }, Date, Math, JSON,
    localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } } });
  for (const f of SIM_FILES) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), context, { filename: f });
  return { context, run: code => vm.runInContext(code, context) };
}

let failed = 0, passed = 0;
function test(name, fn){
  try { fn(); passed++; console.log('  ok   ' + name); }
  catch (e){ failed++; console.log('  FAIL ' + name + '\n       ' + (e.message || e)); }
}
function eq(actual, expected, msg){
  if (JSON.stringify(actual) !== JSON.stringify(expected))
    throw new Error(`${msg || 'value'}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}
function ok(cond, msg){ if (!cond) throw new Error(msg || 'assertion failed'); }
function done(){ console.log(`${passed} passed, ${failed} failed`); process.exit(failed ? 1 : 0); }

module.exports = { ROOT, load, test, eq, ok, done };
