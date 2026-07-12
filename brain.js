// Brain = an evolving neural network (NEAT-style topology + weight evolution)
// with reward-modulated Hebbian plasticity, gated memory neurons (for
// longer-horizon state), and a per-life plasticity boost (fed by 'data').
//
// The same machinery serves two species via *schemas*: Nodlings (43+ senses,
// 9 actions, cosmetic genes) and Predators (few senses, 2 actions). Genomes of
// different schemas never cross over, so their shared innovation ids are just
// labels and can't corrupt each other.
'use strict';

const N_SENSES = 49;   // Nodling input neurons (map documented in Nodling.sense())
const N_BODY   = 8;    // Nodling morphology genes (visual, inherited)
const OUTPUTS  = ['moveX','moveY','grab','drop','interact','strike','sound','mem0','mem1'];

const NODLING_SCHEMA = { nIn:N_SENSES, outputs:OUTPUTS, cosmetic:true };
const PRED_SCHEMA    = { nIn:11, outputs:['moveX','moveY'], cosmetic:false };

const HIDDEN_BASE = 100; // hidden node ids start here (above every schema's fixed ids)
const MAX_CONNS = 300, MAX_HIDDEN = 60, W_CLAMP = 4, LEARN_RATE = 0.02;

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
  if (sc.cosmetic){ g.hue = rng()*360; g.body = randBody(rng); g.diet = rng(); } // 0 herbivore .. 1 carnivore
  return g;
}

function mutateGenome(g, rng, sc = NODLING_SCHEMA){
  const conns = g.conns.map(c => ({...c}));
  const mem = {...(g.mem || {})};
  for (const c of conns){
    if (rng() < 0.8) c.w = clampW(c.w + (rng()*2-1)*0.4);
    if (rng() < 0.3) c.pl = Math.max(-1, Math.min(1, c.pl + (rng()*2-1)*0.2));
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
    out.diet = Math.max(0, Math.min(1, (g.diet ?? 0.5) + (rng()*2-1)*0.08));
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
    out.diet = rng() < 0.5 ? (a.diet ?? 0.5) : (b.diet ?? 0.5);
  }
  return out;
}

function genomeSize(g){ return g.conns.length; }

// --- runtime brain ---
class Brain {
  constructor(genome, sc = NODLING_SCHEMA){
    this.sc = sc;
    this.boost = 1;                 // plasticity multiplier (data → temporary surge)
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
    this.incoming = this.comp.map(t => incoming.get(t) || []);
    // per-comp memory retain (0 = plain tanh neuron)
    this.retain = new Float64Array(this.comp.length);
    const localToId = order;                       // local idx -> global id
    for (let j = 0; j < this.comp.length; j++){
      const gid = localToId[this.comp[j]];
      this.retain[j] = mem[gid] || 0;
    }
    this.act = new Float64Array(this.n);
    this.tmp = new Float64Array(this.comp.length);
  }

  step(senses, reward){
    const a = this.act, comp = this.comp, inc = this.incoming, tmp = this.tmp, w = this.w;
    const nIn = this.sc.nIn;
    for (let i = 0; i < nIn; i++) a[this.inLocal[i]] = senses[i];
    a[this.biasLocal] = 1;

    for (let j = 0; j < comp.length; j++){
      const list = inc[j]; let s = 0;
      for (let k = 0; k < list.length; k++) s += w[list[k][1]] * a[list[k][0]];
      const r = this.retain[j];
      tmp[j] = r ? r*a[comp[j]] + (1-r)*Math.tanh(s) : Math.tanh(s); // gated memory
    }
    if (reward){
      const lr = LEARN_RATE * this.boost;
      for (let j = 0; j < comp.length; j++){
        const list = inc[j], post = tmp[j];
        for (let k = 0; k < list.length; k++){
          const wi = list[k][1], pl = this.pl[wi];
          if (pl) w[wi] = clampW(w[wi] + lr*pl*reward*a[list[k][0]]*post);
        }
      }
    }
    if (this.boost > 1) this.boost = Math.max(1, this.boost*0.99); // surge decays
    for (let j = 0; j < comp.length; j++) a[comp[j]] = tmp[j];

    const out = {glitch:false};
    for (let k = 0; k < this.outNames.length; k++){
      let v = a[this.outLocal[k]];
      if (!Number.isFinite(v)){ v = 0; out.glitch = true; }
      out[this.outNames[k]] = v;
    }
    return out;
  }
}
