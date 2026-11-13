'use strict';
// Renders loop/progress.svg from loop/history.jsonl — committed each cycle so
// progress is visible on GitHub (and in the README) with no hosting needed.

const PANELS = [
  { key: h => h.probes && h.probes.skill, title: 'Skill (exam score, evolved - random)', color: '#2a9d8f' },
  { key: h => h.probes && h.probes.learningGain, title: 'Learning gain (what plasticity is worth)', color: '#8e5bd0' },
  { key: h => h.probes && h.probes.memoryGain, title: 'Memory gain (what memory is worth)', color: '#3b8fd9' },
  { key: h => h.avgBrain, title: 'Brain size (connections)', color: '#6a7fdb' },
  { key: h => h.medianFitness, title: 'Median fitness (living)', color: '#e9a23b' },
  { key: h => h.benchmark && h.benchmark.gap, title: 'Old benchmark gap (retired at cycle 228)', color: '#999999' },
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
    if (lo < 0){ const y0 = oy + H - 28 - (0 - lo) / (hi - lo) * (H - 58); out.push(`<line x1="${ox+PAD}" y1="${y0.toFixed(1)}" x2="${ox+W-PAD}" y2="${y0.toFixed(1)}" stroke="#bbb" stroke-dasharray="3 3"/>`); }
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
  ['Skill (the headline number)', 'An exam for the species. A sample of 40 living Nodlings is copied into fresh, identical test worlds and scored on how long each lives and how many offspring it has. There are three tasks: a normal world, a world with little food, and a world where thirst bites five times faster. The same exam is given to Nodlings with random brains. Skill is the evolved score minus the random score, averaged over the tasks. The exam never changes when the live world is made harder, so a rising line means the Nodlings really got better.'],
  ['Learning gain', 'The exam score with learning switched on, minus the score of the same Nodlings with learning switched off. It answers "does learning during a lifetime actually help them?". Positive means it helps. At or below zero means the brains do not use learning yet, which is where the project started in November 2026.'],
  ['Memory gain', 'The same idea for memory: the normal exam score minus the score when the memory senses (remembered food, water and shelter, plus the two memory cells) are blanked. A large positive number means the Nodlings rely on memory.'],
  ['Brain size', 'Average number of connections in a living Nodling brain. Not a goal by itself, but a collapse suggests that thinking no longer pays.'],
  ['Median fitness', 'The middle score of the Nodlings alive right now, where score = age in ticks + 250 per offspring. It swings as old Nodlings die, so read the trend, not one value.'],
  ['Max generation', 'The longest family line alive: how many parent-to-child steps separate it from the first Nodlings.'],
  ['Old benchmark gap', 'The headline until cycle 228. It let the test colony breed until it filled the map, so it mostly measured how fast a colony grows and it barely moved for a month. Replaced by Skill.'],
  ['Population', 'How many Nodlings are alive right now. It is capped (currently 500), so it normally sits near the cap; a sudden drop would mean trouble.'],
  ['Instant test', 'A quick check of a rule change: the same living Nodlings sit the exam under the old and the new rules, on several sets of test worlds. It shows the immediate effect of the change.'],
  ['Evolution experiment', 'The real test of a change. Several copies of the world evolve for about 40 days with the change and several without it, on GitHub Actions. A change is kept only if the Nodlings that evolved with it score measurably higher on the exam. One run per side proves nothing: identical rules can differ by 5 to 55 percent between two runs.'],
  ['INCIDENT', 'A guardrail tripped on a plain run, so the loop stopped changing things and left a note in the changelog for a human to look at.'],
  ['STRUCTURAL', 'A changelog tag for a change that adds a new rule or reward, as opposed to just nudging an existing number.'],
];

const pv = (h, k) => (h.probes && h.probes[k] != null ? h.probes[k] : '');
const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

