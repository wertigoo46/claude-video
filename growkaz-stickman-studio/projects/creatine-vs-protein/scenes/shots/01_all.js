// shots/01_all.js — Creatine vs Protein (9:16, 12 shots)
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, key, clamp, lerp, shake, seg, circle, ring, rr, poly, glow, alpha, shade, linGrad, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { gym, studio, tub, pill, popIn } from '../sets/gym.js';
import { HERO, DOC, neon } from '../cast.js';

const L = (info, gt) => gt - info.shot.start;           // global word time -> local shot time
const rimOf = (M, dir = [0, -1]) => ({ color: M.rim, dir, w: 5 });
const blink = (t, p = 3.1) => (t % p) > p - 0.12;
const PROT = ['#1a1630', '#ff3d6e'], CREA = ['#f2f4f8', '#14b2ff'];
function check(g, x, y, s, c) { g.save(); g.shadowColor = c; g.shadowBlur = 20; seg(g, [[x - 30 * s, y], [x - 8 * s, y + 24 * s], [x + 36 * s, y - 28 * s]], 14 * s, c); g.restore(); }
function cross(g, x, y, s, c) { g.save(); g.shadowColor = c; g.shadowBlur = 20; seg(g, [[x - 26 * s, y - 26 * s], [x + 26 * s, y + 26 * s]], 14 * s, c); seg(g, [[x + 26 * s, y - 26 * s], [x - 26 * s, y + 26 * s]], 14 * s, c); g.restore(); }
function brick(g, x, y, w, h, M) { rr(g, x, y, w, h, 6); g.fillStyle = '#c8502a'; g.fill(); g.fillStyle = alpha('#ffffff', 0.18); g.fillRect(x + 6, y + 5, w - 12, 6); g.strokeStyle = shade('#c8502a', -0.45); g.lineWidth = 3; g.stroke(); }
function bolt(g, x, y, s, c, a = 1) { g.save(); g.globalAlpha *= a; g.shadowColor = c; g.shadowBlur = 40; poly(g, [[x + 20 * s, y - 120 * s], [x - 50 * s, y + 10 * s], [x - 2 * s, y + 10 * s], [x - 20 * s, y + 120 * s], [x + 54 * s, y - 20 * s], [x + 6 * s, y - 20 * s]], c); g.restore(); }

// s01 — "Creatine or protein."  gym wide, two tubs pop in, VS
registerShot('s01', { draw(g, t, info) {
  const cam = { z: 1.02 + 0.06 * ease.inOut(t / info.dur), x: 0 };
  const { GY, CX, M } = gym(g, t, cam);
  layer(g, cam, 1, (g) => {
    const s = V(2, 2.4);
    neon(g, { x: CX, y: GY, s, facing: 1, outfit: HERO, pose: breathe(posesAt(t, [[0, 'crossArms'], [0.7, 'shrug']]), t), expr: t < 0.7 ? 'thinking' : 'confused', look: [t < 0.7 ? -1 : 1, -0.2], blink: blink(t), rim: rimOf(M) });
    tub(g, CX - V(380, 300), GY, 1.5 * popIn(t, L(info, 0.0)), 'CREATINE', ...CREA);
    tub(g, CX + V(380, 300), GY, 1.5 * popIn(t, L(info, 0.8)), 'PROTEIN', ...PROT);
  });
  const k = popIn(t, 0.55); if (k > 0) { g.save(); g.translate(E.W / 2, E.H * 0.25); g.scale(k, k); text(g, 'VS', 0, 0, { size: 190, color: S().ui.gold, glow: 40, glowColor: '#14b2ff', stroke: 14, strokeColor: '#0e1430' }); g.restore(); }
  FX.dust(g, t, { count: 50, color: '#fff3c0', a: 0.45 });
} });

