// Brain = an evolving neural network (NEAT-style topology + weight evolution)
// with gated memory neurons and within-lifetime learning.
//
// Learning rule (World 2): every plastic connection keeps a fading trace of its
// recent activity (pre x post). A reward that is better or worse than expected
// strengthens or weakens the connections whose trace is still warm, so a reward
// that arrives a few ticks after the action still reaches the right synapses.
// The brain's own `learn` output scales the update: it decides when to rewire itself.
//
// The same machinery serves two species via *schemas*: Nodlings (senses.js,
// 12 outputs, body and drive genes) and Predators (few senses, 2 outputs).
// Genomes of different schemas never cross over.
'use strict';

const N_BODY   = 8;    // Nodling morphology genes (visual, inherited)
const N_DRIVES = 4;    // how much energy, water, comfort and pain count in what feels good (see Nodling.wellbeing)
const OUTPUTS  = ['moveX','moveY','grab','drop','use','strike','sound','mem0','mem1','mem2','mem3','learn'];

const NODLING_SCHEMA = { nIn:N_SENSES, outputs:OUTPUTS, cosmetic:true };
const PRED_SCHEMA    = { nIn:11, outputs:['moveX','moveY'], cosmetic:false };

const HIDDEN_BASE = 100; // hidden node ids start here (above every schema's fixed ids)
const MAX_CONNS = 300, MAX_HIDDEN = 80, W_CLAMP = 4, LEARN_RATE = 0.2, TRACE_DECAY = 0.9;

// World parameters. ENV holds the settings of the LIVE world (the current "era");
// make the world harder or easier by changing these, not by editing constants.
// The skill probes in metrics.js pin every key to EXAM values while they run, so
// the exam stays the same exam however the live world changes, and can switch
// faculties off (learning, memory senses) to measure what they are worth.
const ENV = {
  plasticity: 1,     // multiplier on within-lifetime learning (0 = off)
  thirst: 1,         // multiplier on hydration drain (1 = a drink lasts ~1650 ticks, about 4 days)
  flora: 1,          // multiplier on plant regrowth (lower = scarcer food)
  cold: 1,           // multiplier on the energy cost of being too cold or too hot
  flip: true,        // each year the nourishing and the poisonous plant kind swap
  predators: 2.5,    // predators the world sustains per 100 Nodlings
  senseMask: null,   // sense indices to blank (switched-off tests only)
  outMask: null,     // output names forced to 0 (switched-off tests only)
  noBirths: false,   // probes score a fixed cohort (births counted, children not added)
};
const ENV_LIVE = Object.assign({}, ENV);   // restored after every probe
const EXAM = Object.freeze({ plasticity:1, thirst:1, flora:1, cold:1, flip:true, predators:2.5, senseMask:null, outMask:null, noBirths:true });

const biasId   = sc => sc.nIn;
const outStart = sc => sc.nIn + 1;
const isHidden = id => id >= HIDDEN_BASE;

// --- global historical markings (NEAT crossover alignment) ---
let _innovCounter = 0;
const _innovMap = new Map();
const _splitMap = new Map();
let _nodeCounter = HIDDEN_BASE;

function innovOf(from, to){
  const k = from + '>' + to;
  let v = _innovMap.get(k);
  if (v === undefined){ v = _innovCounter++; _innovMap.set(k, v); }
  return v;
}
function splitNodeId(connInnov){
  let v = _splitMap.get(connInnov);
  if (v === undefined){ v = _nodeCounter++; _splitMap.set(connInnov, v); }
  return v;
}
function reindexFromGenomes(genomes){
  for (const g of genomes){
    for (const c of g.conns){
      _innovMap.set(c.from + '>' + c.to, c.innov);
      if (c.innov >= _innovCounter) _innovCounter = c.innov + 1;
      for (const id of [c.from, c.to]) if (id >= _nodeCounter) _nodeCounter = id + 1;
    }
    if (g.mem) for (const id of Object.keys(g.mem)) if (+id >= _nodeCounter) _nodeCounter = +id + 1;
  }
}

const clampW = w => w > W_CLAMP ? W_CLAMP : w < -W_CLAMP ? -W_CLAMP : w;
const randW  = rng => rng()*2 - 1;
const randPl = rng => rng() < 0.3 ? (rng()*2-1)*0.5 : 0;

function hasConn(conns, from, to){
  for (const c of conns) if (c.from === from && c.to === to) return true;
  return false;
}
function addConn(conns, from, to, w, pl){
  if (from === to || hasConn(conns, from, to)) return false;
  conns.push({from, to, w:clampW(w), pl, en:true, innov:innovOf(from, to)});
  return true;
}
function hiddenIds(conns){
  const s = new Set();
  for (const c of conns){ if (isHidden(c.from)) s.add(c.from); if (isHidden(c.to)) s.add(c.to); }
  return s;
}

