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
module.exports = { renderProgress };
