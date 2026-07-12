// The Observer — an automated analyst that does the "watch and report" job:
// once per in-world day it reads the whole world, tracks trends, and appends
// milestones / issues / improvement ideas to a log you can open on-screen and
// download as a markdown file. Pure heuristics (no network) — it encodes the
// patterns worth watching in an A-Life run.
'use strict';

const observer = {
  log: [],          // {tick, day, kind:'milestone'|'issue'|'idea'|'trend', text}
  hist: [],         // metric snapshots over time
  seen: {},         // one-shot milestone flags
  cool: {},         // issue -> tick last raised (cooldown)
  lastRun: -1e9,
};
const OBS_KEY = 'nodlings.observations.v1';
const OBS_INTERVAL = DAY_LEN;      // analyse once per in-world day
const OBS_LOOKBACK = 6;            // compare against ~6 days ago

function observerMetrics(){
  let struct=0, built=0, planks=0, bricks=0, fiber=0, bridges=0, clay=0, flora=0, cooked=0;
  const cells = world.cells;
  for (let i = 0; i < cells.length; i++){
    const c = cells[i], st = c.stack;
    if (!st.length) continue;
    const top = st[st.length-1];
    if (top === 'flora' || top === 'seed') flora++;
    else if (top === 'plank') planks++;
    else if (top === 'brick') bricks++;
    else if (top === 'fiber') fiber++;
    else if (top === 'clay') clay++;
    else if (top === 'cooked') cooked++;
    if (c.water) bridges++;                         // any material on water = bridge tile
    if (st.length >= 2){ struct++;
      if (st.some(m => m==='wood'||m==='plank'||m==='stone'||m==='brick')) built++; }
  }
  const pop = nodlings.length;
  const sum = f => nodlings.reduce((t,n)=>t+f(n), 0);
  // diet niches + gene-pool diversity (monoculture detector)
  let dietSum = 0, carn = 0; const hueB = new Set();
  for (const n of nodlings){
    const dt = n.genome.diet ?? 0.5;
    dietSum += dt; if (dt > 0.55) carn++;
    hueB.add((n.genome.hue/30)|0);
  }
  // clustering: mean nearest-neighbour distance (sampled) — lower = grouping
  let cl = 0, cn = 0, stride = Math.max(1, (pop/40)|0);
  for (let i = 0; i < pop; i += stride){
    const n = nodlings[i]; let bd = 1e9;
    for (const o of world.near(world.nIndex, n.x, n.y)){
      if (o === n || o.dead) continue;
      const d = (o.x-n.x)**2 + (o.y-n.y)**2; if (d < bd) bd = d;
    }
    if (bd < 1e9){ cl += Math.sqrt(bd); cn++; }
  }
  return {
    tick:world.tick, day:world.tick/DAY_LEN, season:world.season(), pop,
    maxGen: pop ? nodlings.reduce((m,n)=>Math.max(m,n.gen),0) : 0,
    avgBrain: pop ? sum(n=>n.brainSize)/pop : 0,
    avgAge: pop ? sum(n=>n.age)/pop : 0,
    juv: sum(n=>n.age<160?1:0),
    fame: hallOfFame[0] ? hallOfFame[0].score|0 : 0,
    births, deaths,
    predCount: predators.length,
    predKills: predators.reduce((t,p)=>t+p.kills,0),
    predFame: predFame[0] ? predFame[0].score|0 : 0,
    predBrain: predators.length ? predators.reduce((t,p)=>t+genomeSize(p.genome),0)/predators.length : 0,
    critters: critters.length, fires: world.fires.length,
    struct, built, planks, bricks, fiber, bridges, clay, flora, cooked,
    cluster: cn ? cl/cn : 0,
    avgDiet: pop ? dietSum/pop : 0.5, carnFrac: pop ? carn/pop : 0, hueDiv: hueB.size,
  };
}

function observerNote(kind, text){
  observer.log.push({tick:world.tick, day:+(world.tick/DAY_LEN).toFixed(1), kind, text});
  if (observer.log.length > 500) observer.log.shift();
}
function observerOnce(key, kind, text){
  if (observer.seen[key]) return;
  observer.seen[key] = true; observerNote(kind, text);
}
function observerThrottled(key, kind, text, cooldownDays){
  const last = observer.cool[key] || -1e9;
  if (world.tick - last < cooldownDays*DAY_LEN) return;
  observer.cool[key] = world.tick; observerNote(kind, text);
}
const observerIssue = (key, text, cd = 10) => observerThrottled(key, 'issue', text, cd);
const observerTrend = (key, text, cd = 4) => observerThrottled(key, 'trend', text, cd);