// s02 — "Which one actually builds muscle?"  giant face, question marks
registerShot('s02', { draw(g, t, info) {
  const M = mood('golden');
  blurLayer(g, 14, (g) => gym(g, t, { z: 1.5, x: 120, y: -200 })); veil(g, '#2a1802', 0.25);
  const r = V(300, 330) * (1 + 0.05 * t), cx = E.W / 2, cy = E.H * 0.52;
  g.save(); g.shadowColor = 'rgba(40,200,255,.8)'; g.shadowBlur = 40;
  bigFace(g, cx, cy, r, { outfit: HERO, expr: t < 1.0 ? 'thinking' : 'confused', look: [Math.sin(t * 2) * 0.8, -0.4], rimColor: M.rim, rimSide: -1, blink: blink(t, 2.4) });
  g.restore();
  [[0.15, -1, 0.2], [0.6, 1, 0.15], [1.25, 0.2, 0.08]].forEach(([t0, side, yy], i) => { const k = popIn(t, t0); if (k <= 0) return; g.save(); g.translate(cx + side * V(360, 330), E.H * yy + 80 + Math.sin(t * 3 + i) * 12); g.rotate(side * 0.18); g.scale(k, k); text(g, '?', 0, 0, { size: 220, color: S().ui.gold, glow: 40, glowColor: '#14b2ff', stroke: 12, strokeColor: '#0e1430' }); g.restore(); });
  FX.dust(g, t, { count: 30, color: '#fff3c0', a: 0.4 });
} });

// s03 — "Protein is the bricks."  bricks drop and stack beside the hero
registerShot('s03', { draw(g, t, info) {
  const cam = { z: 1.15 + 0.05 * t, x: 40, y: 60 };
  const { GY, CX, M } = gym(g, t, cam);
  const sx = shake(t, 10 * (1 - prog(t, 0, 0.4)), 30);
  g.save(); g.translate(sx[0], sx[1]);
  layer(g, cam, 1, (g) => {
    neon(g, { x: CX - V(260, 230), y: GY, s: V(2.1, 2.4), facing: 1, outfit: HERO, pose: breathe(posesAt(t, [[0, 'holdFront'], [0.9, 'point']]), t), expr: 'happy', blink: blink(t), rim: rimOf(M) });
    const bw = 130, bh = 62, x0 = CX + V(10, 10);
    for (let i = 0; i < 9; i++) { const row = Math.floor(i / 3), col = i % 3, td = 0.08 + i * 0.1; const d = ease.in(prog(t, td, td + 0.22)); if (d <= 0) continue;
      const tx = x0 + col * (bw + 6) + (row % 2) * 30, ty = GY - (row + 1) * (bh + 6); brick(g, tx, lerp(ty - 900, ty, d), bw, bh, M); }
  });
  g.restore();
  pill(g, 'PROTEIN = BRICKS', E.W / 2, E.H * 0.2, { size: 70, sc: popIn(t, 0.15) });
  FX.dust(g, t, { count: 50, color: '#fff3c0', a: 0.45 });
} });

