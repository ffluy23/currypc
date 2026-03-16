// ══════════════════════════════════════════════════════
//  INGREDIENT DATA
//  score: 양수 = 좋은 재료  /  음수 = 안 어울림
//  weirdMsg: 결과 화면 코멘트 (null = 정상 재료)
//
// ══════════════════════════════════════════════════════
const INGREDIENTS = [
  // 정상 재료
  { id: 'potato',    emoji: '🥔', name: '감자',        score:  15, weirdMsg: null },
  { id: 'carrot',    emoji: '🥕', name: '당근',        score:  15, weirdMsg: null },
  { id: 'onion',     emoji: '🧅', name: '양파',        score:  15, weirdMsg: null },
  { id: 'chicken',   emoji: '🍗', name: '닭고기',      score:  15, weirdMsg: null },
  { id: 'beef',      emoji: '🥩', name: '소고기',      score:  15, weirdMsg: null },
  { id: 'shrimp',    emoji: '🍤', name: '새우',        score:  12, weirdMsg: null },
  { id: 'garlic',    emoji: '🧄', name: '마늘',        score:  10, weirdMsg: null },
  { id: 'pepper',    emoji: '🫑', name: '피망',        score:  10, weirdMsg: null },
  { id: 'tomato',    emoji: '🍅', name: '토마토',      score:  12, weirdMsg: null },
  // 애매한 재료
  { id: 'mushroom',  emoji: '🍄', name: '버섯',        score:   5, weirdMsg: '버섯 카레... 나쁘진 않은데?' },
  { id: 'egg',       emoji: '🥚', name: '계란',        score:   5, weirdMsg: '계란 카레... 독특하네.' },
  { id: 'corn',      emoji: '🌽', name: '옥수수',      score:   3, weirdMsg: '달콤한 카레가 될 것 같다구.' },
  // 이상한 재료
  { id: 'banana',    emoji: '🍌', name: '바나나',      score: -15, weirdMsg: '바나나 카레... 진심이야?' },
  { id: 'chocolate', emoji: '🍫', name: '초콜릿',      score: -15, weirdMsg: '초콜릿 카레... 디저트야?' },
  { id: 'icecream',  emoji: '🍦', name: '아이스크림',  score: -20, weirdMsg: '아이스크림 카레... 세상에.' },
  { id: 'sushi',     emoji: '🍣', name: '스시',        score: -10, weirdMsg: '스시를 넣다니...?' },
  { id: 'cake',      emoji: '🎂', name: '케이크',      score: -18, weirdMsg: '생일 파티라도 열어야겠네~' },
  { id: 'candy',     emoji: '🍬', name: '사탕',        score: -12, weirdMsg: '사탕 카레라니, 대단한데?' },
  { id: 'hotdog',    emoji: '🌭', name: '핫도그',      score:  -8, weirdMsg: '핫도그 카레... 멋있다구.' },
  { id: 'popcorn',   emoji: '🍿', name: '팝콘',        score: -10, weirdMsg: '영화관에서 먹어도 될까나?' },
  { id: 'pizza',     emoji: '🍕', name: '피자',        score: -12, weirdMsg: '피자 카레... 이건 나도 좀...' },
  { id: 'cookie',    emoji: '🍪', name: '쿠키',        score:  -8, weirdMsg: '눅눅한 쿠키...?' },
];

// ══════════════════════════════════════════════════════
//  CANVAS / RESIZE
// ══════════════════════════════════════════════════════
const canvas  = document.getElementById('gameCanvas');
const ctx     = canvas.getContext('2d');
const wrapper = document.getElementById('gameWrapper');
let CW, CH, POT_CX, POT_CY, POT_RX, POT_RY, SCALE;

function resize() {
  CW = wrapper.clientWidth;
  CH = wrapper.clientHeight;
  canvas.width  = CW;
  canvas.height = CH;
  SCALE   = Math.min(CW / 700, CH / 600);
  POT_CX  = CW / 2;
  POT_CY  = CH * 0.52;
  POT_RX  = 190 * SCALE;
  POT_RY  = 148 * SCALE;
}
resize();
window.addEventListener('resize', resize);

// ══════════════════════════════════════════════════════
//  UI REFS
// ══════════════════════════════════════════════════════
const timerValEl     = document.getElementById('timerVal');
const phaseNameEl    = document.getElementById('phaseName');
const stirHintDir    = document.getElementById('stirHintDir');
const stirSpeedBar   = document.getElementById('stirSpeedBar');
const stirSpeedFill  = document.getElementById('stirSpeedFill');
const rhythmWrap     = document.getElementById('rhythmWrap');
const rhythmZoneEl   = document.getElementById('rhythmZone');
const rhythmCursorEl = document.getElementById('rhythmCursor');
const tapBtn         = document.getElementById('tapBtn');
const scoreScreen    = document.getElementById('scoreScreen');
const splashScreen   = document.getElementById('splashScreen');
const ingScreen      = document.getElementById('ingredientScreen');
const feedbackEl     = document.getElementById('feedback');

// ══════════════════════════════════════════════════════
//  GAME STATE
// ══════════════════════════════════════════════════════
let phase = 'splash'; // splash | ingredient | stir | fire | result

let selectedIngredients = []; // array of ingredient ids (max 3)
let ingScore  = 0;
let stirScore = 0;
let fireScore = 0;