// Prune bloat: drop disabled connections, then iteratively remove dead-end
// hidden neurons (no enabled input, or nothing they feed). Keeps the connection
// budget spent on structure that actually does something.
function prune(genome){
  let conns = genome.conns.filter(c => c.en);
  for (let pass = 0; pass < 8; pass++){
    const hasIn = new Set(), hasOut = new Set();
    for (const c of conns){ hasIn.add(c.to); hasOut.add(c.from); }
    const before = conns.length;
    conns = conns.filter(c =>
      (!isHidden(c.from) || hasIn.has(c.from)) &&    // a hidden source must receive signal
      (!isHidden(c.to)   || hasOut.has(c.to)));       // a hidden target must feed onward
    if (conns.length === before) break;
  }
  const present = new Set();
  for (const c of conns){ present.add(c.from); present.add(c.to); }
  const mem = {};
  for (const k in genome.mem) if (present.has(+k)) mem[k] = genome.mem[k];
  genome.conns = conns; genome.mem = mem;
  return genome;
}

// --- cosmetic genes ---
const randBody = rng => Array.from({length:N_BODY}, ()=>rng());
const mutateBody = (b, rng, rate=0.12) =>
  b.map(v => rng() < rate ? Math.max(0, Math.min(1, v + (rng()*2-1)*0.25)) : v);
const crossBody = (a, b, rng) => a.map((v,i)=> rng() < 0.5 ? v : b[i]);

function randomGenome(rng, sc = NODLING_SCHEMA){
  const conns = [];
  const nOut = sc.outputs.length, bId = biasId(sc), oStart = outStart(sc);
  for (let k = 0; k < nOut; k++){
    const out = oStart + k;
    addConn(conns, bId, out, randW(rng), randPl(rng));
    const picks = 3 + (rng()*3|0);
    for (let p = 0; p < picks; p++)
      addConn(conns, (rng()*sc.nIn)|0, out, randW(rng), randPl(rng));
  }
  const g = {conns, mem:{}};
  if (sc.cosmetic){ g.hue = rng()*360; g.body = randBody(rng); g.drive = [1, 1, 1, 1]; }
  return g;
}

function mutateGenome(g, rng, sc = NODLING_SCHEMA){
  const conns = g.conns.map(c => ({...c}));
  const mem = {...(g.mem || {})};
  for (const c of conns){
    if (rng() < 0.3) c.w = clampW(c.w + (rng()*2-1)*0.3);
    if (rng() < 0.2) c.pl = Math.max(-1, Math.min(1, c.pl + (rng()*2-1)*0.2));
  }
  const hid = hiddenIds(conns);
  const bId = biasId(sc), oStart = outStart(sc), nOut = sc.outputs.length;
  const sources = [...Array(sc.nIn).keys(), bId, ...hid];
  const targets = Array.from({length:nOut}, (_,k)=>oStart+k).concat([...hid]);

  if (rng() < 0.28 && conns.length < MAX_CONNS)
    addConn(conns, sources[(rng()*sources.length)|0], targets[(rng()*targets.length)|0],
            randW(rng), randPl(rng));
  if (rng() < 0.16 && hid.size < MAX_HIDDEN){
    const enabled = conns.filter(c => c.en);
    if (enabled.length){
      const c = enabled[(rng()*enabled.length)|0];
      c.en = false;
      const nid = splitNodeId(c.innov);
      addConn(conns, c.from, nid, 1, 0);
      addConn(conns, nid, c.to, c.w, 0);
    }
  }
  if (rng() < 0.1 && conns.length) conns[(rng()*conns.length)|0].en ^= true;
  // memory: convert/tune a hidden node into a gated (leaky) memory cell
  if (hid.size && rng() < 0.14){
    const ids = [...hid], id = ids[(rng()*ids.length)|0];
    const cur = mem[id] || 0;
    mem[id] = Math.max(0, Math.min(0.98, (cur || 0.85) + (rng()*2-1)*0.15));
  }
  const out = {conns, mem};
  if (sc.cosmetic){
    out.hue = (g.hue + rng()*20-10 + 360) % 360;
    out.body = mutateBody(g.body, rng);
    out.drive = (g.drive || [1,1,1,1]).map(v => rng() < 0.2 ? Math.max(0, Math.min(2, v + (rng()*2-1)*0.15)) : v);
  }
  return prune(out);
}

function crossoverGenome(a, b, rng, sc = NODLING_SCHEMA){
  const bmap = new Map();
  for (const c of b.conns) bmap.set(c.innov, c);
  const conns = a.conns.map(ca => {
    const cb = bmap.get(ca.innov);
    return cb && rng() < 0.5 ? {...cb} : {...ca};
  });
  const mem = {...(a.mem || {}), ...(b.mem || {})};
  const out = {conns, mem};
  if (sc.cosmetic){
    const dh = ((b.hue - a.hue + 540) % 360) - 180;
    out.hue = (a.hue + dh*rng() + 360) % 360;
    out.body = crossBody(a.body, b.body, rng);
    const da = a.drive || [1,1,1,1], db = b.drive || [1,1,1,1];
    out.drive = da.map((v, i) => rng() < 0.5 ? v : db[i]);
  }
  return out;
}

