// shots/01_all.js — Pre-Workout (dark cinematic, 9:16, 11 shots)
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, key, clamp, lerp, shake, seg, circle, ring, rr, poly, glow, alpha, shade, linGrad, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { noirGym, haze, bedroom, tub, pill, popIn, check, cross } from '../sets/noir.js';
import { HERO, DOC, neon } from '../cast.js';

const L = (info, gt) => gt - info.shot.start;
const rim = (M, dir = [0, -1]) => ({ color: M.rim, dir, w: 5 });
const blink = (t, p = 3.1) => (t % p) > p - 0.12;
const RED = '#ff3b3b', CY = '#3fd8ff';
function scoop(g, x, y, s, fill = '#ff3b3b') { seg(g, [[x + 60 * s, y - 10 * s], [x + 200 * s, y - 60 * s]], 16 * s, '#0b0f1c'); g.fillStyle = '#0b0f1c'; g.beginPath(); g.ellipse(x, y, 80 * s, 50 * s, 0, 0, Math.PI); g.fill(); g.fillStyle = fill; g.beginPath(); g.ellipse(x, y, 76 * s, 22 * s, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = alpha(CY, 0.6); g.lineWidth = 3; g.beginPath(); g.ellipse(x, y, 80 * s, 50 * s, 0, 0, Math.PI); g.stroke(); }
function mug(g, x, y, s, t) { rr(g, x - 70 * s, y - 150 * s, 140 * s, 150 * s, 16 * s); g.fillStyle = '#e8e2d8'; g.fill(); ring(g, x + 80 * s, y - 80 * s, 38 * s, 16 * s, '#e8e2d8'); g.fillStyle = '#3a2418'; g.beginPath(); g.ellipse(x, y - 150 * s, 66 * s, 14 * s, 0, 0, 7); g.fill();
  for (let i = 0; i < 3; i++) { g.strokeStyle = alpha('#ffffff', 0.25); g.lineWidth = 6 * s; g.beginPath(); for (let k = 0; k <= 20; k++) { const yy = y - 170 * s - k * 9 * s, xx = x + (i - 1) * 32 * s + Math.sin(k * 0.5 - t * 3 + i) * 12 * s; k ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); } }
function molecule(g, x, y, s, a, t) { if (a <= 0) return; g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(Math.sin(t * 0.5) * 0.08); g.scale(s, s); g.shadowColor = CY; g.shadowBlur = 25; g.strokeStyle = CY; g.lineWidth = 7;
  const hex = (cx, cy, r) => { g.beginPath(); for (let i = 0; i < 6; i++) { const an = Math.PI / 6 + i * Math.PI / 3; g.lineTo(cx + Math.cos(an) * r, cy + Math.sin(an) * r); } g.closePath(); g.stroke(); };
  hex(-60, 0, 80); poly; g.beginPath(); g.moveTo(9, -40); g.lineTo(90, -70); g.lineTo(140, 0); g.lineTo(90, 70); g.lineTo(9, 40); g.stroke();
  for (const [px, py, l] of [[-60, -80, 'O'], [-130, 40, 'N'], [140, 0, 'N'], [-60, 80, 'N'], [90, -70, 'C']]) { circle(g, px, py, 22, '#04080f'); text(g, l, px, py + 2, { size: 30, color: '#ffffff', font: FONTS.ui, weight: 900 }); }
  g.restore(); }
function sparks(g, t, x, y, r, n, c = CY, seed = 1) { for (let i = 0; i < n; i++) { const a = i * 2.39 + seed, ph = (t * 3 + i * 0.37) % 1, rr2 = r * (0.3 + 0.7 * ((i * 53) % 10) / 10); const px = x + Math.cos(a) * rr2, py = y + Math.sin(a) * rr2; if (ph < 0.5) FX.sparkle(g, px, py, 10 + 14 * Math.sin(ph * Math.PI * 2), c, 0.9); } }
function bar(g, x, y, w, h, v, c, label) { text(g, label, x, y - 40, { size: 44, color: '#cfe8ff', font: FONTS.ui, weight: 900, align: 'left', spacing: 3 }); rr(g, x, y, w, h, h / 2); g.fillStyle = alpha(c, 0.12); g.fill(); g.strokeStyle = alpha(c, 0.4); g.lineWidth = 2; g.stroke(); if (v > 0.01) { g.save(); g.shadowColor = c; g.shadowBlur = 25; rr(g, x, y, Math.max(h, w * v), h, h / 2); g.fillStyle = c; g.fill(); g.restore(); } }

// p01 — "Pre-workout."  storm, lightning, tub under the spotlight
registerShot('p01', { draw(g, t, info) {
  const cam = { z: 1.15 - 0.08 * ease.inOut(t / info.dur), y: 60 };
  const { GY, CX, M } = noirGym(g, t, cam, { gt: info.globalT });
  layer(g, cam, 1, (g) => { rr(g, CX - 160, GY - 90, 320, 90, 8); g.fillStyle = '#05080f'; g.fill(); tub(g, CX, GY - 90, 1.5, 'PRE-WORKOUT'); });
  haze(g, t);
  text(g, 'PRE-WORKOUT', E.W / 2, E.H * 0.2, { size: 120, color: '#ffffff', glow: 40, glowColor: CY, spacing: 8, alpha: ease.out(prog(t, 0.05, 0.4)) });
} });

// p02 — "Magic in a scoop, or just expensive coffee?"  scoop sparkles -> coffee with price tag
registerShot('p02', { draw(g, t, info) {
  const cam = { z: 1.0 + 0.05 * t, x: -15 * t };
  const M = mood('night'), GY = E.H * 0.6, cof = L(info, 3.02);
  layer(g, cam, 0.3, (g) => { g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#02040a', '#0a1222', '#02040a']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, E.H, ['#121a2c', '#02040a']); g.fillRect(-E.W, GY, E.W * 3, E.H); FX.lightCone(g, E.W * 0.3, -50, { spread: 0.5, len: 1400, color: '#cfe6ff', a: 0.16 }); FX.lightCone(g, E.W * 0.72, -50, { spread: 0.5, len: 1400, color: M.practical, a: 0.14 * prog(t, cof - 0.3, cof) }); });
  layer(g, cam, 1, (g) => {
    const sx = E.W * 0.3, sy = GY - 40; FX.pool(g, sx, GY + 30, 220, 40, '#cfe6ff', 0.4);
    scoop(g, sx - 60, sy, 1.3); sparks(g, t, sx - 60, sy - 140, 170, 10, CY);
    text(g, 'MAGIC?', sx - 20, sy - 360, { size: 70, color: CY, glow: 30, glowColor: CY, spacing: 4, alpha: ease.out(prog(t, 0.1, 0.4)) });
    const k = popIn(t, cof - 0.15); if (k > 0) { const cx = E.W * 0.72; FX.pool(g, cx, GY + 30, 220, 40, M.practical, 0.35); g.save(); g.translate(cx, GY + 20); g.scale(k, k); mug(g, 0, 0, 1.3, t); g.restore();
      g.save(); g.translate(cx + 120, GY - 330); g.rotate(0.15); g.scale(k, k); rr(g, -90, -45, 180, 90, 14); g.fillStyle = M.practical; g.fill(); text(g, '$$$', 0, 4, { size: 60, color: '#1a0e04', font: FONTS.ui, weight: 900 }); g.restore(); }
  });
  haze(g, t);
} });

// p03 — "The main thing doing the work is caffeine."  hero under the spotlight, molecule appears
registerShot('p03', { draw(g, t, info) {
  const cam = { z: 1.2 + 0.06 * t, y: 120 }, c = L(info, 6.16);
  const { GY, CX, M } = noirGym(g, t, cam, { gt: info.globalT });
  layer(g, cam, 1, (g) => neon(g, { x: CX - 20, y: GY, s: 2.5, facing: 1, outfit: HERO, pose: breathe(posesAt(t, [[0, 'crossArms'], [c, 'pointUp']]), t), expr: 'determined', look: [0.2, -0.8], blink: blink(t), rim: rim(M) }, 24));
  haze(g, t);
  molecule(g, E.W / 2 + 20, E.H * 0.17, 1.1, ease.out(prog(t, c - 0.2, c + 0.2)), t);
  pill(g, 'CAFFEINE', E.W / 2, E.H * 0.31, { size: 70, sc: popIn(t, c) });
} });

// p04 — "Research shows it can boost strength and endurance a little."
registerShot('p04', { draw(g, t, info) {
  const cam = { z: 1.0 + 0.04 * t };
  layer(g, cam, 0.3, (g) => { g.fillStyle = '#03060c'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); g.strokeStyle = alpha(CY, 0.06); g.lineWidth = 1; for (let x = 0; x < E.W; x += 60) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, E.H); g.stroke(); } for (let y = 0; y < E.H; y += 60) { g.beginPath(); g.moveTo(0, y); g.lineTo(E.W, y); g.stroke(); } glow(g, E.W / 2, E.H * 0.38, 700, '#1a3a6a', 0.5); });
  text(g, 'RESEARCH', E.W / 2, E.H * 0.13, { size: 54, color: '#6f8aa6', font: FONTS.ui, weight: 900, spacing: 10, alpha: ease.out(prog(t, 0, 0.3)) });
  const s1 = L(info, 8.34), s2 = L(info, 8.84);
  bar(g, 140, E.H * 0.25, 800, 46, 0.5 + 0.12 * ease.out(prog(t, s1, s1 + 0.6)), CY, 'STRENGTH');
  bar(g, 140, E.H * 0.36, 800, 46, 0.5 + 0.1 * ease.out(prog(t, s2, s2 + 0.6)), '#5fffb0', 'ENDURANCE');
  for (const [y, t0] of [[0.25, s1], [0.36, s2]]) { const a = ease.out(prog(t, t0 + 0.4, t0 + 0.7)); text(g, '+', 140 + 800 * 0.62 + 50, E.H * y + 22, { size: 70, color: '#ffffff', alpha: a, glow: 20, glowColor: CY }); }
  text(g, '...A LITTLE', E.W / 2, E.H * 0.47, { size: 64, color: '#ffffff', italic: true, font: FONTS.serif, weight: 900, alpha: ease.out(prog(t, L(info, 9.2), L(info, 9.5))), glow: 20, glowColor: CY });
  layer(g, cam, 1, (g) => { const GY = E.H * 0.7; FX.pool(g, E.W / 2, GY + 8, 260, 40, '#cfe6ff', 0.3); neon(g, { x: E.W / 2, y: GY, s: 1.5, facing: 1, outfit: HERO, pose: breathe(posesAt(t, [[0, 'think'], [L(info, 9.2), 'shrug']]), t), expr: 'thinking', look: [0, -1], blink: blink(t), rim: rim(mood('night')) }); });
} });