// ── Stir ──
const STIR_TIME = 28;
let stirTimeLeft  = STIR_TIME;
let stirGoodTime  = 0;
let stirBadTime   = 0;
let burnLevel     = 0;   // 0–1: increases when too slow
let overflowLevel = 0;   // 0–1: increases when too fast
let mouseX = CW / 2, mouseY = CH / 2;
let prevStirAngle   = null;
let angularVelocity = 0;
let bubbles = [], ripples = [], currySplats = [], splashParticles = [];

let requiredDir    = 1;   // 1 = 시계방향, -1 = 반시계방향
let dirChangeTimer = 0;
let dirChangePeriod = 6;
let wrongDirTime   = 0;

// ── Fire ──
const FIRE_BEATS = 10;
let cursor = 0, cursorDir = 1;
let zoneStart = 0.38, zoneWidth = 0.18;
let beatResult   = [];
let beatIndex    = 0;
let firePhaseTime = 0;
let firePhaseBeats = [];
let hitCooldown  = 0;
let fireReady    = false;

let lastTime = 0;
let flameIntensity = 0.5;

// ══════════════════════════════════════════════════════
//  DRAWING HELPERS
// ══════════════════════════════════════════════════════
function drawBackground(c, w, h) {
  const g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#1A0A00');
  g.addColorStop(1, '#0D0600');
  c.fillStyle = g;
  c.fillRect(0, 0, w, h);

  const cg = c.createLinearGradient(0, h * 0.78, 0, h);
  cg.addColorStop(0, '#2A1800');
  cg.addColorStop(1, '#1A0E00');
  c.fillStyle = cg;
  c.fillRect(0, h * 0.78, w, h * 0.22);

  c.fillStyle = '#3D2200';
  c.fillRect(0, h * 0.78 - 3, w, 5);

  c.strokeStyle = 'rgba(60,30,0,0.3)';
  c.lineWidth = 1;
  for (let r = 0; r < 4; r++)
    for (let cc = 0; cc < 12; cc++)
      c.strokeRect(cc * (w / 10), r * (h * 0.16) + 8, w / 10, h * 0.16);
}

function drawFlame(c, cx, cy, ry, sc, intensity) {
  if (intensity <= 0) return;
  const baseY = cy + ry + 20 * sc;
  const cnt   = 3 + Math.floor(intensity * 4);
  for (let i = 0; i < cnt; i++) {
    const ox = (i - cnt / 2) * 25 * sc;
    const h  = (24 + intensity * 42 + Math.sin(Date.now() / 120 + i) * 7) * sc;
    const g  = c.createRadialGradient(cx + ox, baseY, 0, cx + ox, baseY - h / 2, h);
    g.addColorStop(0,   'rgba(255,240,80,0.9)');
    g.addColorStop(0.4, 'rgba(255,120,0,0.7)');
    g.addColorStop(1,   'rgba(255,30,0,0)');
    c.beginPath();
    c.ellipse(cx + ox, baseY, 12 * sc, h, 0, 0, Math.PI * 2);
    c.fillStyle = g;
    c.fill();
  }
}

