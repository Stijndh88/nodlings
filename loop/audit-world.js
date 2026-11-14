#!/usr/bin/env node
// World health check, read-only: prints worldHealth() (metrics.js) for the saved world.
//   node loop/audit-world.js [--dir=PATH]
//   wallShare       share of land cells that are impassable (stack of 3 or more)
//   openShore       share of shore cells that are not walled
//   canReachWater   share of living Nodlings that can walk to a cell beside water
// The same numbers are part of every cycle's metrics; the guardrails use them.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const zlib = require('zlib');
const { SIM_FILES } = require('./sim-files');

const ROOT = path.join(__dirname, '..');
const dirArg = process.argv.find(a => a.startsWith('--dir='));
const dir = path.resolve(dirArg ? dirArg.slice(6) : __dirname);
const store = {};
const context = vm.createContext({ console, Date, Math, JSON,
  localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } } });
for (const f of SIM_FILES) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), context, { filename: f });
context.restoreWorld(zlib.gunzipSync(fs.readFileSync(path.join(dir, 'world.json.gz'))).toString('utf8'));
const report = vm.runInContext(`Object.assign({ day: +(world.tick/DAY_LEN).toFixed(2), population: nodlings.length }, worldHealth())`, context);
console.log(JSON.stringify(report, null, 2));