// p05 — "That tingly feeling?"  giant face in the dark, sparks on the skin
registerShot('p05', { draw(g, t, info) {
  const M = mood('storm');
  blurLayer(g, 14, (g) => noirGym(g, t, { z: 1.6, x: 150, y: -250 }, { gt: info.globalT })); veil(g, '#000000', 0.45);
  const r = 340 * (1 + 0.05 * t), cx = E.W / 2, cy = E.H * 0.47;
  g.save(); g.shadowColor = 'rgba(40,200,255,.7)'; g.shadowBlur = 40; bigFace(g, cx, cy, r, { outfit: HERO, expr: t < 0.5 ? 'confused' : 'nervous', look: [-0.4, 0.3], rimColor: M.rim, rimSide: -1, blink: blink(t, 2.2) }); g.restore();
  sparks(g, t, cx - r * 0.5, cy + r * 0.55, r * 0.45, 9, '#ffffff', 2); sparks(g, t, cx + r * 0.55, cy + r * 0.2, r * 0.35, 7, CY, 5);
  FX.rings(g, cx, cy, t, { count: 2, r0: r * 1.05, r1: r * 1.4, color: CY, a: 0.25 });
} });

// p06 — "That's beta-alanine. Harmless, just weird."
registerShot('p06', { draw(g, t, info) {
  const cam = { z: 1.15 + 0.05 * t, y: 80, x: 20 }, b = L(info, 11.76), h = L(info, 12.82);
  const { GY, CX, M } = noirGym(g, t, cam, { gt: info.globalT });
  const jit = t > 0.2 ? shake(t, 3, 12) : [0, 0];
  layer(g, cam, 1, (g) => { neon(g, { x: CX + jit[0], y: GY, s: 2.5, facing: 1, outfit: HERO, pose: breathe(posesAt(t, [[0, 'crossArms'], [h + 0.3, 'shrug']]), t), expr: t < h ? 'confused' : 'smirk', blink: blink(t), rim: rim(M) });
    sparks(g, t, CX + 10, GY - 380, 140, 10, CY, 3); sparks(g, t, CX - 30, GY - 200, 120, 6, '#ffffff', 8); });
  haze(g, t);
  pill(g, 'BETA-ALANINE', E.W / 2, E.H * 0.13, { size: 70, sc: popIn(t, b - 0.1) });
  const k = popIn(t, h); if (k > 0) { g.save(); g.translate(E.W / 2 - 60, E.H * 0.23); g.scale(k, k); pill(g, 'HARMLESS', 0, 0, { size: 58, line: '#5fffb0' }); check(g, 250, 0, 1.2, '#5fffb0'); g.restore(); }
} });