// s04 — "Aim for about 1.6 g per kg of body weight a day."  number card
registerShot('s04', { draw(g, t, info) {
  const cam = { z: 1 + 0.05 * ease.inOut(t / info.dur), y: -20 * t };
  const { M } = studio(g, t, cam);
  const ui = S().ui, k = popIn(t, 0.1, 0.4);
  if (k > 0) { g.save(); g.translate(E.W / 2, E.H * 0.33); g.scale(k, k);
    rr(g, -440, -330, 880, 660, 40); g.fillStyle = ui.card; g.fill(); g.strokeStyle = '#3fd8ff'; g.lineWidth = 5; g.shadowColor = '#3fd8ff'; g.shadowBlur = 30; g.stroke(); g.shadowBlur = 0;
    text(g, 'DAILY PROTEIN', 0, -240, { size: 52, color: ui.sub, font: FONTS.ui, weight: 900, spacing: 4 });
    const p = ease.out(prog(t, L(info, 6.06), L(info, 6.96))), v = (1.6 * p).toFixed(1);
    text(g, v, -40, -60, { size: 230, color: '#ffffff', font: FONTS.ui, weight: 900, glow: 40, glowColor: '#14b2ff', align: 'right' });
    text(g, 'g', 0, -40, { size: 140, color: '#3fd8ff', font: FONTS.ui, weight: 900, align: 'left' });
    const a2 = ease.out(prog(t, L(info, 7.4), L(info, 7.8))); text(g, 'PER KG BODY WEIGHT', 0, 120, { size: 58, color: '#ffd23a', font: FONTS.ui, weight: 900, alpha: a2, spacing: 2 });
    const a3 = ease.out(prog(t, L(info, 8.4), L(info, 8.8))); text(g, 'EVERY DAY', 0, 220, { size: 58, color: ui.cream, font: FONTS.ui, weight: 900, alpha: a3, spacing: 4 });
    g.restore(); }
  layer(g, cam, 1, (g) => { const GY = E.H * 0.68 + 120;
    FX.pool(g, E.W / 2, GY + 10, 420, 60, M.key, 0.35);
    neon(g, { x: E.W / 2 - 40, y: GY, s: 1.9, facing: 1, outfit: HERO, pose: breathe(posesAt(t, [[0, 'stand'], [0.5, 'pointUp']]), t), expr: 'smile', look: [0.3, -1], blink: blink(t), rim: rimOf(M) }); });
  FX.dust(g, t, { count: 40, color: '#fff3c0', a: 0.4 });
} });

// s05 — "Creatine is the fuel."  power-up, lightning, battery
registerShot('s05', { draw(g, t, info) {
  const cam = { z: 1.08 + 0.08 * t, x: -20 };
  const { GY, CX, M } = gym(g, t, cam);
  veil(g, '#1a0e00', 0.25);
  layer(g, cam, 1, (g) => {
    const hx = CX - V(120, 120); glow(g, hx, GY - 260, 420 * (0.8 + 0.2 * Math.sin(t * 10)), '#3fd8ff', 0.4 * prog(t, 0.2, 0.8));
    neon(g, { x: hx, y: GY, s: 2.5, facing: 1, outfit: HERO, pose: breathe(posesAt(t, [[0, 'ready'], [0.7, 'cheer']]), t), expr: t < 0.7 ? 'determined' : 'joy', blink: blink(t), rim: rimOf(M) }, 26 + 30 * prog(t, 0.2, 0.9));
    tub(g, CX + V(300, 290), GY, 1.4, 'CREATINE', ...CREA);
    // battery filling above the tub
    const bx = CX + V(230, 220), by = GY - 620, f = ease.inOut(prog(t, 0.3, 1.3));
    rr(g, bx, by, 140, 260, 18); g.fillStyle = '#0e1430'; g.fill(); g.strokeStyle = '#3fd8ff'; g.lineWidth = 6; g.stroke(); rr(g, bx + 45, by - 22, 50, 24, 6); g.fillStyle = '#3fd8ff'; g.fill();
    g.save(); g.shadowColor = '#3fd8ff'; g.shadowBlur = 30; g.fillStyle = '#3fd8ff'; g.fillRect(bx + 14, by + 246 - 232 * f, 112, 232 * f); g.restore();
    bolt(g, bx + 70, by + 130, 0.8, '#ffffff', prog(t, 0.6, 0.9));
  });
  FX.speedLines(g, t, { cx: CX - 120, cy: GY - 300, count: 40, a: 0.25 * prog(t, 0, 0.5), color: '#fff6c8' });
  pill(g, 'CREATINE = FUEL', E.W / 2, E.H * 0.2, { size: 70, sc: popIn(t, 0.2) });
  FX.dust(g, t, { count: 50, color: '#fff3c0', a: 0.45 });
} });