function drawPotBase(c, cx, cy, rx, ry, sc, burn, selectedIds) {
  // Shadow + outer body
  c.save();
  c.shadowColor = 'rgba(0,0,0,0.55)';
  c.shadowBlur  = 28 * sc;
  c.shadowOffsetY = 18 * sc;
  const pg = c.createLinearGradient(cx - rx, 0, cx + rx, 0);
  pg.addColorStop(0,   '#222');
  pg.addColorStop(0.3, '#555');
  pg.addColorStop(0.6, '#888');
  pg.addColorStop(1,   '#222');
  c.fillStyle = pg;
  c.beginPath();
  c.ellipse(cx, cy, rx + 9 * sc, ry + 18 * sc, 0, 0, Math.PI * 2);
  c.fill();
  c.restore();

  // Clip to inside
  c.save();
  c.beginPath();
  c.ellipse(cx, cy - 8 * sc, rx - 12 * sc, ry - 16 * sc, 0, 0, Math.PI * 2);
  c.clip();

  const r2 = Math.round(180 - burn * 80);
  const g2 = Math.round(100 - burn * 80);
  c.fillStyle = `rgb(${r2},${g2},10)`;
  c.fillRect(cx - rx, cy - ry - 18 * sc, rx * 2, ry * 2 + 18 * sc);

  // Swirl
  c.globalAlpha = 0.18;
  for (let i = 0; i < 4; i++) {
    const swX = cx + Math.cos(Date.now() / 1500 + i * 1.5) * 54 * sc;
    const swY = cy - 8 * sc + Math.sin(Date.now() / 1500 + i * 1.5) * 28 * sc;
    const sg  = c.createRadialGradient(swX, swY, 0, swX, swY, 62 * sc);
    sg.addColorStop(0, '#F5A800');
    sg.addColorStop(1, 'rgba(245,168,0,0)');
    c.fillStyle = sg;
    c.beginPath();
    c.arc(swX, swY, 62 * sc, 0, Math.PI * 2);
    c.fill();
  }
  c.globalAlpha = 1;

  // Ingredients floating inside
  if (selectedIds && selectedIds.length > 0) {
    const ings = selectedIds.map(id => INGREDIENTS.find(x => x.id === id)).filter(Boolean);
    ings.forEach((ing, i) => {
      const angle = (i / ings.length) * Math.PI * 2 + Date.now() / 2000;
      const er    = rx * 0.44;
      const ex    = cx + Math.cos(angle) * er;
      const ey    = cy - 8 * sc + Math.sin(angle) * er * 0.55;
      c.save();
      c.font = `${Math.round(21 * sc)}px serif`;
      c.textAlign    = 'center';
      c.textBaseline = 'middle';
      c.globalAlpha  = 0.78;
      c.fillText(ing.emoji, ex, ey);
      c.globalAlpha = 1;
      c.restore();
    });
  }

  // Splats, bubbles, ripples
  for (const s of currySplats) {
    c.globalAlpha = s.a;
    c.fillStyle   = '#C87000';
    c.beginPath();
    c.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    c.fill();
    c.globalAlpha = 1;
  }
  for (const b of bubbles) {
    c.globalAlpha  = b.a;
    c.beginPath();
    c.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    c.strokeStyle = `rgba(255,200,80,${b.a})`;
    c.lineWidth   = 1.5;
    c.stroke();
    c.globalAlpha = 1;
  }
  for (const rp of ripples) {
    c.globalAlpha = rp.a;
    c.beginPath();
    c.ellipse(rp.x, rp.y, rp.rx, rp.ry, 0, 0, Math.PI * 2);
    c.strokeStyle = `rgba(255,200,80,${rp.a * 0.8})`;
    c.lineWidth   = 1.5;
    c.stroke();
    c.globalAlpha = 1;
  }

  // Burn overlay
  if (burn > 0) {
    c.fillStyle = `rgba(10,0,0,${burn * 0.62})`;
    c.fillRect(cx - rx, cy - ry - 18 * sc, rx * 2, ry * 2 + 18 * sc);
    if (burn > 0.3) {
      for (let i = 0; i < 3; i++) {
        const sx = cx + (i - 1) * 44 * sc;
        const sy = cy - ry - 14 * sc;
        const sG = c.createRadialGradient(sx, sy - 16 * sc, 0, sx, sy - 16 * sc, 34 * sc);
        sG.addColorStop(0, `rgba(80,80,80,${burn * 0.5})`);
        sG.addColorStop(1, 'rgba(80,80,80,0)');
        c.fillStyle = sG;
        c.beginPath();
        c.arc(sx, sy - 16 * sc + Math.sin(Date.now() / 600 + i) * 6 * sc, 34 * sc, 0, Math.PI * 2);
        c.fill();
      }
    }
  }

  c.restore();

  // Rim
  const rim = c.createLinearGradient(0, cy - ry - 8 * sc, 0, cy - ry + 10 * sc);
  rim.addColorStop(0,   '#AAA');
  rim.addColorStop(0.5, '#EEE');
  rim.addColorStop(1,   '#555');
  c.beginPath();
  c.ellipse(cx, cy - ry + 2 * sc, rx + 3 * sc, 20 * sc, 0, 0, Math.PI * 2);
  c.fillStyle = rim;
  c.fill();

  // Handles
  for (const side of [-1, 1]) {
    c.beginPath();
    c.ellipse(cx + side * (rx + 9 * sc), cy, 20 * sc, 14 * sc, 0, 0, Math.PI * 2);
    const hg = c.createLinearGradient(0, cy - 14 * sc, 0, cy + 14 * sc);
    hg.addColorStop(0, '#888');
    hg.addColorStop(1, '#333');
    c.fillStyle = hg;
    c.fill();
  }
}

function drawSplashParticles(c) {
  for (const p of splashParticles) {
    c.globalAlpha = p.a;
    c.fillStyle   = `hsl(${p.hue},80%,50%)`;
    c.beginPath();
    c.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    c.fill();
    c.globalAlpha = 1;
  }
}