function genomeSize(g){ return g.conns.length; }

// --- runtime brain ---
class Brain {
  constructor(genome, sc = NODLING_SCHEMA){
    this.sc = sc;
    this.gate = 0.5;                // learning gate, set from the `learn` output of the previous step
    const conns = genome.conns, mem = genome.mem || {};
    const nIn = sc.nIn, bId = biasId(sc), oStart = outStart(sc), nOut = sc.outputs.length;

    const ids = new Set();
    for (let i = 0; i < nIn; i++) ids.add(i);
    ids.add(bId);
    for (let k = 0; k < nOut; k++) ids.add(oStart + k);
    for (const c of conns){ ids.add(c.from); ids.add(c.to); }
    const order = [...ids].sort((x,y)=>x-y);
    const local = new Map();
    order.forEach((id,i)=>local.set(id,i));

    this.n = order.length;
    this.inLocal = new Int32Array(nIn);
    for (let i = 0; i < nIn; i++) this.inLocal[i] = local.get(i);
    this.biasLocal = local.get(bId);
    this.outLocal = new Int32Array(nOut);
    for (let k = 0; k < nOut; k++) this.outLocal[k] = local.get(oStart + k);
    this.outNames = sc.outputs;

    this.w  = new Float64Array(conns.length);
    this.pl = new Float64Array(conns.length);
    for (let i = 0; i < conns.length; i++){ this.w[i] = conns[i].w; this.pl[i] = conns[i].pl || 0; }

    const incoming = new Map();
    for (let i = 0; i < conns.length; i++){
      const c = conns[i];
      if (!c.en) continue;
      const t = local.get(c.to);
      (incoming.get(t) || incoming.set(t, []).get(t)).push([local.get(c.from), i]);
    }
    const compSet = new Set(this.outLocal);
    for (const id of order) if (isHidden(id)) compSet.add(local.get(id));
    this.comp = [...compSet];
    // incoming connections, flattened: for computed neuron j, entries inStart[j]..inStart[j+1]
    this.inStart = new Int32Array(this.comp.length + 1);
    const srcs = [], idxs = [];
    this.comp.forEach((t, j) => {
      for (const [from, i] of (incoming.get(t) || [])){ srcs.push(from); idxs.push(i); }
      this.inStart[j+1] = srcs.length;
    });
    this.inFrom = Int32Array.from(srcs); this.inConn = Int32Array.from(idxs);
    // per-comp memory retain (0 = plain tanh neuron)
    this.retain = new Float64Array(this.comp.length);
    const localToId = order;                       // local idx -> global id
    for (let j = 0; j < this.comp.length; j++){
      const gid = localToId[this.comp[j]];
      this.retain[j] = mem[gid] || 0;
    }
    this.trace = new Float64Array(conns.length);   // eligibility trace per connection
    this.learnIdx = sc.outputs.indexOf('learn');
    this.act = new Float64Array(this.n);
    this.tmp = new Float64Array(this.comp.length);
  }

  step(senses, reward){
    const a = this.act, comp = this.comp, tmp = this.tmp, w = this.w;
    const st = this.inStart, src = this.inFrom, ci = this.inConn;
    const nIn = this.sc.nIn;
    for (let i = 0; i < nIn; i++) a[this.inLocal[i]] = senses[i];
    a[this.biasLocal] = 1;

    for (let j = 0; j < comp.length; j++){
      let s = 0;
      for (let k = st[j], e = st[j+1]; k < e; k++) s += w[ci[k]] * a[src[k]];
      const r = this.retain[j];
      tmp[j] = r ? r*a[comp[j]] + (1-r)*Math.tanh(s) : Math.tanh(s); // gated memory
    }
    // learning: update each plastic connection's trace, then apply the reward to the traces
    const lr = LEARN_RATE * this.gate * ENV.plasticity * reward, tr = this.trace, plv = this.pl;
    for (let j = 0; j < comp.length; j++){
      const post = tmp[j];
      for (let k = st[j], e = st[j+1]; k < e; k++){
        const wi = ci[k], pl = plv[wi];
        if (!pl) continue;
        const el = tr[wi] = tr[wi]*TRACE_DECAY + a[src[k]]*post;
        if (lr) w[wi] = clampW(w[wi] + lr*pl*el);
      }
    }
    for (let j = 0; j < comp.length; j++) a[comp[j]] = tmp[j];
    if (this.learnIdx >= 0){ const g = a[this.outLocal[this.learnIdx]]; this.gate = Number.isFinite(g) ? (g + 1)/2 : 0.5; }
    else this.gate = 1;

    const out = {glitch:false};
    for (let k = 0; k < this.outNames.length; k++){
      let v = a[this.outLocal[k]];
      if (!Number.isFinite(v)){ v = 0; out.glitch = true; }
      out[this.outNames[k]] = v;
    }
    return out;
  }
}