// s06 — "Three to five grams daily can get you an extra rep or two."  overhead press, rep counter +2
const PRESS_DN = { ...POSES.stand, eF: [30, -150], hF: [22, -190], eB: [-18, -150], hB: [-12, -190] };
const PRESS_UP = { ...POSES.stand, head: [6, -206], eF: [18, -226], hF: [14, -268], eB: [-8, -226], hB: [-8, -268] };
registerShot('s06', { draw(g, t, info) {
  const cam = { z: 1.12 + 0.05 * t, x: 30, y: 40 };
  const { GY, CX, M } = gym(g, t, cam);
  const up = key(t, [[0, 0], [0.35, 1], [0.6, 1], [0.95, 0], [1.25, 0], [1.6, 1], [1.8, 1], [2.05, 0], [2.12, 0], [2.4, 1], [3.1, 1]]);
  const reps = 9 + (t >= 0.35) + (t >= 1.6) + (t >= 2.4);
  layer(g, cam, 1, (g) => {
    const x = CX - 30, s = 2.5, pose = { ...PRESS_DN }; for (const k of Object.keys(pose)) pose[k] = [lerp(PRESS_DN[k][0], PRESS_UP[k][0], up), lerp(PRESS_DN[k][1], PRESS_UP[k][1], up)];
    neon(g, { x, y: GY, s, facing: 1, outfit: HERO, pose, expr: up > 0.5 ? 'determined' : 'angry', blink: false, rim: rimOf(M) });
    const hy = GY + pose.hF[1] * s, hx = x + pose.hF[0] * s;
    seg(g, [[hx - 260, hy], [hx + 260, hy]], 14, '#1a1630');
    for (const d of [-1, 1]) { const px = hx + d * 210; rr(g, px - 22, hy - 110, 44, 220, 10); g.fillStyle = '#1a1630'; g.fill(); rr(g, px - 22 + d * 46, hy - 85, 34, 170, 8); g.fill(); g.strokeStyle = '#3fd8ff'; g.lineWidth = 3; rr(g, px - 22, hy - 110, 44, 220, 10); g.stroke(); }
  });
  pill(g, 'REP ' + reps, E.W / 2, E.H * 0.12, { size: 90, sc: 1 + 0.15 * Math.max(0, 1 - Math.min(Math.abs(t - 0.35), Math.abs(t - 1.6), Math.abs(t - 2.4)) / 0.15) });
  const k = popIn(t, 2.4); if (k > 0) { g.save(); g.translate(E.W * 0.8, E.H * 0.33); g.scale(k, k); text(g, '+2', 0, 0, { size: 150, color: '#5fffb0', font: FONTS.ui, weight: 900, glow: 30, glowColor: '#14b2ff', stroke: 10, strokeColor: '#0e1430' }); g.restore(); }
  pill(g, '3–5 g DAILY', E.W / 2, E.H * 0.25, { size: 64, sc: popIn(t, L(info, 11.0)), a: 1 - prog(t, 2.2, 2.4) });
  FX.dust(g, t, { count: 50, color: '#fff3c0', a: 0.45 });
} });

// s07 — "Early jump on the scale?"  bathroom scale number jumps
registerShot('s07', { draw(g, t, info) {
  const j = L(info, 14.24), cam = { z: 1.2 + 0.04 * t, y: 120 };
  const sh = shake(t, 14 * (prog(t, j, j + 0.05) - prog(t, j + 0.1, j + 0.5)), 30);
  const { GY, CX, M } = gym(g, t, { ...cam, x: sh[0], y: cam.y + sh[1] });
  layer(g, { ...cam, x: sh[0], y: cam.y + sh[1] }, 1, (g) => {
    rr(g, CX - 150, GY - 34, 300, 40, 12); g.fillStyle = '#f2f4f8'; g.fill(); rr(g, CX - 40, GY - 28, 80, 22, 4); g.fillStyle = '#0e1430'; g.fill();
    neon(g, { x: CX - 10, y: GY - 30, s: 2.5, facing: 1, outfit: HERO, pose: breathe(posesAt(t, [[0, 'stand'], [j, 'handsOnHead']]), t), expr: t < j ? 'neutral' : 'shocked', look: [0.2, 1], blink: false, rim: rimOf(M), shadow: false });
  });
  const ui = S().ui, v = t < j ? '80.0' : (80 + 1.5 * ease.out(prog(t, j, j + 0.3))).toFixed(1);
  g.save(); g.translate(E.W / 2, E.H * 0.2); const sc = 1 + 0.15 * (prog(t, j, j + 0.08) - prog(t, j + 0.08, j + 0.35)); g.scale(sc, sc);
  rr(g, -330, -120, 660, 240, 30); g.fillStyle = ui.card; g.fill(); g.strokeStyle = '#3fd8ff'; g.lineWidth = 5; g.stroke();
  text(g, v + ' kg', 0, 6, { size: 130, color: t < j ? '#ffffff' : '#ff3d6e', font: FONTS.ui, weight: 900, glow: 24, glowColor: t < j ? '#14b2ff' : '#ff3d6e' });
  g.restore();
  if (t > j) FX.rings(g, E.W / 2, E.H * 0.2, t - j, { count: 2, r0: 200, r1: 520, speed: 1.6, color: '#ffffff', a: 0.5 * (1 - prog(t, j, j + 0.8)) });
  FX.dust(g, t, { count: 40, color: '#fff3c0', a: 0.4 });
} });