function drawSpoon(c, cx, cy, sc) {
  if (phase !== 'stir') return;
  const dx   = mouseX - cx;
  const dy   = mouseY - (cy - 8 * sc);
  const angle = Math.atan2(dy, dx);
  const dist  = Math.min(Math.hypot(dx, dy), POT_RX - 26 * sc);
  const sx    = cx + Math.cos(angle) * dist;
  const sy    = (cy - 8 * sc) + Math.sin(angle) * dist;

  c.save();
  c.translate(sx, sy - 36 * sc);
  c.rotate(angle + Math.PI / 2);

  const sg = c.createLinearGradient(-3 * sc, 0, 3 * sc, 0);
  sg.addColorStop(0, '#DDD'); sg.addColorStop(0.5, '#FFF'); sg.addColorStop(1, '#999');
  c.fillStyle = sg;
  c.beginPath();
  c.roundRect(-3 * sc, 0, 6 * sc, 55 * sc, 3 * sc);
  c.fill();
  c.beginPath();
  c.ellipse(0, 61 * sc, 8 * sc, 13 * sc, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = 'rgba(200,120,0,0.7)';
  c.beginPath();
  c.ellipse(0, 61 * sc, 5 * sc, 9 * sc, 0, 0, Math.PI * 2);
  c.fill();
  c.restore();
}

function drawStirHUD(c, cx, cy, ry, sc) {
  if (phase !== 'stir') return;
  const speed    = Math.abs(angularVelocity);
  const goodMin  = 1.2, goodMax = 5.5;
  const actualDir = angularVelocity > 0 ? 1 : -1;
  const dirOk    = speed > goodMin && actualDir === requiredDir;

  // Speed / state hint text
  let hint = '천천히 저어줘 🥄', hintColor = 'rgba(255,200,80,0.9)';
  if      (speed > goodMax) { hint = '너무 세! 넘친다! 💦'; hintColor = '#FF6644'; }
  else if (dirOk)           { hint = '딱 좋아! 👌';          hintColor = '#88FF88'; }

  c.font      = `bold ${Math.round(15 * sc)}px IsYun,sans-serif`;
  c.fillStyle = hintColor;
  c.textAlign = 'center';
  c.fillText(hint, cx, cy + ry + 48 * sc);

  // ── Burn bar (left) ──
  const bx = 12, by = CH * 0.14, bw = 18 * sc, bh = CH * 0.3;
  c.fillStyle = 'rgba(0,0,0,0.5)';
  c.beginPath(); c.roundRect(bx, by, bw, bh, 5); c.fill();
  if (burnLevel > 0) {
    const burnH = burnLevel * bh;
    const bg2 = c.createLinearGradient(0, by + bh, 0, by);
    bg2.addColorStop(0, '#FF2200'); bg2.addColorStop(0.5, '#FF8800'); bg2.addColorStop(1, '#FFD700');
    c.fillStyle = bg2;
    c.beginPath(); c.roundRect(bx, by + bh - burnH, bw, burnH, 5); c.fill();
  }
  c.font      = `${Math.round(11 * sc)}px IsYun,sans-serif`;
  c.fillStyle = '#FFB060';
  c.textAlign = 'center';
  c.fillText('🔥', bx + bw / 2, by - 4);
  c.fillText('탐',  bx + bw / 2, by + bh + 13);

}

// ══════════════════════════════════════════════════════
//  PARTICLES
// ══════════════════════════════════════════════════════
function spawnSplash() {
  const angle = Math.random() * Math.PI * 2;
  const sp    = 130 + Math.random() * 210;
  splashParticles.push({
    x: POT_CX + Math.cos(angle) * (POT_RX - 26 * SCALE),
    y: (POT_CY - 8 * SCALE) + Math.sin(angle) * (POT_RY - 20 * SCALE) * 0.6,
    vx: Math.cos(angle) * sp, vy: Math.sin(angle) * sp - 65,
    r: (3 + Math.random() * 5) * SCALE, hue: 25 + Math.random() * 20, a: 1,
  });
  currySplats.push({
    x: POT_CX + (Math.random() - 0.5) * POT_RX * 1.4,
    y: (POT_CY - 8 * SCALE) + (Math.random() - 0.5) * POT_RY,
    r: (4 + Math.random() * 7) * SCALE, a: 0.7,
  });
}
function spawnBubble() {
  bubbles.push({
    x: POT_CX + (Math.random() - 0.5) * (POT_RX - 26 * SCALE) * 1.5,
    y: POT_CY  + (Math.random() - 0.5) * (POT_RY - 18 * SCALE) * 0.6,
    r: (2 + Math.random() * 5) * SCALE,
    speed: (18 + Math.random() * 35) * SCALE,
    a: 0.7 + Math.random() * 0.3,
  });
}
function spawnRipple() {
  ripples.push({
    x: POT_CX + (Math.random() - 0.5) * 72 * SCALE,
    y: POT_CY - 8 * SCALE + (Math.random() - 0.5) * 34 * SCALE,
    rx: 4 * SCALE, ry: 3 * SCALE, a: 0.8,
  });
}

// ══════════════════════════════════════════════════════
//  INGREDIENT SCREEN
// ══════════════════════════════════════════════════════
const ingCanvas = document.getElementById('ingCanvas');
const ingCtx    = ingCanvas.getContext('2d');

// Falling animations: { ing, x, y, vy, done }
let ingFlyers = [];

// Build ingredient shelf buttons
function buildIngredientShelf() {
  const shelf = document.getElementById('ingShelfInner');
  shelf.innerHTML = '';
  INGREDIENTS.forEach(ing => {
    const btn = document.createElement('div');
    btn.className = 'ing-btn';
    btn.id = 'ing-' + ing.id;
    btn.innerHTML = `<span class="ing-emoji">${ing.emoji}</span><span class="ing-name">${ing.name}</span>`;
    btn.addEventListener('click',      () => tapIngredient(ing.id, btn));
    btn.addEventListener('touchend',   e  => { e.preventDefault(); tapIngredient(ing.id, btn); }, { passive: false });
    shelf.appendChild(btn);
  });
}

function tapIngredient(id, btn) {
  // Already selected?
  if (selectedIngredients.includes(id)) return;
  if (selectedIngredients.length >= 3)  return;

  // Get button rect → launch flyer toward pot
  const rect  = btn.getBoundingClientRect();
  const wRect = wrapper.getBoundingClientRect();
  const startX = rect.left - wRect.left + rect.width / 2;
  const startY = rect.top  - wRect.top  + rect.height / 2;

  // Destination: pot center on ingCanvas
  const icW   = ingCanvas.width;
  const icH   = ingCanvas.height;
  const destX = icW / 2;
  const destY = icH * 0.45;

  ingFlyers.push({ id, startX, startY, x: startX, y: startY, destX, destY, t: 0, done: false });
  btn.classList.add('in-flight');
  updateIngUI();
}

function updateIngUI() {
  INGREDIENTS.forEach(ing => {
    const btn = document.getElementById('ing-' + ing.id);
    if (!btn) return;
    const used   = selectedIngredients.includes(ing.id);
    const flight = ingFlyers.some(f => f.id === ing.id && !f.done);
    btn.classList.toggle('used',      used);
    btn.classList.toggle('in-flight', flight && !used);
    btn.classList.toggle('disabled',  !used && !flight && selectedIngredients.length >= 3);
  });

  for (let i = 0; i < 3; i++) {
    const slot  = document.getElementById('slot' + i);
    const ingId = selectedIngredients[i];
    const ing   = ingId ? INGREDIENTS.find(x => x.id === ingId) : null;
    if (ing) {
      slot.className = 'slot filled';
      slot.innerHTML = `<span>${ing.emoji}</span><span class="slot-name">${ing.name}</span>
        <span class="slot-remove" data-id="${ing.id}">✕</span>`;
      slot.querySelector('.slot-remove').addEventListener('click', e => {
        e.stopPropagation();
        removeIngredient(ingId);
      });
    } else {
      slot.className = 'slot';
      slot.innerHTML = `<span style="color:rgba(255,248,238,0.2);font-size:20px">?</span>`;
    }
  }

  document.getElementById('ingCount').textContent = `(${selectedIngredients.length}/3)`;
  const confirmBtn = document.getElementById('confirmIngBtn');
  confirmBtn.disabled = selectedIngredients.length === 0;
  confirmBtn.textContent = selectedIngredients.length === 0
    ? '재료를 선택해~'
    : `요리 시작! (${selectedIngredients.length}개) →`;
}

function removeIngredient(id) {
  const idx = selectedIngredients.indexOf(id);
  if (idx >= 0) selectedIngredients.splice(idx, 1);
  updateIngUI();
}

// Ingredient canvas render loop
function ingLoop(ts) {
  if (phase !== 'ingredient') return;

  const icW = ingCanvas.width;
  const icH = ingCanvas.height;
  const sc  = Math.min(icW / 700, icH / 400);
  const cx  = icW / 2;
  const cy  = icH * 0.5;
  const rx  = 180 * sc;
  const ry  = 140 * sc;

  ingCtx.clearRect(0, 0, icW, icH);
  drawBackground(ingCtx, icW, icH);
  drawFlame(ingCtx, cx, cy, ry, sc, 0.6);
  drawPotBase(ingCtx, cx, cy, rx, ry, sc, 0, selectedIngredients);

  // Flyers
  const dt = 1 / 60;
  for (const f of ingFlyers) {
    if (f.done) continue;
    f.t = Math.min(f.t + dt * 2.2, 1);

    // Bezier arc toward pot center on the ingCanvas
    // Convert world coords → ingCanvas coords
    const wRect  = wrapper.getBoundingClientRect();
    const icRect = ingCanvas.getBoundingClientRect();
    const offX   = icRect.left - wRect.left;
    const offY   = icRect.top  - wRect.top;

    const sx = f.startX - offX;
    const sy = f.startY - offY;
    const dx = cx;
    const dy = cy;
    const mx = (sx + dx) / 2;
    const my = Math.min(sy, dy) - icH * 0.2;  // arc upward

    const tt = f.t;
    const bx = (1-tt)*(1-tt)*sx + 2*(1-tt)*tt*mx + tt*tt*dx;
    const by = (1-tt)*(1-tt)*sy + 2*(1-tt)*tt*my + tt*tt*dy;

    ingCtx.font      = `${Math.round(28 * sc)}px serif`;
    ingCtx.textAlign    = 'center';
    ingCtx.textBaseline = 'middle';
    ingCtx.globalAlpha  = 1 - f.t * 0.4;
    const ing = INGREDIENTS.find(x => x.id === f.id);
    if (ing) ingCtx.fillText(ing.emoji, bx, by);
    ingCtx.globalAlpha = 1;

    if (f.t >= 1 && !f.done) {
      f.done = true;
      selectedIngredients.push(f.id);
      updateIngUI();
    }
  }
  ingFlyers = ingFlyers.filter(f => !f.done || selectedIngredients.includes(f.id));

  requestAnimationFrame(ingLoop);
}

function resizeIngCanvas() {
  const area = document.getElementById('ingPotArea');
  ingCanvas.width  = area.clientWidth;
  ingCanvas.height = area.clientHeight;
}

function showIngredientScreen() {
  phase = 'ingredient';
  phaseNameEl.textContent = '🥘 재료';
  timerValEl.textContent  = '--';
  selectedIngredients = [];
  ingFlyers = [];

  buildIngredientShelf();
  updateIngUI();
  ingScreen.style.display = 'flex';
  splashScreen.style.display  = 'none';
  scoreScreen.style.display   = 'none';

  requestAnimationFrame(() => {
    resizeIngCanvas();
    requestAnimationFrame(ingLoop);
  });
}

document.getElementById('confirmIngBtn').addEventListener('click', () => {
  ingScreen.style.display = 'none';
  startStirPhase();
});

// ══════════════════════════════════════════════════════
//  STIR PHASE
// ══════════════════════════════════════════════════════
function startStirPhase() {
  phase = 'stir';
  phaseNameEl.textContent = '🥄 젓기';
  stirTimeLeft = STIR_TIME;
  stirGoodTime = 0; stirBadTime = 0;
  burnLevel = 0; overflowLevel = 0; wrongDirTime = 0;
  bubbles = []; ripples = []; currySplats = []; splashParticles = [];
  prevStirAngle = null; angularVelocity = 0;
  dirChangeTimer = 0; dirChangePeriod = 6;
  requiredDir = Math.random() < 0.5 ? 1 : -1;
  updateDirHint();

  stirSpeedBar.style.display = 'flex';
  stirHintDir.style.display  = 'block';
  showFeedback('빙글빙글 저어줘! 🥄', '#F5C842');
}

function updateDirHint() {
  if (requiredDir === 1) {
    stirHintDir.textContent = '→ 오른쪽!';
    stirHintDir.style.color = '#88FF88';
  } else {
    stirHintDir.textContent = '← 왼쪽!';
    stirHintDir.style.color = '#88CCFF';
  }
}

function updateStir(dt) {
  const dx   = mouseX - POT_CX;
  const dy   = mouseY - (POT_CY - 8 * SCALE);
  const dist = Math.hypot(dx, dy);

  if (dist < 28 * SCALE) {
    prevStirAngle = null;
  } else {
    const angle = Math.atan2(dy, dx);
    if (prevStirAngle !== null) {
      let dA = angle - prevStirAngle;
      while (dA >  Math.PI) dA -= Math.PI * 2;
      while (dA < -Math.PI) dA += Math.PI * 2;
      angularVelocity = dA / dt;
    }
    prevStirAngle = angle;
  }

  const speed     = Math.abs(angularVelocity);
  const actualDir = angularVelocity > 0 ? 1 : -1;
  const goodMin   = 1.2, goodMax = 5.5;
  const dirOk     = speed > goodMin && actualDir === requiredDir;

  if (speed > goodMax) {
    // ★ 너무 빠름 → 넘침
    overflowLevel = Math.min(1, overflowLevel + dt * 0.18);
    burnLevel     = Math.max(0, burnLevel    - dt * 0.04);
    stirBadTime  += dt;
    if (Math.random() < 0.45) spawnSplash();
  } else if (speed > goodMin) {
    if (dirOk) {
      // ★ 적당한 속도 + 맞는 방향 → 좋음
      stirGoodTime  += dt;
      burnLevel      = Math.max(0, burnLevel    - dt * 0.12);
      overflowLevel  = Math.max(0, overflowLevel - dt * 0.08);
      if (Math.random() < 0.15) spawnRipple();
      if (Math.random() < 0.04) spawnBubble();
    } else {
      // 속도는 ok 근데 방향이 틀림
      wrongDirTime  += dt;
      burnLevel      = Math.min(1, burnLevel + dt * 0.03);
      stirBadTime   += dt * 0.4;
    }
  } else {
    // ★ 너무 느림 → 탐
    burnLevel      = Math.min(1, burnLevel    + dt * 0.07);
    overflowLevel  = Math.max(0, overflowLevel - dt * 0.04);
    stirBadTime   += dt * 0.6;
  }

  if (Math.random() < 0.03) spawnBubble();

  // Direction change timer (메시지 없이 방향만 전환)
  dirChangeTimer += dt;
  if (dirChangeTimer >= dirChangePeriod) {
    dirChangeTimer  = 0;
    dirChangePeriod = 4 + Math.random() * 4;
    requiredDir    *= -1;
    updateDirHint();
  }

  // Particle updates
  for (const b of bubbles) { b.y -= b.speed * dt; b.a -= dt * 0.8; }
  bubbles = bubbles.filter(b => b.a > 0);
  for (const r of ripples) { r.rx += dt * 38 * SCALE; r.ry += dt * 23 * SCALE; r.a -= dt * 1.5; }
  ripples = ripples.filter(r => r.a > 0);
  for (const s of currySplats) s.a -= dt * 0.3;
  currySplats = currySplats.filter(s => s.a > 0);
  for (const p of splashParticles) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 400 * dt; p.a -= dt * 1.5; }
  splashParticles = splashParticles.filter(p => p.a > 0);

  // Speed bar
  const speedNorm = Math.min(speed / (goodMax * 1.3), 1);
  stirSpeedFill.style.height = (speedNorm * 100) + '%';
  stirSpeedFill.style.background = speed > goodMax
    ? 'linear-gradient(to top,#FF4444,#FF8844)'
    : speed > goodMin
    ? 'linear-gradient(to top,#44FF88,#AAFF44)'
    : 'linear-gradient(to top,#FF8800,#FFCC00)';

  stirTimeLeft -= dt;
  timerValEl.textContent = Math.max(0, Math.ceil(stirTimeLeft)) + 's';
  if (stirTimeLeft <= 0) endStirPhase();
}

