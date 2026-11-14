#!/usr/bin/env node
// World health audit: read-only checks on the saved world that the normal metrics do not show.
// Written for the November 2026 audit (docs/AUDIT-2026-11.md). Prints one JSON object.
//   node loop/audit-world.js [--dir=PATH]
// Key numbers:
//   wallShare        share of land cells that are impassable (stack of 3 or more)
//   canReachWater    share of living Nodlings that can walk to a cell beside water
//   openShore        share of shore cells that are not walled
//   plasticShare     share of brain connections that change during life
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const zlib = require('zlib');

const ROOT = path.join(__dirname, '..');
const SIM_FILES = ['brain.js', 'world.js', 'selftest.js', 'nodling.js', 'critters.js', 'predators.js', 'observer.js', 'sim.js', 'metrics.js'];
const dirArg = process.argv.find(a => a.startsWith('--dir='));
const dir = path.resolve(dirArg ? dirArg.slice(6) : __dirname);

const store = {};
const context = vm.createContext({ console, Date, Math, JSON,
  localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } } });
for (const f of SIM_FILES) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), context, { filename: f });
context.restoreWorld(zlib.gunzipSync(fs.readFileSync(path.join(dir, 'world.json.gz'))).toString('utf8'));

const report = vm.runInContext(`(function(){
  const passable = (x, y) => { const c = world.at(x, y); return c && c.stack.length < 3 && (!c.water || c.stack.length > 0); };
  let land = 0, walls = 0, fiberWalls = 0, empty = 0, shore = 0, shoreOpen = 0;
  for (let y = 0; y < GRID_H; y++) for (let x = 0; x < GRID_W; x++){
    const c = world.at(x, y);
    if (c.water) continue;
    land++;
    if (!c.stack.length) empty++;
    if (c.stack.length >= 3){ walls++; if (c.stack.includes('fiber')) fiberWalls++; }
    if (world.adjacentWater(x, y)){ shore++; if (c.stack.length < 3) shoreOpen++; }
  }
  // flood-fill the walkable cells into regions and note which regions touch water
  const region = new Int32Array(GRID_W*GRID_H).fill(-1), touches = [];
  for (let i = 0; i < region.length; i++){
    if (region[i] >= 0 || !passable(i % GRID_W, (i / GRID_W)|0)) continue;
    const id = touches.length; let touch = false; const q = [i]; region[i] = id;
    while (q.length){
      const j = q.pop(), jx = j % GRID_W, jy = (j / GRID_W)|0;
      if (world.adjacentWater(jx, jy)) touch = true;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++){
        const nx = jx+dx, ny = jy+dy;
        if ((!dx && !dy) || nx < 0 || ny < 0 || nx >= GRID_W || ny >= GRID_H) continue;
        const k = ny*GRID_W + nx;
        if (region[k] < 0 && passable(nx, ny)){ region[k] = id; q.push(k); }
      }
    }
    touches.push(touch);
  }
  let reach = 0;
  for (const n of nodlings){ const id = region[(n.y|0)*GRID_W + (n.x|0)]; if (id >= 0 && touches[id]) reach++; }
  let conns = 0, plastic = 0, hidden = 0;
  for (const n of nodlings){
    const h = new Set();
    for (const c of n.genome.conns){ if (!c.en) continue; conns++; if (c.pl) plastic++; if (c.from >= HIDDEN_BASE) h.add(c.from); if (c.to >= HIDDEN_BASE) h.add(c.to); }
    hidden += h.size;
  }
  const N = nodlings.length || 1, r3 = v => +v.toFixed(3);
  return { day: +(world.tick/DAY_LEN).toFixed(2), population: nodlings.length,
    wallShare: r3(walls/land), fiberWallShare: r3(walls ? fiberWalls/walls : 0), emptyLandShare: r3(empty/land),
    openShore: r3(shore ? shoreOpen/shore : 0), canReachWater: r3(reach/N),
    avgConnections: r3(conns/N), avgHidden: r3(hidden/N), plasticShare: r3(conns ? plastic/conns : 0) };
})()`, context);
console.log(JSON.stringify(report, null, 2));
