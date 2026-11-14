'use strict';
// Renders loop/progress.svg from loop/history.jsonl — committed each cycle so
// progress is visible on GitHub (and in the README) with no hosting needed.

const PANELS = [
  { key: h => h.probes && h.probes.skill, title: 'Skill (exam score, evolved - random)', color: '#2a9d8f' },
  { key: h => h.probes && h.probes.learningGain, title: 'Learning gain (what learning is worth)', color: '#8e5bd0' },
  { key: h => h.probes && h.probes.handsGain, title: 'Hands gain (what grab, drop, strike are worth)', color: '#d0715b' },
  { key: h => h.probes && h.probes.memoryGain, title: 'Memory gain (what memory is worth)', color: '#3b8fd9' },
  { key: h => h.techniques, title: 'Techniques in common use (ledger)', color: '#e9a23b' },
  { key: h => h.badMealShare == null ? NaN : h.badMealShare*100, title: 'Bad meals % (50 = cannot tell the plants apart)', color: '#999999' },
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
  ['Nodling', 'One of the little creatures in the simulation. Each has a small evolving "brain"; nobody scripts what it does and nothing rewards it except its own body feeling better or worse.'],
  ['World 2', 'The world since November 2026. Materials are rows of properties (mass, hardness, fuel, food...) and a handful of rules act on those properties, so things can be combined in ways nobody listed. The first world paid Nodlings bonuses for behaviours; this one pays nothing.'],
  ['What is the loop?', 'An unattended routine that keeps the world running. Each "cycle" it simulates a stretch of time, measures how the Nodlings are doing, and tests one small change to the world.'],
  ['Day and year', 'A day is 400 ticks and a year is 8 days. A Nodling can live about 3 years, so it sees several winters.'],
  ['Skill (the headline number)', 'An exam for the species. A sample of living adult Nodlings is copied into fresh, identical test worlds and scored on how long each lives and how many offspring it has over a year and a half (one winter, and one swap of the good and the poisonous plant). Three tasks: a normal world, a world with little food, a world where thirst bites three times faster. Random brains sit the same exam. Skill is the evolved score minus the random score.'],
  ['Learning gain', 'The exam score minus the score of the same Nodlings with learning switched off. Positive means that learning during a lifetime helps them.'],
  ['Hands gain', 'The exam score minus the score with grab, drop and strike switched off. Positive means that handling things (tools, fire, walls) helps them survive. In the first world this was exactly zero.'],
  ['Memory gain, social gain', 'The same idea for memory and for the senses about other Nodlings.'],
  ['Techniques', 'The technique ledger counts every kind of thing a Nodling does with an object: the action, what is in its hand, what it acts on, and what happens (for example "strike / hard / animal / kill"). "In common use" means at least 20% of the Nodlings active during the batch did it at least once. Random brains grab, drop and strike by accident, so watch whether the shares rise, not whether a type exists. Nothing is ever rewarded for appearing here.'],
  ['Tool techniques', 'Techniques that need something in the hand, or something placed to an effect (feeding a fire, bridging water).'],
  ['Bad meals', 'Each year one of the two plant kinds is nourishing and the other mildly poisonous, and they swap. 50% bad meals means Nodlings eat both alike; a lower number means they learned which is which.'],
  ['World health', 'wallShare (how much land is wall), openShore and canReachWater (can Nodlings still walk to water). The first world silted up until nobody could reach water; these numbers guard against that.'],
  ['Brain size', 'Average number of connections in a living Nodling brain.'],
  ['Max generation', 'The longest family line alive.'],
  ['Instant test', 'A quick check of a change: the same living Nodlings sit the exam under the old and the new code, on several sets of test worlds.'],
  ['Evolution experiment', 'The real test of a change. Several copies of the world evolve with the change and several without it, on GitHub Actions. A change is kept only if the Nodlings that evolved with it score measurably higher on the exam.'],
  ['INCIDENT', 'A guardrail tripped on a plain run, so the loop stopped changing things and left a note in the changelog for a human to look at.'],
];

const pv = (h, k) => (h.probes && h.probes[k] != null ? h.probes[k] : '');
const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

