'use strict';
// Renders loop/progress.svg from loop/history.jsonl — committed each cycle so
// progress is visible on GitHub (and in the README) with no hosting needed.

const PANELS = [
  { key: h => h.benchmark && h.benchmark.gap, title: 'Benchmark gap (evolved - random)', color: '#2a9d8f' },
  { key: h => h.medianFitness, title: 'Median fitness (living)', color: '#e9a23b' },
  { key: h => h.largestCluster, title: 'Largest built cluster (cells)', color: '#c8553d' },
  { key: h => h.maxGen, title: 'Max generation', color: '#6a7fdb' },
];

function renderProgress(history){
  const W = 360, H = 150, PAD = 28, cols = 2;
  const rows = Math.ceil(PANELS.length / cols);
  const out = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W*cols} ${H*rows+22}" font-family="sans-serif" font-size="11">`,
    `<rect width="100%" height="100%" fill="#fff"/>`,
    `<text x="10" y="15" font-size="13" font-weight="bold" fill="#222">Nodlings progress (${history.length} cycles, day ${history.length ? history[history.length-1].day : 0})</text>`];
  PANELS.forEach((p, i) => {
    const ox = (i % cols) * W, oy = 22 + Math.floor(i / cols) * H;
    const pts = history.map((h, idx) => [idx, p.key(h)]).filter(([, v]) => Number.isFinite(v));
    out.push(`<text x="${ox+PAD}" y="${oy+14}" fill="#444">${p.title}</text>`);
    if (pts.length < 1){ out.push(`<text x="${ox+PAD}" y="${oy+70}" fill="#999">no data yet</text>`); return; }
    const vs = pts.map(([, v]) => v), lo = Math.min(...vs, 0), hi = Math.max(...vs, lo + 1);
    const x = idx => ox + PAD + (history.length > 1 ? idx / (history.length - 1) : 0.5) * (W - PAD*2);
    const y = v => oy + H - 28 - (v - lo) / (hi - lo) * (H - 58);
    out.push(`<line x1="${ox+PAD}" y1="${oy+H-28}" x2="${ox+W-PAD}" y2="${oy+H-28}" stroke="#ccc"/>`);
    out.push(`<polyline fill="none" stroke="${p.color}" stroke-width="2" points="${pts.map(([idx, v]) => x(idx).toFixed(1)+','+y(v).toFixed(1)).join(' ')}"/>`);
    const last = pts[pts.length-1];
    out.push(`<circle cx="${x(last[0]).toFixed(1)}" cy="${y(last[1]).toFixed(1)}" r="3" fill="${p.color}"/>`);
    out.push(`<text x="${ox+PAD}" y="${oy+H-12}" fill="#777">${Math.round(lo)}</text><text x="${ox+W-PAD}" y="${oy+H-12}" text-anchor="end" fill="#222">now ${Math.round(last[1]*10)/10} (peak ${Math.round(hi)})</text>`);
  });
  out.push('</svg>');
  return out.join('\n');
}


// Plain-words glossary shown on the dashboard (HTML and markdown). One source, so
// every rebuild keeps it in step with the metrics the page shows.
const GLOSSARY = [
  ['Nodling', 'One of the little creatures in the simulation. Each has a small evolving "brain"; nobody scripts what it does.'],
  ['What is the loop?', 'An unattended routine that keeps the world running. Each "cycle" it simulates a long stretch of time, measures how the Nodlings are doing, tries one small change to the rules, tests it, and keeps or reverts it.'],
  ['Cycle', 'One run of that routine. The cycle number counts up over time.'],
  ['Day', 'In-world days since the world started (one day is 1,600 simulation ticks). It only measures how long the world has been running, not how well it is going.'],
  ['Population', 'How many Nodlings are alive right now. It is capped (currently 400), so it normally sits near the cap; a sudden drop would mean trouble.'],
  ['Benchmark gap (the headline number)', 'A test of how much evolution has taught the species. We drop 30 Nodlings built from the best evolved brains, and 30 with random brains, into fresh identical worlds for a while, then compare how long they live and how many offspring they have. The gap is evolved minus random. Random brains score about 320, so a gap near 2,000 means evolved Nodlings do roughly 7x better. Higher is better; a falling gap means the species got worse at surviving.'],
  ['Median fitness', 'The middle score among the Nodlings alive now, where score = age + 250 per offspring. It moves with the age mix of the population (lots of newborns pulls it down), so it is a rough health reading, not a progress score.'],
  ['Max generation', 'The longest family line alive: how many parents-to-children steps lead to the oldest-lineage Nodling. A bigger number means evolution has had more rounds of selection.'],
  ['Largest cluster', 'The biggest group of touching built tiles (wood, plank, stone or brick). It stands in for "village size": scattered single blocks count as 1, a real settlement would be much larger. The project hopes to see this grow.'],
  ['Brick cells', 'Tiles holding fired bricks. Bricks only appear when clay sits next to fire (a kiln), so this shows whether Nodlings and fire are producing the best building material.'],
  ['Comm (call separation)', 'Whether calls carry meaning. It measures how different the average call pitch is when a predator is nearby versus not. Near 0 means calls are random noise; a rising number means Nodlings call differently when in danger, like an alarm.'],
  ['Hypotheses: kept / reverted / untested / running', 'Each cycle tests one idea. "kept": it passed the checks and stays. "reverted": it did not help or made things worse and was undone. "untested": proposed but never properly evaluated. "running": being tested right now.'],
  ['Guardrails', 'Safety checks every change must pass: the population must not crash, no numbers may break, and the benchmark gap must not drop by more than a quarter compared with an identical run without the change.'],
  ['Paired test (A/B)', 'To judge a change fairly, the loop runs the world twice from the exact same saved state, once without and once with the change, and compares. Short runs are noisy, so small differences are often "within noise".'],
  ['INCIDENT', 'A guardrail tripped on a plain run, so the loop stopped changing things and left a note in the changelog for a human to look at.'],
  ['STRUCTURAL', 'A changelog tag for a change that adds a new rule or reward, as opposed to just nudging an existing number.'],
];