// s08 — "That's water, not fat."  freeze: muscle full of water drops
registerShot('s08', { draw(g, t, info) {
  const cam = { z: 1.0 + 0.04 * t, r: -0.02 + 0.01 * t };
  const { M } = studio(g, t, cam, { gy: 0.45 });
  layer(g, cam, 1, (g) => {
    const cx = E.W / 2, cy = E.H * 0.45;
    // flexed arm: shoulder (left edge) -> elbow -> fist up, bicep bulge on top of the upper arm
    const ink = S().ink, sh = [cx - 560, cy + 170], el = [cx + 170, cy + 150], fi = [cx + 190, cy - 270];
    g.save(); g.shadowColor = '#3fd8ff'; g.shadowBlur = 50;
    seg(g, [sh, el], 190, ink); seg(g, [el, fi], 150, ink); circle(g, fi[0], fi[1], 105, ink);
    g.beginPath(); g.ellipse(cx - 140, cy + 40, 250, 170, -0.08, 0, Math.PI * 2); g.fillStyle = ink; g.fill(); g.restore();
    seg(g, [[fi[0] - 60, fi[1] - 30], [fi[0] + 40, fi[1] - 30]], 10, alpha('#0a5cc0', 0.8)); seg(g, [[fi[0] - 60, fi[1] + 10], [fi[0] + 40, fi[1] + 10]], 10, alpha('#0a5cc0', 0.8));
    g.save(); g.beginPath(); g.ellipse(cx - 140, cy + 40, 238, 158, -0.08, 0, Math.PI * 2); g.clip();
    FX.drops(g, t, { count: 40, area: [cx - 380, cy - 120, 480, 320], rMin: 8, rMax: 26, color: '#e8fbff', drift: 6 }); g.restore();
  });
  const w = L(info, 15.5), f = L(info, 16.3), ui = S().ui;
  const a1 = popIn(t, w), a2 = popIn(t, f);
  if (a1 > 0) { g.save(); g.translate(E.W / 2 - 220, E.H * 0.13); g.scale(a1, a1); pill(g, 'WATER', 0, 0, { size: 66, line: '#5fffb0' }); check(g, 200, 0, 1.2, '#5fffb0'); g.restore(); }
  if (a2 > 0) { g.save(); g.translate(E.W / 2 - 220, E.H * 0.19); g.scale(a2, a2); pill(g, 'FAT', 0, 0, { size: 66, line: '#ff3d6e' }); cross(g, 160, 0, 1.2, '#ff3d6e'); g.restore(); }
  g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(60,160,255,.25)'; g.fillRect(0, 0, E.W, E.H); g.restore();
} });

