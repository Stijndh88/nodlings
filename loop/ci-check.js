#!/usr/bin/env node
// CI gate: self-test + determinism + finite metrics, on a throwaway state dir
// (never touches the committed loop/ state). Fast: ~2x 1200 ticks.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const run = (dir, out) => spawnSync(process.execPath,
  [path.join(__dirname, 'run-headless.js'), '--ticks=1200', '--no-bench', `--dir=${dir}`, `--out=${out}`],
  { encoding: 'utf8' });

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nodlings-ci-'));
const a = path.join(tmp, 'a'), b = path.join(tmp, 'b');
const ra = run(a, path.join(tmp, 'a.json'));
if (ra.status !== 0){ console.error(ra.stdout, ra.stderr); console.error('CI FAIL: headless run failed or guardrail tripped'); process.exit(1); }
// resume the saved world in two copies; identical state must give identical results
fs.cpSync(a, b, { recursive: true });
const r1 = run(a, path.join(tmp, 'a2.json')), r2 = run(b, path.join(tmp, 'b2.json'));
if (r1.status !== 0 || r2.status !== 0){ console.error(r1.stdout, r2.stdout); console.error('CI FAIL: resumed run failed'); process.exit(1); }
const m1 = fs.readFileSync(path.join(tmp, 'a2.json'), 'utf8'), m2 = fs.readFileSync(path.join(tmp, 'b2.json'), 'utf8');
if (m1 !== m2){ console.error(m1, m2); console.error('CI FAIL: resumed runs are not deterministic'); process.exit(1); }
console.log('CI OK: self-test, headless run, resume, determinism');
