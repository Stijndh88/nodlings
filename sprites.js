// Procedural pixel art. Creatures are drawn from a genome's heritable `body`
// genes, so siblings and descendants look related; a child crossing mother and
// father inherits a visible mix. Everything is cached on tiny offscreen
// canvases and blitted with smoothing off for a crisp 8-bit look.
'use strict';

const SPR = 16; // native sprite resolution (logical pixels)

function mkCanvas(w, h){
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}
function px(ctx, x, y, col){ ctx.fillStyle = col; ctx.fillRect(x, y, 1, 1); }
// vertical-mirror plot → bilateral symmetry, the shortcut every 8-bit sprite uses
function sym(ctx, x, y, col){ px(ctx, x, y, col); px(ctx, SPR-1-x, y, col); }

// --- creatures ---
const _creatureCache = new Map();

function creatureSig(g){
  return (g.hue|0) + ':' + g.body.map(v=>Math.round(v*7)).join('');
}

function buildCreature(g){
  const cv = mkCanvas(SPR, SPR);
  const ctx = cv.getContext('2d');
  const b = g.body;
  const h = g.hue;
  const body   = `hsl(${h},62%,55%)`;
  const shade  = `hsl(${h},62%,40%)`;
  const line   = `hsl(${h},55%,25%)`;
  const accent = `hsl(${(h + 40 + b[6]*200) % 360},70%,60%)`;

  const rad   = 3 + Math.round(b[0]*2.5);        // body radius (3..5)
  const squish= 0.7 + b[1]*0.6;                  // round vs tall
  const cxp = 8, cyp = 9;

  // body blob (mirrored)
  for (let y = -rad-1; y <= rad+1; y++) for (let x = 0; x <= rad+1; x++){
    const yy = y/squish;
    if (x*x + yy*yy <= rad*rad){
      const edge = x*x + yy*yy > (rad-1)*(rad-1);
      sym(ctx, cxp+x, cyp+y, edge ? shade : body);
    }
  }
  // outline pass (draw dark just outside the blob)
  for (let y = -rad-2; y <= rad+2; y++) for (let x = 0; x <= rad+2; x++){
    const yy = y/squish;
    const d = x*x + yy*yy;
    if (d > rad*rad && d <= (rad+1.4)*(rad+1.4)) sym(ctx, cxp+x, cyp+y, line);
  }

  // legs (0..3 nubs per side)
  const legs = Math.round(b[4]*3);
  for (let i = 0; i < legs; i++){
    const lx = cxp + 1 + i;
    sym(ctx, lx, cyp + Math.round(rad/squish) + 1, line);
  }
  // antennae
  if (b[7] > 0.55){
    sym(ctx, cxp+1, cyp-rad-1, line);
    sym(ctx, cxp+1, cyp-rad-2, accent);
  }
  // eyes (1..3): white pixel with a dark pupil, mirrored
  const eyes = 1 + Math.round(b[2]*2);
  const eyeY = cyp - Math.round(rad*0.3);
  for (let i = 0; i < eyes; i++){
    const ex = cxp + 1 + i;
    sym(ctx, ex, eyeY, '#f4f4f4');
    px(ctx, ex, eyeY, '#151515'); px(ctx, SPR-1-ex, eyeY, '#151515');
  }

  // pattern
  if (b[5] > 0.66){          // spots
    for (let i = 0; i < 3; i++)
      sym(ctx, cxp + (i%2? 2:1), cyp + i - 1, accent);
  } else if (b[5] > 0.33){   // belly patch
    for (let y = 1; y <= rad-1; y++) px(ctx, cxp, cyp+y, accent);
  }
  return cv;
}

function creatureSprite(g){
  const sig = creatureSig(g);
  let c = _creatureCache.get(sig);
  if (!c){
    if (_creatureCache.size > 3000) _creatureCache.clear();
    c = buildCreature(g);
    _creatureCache.set(sig, c);
  }
  return c;
}

// --- terrain & materials (small fixed set, built once) ---
function noise2(x, y){ // cheap deterministic per-cell hash → texture variation
  let n = (x*374761393 + y*668265263) >>> 0;
  n = (n ^ (n >>> 13)) * 1274126177 >>> 0;
  return (n >>> 0) / 4294967296;
}

