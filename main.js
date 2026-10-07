// Browser UI driver: reset/import handlers, sidebar stats, sparkline, help
// tips, and persistence wiring. Simulation state and simTick() itself live in
// sim.js (shared with the headless loop harness).
'use strict';

function resetWorld(keepFame){
  world = new World(Date.now());
  nodlings = []; critters = []; predators = [];
  if (!keepFame){ hallOfFame.length = 0; }
  births = 0; deaths = 0; popHist.length = 0;
  resetObserver();
  clearSelection();
  camera.cx = GRID_W/2; camera.cy = GRID_H/2; camera.zoom = 9;
  seed(START_POP);
  spawnCritters(world, critters, START_CRITTERS);
  spawnPredators(world, predators, START_PREDATORS);
  saveProgress();
}

// ---------- UI ----------
let paused = false;
const speedSel = document.getElementById('speed');
document.getElementById('pause').onclick = e => {
  paused = !paused; e.target.textContent = paused ? 'Resume' : 'Pause';
};
document.getElementById('reset').onclick = () => resetWorld(true);   // keep evolved genomes
document.getElementById('save').onclick  = () => saveProgress();
document.getElementById('export').onclick = () => {
  const blob = new Blob([serialize()], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `nodlings-gen-${hallOfFame[0]?hallOfFame[0].score|0:0}.json`;
  a.click(); URL.revokeObjectURL(a.href);
};
const importInput = document.getElementById('importfile');
document.getElementById('import').onclick = () => importInput.click();
importInput.onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => { try { if (applySave(JSON.parse(r.result))){ resetFromImport(); } } catch (err){ alert('Bad save file'); } };
  r.readAsText(f);
  importInput.value = '';
};
function resetFromImport(){
  world = new World(Date.now());
  nodlings = []; critters = []; predators = [];
  clearSelection();
  camera.cx = GRID_W/2; camera.cy = GRID_H/2; camera.zoom = 14;
  seed(START_POP); spawnCritters(world, critters, START_CRITTERS);
  spawnPredators(world, predators, START_PREDATORS);
  saveProgress();
}

// ---- watch the autonomous loop's world (loop/world.json.gz) ----
// Served over http (e.g. GitHub Pages) this fetches the file directly; opened
// from disk it falls back to a file picker. The loop's world is loaded as-is.
async function openLoopWorld(buf, name){
  let text;
  if (/\.gz$/i.test(name) || (buf[0] === 0x1f && buf[1] === 0x8b)){
    const ds = new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip')));
    text = await ds.text();
  } else text = new TextDecoder().decode(buf);
  restoreWorld(text);
  resetObserver(); clearSelection();
  camera.cx = GRID_W/2; camera.cy = GRID_H/2; camera.zoom = 9;
}
const loopInput = document.getElementById('loopfile');
document.getElementById('loopworld').onclick = async () => {
  try {
    const r = await fetch('loop/world.json.gz');
    if (!r.ok) throw new Error('not served');
    await openLoopWorld(new Uint8Array(await r.arrayBuffer()), 'world.json.gz');
  } catch (err){ loopInput.click(); }
};
loopInput.onchange = async e => {
  const f = e.target.files[0]; if (!f) return;
  try { await openLoopWorld(new Uint8Array(await f.arrayBuffer()), f.name); }
  catch (err){ alert('Could not read the loop world file'); }
  loopInput.value = '';
};

// auto-save: periodically + when the tab closes, so progress is never lost
setInterval(saveProgress, 8000);
window.addEventListener('beforeunload', () => { saveProgress(); saveObserver(); });

