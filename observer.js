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
const OBS_KEY = 'nodlings.observations.w2';
const OBS_INTERVAL = DAY_LEN*2;    // analyse every second in-world day
const OBS_LOOKBACK = 6;            // compare against ~6 days ago

function observerMetrics(){
  let struct=0, walls=0, bridges=0, plants=0;
  const cells = world.cells;
  for (let i = 0; i < cells.length; i++){
    const c = cells[i], st = c.stack;
    if (!st.length) continue;
    if (MATERIALS[st[st.length-1]].spreads) plants++;
    if (c.water) bridges++;                         // any material on water = bridge tile
    if (st.length >= 2) struct++;
    if (st.length >= WALL_HEIGHT) walls++;
  }
  const pop = nodlings.length;
  const sum = f => nodlings.reduce((t,n)=>t+f(n), 0);
  const hueB = new Set();
  for (const n of nodlings) hueB.add((n.genome.hue/30)|0);
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
  const meals = sum(n=>n.meals), bad = sum(n=>n.badMeals);
  return {
    tick:world.tick, day:world.tick/DAY_LEN, season:world.season(), pop,
    maxGen: pop ? nodlings.reduce((m,n)=>Math.max(m,n.gen),0) : 0,
    avgBrain: pop ? sum(n=>n.brainSize)/pop : 0,
    avgAge: pop ? sum(n=>n.age)/pop : 0,
    juv: sum(n=>n.age<MATURITY?1:0),
    fame: hallOfFame[0] ? hallOfFame[0].score|0 : 0,
    births, deaths,
    predCount: predators.length,
    predKills: predators.reduce((t,p)=>t+p.kills,0),
    predFame: predFame[0] ? predFame[0].score|0 : 0,
    predBrain: predators.length ? predators.reduce((t,p)=>t+genomeSize(p.genome),0)/predators.length : 0,
    critters: critters.length, fires: world.fires.length,
    struct, walls, bridges, plants,
    carrying: pop ? sum(n=>n.carrying?1:0)/pop : 0,
    badMeals: meals ? bad/meals : 0.5,
    techniques: world.ledger.size,
    cluster: cn ? cl/cn : 0, hueDiv: hueB.size,
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

  // ---- milestones (one-shot): things that happened, never things we paid for ----
  if (m.bridges > 0) observerOnce('bridge','milestone','Something that floats was put on water: a bridge tile exists.');
  if (m.walls > 0) observerOnce('wall','milestone','A stack 3 high exists: a wall. Only deliberate placing can make one.');
  if (m.fires > 0) observerOnce('fire','milestone','Something is burning (lightning or a spark from a strike).');
  if (m.predKills > 0) observerOnce('predkill','milestone','Predators have started landing kills.');
  for (const key of world.ledger.keys()) observerOnce('tech:'+key,'milestone',`First time: ${key.split('|').join(' / ')} (verb / in hand / target / result).`);
  for (const g of [10,25,50,100,200,400,1000]) if (m.maxGen >= g) observerOnce('gen'+g,'milestone',`Reached generation ${g}.`);

  // ---- trends (vs ~6 days ago) ----
  if (past){
    if (m.maxGen > past.maxGen + 3) observerTrend('deepen', `Lineages are deepening: max generation ${past.maxGen} to ${m.maxGen}.`, 12);
    if (past.badMeals > 0.35 && m.badMeals < 0.2 && m.pop > 20)
      observerTrend('choosy', `Nodlings are avoiding the poisonous plant: bad meals ${Math.round(past.badMeals*100)}% to ${Math.round(m.badMeals*100)}%.`, 8);
    if (m.cluster && past.cluster && m.cluster < past.cluster*0.7 && m.pop > 30)
      observerTrend('group', `Nodlings are grouping more tightly (mean spacing ${past.cluster.toFixed(1)} to ${m.cluster.toFixed(1)}).`, 8);
    if (past.plants > 200 && m.plants < past.plants*0.4)
      observerIssue('food', `Plants fell ${Math.round(100-100*m.plants/past.plants)}% in ~${OBS_LOOKBACK} days (winter, fire or overgrazing).`, 8);
  }
  if (m.pop > 20 && m.hueDiv <= 2)
    observerIssue('mono', `Gene pool is a near-monoculture (only ${m.hueDiv} lineage colours).`, 16);
  if (m.pop < 20)
    observerIssue('extinct', `Population is critically low (${m.pop}); the gene bank is topping it up.`, 8);

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
    `| predators | ${m.predCount}, ${m.predKills} kills, best ${m.predFame} |`,
    `| stacks (2+) / walls (3+) / bridges | ${m.struct} / ${m.walls} / ${m.bridges} |`,
    `| plants / bad meals | ${m.plants} / ${Math.round(m.badMeals*100)}% |`,
    `| technique types seen | ${m.techniques} |`,
    `| active fires | ${m.fires} |`, '',
    '## Log (newest first)', ''];
  for (let i = observer.log.length-1; i >= 0; i--){
    const e = observer.log[i];
    L.push(`- **[day ${e.day}]** _(${e.kind})_ ${e.text}`);
  }
  return L.join('\n');
}