const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

// Self-contained loop/dashboard.html: open it straight from the repo or a checkout.
function renderDashboard(history, svg, changelog, hypotheses){
  const rows = history.slice(-15).reverse().map(h => `<tr><td>${h.cycle}</td><td>${h.day}</td><td>${h.benchmark ? h.benchmark.gap : ''}</td><td>${h.medianFitness}</td><td>${h.largestCluster}</td><td>${h.brickCells}</td><td>${h.maxGen}</td><td>${h.commSeparation ?? ''}</td></tr>`).join('');
  const hyp = (hypotheses.hypotheses || []).map(x => `<li><b>${esc(x.status)}</b> ${esc(x.change)} <small>${esc(x.note || '')}</small></li>`).join('');
  const entries = changelog.split(/^## /m).slice(1, 6).map(e => `<section><h3>${esc(e.split('\n')[0])}</h3><pre>${esc(e.split('\n').slice(1).join('\n').trim())}</pre></section>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nodlings progress</title>
<style>body{font:14px/1.45 system-ui,sans-serif;max-width:820px;margin:0 auto;padding:16px;background:#fff;color:#222}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #ddd;padding:3px 6px;text-align:right}th{font-weight:600}dt{font-weight:600;margin-top:10px}dd{margin:2px 0 0 0}pre{white-space:pre-wrap;background:#f6f6f6;padding:8px}svg{max-width:100%;height:auto}@media(prefers-color-scheme:dark){body{background:#15171c;color:#dde}td,th{border-color:#333}pre{background:#20232b}svg rect{fill:#15171c}svg text{fill:#ccd}}</style></head><body>
<h1>Nodlings progress</h1><p>Updated ${new Date().toISOString().slice(0, 16)}Z. This page tracks a simulated world of small creatures (Nodlings) whose brains evolve. The headline is the <b>benchmark gap</b>: how much better the evolved Nodlings do than random ones (higher is better). New here? The <a href="#glossary">glossary at the bottom</a> explains every number.</p>
${svg}
<h2>Recent cycles</h2><table><tr><th>cycle</th><th>day</th><th title="Evolved minus random Nodlings; higher is better">bench gap</th><th title="Middle score of living Nodlings">median fit</th><th title="Biggest group of touching built tiles">cluster</th><th title="Fired-brick tiles">bricks</th><th title="Longest family line alive">max gen</th><th title="Do calls differ when a predator is near?">comm</th></tr>${rows}</table>
<h2>Hypotheses</h2><ul>${hyp}</ul><h2>Latest changelog</h2>${entries}\n<h2 id="glossary">What do these numbers mean?</h2><dl>${GLOSSARY.map(([t, d]) => `<dt>${esc(t)}</dt><dd>${esc(d)}</dd>`).join('')}</dl></body></html>`;
}

// loop/dashboard.md: renders natively in the GitHub app/mobile (no Pages needed).
function renderMarkdown(history, hypotheses){
  const last = history[history.length - 1];
  const fmt = h => `| ${h.cycle} | ${h.day} | ${h.benchmark ? h.benchmark.gap : ''} | ${h.medianFitness} | ${h.largestCluster} | ${h.brickCells} | ${h.maxGen} | ${h.commSeparation ?? ''} |`;
  const hyp = (hypotheses.hypotheses || []).map(x => `- **${x.status}**: ${x.change}${x.note ? ' (' + x.note + ')' : ''}`).join('\n');
  return `# Nodlings progress

This page tracks a simulated world of small creatures (Nodlings) whose brains evolve. The headline is the **benchmark gap**: how much better the evolved Nodlings do than random ones (higher is better). The glossary at the bottom explains every number.

Updated ${new Date().toISOString().slice(0, 16)}Z. ${last ? `Now: day ${last.day}, benchmark gap **${last.benchmark ? last.benchmark.gap : 'n/a'}** (evolved gene pool minus random genomes), largest built cluster ${last.largestCluster}, ${last.brickCells} brick cells, max generation ${last.maxGen}.` : ''}

![progress](progress.svg)

## Recent cycles (newest first)

| cycle | day | bench gap | median fitness | cluster | bricks | max gen | comm |
|---|---|---|---|---|---|---|---|
${history.slice(-15).reverse().map(fmt).join('\n')}

## Hypotheses

${hyp}

See [CHANGELOG.md](CHANGELOG.md) for what each cycle changed.

## What do these numbers mean?

${GLOSSARY.map(([t, d]) => `**${t}.** ${d}`).join('\n\n')}
`;
}
module.exports = { renderProgress, renderDashboard, renderMarkdown };