// p07 — "You don't need a crazy dose."  scoops pile into a shaker, red alarm
registerShot('p07', { draw(g, t, info) {
  const cam = { z: 1.1 + 0.08 * t };
  const M = mood('night'), GY = E.H * 0.62, red = prog(t, 0.6, 1.2);
  layer(g, cam, 0.3, (g) => { g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#02040a', '#0a1020', '#02040a']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); glow(g, E.W / 2, E.H * 0.4, 800, RED, 0.25 * red * (0.7 + 0.3 * Math.sin(t * 12))); });
  layer(g, cam, 1, (g) => {
    FX.pool(g, E.W / 2, GY + 10, 280, 40, '#cfe6ff', 0.35);
    // shaker
    poly(g, [[E.W / 2 - 120, GY - 480], [E.W / 2 + 120, GY - 480], [E.W / 2 + 100, GY], [E.W / 2 - 100, GY]], alpha('#cfe6ff', 0.12)); g.strokeStyle = alpha('#cfe6ff', 0.6); g.lineWidth = 4; g.stroke();
    const n = (t > 0.15) + (t > 0.55) + (t > 0.95); g.fillStyle = RED; g.fillRect(E.W / 2 - 100, GY - 90 * n, 200, 90 * n);
    for (let i = 0; i < 3; i++) { const t0 = 0.0 + i * 0.4, d = prog(t, t0, t0 + 0.2); if (d > 0 && d < 1) scoop(g, E.W / 2 + 40, lerp(GY - 900, GY - 520, ease.in(d)), 1.1); }
    for (let i = 0; i < n; i++) text(g, String(i + 1), E.W / 2 + 200, GY - 45 - 90 * i, { size: 56, color: RED, font: FONTS.ui, weight: 900, glow: 16, glowColor: RED });
  });
  pill(g, 'CRAZY DOSE?', E.W / 2, E.H * 0.13, { size: 72, line: RED, sc: popIn(t, 0.7) });
  FX.dust(g, t, { count: 30, color: '#ffd0d0', a: 0.3 });
} });

// p08 — "More stimulant doesn't mean more gains."
registerShot('p08', { draw(g, t, info) {
  const cam = { z: 1.0 + 0.03 * t }, g2 = L(info, 17.8);
  layer(g, cam, 0.3, (g) => { g.fillStyle = '#03060c'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); glow(g, E.W / 2, E.H * 0.35, 700, '#3a0a0a', 0.5); });
  bar(g, 140, E.H * 0.2, 800, 46, ease.inOut(prog(t, 0.1, 1.2)) * 0.98, RED, 'STIMULANT');
  bar(g, 140, E.H * 0.31, 800, 46, 0.42 + 0.02 * Math.sin(t * 4), CY, 'GAINS');
  const k = popIn(t, g2 - 0.1); if (k > 0) { g.save(); g.translate(E.W / 2, E.H * 0.45); g.scale(k, k); pill(g, 'MORE ≠ BETTER', 0, 0, { size: 66, line: RED }); g.restore(); }
  layer(g, cam, 1, (g) => { const GY = E.H * 0.72; FX.pool(g, E.W / 2, GY + 8, 260, 40, '#cfe6ff', 0.3); const jit = shake(t, 4 * prog(t, 0.6, 1.2), 14); neon(g, { x: E.W / 2 + jit[0], y: GY, s: 1.6, facing: 1, outfit: HERO, pose: breathe(posesAt(t, [[0, 'ready'], [g2, 'facepalm']]), t), expr: t < g2 ? 'scared' : 'sad', blink: false, rim: rim(mood('night')) }); });
} });

// p09 — "Skip it late in the day, or your sleep pays for it."  awake in bed at night
registerShot('p09', { draw(g, t, info) {
  const cam = { z: 1.0 + 0.05 * t, y: 40 }, sl = L(info, 20.34);
  const { GY, CX, M } = bedroom(g, t, cam);
  layer(g, cam, 1, (g) => {
    FX.bed(g, { x: CX - 300, y: GY, w: 560, color: '#1a2440', frame: '#070b14', pillow: '#3a4a6a' });
    neon(g, { x: CX + 75, y: GY - 5, s: 1.6, rot: -Math.PI / 2, facing: 1, outfit: HERO, pose: POSES.lie, expr: 'shocked', look: [0, -1], blink: false, rim: rim(M, [0.3, -1]), shadow: false });
    g.fillStyle = '#1a2440'; rr(g, CX - 120, GY - 125, 380, 55, 20); g.fill();
    // nightstand + red alarm clock
    g.fillStyle = '#070b14'; g.fillRect(CX + 280, GY - 170, 190, 170);
    rr(g, CX + 290, GY - 260, 170, 90, 14); g.fillStyle = '#05070c'; g.fill(); text(g, (t < 1 ? '11:5' + Math.min(9, 7 + Math.floor(t * 3)) : '12:0' + Math.floor((t - 1) * 3)) , CX + 375, GY - 214, { size: 52, color: RED, font: FONTS.ui, weight: 900, glow: 20, glowColor: RED });
  });
  FX.dust(g, t, { count: 25, color: '#cfe4ff', a: 0.3 });
  pill(g, 'LATE = BAD SLEEP', E.W / 2, E.H * 0.13, { size: 62, line: RED, sc: popIn(t, sl - 0.1) });
} });

// p10 — "Heart issues? Ask your doctor first."  ECG + doctor backlit in a doorway
registerShot('p10', { draw(g, t, info) {
  const cam = { z: 1.08 + 0.05 * t }, a = L(info, 22.38);
  const { GY, CX, M } = noirGym(g, t, cam, { gt: info.globalT, spot: E.W / 2 + 200 });
  layer(g, cam, 1, (g) => {
    neon(g, { x: CX - 230, y: GY, s: 2.3, facing: 1, outfit: HERO, pose: breathe(posesAt(t, [[0, 'sad'], [a, 'relaxed']]), t), expr: t < a ? 'worried' : 'neutral', look: [1, 0], blink: blink(t), rim: rim(M) });
    drawFigure(g, { x: CX + 230, y: GY, s: 2.35, facing: -1, outfit: DOC, pose: breathe(posesAt(t, [[0, 'stand'], [a - 0.1, 'explain']]), t, 1, 3), expr: 'neutral', blink: blink(t, 2.7), rim: rim(M), ink: '#05080f', inkFar: '#1a2232' });
  });
  haze(g, t);
  // ECG line
  const y0 = E.H * 0.15, w = E.W - 160; g.save(); g.shadowColor = RED; g.shadowBlur = 20; g.strokeStyle = RED; g.lineWidth = 6; g.beginPath();
  for (let i = 0; i <= 200; i++) { const u = i / 200; if (u > prog(t, 0, 0.8)) break; const ph = (u * 3) % 1; const yy = ph > 0.45 && ph < 0.5 ? -90 : ph > 0.5 && ph < 0.55 ? 60 : 0; i ? g.lineTo(80 + u * w, y0 + yy) : g.moveTo(80, y0); } g.stroke(); g.restore();
  pill(g, 'HEART ISSUES?', E.W / 2, E.H * 0.25, { size: 64, line: RED, sc: popIn(t, 0.1) });
  pill(g, 'ASK YOUR DOCTOR FIRST', E.W / 2, E.H * 0.33, { size: 52, line: '#5fffb0', sc: popIn(t, a) });
} });

// p11 — "Follow for more no-hype training science."
registerShot('p11', { draw(g, t, info) {
  const cam = { z: 1.2 - 0.05 * t, y: 80 };
  const { GY, CX, M } = noirGym(g, t, cam, { gt: info.globalT });
  layer(g, cam, 1, (g) => neon(g, { x: CX - 10, y: GY, s: 2.5, facing: 1, outfit: HERO, pose: breathe(posesAt(t, [[0, 'crossArms'], [0.4, 'point'], [2.2, 'crossArms']]), t), expr: 'determined', blink: blink(t), rim: rim(M) }, 30));
  haze(g, t); FX.rain(g, t, { count: 140, a: 0.18 });
  const k = popIn(t, 0.15, 0.45); if (k > 0) { g.save(); g.translate(E.W / 2, E.H * 0.14); g.scale(k, k); rr(g, -320, -80, 640, 160, 80); g.fillStyle = 'rgba(4,8,18,.9)'; g.fill(); g.strokeStyle = CY; g.lineWidth = 5; g.shadowColor = CY; g.shadowBlur = 35; g.stroke(); g.shadowBlur = 0; text(g, '+ FOLLOW', 0, 4, { size: 90, color: '#ffffff', spacing: 4 }); g.restore(); }
  text(g, 'NO-HYPE', E.W / 2, E.H * 0.235, { size: 86, color: '#ffffff', alpha: ease.out(prog(t, L(info, 24.5), L(info, 24.9))), glow: 30, glowColor: CY, spacing: 6 });
  text(g, 'TRAINING SCIENCE', E.W / 2, E.H * 0.29, { size: 70, color: CY, alpha: ease.out(prog(t, L(info, 25.0), L(info, 25.4))), glow: 30, glowColor: CY, spacing: 4 });
} });