function runObserver(){
  const m = observerMetrics();
  observer.hist.push(m);
  if (observer.hist.length > 400) observer.hist.shift();
  const past = observer.hist[Math.max(0, observer.hist.length - 1 - OBS_LOOKBACK)];

  // ---- milestones (one-shot) ----
  if (m.built > 0)  observerOnce('built','milestone','Nodlings are stacking durable materials (wood/stone/plank) into structures — deliberate building, not just corpse-flora.');
  if (m.bricks > 0) observerOnce('brick','milestone','First brick fired — clay met fire (a kiln). Brick is the best insulator; shelter built from it would survive winter far better.');
  if (m.bridges > 0) observerOnce('bridge','milestone','A bridge tile appeared over water — someone laid buoyant material on the sea. Watch for territory expansion / crossings.');
  if (m.bridges >= 6) observerOnce('bridge6','milestone','Several bridge tiles now span water — a deliberate crossing is forming.');
  if (m.built >= 25) observerOnce('village','milestone','A cluster of 25+ durable structures exists — a proto-settlement is taking shape.');
  if (m.predKills > 0) observerOnce('predkill','milestone','Predators have started landing kills — hunting is being learned (co-evolution underway).');
  for (const g of [10,25,50,100,200,400]) if (m.maxGen >= g) observerOnce('gen'+g,'milestone',`Reached generation ${g} — a lineage ${g} ancestors deep, each one selected.`);
  for (const p of [100,150]) if (m.pop >= p) observerOnce('pop'+p,'milestone',`Population reached ${p}.`);
  for (const f of [5000,10000,25000,50000]) if (m.fame >= f) observerOnce('fame'+f,'milestone',`Best Nodling fitness passed ${f}.`);
  for (const f of [10000,30000]) if (m.predFame >= f) observerOnce('pfame'+f,'milestone',`Best predator fitness passed ${f} — a very effective hunter lineage.`);

  // ---- trends (vs ~6 days ago) ----
  if (past){
    const dFame = m.fame - past.fame, dBrain = m.avgBrain - past.avgBrain;
    const genGrew = m.maxGen > past.maxGen + 3;
    if (dFame > 800) observerTrend('climb', `Fitness climbing fast (+${dFame} in ~${OBS_LOOKBACK} days) — strong selection right now.`, 4);
    if (genGrew) observerTrend('deepen', `Lineages are deepening — max generation ${past.maxGen}→${m.maxGen}. Continuous selection is running in a stable population — the healthy state, even if the fitness number saturates.`, 6);
    // real stagnation only if BOTH fitness and generation depth are stuck
    if (m.fame === past.fame && !genGrew && m.day > 30)
      observerIssue('plateau', `Fitness AND generation depth are both flat (~${OBS_LOOKBACK} days) — evolution may genuinely be stalling; check population stability and gene-pool diversity.`, 16);
    // only a *genuine* shrink below the cap, not bloat noise
    if (dBrain < -8 && m.avgBrain < MAX_CONNS*0.8)
      observerTrend('shrink', 'Brains are genuinely shrinking below capacity — selection favours simpler wiring right now.', 8);
    if (m.avgBrain >= MAX_CONNS*0.95)
      observerIssue('bloat', `Brains sit at the connection cap (${MAX_CONNS}) — likely bloated with unused structure. Raising the cap or pruning dead connections could give evolution more room.`, 25);
    if (m.cluster && past.cluster && m.cluster < past.cluster*0.7 && m.pop > 30)
      observerTrend('group', `Nodlings are grouping more tightly (mean spacing ${past.cluster.toFixed(1)}→${m.cluster.toFixed(1)}) — possible flocking / proto-tribe.`, 5);
    if (past.flora > 200 && m.flora < past.flora*0.4)
      observerIssue('firewipe', `Food (flora) fell ${Math.round(100-100*m.flora/past.flora)}% in ~${OBS_LOOKBACK} days — likely a wildfire or overgrazing. If wildfires recur, lower fire spread further; water/stone lines act as firebreaks.`, 8);
  }

  // ---- niches & diversity (the health of the evolutionary engine) ----
  if (m.carnFrac > 0.2 && m.carnFrac < 0.8)
    observerOnce('niche','milestone',`Diet niches have formed — roughly ${Math.round(m.carnFrac*100)}% carnivorous vs herbivorous. The population is splitting into a food web, which raises carrying capacity and diversity.`);
  if (m.pop > 20 && m.hueDiv <= 2)
    observerIssue('mono', `Gene pool is a near-monoculture (only ${m.hueDiv} lineage colours) — a sign the population keeps crashing and reseeding from the same few genomes. Low diversity is what stalls evolution; the fix is a stable population, not more mutation.`, 14);
  // the treadmill: lots of days elapsed but generations aren't accumulating
  if (m.day > 40 && m.maxGen < 15)
    observerIssue('treadmill', `After ${m.day|0} days, max generation is only ${m.maxGen} — lineages aren't persisting. The population is crashing to the reseed floor and resetting its gene pool each cycle. Stabilising the population near carrying capacity is the single biggest unlock for evolution here.`, 20);

  // ---- standing issues (cooldowns) ----
  if (m.pop < 12)
    observerIssue('extinct', `Population is critically low (${m.pop}). If this keeps recurring, winters or predators may be over-culling — milder winters, fewer/slower predators, or a fattening buffer help.`, 8);
  // only flag "no kills" if predators genuinely never learned (low predator fame)
  if (m.day > 12 && m.predKills === 0 && m.predCount > 0 && m.predFame < 5000)
    observerIssue('nohunt', 'Predators exist but still have zero kills and low predator fitness — hunting is not being learned; consider stronger approach-shaping.', 14);
  if (m.day > 25 && m.built < 3)
    observerIssue('nobuild', 'Almost no deliberate construction yet — the shelter/nest payoff may be too weak or too many steps away to be discovered. Consider a stronger cold pressure or a bigger nest bonus.', 20);
  if (m.flora < 60 && m.pop > 20)
    observerIssue('food', 'Food supply is low relative to population — grazing (Nodlings + critters) may be outpacing regrowth. Consider faster germination or fewer critters.', 12);

  saveObserver();
}