function endStirPhase() {
  stirSpeedBar.style.display = 'none';
  stirHintDir.style.display  = 'none';

  const ratio       = stirGoodTime / STIR_TIME;
  const burnPenalty = burnLevel * 0.4;
  const ofPenalty   = overflowLevel * 0.3;

  stirScore = Math.round(ratio * 100 * (1 - burnPenalty) * (1 - ofPenalty));
  stirScore = Math.max(0, Math.min(100, stirScore));

  // 4-state feedback: 타버렸어 / 넘쳤어 / 그럭저럭 / 완벽해
  let msg, color;
  if (burnLevel >= 0.6) {
    msg = '타버렸어! 🔥'; color = '#FF4444';
  } else if (overflowLevel >= 0.6) {
    msg = '넘쳤어! 💦'; color = '#44AAFF';
  } else if (stirScore >= 70) {
    msg = '완벽해! 🥄'; color = '#44FF88';
  } else {
    msg = '그럭저럭...'; color = '#FFD700';
  }
  showFeedback(msg, color);
  setTimeout(() => startFirePhase(), 1800);
}

// ══════════════════════════════════════════════════════
//  FIRE PHASE
// ══════════════════════════════════════════════════════
function startFirePhase() {
  phase = 'fire';
  phaseNameEl.textContent = '🔥 불조절';
  firePhaseTime = 0; beatIndex = 0; beatResult = [];
  cursor = 0; cursorDir = 1; hitCooldown = 0;
  fireReady = false;

  stirSpeedBar.style.display = 'none';
  stirHintDir.style.display  = 'none';

  // Build beats
  firePhaseBeats = [];
  for (let i = 0; i < FIRE_BEATS; i++) {
    firePhaseBeats.push({
      time:      2.0 + i * 2.0,
      zoneStart: 0.22 + Math.random() * 0.38,
      zoneWidth: 0.13 + Math.random() * 0.12,
      speed:     0.008 + Math.random() * 0.008,
    });
  }

  // Reset rhythm UI to hidden-state
  rhythmZoneEl.style.left  = '0%';
  rhythmZoneEl.style.width = '0%';
  rhythmCursorEl.style.left = '0%';

  rhythmWrap.style.display = 'flex';
  tapBtn.style.display     = 'flex';
  timerValEl.textContent   = `1/${FIRE_BEATS}`;

  showFeedback('준비... 박자를 맞춰봐! 🔥', '#F5C842');
  setTimeout(() => { fireReady = true; }, 1000);
}