// s09 — "So protein wins."  podium
registerShot('s09', { draw(g, t, info) {
  const cam = { z: 1.05 + 0.06 * t, x: -10 };
  const { GY, CX, M } = gym(g, t, cam);
  const w = L(info, 17.32);
  layer(g, cam, 1, (g) => {
    const rise = ease.outBack(prog(t, 0, 0.5));
    const pod = (x, h, n) => { rr(g, x - 130, GY - h * rise, 260, h * rise + 10, 10); g.fillStyle = '#1a1630'; g.fill(); g.strokeStyle = '#3fd8ff'; g.lineWidth = 4; g.stroke(); text(g, n, x, GY - h * rise * 0.5, { size: 90, color: '#3fd8ff', font: FONTS.ui, weight: 900 }); };
    pod(CX + 20, 300, '1'); pod(CX + 290, 170, '2');
    tub(g, CX + 20, GY - 300 * rise, 1.4 * popIn(t, w - 0.1), 'PROTEIN', ...PROT);
    tub(g, CX + 290, GY - 170 * rise, 1.2 * popIn(t, 0.1), 'CREATINE', ...CREA);
    neon(g, { x: CX - 320, y: GY, s: 2.3, facing: 1, outfit: HERO, pose: breathe(posesAt(t, [[0, 'explain'], [w, 'cheer']]), t), expr: t < w ? 'smile' : 'joy', blink: blink(t), rim: rimOf(M) });
    if (t > w) for (let i = 0; i < 6; i++) FX.sparkle(g, CX + 20 + Math.cos(i + t) * 170, GY - 620 + Math.sin(i * 2.1 + t * 1.3) * 120, 22 + 8 * Math.sin(t * 6 + i), '#ffffff', 0.9);
  });
  pill(g, 'PROTEIN WINS', E.W / 2, E.H * 0.18, { size: 80, sc: popIn(t, w), line: '#ffd23a' });
  FX.dust(g, t, { count: 50, color: '#fff3c0', a: 0.45 });
} });

// s10 — "Creatine can't build what you never eat."  empty plate, tub can't help
registerShot('s10', { draw(g, t, info) {
  const cam = { z: 1.15 + 0.05 * t, x: 20, y: 80 };
  const { GY, CX, M } = gym(g, t, cam);
  veil(g, '#1a0e00', 0.2);
  const b = L(info, 19.28), e = L(info, 19.9);
  layer(g, cam, 1, (g) => {
    rr(g, CX - 40, GY - 170, 520, 26, 8); g.fillStyle = '#1a1630'; g.fill(); seg(g, [[CX, GY - 150], [CX, GY]], 14, '#1a1630'); seg(g, [[CX + 440, GY - 150], [CX + 440, GY]], 14, '#1a1630');
    g.fillStyle = '#f2f4f8'; g.beginPath(); g.ellipse(CX + 290, GY - 178, 120, 24, 0, 0, 7); g.fill(); g.fillStyle = '#d8dce4'; g.beginPath(); g.ellipse(CX + 290, GY - 180, 80, 14, 0, 0, 7); g.fill();
    tub(g, CX + 70, GY - 170, 1.0, 'CREATINE', ...CREA);
    neon(g, { x: CX - 250, y: GY, s: 2.4, facing: 1, outfit: HERO, pose: breathe(posesAt(t, [[0, 'explain'], [e, 'shrug']]), t), expr: t < b ? 'thinking' : 'sad', look: [1, 0.4], blink: blink(t), rim: rimOf(M) });
    // crumbling bricks above the tub
    for (let i = 0; i < 5; i++) { const d = prog(t, b + i * 0.05, b + 0.8 + i * 0.05); const x = CX + 10 + i * 40, y = GY - 520 + d * d * 300; g.save(); g.globalAlpha *= 1 - d; g.translate(x, y); g.rotate(d * (i - 2) * 0.6); brick(g, -40, -18, 80, 36, M); g.restore(); }
    const k = popIn(t, e); if (k > 0) { g.save(); g.translate(CX + 290, GY - 300); g.scale(k, k); cross(g, 0, 0, 1.6, '#ff3d6e'); g.restore(); }
  });
  pill(g, 'NO FOOD = NO BUILD', E.W / 2, E.H * 0.18, { size: 62, sc: popIn(t, b), line: '#ff3d6e' });
  FX.dust(g, t, { count: 40, color: '#fff3c0', a: 0.4 });
} });