const TILES = {};
function buildTiles(){
  const base = (cols) => {
    const cv = mkCanvas(SPR, SPR), ctx = cv.getContext('2d');
    for (let y = 0; y < SPR; y++) for (let x = 0; x < SPR; x++)
      px(ctx, x, y, cols[(noise2(x, y)*cols.length)|0]);
    return cv;
  };
  TILES.grass = base(['#3d5a2b','#42612e','#395326','#476a31']);
  TILES.sand  = base(['#c9b271','#d2bd7f','#c0a866']);
  TILES.water = base(['#25507e','#2a578a','#1f4670','#2f5f95']);

  const item = draw => { const cv = mkCanvas(SPR, SPR), ctx = cv.getContext('2d'); draw(ctx); return cv; };
  // tree (wood)
  TILES.wood = item(ctx => {
    ctx.fillStyle = '#6b451f'; ctx.fillRect(7, 9, 2, 6);
    ctx.fillStyle = '#2f6d2f'; ctx.beginPath();
    for (const [x,y,r] of [[8,6,5],[5,8,3.2],[11,8,3.2]]){ ctx.moveTo(x,y); ctx.arc(x,y,r,0,7); }
    ctx.fill();
    ctx.fillStyle = '#3c8a3c'; ctx.beginPath(); ctx.arc(8,6,3,0,7); ctx.fill();
  });
  // rock (stone)
  TILES.stone = item(ctx => {
    ctx.fillStyle = '#8f8f97'; ctx.beginPath();
    ctx.moveTo(3,14); ctx.lineTo(5,7); ctx.lineTo(9,5); ctx.lineTo(13,9); ctx.lineTo(13,14); ctx.fill();
    ctx.fillStyle = '#b7b7bf'; ctx.beginPath();
    ctx.moveTo(5,7); ctx.lineTo(9,5); ctx.lineTo(9,9); ctx.lineTo(6,10); ctx.fill();
  });
  // bush (flora)
  TILES.flora = item(ctx => {
    ctx.fillStyle = '#2f7d3a';
    for (const [x,y,r] of [[8,10,4],[5,11,2.6],[11,11,2.6]]){ ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.fill(); }
    ctx.fillStyle = '#63c766';
    for (const [x,y] of [[7,9],[9,10],[10,8]]){ ctx.fillRect(x,y,1,1); }
  });
  // plank (worked wood — stacked boards)
  TILES.plank = item(ctx => {
    ctx.fillStyle = '#c98f4e';
    for (let y = 5; y <= 12; y += 3){ ctx.fillRect(3, y, 10, 2); }
    ctx.fillStyle = '#a06e35';
    for (let y = 5; y <= 12; y += 3){ ctx.fillRect(3, y+1, 10, 1); }
    ctx.fillStyle = '#7a5323'; ctx.fillRect(7, 4, 1, 10); // nail seam
  });
  // crystal (data)
  TILES.data = item(ctx => {
    ctx.fillStyle = '#c94fd9'; ctx.beginPath();
    ctx.moveTo(8,3); ctx.lineTo(11,8); ctx.lineTo(8,14); ctx.lineTo(5,8); ctx.fill();
    ctx.fillStyle = '#eaa6f2'; ctx.beginPath();
    ctx.moveTo(8,3); ctx.lineTo(8,14); ctx.lineTo(5,8); ctx.fill();
  });
  // seed (scattered kernels)
  TILES.seed = item(ctx => {
    ctx.fillStyle = '#d8c36a';
    for (const [x,y] of [[7,10],[9,9],[8,12],[6,8],[10,11]]) ctx.fillRect(x,y,1,1);
    ctx.fillStyle = '#a8913f';
    for (const [x,y] of [[7,11],[9,10]]) ctx.fillRect(x,y,1,1);
  });
  // meat (a red chunk)
  TILES.meat = item(ctx => {
    ctx.fillStyle = '#b5423f'; ctx.beginPath(); ctx.arc(8,10,3.4,0,7); ctx.fill();
    ctx.fillStyle = '#e07a72'; ctx.fillRect(7,9,1,1); ctx.fillRect(9,10,1,1);
    ctx.fillStyle = '#f2efe6'; ctx.fillRect(6,11,1,1); // bone fleck
  });
  // cooked meat (browned)
  TILES.cooked = item(ctx => {
    ctx.fillStyle = '#8a4a2a'; ctx.beginPath(); ctx.arc(8,10,3.4,0,7); ctx.fill();
    ctx.fillStyle = '#d98a4f'; ctx.fillRect(7,9,2,1); ctx.fillRect(8,11,1,1);
  });
  // clay lump
  TILES.clay = item(ctx => {
    ctx.fillStyle = '#8a7360'; ctx.beginPath(); ctx.ellipse(8,11,4,3,0,0,7); ctx.fill();
    ctx.fillStyle = '#6f5c4c'; ctx.fillRect(6,11,1,1); ctx.fillRect(10,10,1,1);
  });
  // brick (fired clay, stacked)
  TILES.brick = item(ctx => {
    ctx.fillStyle = '#b06a48';
    for (let y = 6; y <= 12; y += 3) ctx.fillRect(3, y, 10, 2);
    ctx.fillStyle = '#8a4a30'; ctx.fillRect(8,6,1,8); ctx.fillRect(5,9,1,3);
  });
  // fiber (strands)
  TILES.fiber = item(ctx => {
    ctx.strokeStyle = '#9ab04a'; ctx.lineWidth = 1;
    for (const x of [5,8,11]){ ctx.beginPath(); ctx.moveTo(x,5); ctx.lineTo(x+ (x%2?1:-1),13); ctx.stroke(); }
  });
}