function updateFire(dt) {
  firePhaseTime += dt;
  if (!fireReady) return;

  if (beatIndex < firePhaseBeats.length) {
    const beat = firePhaseBeats[beatIndex];

    // Show zone only when beat is close
    if (firePhaseTime >= beat.time - 1.0) {
      rhythmZoneEl.style.left  = (beat.zoneStart * 100) + '%';
      rhythmZoneEl.style.width = (beat.zoneWidth * 100) + '%';
    } else {
      rhythmZoneEl.style.left  = '0%';
      rhythmZoneEl.style.width = '0%';
    }

    cursor += cursorDir * beat.speed * dt * 60;
    if (cursor >= 1) { cursor = 1; cursorDir = -1; }
    if (cursor <= 0) { cursor = 0; cursorDir =  1; }
    rhythmCursorEl.style.left = `calc(${cursor * 100}% - 3.5px)`;

    timerValEl.textContent = `${beatIndex + 1}/${FIRE_BEATS}`;

    // Auto-miss
    if (firePhaseTime > beat.time + 2.5) {
      beatResult.push('miss');
      showBeatFeedback('MISS 💨', '#FF4444');
      beatIndex++;
      hitCooldown = 0;
    }
  } else {
    endFirePhase();
  }
  if (hitCooldown > 0) hitCooldown -= dt;
}

