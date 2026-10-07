#!/usr/bin/env node
// Reports which progress metrics have plateaued in loop/history.jsonl, so the
// loop knows to switch from tuning to a STRUCTURAL change (new affordance,
// pressure or sense) instead of re-tuning a saturated knob.
//   node loop/plateau.js [--window=4] [--tol=0.03]   (exit 0 always; prints JSON)
'use strict';
const fs = require('fs');
const path = require('path');
const arg = (n, d) => { const m = process.argv.find(a => a.startsWith(`--${n}=`)); return m ? +m.slice(n.length + 3) : d; };
const win = arg('window', 4), tol = arg('tol', 0.03);
const file = path.join(__dirname, 'history.jsonl');
const hist = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l)) : [];
const metrics = {
  'benchmark.gap': h => h.benchmark && h.benchmark.gap,
  medianFitness: h => h.medianFitness,
  largestCluster: h => h.largestCluster,
  brickCells: h => h.brickCells,
  maxGen: h => h.maxGen,
};
const out = { cycles: hist.length, window: win, plateaued: [], rising: [], insufficientData: hist.length < win };
if (hist.length >= win){
  const tail = hist.slice(-win);
  for (const [name, f] of Object.entries(metrics)){
    const v = tail.map(f).filter(Number.isFinite);
    if (v.length < win) continue;
    const lo = Math.min(...v), hi = Math.max(...v), base = Math.max(Math.abs(hi), 1);
    ((hi - lo) / base <= tol || v[v.length-1] <= v[0] ? out.plateaued : out.rising).push(name);
  }
}
out.advice = out.plateaued.length >= 3 ? 'STRUCTURAL cycle required: add a new affordance, pressure or sense instead of tuning.' : 'Tuning is still productive.';
console.log(JSON.stringify(out, null, 2));
