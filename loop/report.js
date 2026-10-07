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

const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

// Self-contained loop/dashboard.html: open it straight from the repo or a checkout.
function renderDashboard(history, svg, changelog, hypotheses){
  const rows = history.slice(-15).reverse().map(h => `<tr><td>${h.cycle}</td><td>${h.day}</td><td>${h.benchmark ? h.benchmark.gap : ''}</td><td>${h.medianFitness}</td><td>${h.largestCluster}</td><td>${h.brickCells}</td><td>${h.maxGen}</td><td>${h.commSeparation ?? ''}</td></tr>`).join('');
  const hyp = (hypotheses.hypotheses || []).map(x => `<li><b>${esc(x.status)}</b> ${esc(x.change)} <small>${esc(x.note || '')}</small></li>`).join('');
  const entries = changelog.split(/^## /m).slice(1, 6).map(e => `<section><h3>${esc(e.split('\n')[0])}</h3><pre>${esc(e.split('\n').slice(1).join('\n').trim())}</pre></section>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nodlings progress</title>
<style>body{font:14px/1.45 system-ui,sans-serif;max-width:820px;margin:0 auto;padding:16px;background:#fff;color:#222}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #ddd;padding:3px 6px;text-align:right}th{font-weight:600}pre{white-space:pre-wrap;background:#f6f6f6;padding:8px}svg{max-width:100%;height:auto}@media(prefers-color-scheme:dark){body{background:#15171c;color:#dde}td,th{border-color:#333}pre{background:#20232b}svg rect{fill:#15171c}svg text{fill:#ccd}}</style></head><body>
<h1>Nodlings progress</h1><p>Updated ${new Date().toISOString().slice(0, 16)}Z. Headline: <b>benchmark gap</b> (how far the evolved gene pool beats random genomes).</p>
${svg}
<h2>Recent cycles</h2><table><tr><th>cycle</th><th>day</th><th>bench gap</th><th>median fit</th><th>cluster</th><th>bricks</th><th>max gen</th><th>comm</th></tr>${rows}</table>
<h2>Hypotheses</h2><ul>${hyp}</ul><h2>Latest changelog</h2>${entries}</body></html>`;
}
module.exports = { renderProgress, renderDashboard };