// Self-contained loop/dashboard.html: open it straight from the repo or a checkout.
function renderDashboard(history, svg, changelog, hypotheses){
  const rows = history.slice(-15).reverse().map(h => `<tr><td>${h.cycle}</td><td>${h.day}</td><td>${pv(h, 'skill')}</td><td>${pv(h, 'learningGain')}</td><td>${pv(h, 'memoryGain')}</td><td>${h.avgBrain}</td><td>${h.medianFitness}</td><td>${h.maxGen}</td></tr>`).join('');
  const hyp = (hypotheses.hypotheses || []).slice(-25).reverse().map(x => `<li><b>${esc(x.status)}</b> ${esc(x.change)} <small>${esc(x.note || '')}</small></li>`).join('');
  const entries = changelog.split(/^## /m).slice(1, 6).map(e => `<section><h3>${esc(e.split('\n')[0])}</h3><pre>${esc(e.split('\n').slice(1).join('\n').trim())}</pre></section>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nodlings progress</title>
<style>body{font:14px/1.45 system-ui,sans-serif;max-width:820px;margin:0 auto;padding:16px;background:#fff;color:#222}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #ddd;padding:3px 6px;text-align:right}th{font-weight:600}dt{font-weight:600;margin-top:10px}dd{margin:2px 0 0 0}pre{white-space:pre-wrap;background:#f6f6f6;padding:8px}svg{max-width:100%;height:auto}@media(prefers-color-scheme:dark){body{background:#15171c;color:#dde}td,th{border-color:#333}pre{background:#20232b}svg rect{fill:#15171c}svg text{fill:#ccd}}</style></head><body>
<h1>Nodlings progress</h1><p>Updated ${new Date().toISOString().slice(0, 16)}Z. This page tracks a simulated world of small creatures (Nodlings) whose brains evolve. The headline is <b>skill</b>: how much better the evolved Nodlings score on a fixed exam than Nodlings with random brains (higher is better). <b>Learning gain</b> and <b>memory gain</b> show whether they actually use learning and memory. New here? The <a href="#glossary">glossary at the bottom</a> explains every number.</p>
${svg}
<h2>Recent cycles</h2><table><tr><th>cycle</th><th>day</th><th title="Exam score, evolved minus random; higher is better">skill</th><th title="Exam score with learning minus without">learning gain</th><th title="Exam score with memory minus without">memory gain</th><th title="Average connections per brain">brain</th><th title="Middle score of living Nodlings">median fit</th><th title="Longest family line alive">max gen</th></tr>${rows}</table>
<h2>Latest hypotheses</h2><ul>${hyp}</ul><h2>Latest changelog</h2>${entries}\n<h2 id="glossary">What do these numbers mean?</h2><dl>${GLOSSARY.map(([t, d]) => `<dt>${esc(t)}</dt><dd>${esc(d)}</dd>`).join('')}</dl></body></html>`;
}

// loop/dashboard.md: renders natively in the GitHub app/mobile (no Pages needed).
function renderMarkdown(history, hypotheses){
  const last = history[history.length - 1];
  const fmt = h => `| ${h.cycle} | ${h.day} | ${pv(h, 'skill')} | ${pv(h, 'learningGain')} | ${pv(h, 'memoryGain')} | ${h.avgBrain} | ${h.medianFitness} | ${h.maxGen} |`;
  const hyp = (hypotheses.hypotheses || []).slice(-25).reverse().map(x => `- **${x.status}**: ${x.change}${x.note ? ' (' + x.note + ')' : ''}`).join('\n');
  return `# Nodlings progress

This page tracks a simulated world of small creatures (Nodlings) whose brains evolve. The headline is **skill**: how much better the evolved Nodlings score on a fixed exam than Nodlings with random brains (higher is better). **Learning gain** and **memory gain** show whether they actually use learning and memory. The glossary at the bottom explains every number.

Updated ${new Date().toISOString().slice(0, 16)}Z. ${last ? `Now: day ${last.day}, skill **${pv(last, 'skill') || 'n/a'}**, learning gain ${pv(last, 'learningGain') || 'n/a'}, memory gain ${pv(last, 'memoryGain') || 'n/a'}, brain size ${last.avgBrain}, max generation ${last.maxGen}. The plan is in [ROADMAP.md](../ROADMAP.md).` : ''}

![progress](progress.svg)

## Recent cycles (newest first)

| cycle | day | skill | learning gain | memory gain | brain | median fitness | max gen |
|---|---|---|---|---|---|---|---|
${history.slice(-15).reverse().map(fmt).join('\n')}

## Latest hypotheses

${hyp}

See [CHANGELOG.md](CHANGELOG.md) for what each cycle changed.

## What do these numbers mean?

${GLOSSARY.map(([t, d]) => `**${t}.** ${d}`).join('\n\n')}
`;
}
module.exports = { renderProgress, renderDashboard, renderMarkdown };