// Observations panel (the Observer's report)
const obsPanel = document.getElementById('obs-panel');
function renderObs(){
  const body = document.getElementById('obs-body');
  if (!observer.log.length){ body.innerHTML = '<p style="opacity:.6">No observations yet — let the world run a few days.</p>'; return; }
  const icon = { milestone:'🏆', issue:'⚠️', idea:'💡', trend:'📈' };
  body.innerHTML = observer.log.slice().reverse().map(e =>
    `<div class="obs-row obs-${e.kind}"><span class="obs-day">day ${e.day}</span> ${icon[e.kind]||''} ${e.text}</div>`).join('');
}
document.getElementById('obs-btn').onclick = () => { renderObs(); obsPanel.style.display = 'flex'; };
document.getElementById('obs-close').onclick = () => { obsPanel.style.display = 'none'; };
document.getElementById('obs-download').onclick = () => {
  const blob = new Blob([observerMarkdown()], {type:'text/markdown'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `nodlings-observations-day${(world.tick/DAY_LEN)|0}.md`;
  a.click(); URL.revokeObjectURL(a.href);
};

let savedFlashUntil = 0;
function flashSaved(){ savedFlashUntil = performance.now() + 1200; }

// '?' help tooltips, rendered on <body> so the sidebar's overflow can't clip them
function initHelpTips(){
  const tip = document.createElement('div'); tip.id = 'helptip'; document.body.appendChild(tip);
  for (const el of document.querySelectorAll('.help')){
    el.addEventListener('mouseenter', () => {
      tip.textContent = el.dataset.tip; tip.style.display = 'block';
      const r = el.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight;
      let x = r.left - tw - 10; if (x < 6) x = r.right + 10;          // flip if no room left
      let y = r.top + r.height/2 - th/2;
      y = Math.max(6, Math.min(window.innerHeight - th - 6, y));
      tip.style.left = x + 'px'; tip.style.top = y + 'px';
    });
    el.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
  }
}

const stat = id => document.getElementById(id);
const clockStr = () => {
  const mins = world.dayFrac()*24*60;
  return `${String((mins/60)|0).padStart(2,'0')}:${String((mins%60)|0).padStart(2,'0')}`;
};

let statFrame = 0;
function updateStats(){
  if (statFrame++ % 6) return;
  const pop = nodlings.length;
  const maxGen = nodlings.reduce((m,n)=>Math.max(m,n.gen), 0);
  const avgBrain = pop ? (nodlings.reduce((t,n)=>t+n.brainSize,0)/pop)|0 : 0;
  const juv = nodlings.reduce((t,n)=>t+(n.age<160?1:0), 0);
  let structures = 0, flora = 0, planks = 0, bricks = 0, bridges = 0;
  for (const c of world.cells){
    if (c.stack.length >= 2) structures++;
    if (c.water && c.stack.length) bridges++;
    const top = c.stack[c.stack.length-1];
    if (top === 'flora' || top === 'seed') flora++;
    else if (top === 'plank') planks++;
    else if (top === 'brick') bricks++;
  }
  const kills = predators.reduce((t,p)=>t+p.kills, 0);
  const predBrain = predators.length ? (predators.reduce((t,p)=>t+genomeSize(p.genome),0)/predators.length)|0 : 0;
  const hueDiv = new Set(nodlings.map(n=>(n.genome.hue/30)|0)).size;
  const carnPct = pop ? Math.round(100*nodlings.filter(n=>(n.genome.diet ?? 0.5) > 0.55).length/pop) : 0;
  stat('s-day').textContent    = (world.tick/DAY_LEN).toFixed(1);
  stat('s-clock').textContent  = clockStr() + (world.isNight() ? ' 🌙' : ' ☀️');
  stat('s-season').textContent = world.season();
  stat('s-temp').textContent   = world.ambient().toFixed(1) + '°';
  stat('s-pop').textContent    = pop + (juv ? ` (${juv}j)` : '');
  stat('s-crit').textContent   = critters.length;
  stat('s-gen').textContent    = maxGen;
  stat('s-brain').textContent  = avgBrain + ' conns';
  stat('s-fit').textContent    = hallOfFame[0] ? hallOfFame[0].score|0 : 0;
  stat('s-div').textContent    = hueDiv + ' lineages';
  stat('s-diet').textContent   = `${100-carnPct}%h / ${carnPct}%c`;
  stat('s-births').textContent = births;
  stat('s-deaths').textContent = deaths;
  stat('s-pred').textContent   = predators.length;
  stat('s-kills').textContent  = kills;
  stat('s-pfit').textContent   = predFame[0] ? predFame[0].score|0 : 0;
  stat('s-pbrain').textContent = predBrain + ' conns';
  stat('s-struct').textContent = structures;
  stat('s-build').textContent  = `${planks}p ${bricks}b`;
  stat('s-bridge').textContent = bridges;
  stat('s-fire').textContent   = world.fires.length;
  stat('s-flora').textContent  = flora;
  stat('s-saved').textContent  = performance.now() < savedFlashUntil ? 'saved ✓' : '';
  drawSparkline();
}

let sparkCanvas, sparkCtx;
function drawSparkline(){
  if (!sparkCanvas){ sparkCanvas = document.getElementById('spark'); sparkCtx = sparkCanvas.getContext('2d'); }
  const w = sparkCanvas.width, h = sparkCanvas.height;
  sparkCtx.clearRect(0, 0, w, h);
  if (popHist.length < 2) return;
  const max = Math.max(10, ...popHist);
  sparkCtx.strokeStyle = '#6fcf7f'; sparkCtx.lineWidth = 1.5;
  sparkCtx.beginPath();
  popHist.forEach((v, i) => {
    const x = i/(popHist.length-1)*w, y = h - (v/max)*(h-2) - 1;
    i ? sparkCtx.lineTo(x, y) : sparkCtx.moveTo(x, y);
  });
  sparkCtx.stroke();
}

function frame(){
  if (!paused){ const steps = +speedSel.value; for (let i = 0; i < steps; i++) simTick(); }
  draw(nodlings);
  drawMini(nodlings);
  updateStats();
  requestAnimationFrame(frame);
}

// ---- self-check: fails loudly in the console if the brain math breaks ----
selfTest();

initHelpTips();
loadProgress();                      // resume evolved genomes if a save exists
// Each page load builds a FRESH world (positions/tick/structures aren't saved),
// so the observation log starts fresh too — otherwise it mixes old high-day
// entries with the new run. Download it before reloading if you want to keep it.
resetObserver();
initRender(() => nodlings);
seed(START_POP);
spawnCritters(world, critters, START_CRITTERS);
spawnPredators(world, predators, START_PREDATORS);
frame();