function onTap() {
  if (phase !== 'fire' || !fireReady || hitCooldown > 0) return;
  if (beatIndex >= firePhaseBeats.length) return;
  const beat = firePhaseBeats[beatIndex];
  if (firePhaseTime < beat.time - 0.5) return;

  const inZone     = cursor >= beat.zoneStart && cursor <= beat.zoneStart + beat.zoneWidth;
  const centerDist = inZone
    ? Math.abs(cursor - (beat.zoneStart + beat.zoneWidth / 2)) / (beat.zoneWidth / 2)
    : 1;

  if (inZone) {
    if (centerDist < 0.3) { beatResult.push('perfect'); showBeatFeedback('PERFECT! 🔥', '#FFD700'); }
    else                  { beatResult.push('good');    showBeatFeedback('GOOD! ✓',     '#44FF88'); }
  } else {
    beatResult.push('miss');
    showBeatFeedback('MISS 💨', '#FF4444');
  }
  beatIndex++;
  hitCooldown = 0.4;
}

function endFirePhase() {
  rhythmWrap.style.display = 'none';
  tapBtn.style.display     = 'none';
  let pts = 0;
  for (const r of beatResult) { if (r === 'perfect') pts += 10; else if (r === 'good') pts += 6; }
  fireScore = Math.round((pts / (FIRE_BEATS * 10)) * 100);
  setTimeout(() => showResult(), 600);
}

// ══════════════════════════════════════════════════════
//  SCORE CALC — 100점 만점
//  재료(30) + 젓기(40) + 불조절(30)
// ══════════════════════════════════════════════════════
function calcIngScore() {
  // raw score from ingredient selection
  let raw  = 0;
  const msgs = [];
  for (const id of selectedIngredients) {
    const ing = INGREDIENTS.find(x => x.id === id);
    if (!ing) continue;
    raw += ing.score;
    if (ing.weirdMsg) msgs.push(ing.emoji + ' ' + ing.weirdMsg);
  }
  // normalize to 0–30
  // max possible raw = 45 (3 × 15), min = –60 (3 × –20)
  const clamped   = Math.max(-60, Math.min(45, raw));
  const normalized = Math.round(((clamped + 60) / 105) * 30);
  return { score: normalized, msgs };
}

function showResult() {
  phase = 'result';
  const { score: iScore, msgs } = calcIngScore();
  ingScore = iScore;

  // Scale stir / fire to their weights (40 + 30)
  const stirWeighted = Math.round(stirScore * 0.4);
  const fireWeighted = Math.round(fireScore * 0.3);
  const total = ingScore + stirWeighted + fireWeighted;

  let grade = '😭 탄 카레';
  let gradeColor = '#FF6644';
  if      (total >= 88) { grade = '리자몽급 맛';    gradeColor = '#FFD700'; }
  else if (total >= 70) { grade = '대왕끼리동급 맛';         gradeColor = '#F5C842'; }
  else if (total >= 50) { grade = '마자용급 맛';      gradeColor = '#88FF88'; }
  else if (total >= 30) { grade = '또가스급 맛';  gradeColor = '#FF9944'; }

  document.getElementById('sc0').textContent = ingScore + '점 / 30';
  document.getElementById('sc1').textContent = stirWeighted + '점 / 40';
  document.getElementById('sc2').textContent = fireWeighted + '점 / 30';
  document.getElementById('totalScore').textContent = total + '점 / 100';
  const gradeEl = document.getElementById('grade');
  gradeEl.textContent = grade;
  gradeEl.style.color = gradeColor;

  const ingResultEl = document.getElementById('ingredientResult');
  ingResultEl.innerHTML = msgs.length > 0 ? msgs.join('<br>') : '';
  ingResultEl.style.display = msgs.length > 0 ? 'block' : 'none';

  scoreScreen.style.display = 'flex';
}

