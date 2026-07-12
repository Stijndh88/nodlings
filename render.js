// Rendering + camera + input. Draws only the visible viewport (the world is
// 256x192 = 49k cells), a throttled minimap, seasonal/night tint, and resolves
// mouse-hover into a tooltip. No simulation logic lives here.
'use strict';

const camera = { cx: GRID_W/2, cy: GRID_H/2, zoom: 9 }; // zoom = pixels per tile
const MIN_ZOOM = 3, MAX_ZOOM = 40;

let canvas, ctx, miniCanvas, miniCtx, tooltipEl;
let hover = { sx: 0, sy: 0, active: false, text: '' };
let selected = null, following = false; // click a Nodling to follow it
function clearSelection(){ selected = null; following = false; }

function initRender(getNodlings){
  buildTiles();
  canvas = document.getElementById('c');
  ctx = canvas.getContext('2d');
  miniCanvas = document.getElementById('mini');
  miniCtx = miniCanvas.getContext('2d');
  miniCanvas.width = 226; miniCanvas.height = 170;
  tooltipEl = document.getElementById('tip');
  const fit = () => {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    ctx.imageSmoothingEnabled = false; // reset by a buffer resize
  };
  fit();
  window.addEventListener('resize', fit);
  bindInput(getNodlings);
}

function viewport(){
  const tilesX = canvas.width / camera.zoom, tilesY = canvas.height / camera.zoom;
  return {
    x0: camera.cx - tilesX/2, y0: camera.cy - tilesY/2,
    x1: camera.cx + tilesX/2, y1: camera.cy + tilesY/2,
  };
}
function worldToScreen(wx, wy, vp){
  return [ (wx - vp.x0)*camera.zoom, (wy - vp.y0)*camera.zoom ];
}