function observerTick(){
  if (world.tick - observer.lastRun < OBS_INTERVAL) return;
  observer.lastRun = world.tick;
  runObserver();
}

// ---- persistence & export ----
function saveObserver(){
  try { localStorage.setItem(OBS_KEY, JSON.stringify({log:observer.log, seen:observer.seen, cool:observer.cool})); } catch(e){}
}
function loadObserver(){
  try { const s = localStorage.getItem(OBS_KEY); if (!s) return;
    const d = JSON.parse(s);
    if (d.log) observer.log = d.log;
    if (d.seen) observer.seen = d.seen;
    if (d.cool) observer.cool = d.cool;
  } catch(e){}
}
function resetObserver(){
  observer.log = []; observer.hist = []; observer.seen = {}; observer.cool = {}; observer.lastRun = -1e9;
  saveObserver();
}

function observerMarkdown(){
  const m = observer.hist[observer.hist.length-1] || observerMetrics();
  const L = ['# Nodlings — Observations & Improvement Ideas', '',
    `Seed \`${world.seed}\` · day ${(world.tick/DAY_LEN).toFixed(1)} · ${world.season()}`, '',
    '## Current snapshot', '',
    `| metric | value |`, `|---|---|`,
    `| population | ${m.pop} (${m.juv} juvenile) |`,
    `| max generation | ${m.maxGen} |`,
    `| best fitness | ${m.fame} |`,
    `| avg brain (conns) | ${m.avgBrain.toFixed(0)} |`,
    `| lineage diversity | ${m.hueDiv} colour-groups |`,
    `| diet | ${Math.round((1-m.avgDiet)*100)}% herbivore / ${Math.round(m.carnFrac*100)}% carnivore |`,
    `| predators | ${m.predCount}, ${m.predKills} kills, best ${m.predFame} |`,
    `| structures (durable) | ${m.struct} (${m.built}) |`,
    `| planks / bricks / bridges | ${m.planks} / ${m.bricks} / ${m.bridges} |`,
    `| flora / cooked food | ${m.flora} / ${m.cooked} |`,
    `| active fires | ${m.fires} |`, '',
    '## Log (newest first)', ''];
  for (let i = observer.log.length-1; i >= 0; i--){
    const e = observer.log[i];
    L.push(`- **[day ${e.day}]** _(${e.kind})_ ${e.text}`);
  }
  return L.join('\n');
}