// ══════════════════════════════════════════════════════
//  FEEDBACK
// ══════════════════════════════════════════════════════
function showFeedback(text, color) {
  feedbackEl.textContent  = text;
  feedbackEl.style.color  = color;
  feedbackEl.style.opacity = '1';
  setTimeout(() => { feedbackEl.style.opacity = '0'; }, 1500);
}
let bfTimer = null;
function showBeatFeedback(text, color) {
  feedbackEl.textContent  = text;
  feedbackEl.style.color  = color;
  feedbackEl.style.opacity = '1';
  if (bfTimer) clearTimeout(bfTimer);
  bfTimer = setTimeout(() => { feedbackEl.style.opacity = '0'; }, 700);
}

// ══════════════════════════════════════════════════════
//  MAIN GAME LOOP
// ══════════════════════════════════════════════════════
function gameLoop(ts) {
  const dt = Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;

  ctx.clearRect(0, 0, CW, CH);
  drawBackground(ctx, CW, CH);

  if      (phase === 'stir') flameIntensity = 0.4 + burnLevel * 0.5;
  else if (phase === 'fire') flameIntensity = 0.3 + cursor  * 0.7;
  else                       flameIntensity = 0.5;

  drawFlame(ctx, POT_CX, POT_CY, POT_RY, SCALE, flameIntensity);
  drawPotBase(ctx, POT_CX, POT_CY, POT_RX, POT_RY, SCALE, burnLevel, selectedIngredients);
  drawSplashParticles(ctx);
  drawSpoon(ctx, POT_CX, POT_CY, SCALE);
  drawStirHUD(ctx, POT_CX, POT_CY, POT_RY, SCALE);

  if (phase === 'stir') updateStir(dt);
  if (phase === 'fire') updateFire(dt);

  requestAnimationFrame(gameLoop);
}

// ══════════════════════════════════════════════════════
//  INPUT — MOUSE + TOUCH
// ══════════════════════════════════════════════════════
function getCanvasPos(e) {
  const rect   = canvas.getBoundingClientRect();
  const scaleX = CW / rect.width;
  const scaleY = CH / rect.height;
  if (e.touches && e.touches.length > 0) {
    return {
      x: (e.touches[0].clientX - rect.left) * scaleX,
      y: (e.touches[0].clientY - rect.top)  * scaleY,
    };
  }
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top)  * scaleY,
  };
}

canvas.addEventListener('touchstart', e => {
  if (phase === 'stir') {
    const p = getCanvasPos(e); mouseX = p.x; mouseY = p.y; prevStirAngle = null;
  }
}, { passive: true });

canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  if (phase === 'stir') { const p = getCanvasPos(e); mouseX = p.x; mouseY = p.y; }
}, { passive: false });

canvas.addEventListener('touchend', () => {
  if (phase === 'stir') prevStirAngle = null;
}, { passive: true });

canvas.addEventListener('mousemove', e => {
  const p = getCanvasPos(e); mouseX = p.x; mouseY = p.y;
});

// Fire tap
tapBtn.addEventListener('touchstart', e => { e.preventDefault(); onTap(); }, { passive: false });
tapBtn.addEventListener('click', onTap);
document.addEventListener('keydown', e => { if (e.code === 'Space') { e.preventDefault(); onTap(); } });

// ══════════════════════════════════════════════════════
//  GAME START / RESTART
// ══════════════════════════════════════════════════════
function initGame() {
  stirScore = 0; fireScore = 0; ingScore = 0;
  selectedIngredients = [];
}

document.getElementById('startBtn').addEventListener('click', () => {
  splashScreen.style.display = 'none';
  initGame();
  lastTime = performance.now();
  requestAnimationFrame(ts => { lastTime = ts; gameLoop(ts); });
  showIngredientScreen();
});

document.getElementById('restartBtn').addEventListener('click', () => {
  scoreScreen.style.display = 'none';
  initGame();
  showIngredientScreen();
});

// ══════════════════════════════════════════════════════
//  SPLASH IDLE LOOP
// ══════════════════════════════════════════════════════
function splashLoop(ts) {
  if (phase !== 'splash') return;
  ctx.clearRect(0, 0, CW, CH);
  drawBackground(ctx, CW, CH);
  drawFlame(ctx, POT_CX, POT_CY, POT_RY, SCALE, 0.6);
  drawPotBase(ctx, POT_CX, POT_CY, POT_RX, POT_RY, SCALE, 0, []);
  if (Math.random() < 0.05) spawnBubble();
  for (const b of bubbles) { b.y -= b.speed * 0.016; b.a -= 0.016 * 0.8; }
  bubbles.filter(b => b.a > 0);
  lastTime = ts;
  requestAnimationFrame(splashLoop);
}
requestAnimationFrame(splashLoop);