// --- critters (neutral wildlife): small, muted, not gene-colored ---
const _critterSprites = [];
function buildCritter(kind){
  const cv = mkCanvas(SPR, SPR), ctx = cv.getContext('2d');
  const fur   = kind ? '#8a8f98' : '#b79a6f';
  const shade = kind ? '#6b7079' : '#94794f';
  const line  = '#3a3a3a';
  const cxp = 8, cyp = 10, rad = 3;
  for (let y = -rad; y <= rad; y++) for (let x = 0; x <= rad; x++)
    if (x*x + (y/0.85)**2 <= rad*rad) sym(ctx, cxp+x, cyp+y, x*x+(y/0.85)**2>(rad-1)**2?shade:fur);
  // ears: tall for kind 0 (rabbit), small for kind 1 (mouse)
  if (kind === 0){ sym(ctx, cxp+1, cyp-rad-2, fur); sym(ctx, cxp+1, cyp-rad-1, fur); }
  else { sym(ctx, cxp+2, cyp-rad, fur); }
  sym(ctx, cxp+1, cyp-1, '#111'); // eye
  px(ctx, cxp-1, cyp+rad, line); px(ctx, cxp+1, cyp+rad, line); // feet
  return cv;
}
function critterSprite(kind){
  if (!_critterSprites[kind]) _critterSprites[kind] = buildCritter(kind);
  return _critterSprites[kind];
}

// --- predator: bigger, dark, spiky — reads as a threat ---
let _predatorSprite = null;
function buildPredator(){
  const cv = mkCanvas(SPR, SPR), ctx = cv.getContext('2d');
  const body = '#5a2330', shade = '#3d141d', spike = '#7d3040';
  const cxp = 8, cyp = 9, rad = 4.5;
  for (let y = -rad; y <= rad; y++) for (let x = 0; x <= rad+1; x++){
    const d = x*x + (y/0.8)**2;
    if (d <= rad*rad) sym(ctx, cxp+x, cyp+y, d > (rad-1)**2 ? shade : body);
  }
  // back spikes
  for (const dx of [0,2,4]) { sym(ctx, cxp+dx, cyp-rad-1, spike); sym(ctx, cxp+dx, cyp-rad, spike); }
  // legs
  for (const dx of [1,3]) { sym(ctx, cxp+dx, cyp+rad, shade); sym(ctx, cxp+dx, cyp+rad+1, shade); }
  // glowing eyes
  sym(ctx, cxp+2, cyp-1, '#ffcf3a');
  sym(ctx, cxp+2, cyp-1, '#ff6a2a');
  return cv;
}
function predatorSprite(){
  if (!_predatorSprite) _predatorSprite = buildPredator();
  return _predatorSprite;
}