// Self-contained loop/dashboard.html: open it straight from the repo or a checkout.
function renderDashboard(history, svg, changelog, hypotheses){
  const rows = history.slice(-15).reverse().map(h => `<tr><td>${h.cycle}</td><td>${h.day}</td><td>${pv(h, 'skill')}</td><td>${pv(h, 'learningGain')}</td><td>${pv(h, 'handsGain')}</td><td>${pv(h, 'memoryGain')}</td><td>${h.techniques ?? ''}</td><td>${h.avgBrain}</td><td>${h.maxGen}</td></tr>`).join('');
  const hyp = (hypotheses.hypotheses || []).slice(-25).reverse().map(x => `<li><b>${esc(x.status)}</b> ${esc(x.change)} <small>${esc(x.note || '')}</small></li>`).join('');
  const entries = changelog.split(/^## /m).slice(1, 6).map(e => `<section><h3>${esc(e.split('\n')[0])}</h3><pre>${esc(e.split('\n').slice(1).join('\n').trim())}</pre></section>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nodlings progress</title>
<style>body{font:14px/1.45 system-ui,sans-serif;max-width:820px;margin:0 auto;padding:16px;background:#fff;color:#222}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #ddd;padding:3px 6px;text-align:right}th{font-weight:600}dt{font-weight:600;margin-top:10px}dd{margin:2px 0 0 0}pre{white-space:pre-wrap;background:#f6f6f6;padding:8px}svg{max-width:100%;height:auto}@media(prefers-color-scheme:dark){body{background:#15171c;color:#dde}td,th{border-color:#333}pre{background:#20232b}svg rect{fill:#15171c}svg text{fill:#ccd}}</style></head><body>
<h1>Nodlings progress</h1><p>Updated ${new Date().toISOString().slice(0, 16)}Z. This page tracks a simulated world of small creatures (Nodlings) whose brains evolve. The headline is <b>skill</b>: how much better the evolved Nodlings score on a fixed exam than Nodlings with random brains (higher is better). <b>Learning gain</b>, <b>hands gain</b> and <b>memory gain</b> show whether they actually use learning, their hands and memory. New here? The <a href="#glossary">glossary at the bottom</a> explains every number.</p>
${svg}
<h2>Recent cycles</h2><table><tr><th>cycle</th><th>day</th><th title="Exam score, evolved minus random; higher is better">skill</th><th title="Exam score with learning minus without">learning gain</th><th title="Exam score with hands minus without">hands gain</th><th title="Exam score with memory minus without">memory gain</th><th title="Kinds of things done with objects by at least 5% of Nodlings">techniques</th><th title="Average connections per brain">brain</th><th title="Longest family line alive">max gen</th></tr>${rows}</table>
<h2>Latest hypotheses</h2><ul>${hyp}</ul><h2>Latest changelog</h2>${entries}\n<h2 id="glossary">What do these numbers mean?</h2><dl>${GLOSSARY.map(([t, d]) => `<dt>${esc(t)}</dt><dd>${esc(d)}</dd>`).join('')}</dl></body></html>`;
}

// loop/dashboard.md: renders natively in the GitHub app/mobile (no Pages needed).
function renderMarkdown(history, hypotheses){
  const last = history[history.length - 1];
  const fmt = h => `| ${h.cycle} | ${h.day} | ${pv(h, 'skill')} | ${pv(h, 'learningGain')} | ${pv(h, 'handsGain')} | ${pv(h, 'memoryGain')} | ${h.techniques ?? ''} | ${h.avgBrain} | ${h.maxGen} |`;
  const hyp = (hypotheses.hypotheses || []).slice(-25).reverse().map(x => `- **${x.status}**: ${x.change}${x.note ? ' (' + x.note + ')' : ''}`).join('\n');
  return `# Nodlings progress

This page tracks a simulated world of small creatures (Nodlings) whose brains evolve. The headline is **skill**: how much better the evolved Nodlings score on a fixed exam than Nodlings with random brains (higher is better). **Learning gain**, **hands gain** and **memory gain** show whether they actually use learning, their hands and memory. The glossary at the bottom explains every number.

Updated ${new Date().toISOString().slice(0, 16)}Z. ${last ? `Now: day ${last.day}, skill **${pv(last, 'skill') || 'n/a'}**, learning gain ${pv(last, 'learningGain') || 'n/a'}, memory gain ${pv(last, 'memoryGain') || 'n/a'}, brain size ${last.avgBrain}, max generation ${last.maxGen}. The plan is in [ROADMAP.md](../ROADMAP.md).` : ''}

![progress](progress.svg)

## Recent cycles (newest first)

| cycle | day | skill | learning gain | hands gain | memory gain | techniques | brain | max gen |
|---|---|---|---|---|---|---|---|---|
${history.slice(-15).reverse().map(fmt).join('\n')}

## Latest hypotheses

${hyp}

See [CHANGELOG.md](CHANGELOG.md) for what each cycle changed.

## What do these numbers mean?

${GLOSSARY.map(([t, d]) => `**${t}.** ${d}`).join('\n\n')}
`;
}
module.exports = { renderProgress, renderDashboard, renderMarkdown };