function draw(nodlings){
  const vp = viewport();
  const z = camera.zoom;
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const ix0 = Math.max(0, Math.floor(vp.x0)), iy0 = Math.max(0, Math.floor(vp.y0));
  const ix1 = Math.min(GRID_W-1, Math.ceil(vp.x1)), iy1 = Math.min(GRID_H-1, Math.ceil(vp.y1));

  // terrain + materials
  for (let y = iy0; y <= iy1; y++) for (let x = ix0; x <= ix1; x++){
    const c = world.cells[y*GRID_W + x];
    const [sx, sy] = worldToScreen(x, y, vp);
    const base = c.water ? TILES.water : c.sand ? TILES.sand : TILES.grass;
    ctx.drawImage(base, sx, sy, z, z);
    if (c.stack.length){
      const top = c.stack[c.stack.length-1];
      ctx.drawImage(TILES[top], sx, sy, z, z);
      if (c.stack.length >= 2){
        // stacked structure: draw a shifted copy per extra layer + outline
        const layers = Math.min(3, c.stack.length);
        for (let l = 1; l < layers; l++)
          ctx.drawImage(TILES[c.stack[c.stack.length-1-l]], sx, sy - l*z*0.28, z, z);
        ctx.strokeStyle = 'rgba(255,255,120,0.55)';
        ctx.lineWidth = Math.max(1, z*0.06);
        ctx.strokeRect(sx+0.5, sy+0.5, z-1, z-1);
      }
    }
    if (c.fire){ // flame overlay
      ctx.fillStyle = `rgba(255,${120 + (Math.sin(world.tick*0.5 + x)*50|0)},40,0.8)`;
      ctx.beginPath(); ctx.arc(sx + z/2, sy + z*0.4, z*0.4, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(255,230,120,0.9)';
      ctx.beginPath(); ctx.arc(sx + z/2, sy + z*0.35, z*0.2, 0, Math.PI*2); ctx.fill();
    }
  }

  // sound rings ("glowing" halos — a Nodling emitting on its sound channel)
  for (const s of world.sounds){
    if (s.x < vp.x0-2 || s.x > vp.x1+2 || s.y < vp.y0-2 || s.y > vp.y1+2) continue;
    const [sx, sy] = worldToScreen(s.x, s.y, vp);
    ctx.strokeStyle = `hsla(${s.f*300},85%,70%,0.35)`;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(sx, sy, z*0.9, 0, Math.PI*2); ctx.stroke();
  }

  // critters (neutral wildlife)
  for (const cr of critters){
    if (cr.x < vp.x0-1 || cr.x > vp.x1+1 || cr.y < vp.y0-1 || cr.y > vp.y1+1) continue;
    const [sx, sy] = worldToScreen(cr.x, cr.y, vp);
    const size = z * 0.85;
    ctx.drawImage(critterSprite(cr.kind), sx - size/2, sy - size*0.55, size, size);
  }

  // predators (bigger, drawn over critters)
  for (const p of predators){
    if (p.x < vp.x0-1 || p.x > vp.x1+1 || p.y < vp.y0-1 || p.y > vp.y1+1) continue;
    const [sx, sy] = worldToScreen(p.x, p.y, vp);
    const size = z * 1.4;
    ctx.drawImage(predatorSprite(), sx - size/2, sy - size*0.6, size, size);
  }

  // Nodlings (with a faint idle bob so they read as alive)
  for (const n of nodlings){
    if (n.x < vp.x0-1 || n.x > vp.x1+1 || n.y < vp.y0-1 || n.y > vp.y1+1) continue;
    const bob = Math.sin(n.age*0.25 + n.x*3) * z*0.05;
    const [sx, sy] = worldToScreen(n.x, n.y, vp);
    const size = z * (n.age < 160 ? 0.7 : 1.1);   // juveniles are smaller
    if (n === selected){
      ctx.strokeStyle = '#ffe86a'; ctx.lineWidth = Math.max(1.5, z*0.08);
      ctx.beginPath(); ctx.arc(sx, sy - size*0.05, size*0.7, 0, Math.PI*2); ctx.stroke();
    }
    ctx.drawImage(creatureSprite(n.genome), sx - size/2, sy - size*0.6 + bob, size, size);
    if (n.carrying){ // little dot of what it holds
      ctx.fillStyle = MATERIALS[n.carrying].color;
      ctx.fillRect(sx + size*0.25, sy - size*0.55 + bob, Math.max(2, z*0.18), Math.max(2, z*0.18));
    }
  }

  // follow the selected Nodling (until the user pans, or it dies)
  if (selected && selected.dead) clearSelection();
  if (following && selected){
    camera.cx += (selected.x - camera.cx)*0.15;
    camera.cy += (selected.y - camera.cy)*0.15;
    clampCam();
  }

  // seasonal / night tint
  const amb = world.ambient();
  if (world.isNight()){
    ctx.fillStyle = 'rgba(10,14,40,0.34)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  if (amb < 4){ // frost tint in the cold
    ctx.fillStyle = `rgba(150,190,255,${Math.min(0.22, (4-amb)/60)})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (amb > 26){ // heat haze
    ctx.fillStyle = `rgba(255,180,90,${Math.min(0.14, (amb-26)/60)})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (hover.active){
    tooltipEl.style.display = 'block';
    tooltipEl.style.left = (hover.sx + 14) + 'px';
    tooltipEl.style.top  = (hover.sy + 14) + 'px';
    tooltipEl.innerHTML = hover.text;
  } else {
    tooltipEl.style.display = 'none';
  }
}

// Minimap: whole world downsampled. Rebuilt on a throttle (it scans 49k cells).
let miniTick = 0;
function drawMini(nodlings){
  const mw = miniCanvas.width, mh = miniCanvas.height;
  if (miniTick++ % 12 === 0){
    const img = miniCtx.createImageData(mw, mh);
    for (let py = 0; py < mh; py++) for (let px2 = 0; px2 < mw; px2++){
      const gx = (px2/mw*GRID_W)|0, gy = (py/mh*GRID_H)|0;
      const c = world.cells[gy*GRID_W + gx];
      let r, g, b;
      if (c.water){ r=40; g=80; b=126; }
      else if (c.stack.length){ const col = MATERIALS[c.stack[c.stack.length-1]].color;
        r = parseInt(col.slice(1,3),16); g = parseInt(col.slice(3,5),16); b = parseInt(col.slice(5,7),16); }
      else if (c.sand){ r=201; g=178; b=113; }
      else { r=61; g=90; b=43; }
      const i = (py*mw + px2)*4;
      img.data[i]=r; img.data[i+1]=g; img.data[i+2]=b; img.data[i+3]=255;
    }
    miniCtx.putImageData(img, 0, 0);
    miniCtx.__base = miniCtx.getImageData(0, 0, mw, mh);
  } else if (miniCtx.__base){
    miniCtx.putImageData(miniCtx.__base, 0, 0);
  }
  // Nodlings as bright dots, predators as red
  miniCtx.fillStyle = '#ffef8a';
  for (const n of nodlings) miniCtx.fillRect((n.x/GRID_W*mw)|0, (n.y/GRID_H*mh)|0, 1, 1);
  miniCtx.fillStyle = '#ff4d4d';
  for (const p of predators) miniCtx.fillRect((p.x/GRID_W*mw)|0, (p.y/GRID_H*mh)|0, 2, 2);
  // viewport rectangle
  const vp = viewport();
  miniCtx.strokeStyle = '#fff';
  miniCtx.lineWidth = 1;
  miniCtx.strokeRect(vp.x0/GRID_W*mw, vp.y0/GRID_H*mh,
                     (vp.x1-vp.x0)/GRID_W*mw, (vp.y1-vp.y0)/GRID_H*mh);
}

// --- input: pan (drag), zoom (wheel to cursor), minimap jump, hover tooltip ---
function bindInput(getNodlings){
  let dragging = false, lastX = 0, lastY = 0, moved = 0;

  canvas.addEventListener('mousedown', e => { dragging = true; moved = 0; lastX = e.offsetX; lastY = e.offsetY; });
  window.addEventListener('mouseup', () => { dragging = false; });
  canvas.addEventListener('mouseleave', () => { hover.active = false; });

  canvas.addEventListener('mousemove', e => {
    if (dragging){
      const dx = e.offsetX - lastX, dy = e.offsetY - lastY;
      moved += Math.abs(dx) + Math.abs(dy);
      if (moved > 4) following = false; // manual pan cancels follow
      camera.cx -= dx / camera.zoom;
      camera.cy -= dy / camera.zoom;
      clampCam();
      lastX = e.offsetX; lastY = e.offsetY;
    }
    updateHover(e.offsetX, e.offsetY, getNodlings());
  });

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const vp = viewport();
    const wx = vp.x0 + e.offsetX/camera.zoom, wy = vp.y0 + e.offsetY/camera.zoom;
    const factor = e.deltaY < 0 ? 1.15 : 1/1.15;
    camera.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, camera.zoom*factor));
    // keep the cursor's world point fixed while zooming
    const vp2 = viewport();
    camera.cx += wx - (vp2.x0 + e.offsetX/camera.zoom);
    camera.cy += wy - (vp2.y0 + e.offsetY/camera.zoom);
    clampCam();
  }, { passive:false });

  // click a Nodling to follow it; click empty ground to drop the selected material
  canvas.addEventListener('click', e => {
    if (moved > 4) return;
    const vp = viewport();
    const wx = vp.x0 + e.offsetX/camera.zoom, wy = vp.y0 + e.offsetY/camera.zoom;
    let hit = null, bd = 0.7*0.7;
    for (const n of getNodlings()){
      const d = (n.x-wx)**2 + (n.y-wy)**2;
      if (d < bd){ bd = d; hit = n; }
    }
    if (hit){
      if (hit === selected){ clearSelection(); }      // click again to release
      else { selected = hit; following = true; }
      return;
    }
    const c = world.at(wx|0, wy|0);
    if (c && !c.water) c.stack.push(document.getElementById('drop').value);
  });

  // minimap: click/drag to recenter camera
  const jump = e => {
    const r = miniCanvas.getBoundingClientRect();
    camera.cx = (e.clientX - r.left)/r.width*GRID_W;
    camera.cy = (e.clientY - r.top)/r.height*GRID_H;
    clampCam();
  };
  let miniDrag = false;
  miniCanvas.addEventListener('mousedown', e => { miniDrag = true; jump(e); });
  window.addEventListener('mouseup', () => { miniDrag = false; });
  miniCanvas.addEventListener('mousemove', e => { if (miniDrag) jump(e); });
}

