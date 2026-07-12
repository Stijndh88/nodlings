// Simulation driver: tick loop, population bookkeeping, hall of fame, sidebar,
// and persistence (auto-saves the evolved genomes so progress survives reloads).
'use strict';

let world = new World();
let nodlings = [];
let critters = [];
let predators = [];
const START_POP = 70, START_CRITTERS = 60, START_PREDATORS = 4;
const LIFE_SUPPORT = 60;  // gently top up toward this from the diverse gene bank
const hallOfFame = []; // best genomes ever, by lifetime fitness — the "progress"
let births = 0, deaths = 0;
const popHist = [];

// ---------- novelty search ----------
// A rolling archive of behaviour signatures; novelty = distance to the nearest
// stored behaviours. Rewarding novel behaviour keeps the world exploring.
const behaviorArchive = [];
const ARCHIVE_MAX = 200;
function archiveBehavior(sig){
  behaviorArchive.push(sig);
  if (behaviorArchive.length > ARCHIVE_MAX)
    behaviorArchive.splice((Math.random()*ARCHIVE_MAX)|0, 1); // random eviction keeps it varied
}
function behaviorNovelty(sig){
  const A = behaviorArchive;
  if (A.length < 10) return 0.5; // early on, everything is novel
  const best = [1e9,1e9,1e9];    // 3 nearest sq-distances
  for (let i = 0; i < A.length; i++){
    const a = A[i]; let d = 0;
    for (let k = 0; k < 6; k++){ const e = sig[k]-a[k]; d += e*e; }
    if (d < best[2]){ best[2] = d; best.sort((x,y)=>x-y); }
  }
  return Math.min(1, Math.sqrt((best[0]+best[1]+best[2])/3));
}

// ---------- persistence ----------
const SAVE_KEY = 'nodlings.save.v6'; // v6: speciation + novelty + bigger world (fresh start)

function serialize(){
  return JSON.stringify({
    v:4, tick:world.tick, births, deaths, popHist,
    fame: hallOfFame.map(h => ({score:h.score, genome:h.genome})),
    predFame: predFame.map(h => ({score:h.score, genome:h.genome})),
  });
}
function saveProgress(){
  try { localStorage.setItem(SAVE_KEY, serialize()); flashSaved(); } catch (e){}
}
function applySave(d){
  if (!d || !d.fame) return false;
  hallOfFame.length = 0;
  for (const h of d.fame) hallOfFame.push(h);
  predFame.length = 0;
  if (Array.isArray(d.predFame)) for (const h of d.predFame) predFame.push(h);
  reindexFromGenomes(hallOfFame.concat(predFame).map(h => h.genome)); // keep NEAT ids consistent
  births = d.births|0; deaths = d.deaths|0;
  popHist.length = 0; if (Array.isArray(d.popHist)) popHist.push(...d.popHist);
  return true;
}
function loadProgress(){
  try { const s = localStorage.getItem(SAVE_KEY); return s ? applySave(JSON.parse(s)) : false; }
  catch (e){ return false; }
}

// ---------- population ----------
// A reseed draws mostly from the (deep, diverse) hall of fame with extra
// mutation, but a healthy fraction fresh-random — injecting diversity instead of
// re-cloning the monoculture that stalled evolution. It also carries the source
// lineage's generation, so topping up doesn't reset the population's gen depth.
function fameEntry(){
  if (hallOfFame.length && world.rng() < 0.6){
    const e = hallOfFame[(world.rng()*hallOfFame.length)|0];
    return { genome: mutateGenome(mutateGenome(e.genome, world.rng), world.rng), gen: e.gen || 0 };
  }
  return { genome: randomGenome(world.rng), gen: 0 };
}
function seed(n){
  for (let i = 0; i < n; i++){
    const x = (world.rng()*GRID_W)|0, y = (world.rng()*GRID_H)|0;
    const c = world.at(x, y);
    if (!c || c.water){ i--; continue; }
    const e = fameEntry();
    nodlings.push(new Nodling(world, x + 0.5, y + 0.5, e.genome, e.gen));
  }
}

function simTick(){
  world.pop = nodlings.length;
  world.predators = predators;         // so Nodlings can sense them this tick
  world.nextSounds = [];
  world.buildIndex(nodlings);
  world.step();
  const born = [];
  for (const n of nodlings){ const child = n.tick(); if (child) born.push(child); }
  predators = updatePredators(world, predators); // hunt (may kill Nodlings) after they act
  for (const n of nodlings){
    if (!n.dead) continue;
    deaths++;
    hallOfFame.push({genome:n.genome, score:n.age + 250*n.offspring, gen:n.gen});
    hallOfFame.sort((a,b)=>b.score-a.score);
    hallOfFame.length = Math.min(hallOfFame.length, 40); // deeper, more diverse seed bank
  }
  births += born.length;
  nodlings = nodlings.filter(n=>!n.dead).concat(born);
  critters = updateCritters(world, critters);
  // gentle life-support: trickle in one gene-bank Nodling at a time toward a
  // minimum, instead of dumping a crowd of clones — keeps a diverse standing
  // population without the reseed treadmill that reset the gene pool.
  if (nodlings.length < LIFE_SUPPORT && world.rng() < 0.04) seed(1);
  // Also enrol the best *living* Nodling periodically — in a stable population
  // the elite may never die, so death-only fame would lag and understate progress.
  if (world.tick % 300 === 0 && nodlings.length){
    let best = null, bs = -1;
    for (const n of nodlings){ const f = n.age + 250*n.offspring; if (f > bs){ bs = f; best = n; } }
    if (best){
      hallOfFame.push({genome:best.genome, score:bs, gen:best.gen});
      hallOfFame.sort((a,b)=>b.score-a.score);
      hallOfFame.length = Math.min(hallOfFame.length, 40);
    }
  }
  world.sounds = world.nextSounds;
  observerTick();

  if (world.tick % 150 === 0){
    popHist.push(nodlings.length);
    if (popHist.length > 220) popHist.shift();
  }
}

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
(function selfTest(){
  const rng = makeRng(42);
  const s = Array.from({length:N_SENSES}, (_,i)=>Math.sin(i));
  const g = randomGenome(rng);
  const brain = new Brain(g);
  const o = brain.step(s, 0);
  console.assert(OUTPUTS.every(k=>Number.isFinite(o[k]) && Math.abs(o[k]) <= 1.0001),
    'network outputs finite and bounded');
  const g2 = mutateGenome(g, rng), g3 = crossoverGenome(g, g2, rng);
  console.assert(genomeSize(g2) > 0 && g3.body.length === N_BODY, 'variation produces valid genomes');
  // plasticity actually changes a synapse under reward
  const gp = randomGenome(rng);
  gp.conns.forEach(c => { c.pl = 1; c.w = 0.5; });
  const bp = new Brain(gp), before = bp.w[0];
  for (let i = 0; i < 20; i++) bp.step(s.map(()=>1), 1);
  console.assert(bp.w[0] !== before, 'reward-modulated plasticity updates weights');
  console.log('Nodlings self-test passed (NEAT + plasticity)');
})();

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