// s11 — "Kidney issues? Ask your doctor first."  doctor + hero
registerShot('s11', { draw(g, t, info) {
  const cam = { z: 1.08 + 0.05 * t, x: -10 };
  const { GY, CX, M } = studio(g, t, cam, { gy: 0.55 });
  const a = L(info, 21.74);
  layer(g, cam, 1, (g) => {
    FX.pool(g, CX, GY + 10, 560, 70, M.key, 0.35);
    // clinic cross sign
    g.save(); g.shadowColor = '#5fffb0'; g.shadowBlur = 30; g.fillStyle = '#5fffb0'; g.fillRect(CX + 230, GY - 760, 50, 150); g.fillRect(CX + 180, GY - 710, 150, 50); g.restore();
    neon(g, { x: CX - 230, y: GY, s: 2.35, facing: 1, outfit: HERO, pose: breathe(posesAt(t, [[0, 'think'], [a + 0.3, 'relaxed']]), t), expr: t < a ? 'worried' : 'smile', look: [1, -0.2], blink: blink(t), rim: rimOf(M) });
    drawFigure(g, { x: CX + 240, y: GY, s: 2.4, facing: -1, outfit: DOC, pose: breathe(posesAt(t, [[0, 'stand'], [a - 0.1, 'explain']]), t, 1, 3), expr: 'smile', blink: blink(t, 2.7), rim: rimOf(M, [0, -1]), ink: '#1a1630', inkFar: '#3a3450' });
  });
  pill(g, 'KIDNEY ISSUES?', E.W / 2, E.H * 0.14, { size: 68, sc: popIn(t, 0.1), line: '#ff3d6e' });
  pill(g, 'ASK YOUR DOCTOR FIRST', E.W / 2, E.H * 0.24, { size: 56, sc: popIn(t, a), line: '#5fffb0' });
  FX.dust(g, t, { count: 40, color: '#fff3c0', a: 0.4 });
} });

// s12 — "Follow for more no-hype training science."  CTA
registerShot('s12', { captions: false, draw(g, t, info) {
  const cam = { z: 1.08 + 0.05 * t, y: 40 };
  const { GY, CX, M } = gym(g, t, cam);
  layer(g, cam, 1, (g) => {
    neon(g, { x: CX - 20, y: GY, s: 2.4, facing: 1, outfit: HERO, pose: breathe(posesAt(t, [[0, 'wave'], [1.0, 'point'], [2.4, 'cheer']]), t), expr: 'joy', look: [0.3, 0], blink: blink(t), rim: rimOf(M) }, 34);
  });
  const k = popIn(t, 0.12, 0.45);
  if (k > 0) { g.save(); g.translate(E.W / 2, E.H * 0.1); g.scale(k * (1 + 0.03 * Math.sin(t * 6)), k * (1 + 0.03 * Math.sin(t * 6)));
    rr(g, -330, -85, 660, 170, 85); g.fillStyle = '#ff3d6e'; g.shadowColor = '#ff3d6e'; g.shadowBlur = 40; g.fill(); g.shadowBlur = 0;
    text(g, '+ FOLLOW', 0, 4, { size: 96, color: '#ffffff', spacing: 3 }); g.restore(); }
  const a2 = ease.out(prog(t, L(info, 23.7), L(info, 24.1)));
  text(g, 'NO-HYPE', E.W / 2, E.H * 0.2, { size: 92, color: '#ffffff', alpha: a2, glow: 30, glowColor: '#14b2ff', stroke: 12, strokeColor: '#0e1430', spacing: 4 });
  text(g, 'TRAINING SCIENCE', E.W / 2, E.H * 0.26, { size: 76, color: S().ui.gold, alpha: ease.out(prog(t, L(info, 24.2), L(info, 24.6))), glow: 30, glowColor: '#14b2ff', stroke: 12, strokeColor: '#0e1430', spacing: 3 });
  FX.dust(g, t, { count: 60, color: '#fff3c0', a: 0.5 });
} });