function clampCam(){
  camera.cx = Math.max(0, Math.min(GRID_W, camera.cx));
  camera.cy = Math.max(0, Math.min(GRID_H, camera.cy));
}

function updateHover(mx, my, nodlings){
  const vp = viewport();
  const wx = vp.x0 + mx/camera.zoom, wy = vp.y0 + my/camera.zoom;

  // nearest Nodling under the cursor wins (creatures are the interesting bit)
  let best = null, bd = 0.7*0.7;
  for (const n of nodlings){
    const d = (n.x-wx)**2 + (n.y-wy)**2;
    if (d < bd){ bd = d; best = n; }
  }
  if (best){
    hover.active = true; hover.sx = mx; hover.sy = my;
    hover.text = `<b>Nodling</b> gen ${best.gen}<br>`
      + `energy ${best.energy|0} · hydration ${best.hydration|0}<br>`
      + `temp ${best.bodyTemp.toFixed(1)}° · age ${best.age}<br>`
      + `offspring ${best.offspring} · brain ${best.brainSize} nodes`
      + (best.carrying ? `<br>carrying ${best.carrying}` : '');
    return;
  }
  const c = world.at(wx|0, wy|0);
  if (!c){ hover.active = false; return; }
  let label;
  if (c.stack.length){
    const top = c.stack[c.stack.length-1];
    label = `<b>${top}</b>` + (c.stack.length >= 2 ? ` structure (${c.stack.length} high)` : '');
  } else if (c.water) label = '<b>water</b>';
  else if (c.sand) label = '<b>sand</b>';
  else label = '<b>grass</b>';
  hover.active = true; hover.sx = mx; hover.sy = my;
  hover.text = `${label}<br>${world.cellTemp(wx|0, wy|0).toFixed(1)}° here`;
}
