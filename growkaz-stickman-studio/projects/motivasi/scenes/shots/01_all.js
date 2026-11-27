// shots/01_all.js — Kau Penat? Bagus. (Malay gym motivation, dark cinematic, 13 shots)
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, key, clamp, lerp, shake, seg, circle, ring, rr, poly, glow, alpha, shade, linGrad, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { noirGym, haze, bedroom, pill, popIn, check, cross } from '../sets/noir.js';
import { HERO, neon } from '../cast.js';

const L = (info, gt) => gt - info.shot.start;
const rim = (M, dir = [0, -1]) => ({ color: M.rim, dir, w: 5 });
const blink = (t, p = 3.1) => (t % p) > p - 0.12;
const RED = '#ff3b3b', CY = '#3fd8ff', GOLD = '#ffb24a';
const FLEX = { ...POSES.stand, eF: [40, -190], hF: [36, -236], eB: [-36, -190], hB: [-30, -236] };
const PRESS_DN = { ...POSES.stand, eF: [30, -150], hF: [22, -190], eB: [-18, -150], hB: [-12, -190] };
const PRESS_UP = { ...POSES.stand, head: [6, -206], eF: [18, -226], hF: [14, -268], eB: [-8, -226], hB: [-8, -268] };
const lerpPose = (a, b, k) => { const o = {}; for (const n of Object.keys(a)) o[n] = [lerp(a[n][0], b[n][0], k), lerp(a[n][1], b[n][1], k)]; return o; };
function sweat(g, t, x, y, r) { for (let i = 0; i < 5; i++) { const ph = (t * 0.6 + i * 0.23) % 1, px = x + Math.cos(i * 2.1) * r, py = y + Math.sin(i * 1.3) * r * 0.5 + ph * 160; g.save(); g.globalAlpha = 1 - ph; g.fillStyle = '#dff6ff'; g.beginPath(); g.moveTo(px, py - 22); g.quadraticCurveTo(px + 13, py, px, py + 10); g.quadraticCurveTo(px - 13, py, px, py - 22); g.fill(); g.restore(); } }
function bigWord(g, str, y, t0, t, o = {}) { const a = ease.out(prog(t, t0, t0 + 0.35)); if (a <= 0) return; const s = 1 + 0.15 * (1 - a); g.save(); g.translate(E.W / 2, y); g.scale(s, s); text(g, str, 0, 0, { size: o.size || 120, color: o.color || '#ffffff', alpha: a * (o.a ?? 1), glow: 40, glowColor: o.glow || CY, spacing: o.spacing ?? 8 }); g.restore(); }
function doorway(g, x, GY, w, h, open, M) { // bright door in the dark wall
  g.fillStyle = '#02040a'; g.fillRect(x - w / 2 - 20, GY - h - 20, w + 40, h + 20);
  const ow = w * open; g.fillStyle = linGrad(g, 0, GY - h, 0, GY, ['#fff6e0', '#ffd79a']); g.fillRect(x - w / 2, GY - h, ow, h);
  g.fillStyle = '#0a0f1a'; g.fillRect(x - w / 2 + ow, GY - h, w - ow, h);
  glow(g, x - w / 2 + ow / 2, GY - h / 2, h * 0.9 * open + 1, '#ffd79a', 0.55 * open);
  g.save(); g.globalCompositeOperation = 'lighter'; poly(g, [[x - w / 2, GY], [x - w / 2 + ow, GY], [x + w * 1.6 * open, GY + 600], [x - w * 1.6 * open, GY + 600]], alpha('#ffd79a', 0.35 * open)); g.restore();
}

// m01 — "Kau penat? Bagus."  sweaty giant face, thunder
registerShot('m01', { draw(g, t, info) {
  const M = mood('storm');
  blurLayer(g, 14, (g) => noirGym(g, t, { z: 1.6, x: 150, y: -250 }, { gt: info.globalT })); veil(g, '#000', 0.5);
  const r = 340 * (1 + 0.05 * t), cx = E.W / 2, cy = E.H * 0.47, b = L(info, 1.02);
  g.save(); g.shadowColor = 'rgba(40,200,255,.7)'; g.shadowBlur = 40; bigFace(g, cx, cy, r, { outfit: HERO, expr: t < b ? 'sad' : 'determined', look: [0, 0.2], rimColor: M.rim, rimSide: -1, blink: false }); g.restore();
  sweat(g, t, cx, cy - r * 0.4, r * 0.7);
  bigWord(g, 'BAGUS.', E.H * 0.13, b, t, { size: 140 });
} });

// m02 — "Maksudnya kau tengah berubah."  hero rises into the spotlight
registerShot('m02', { draw(g, t, info) {
  const cam = { z: 1.25 - 0.1 * ease.inOut(t / info.dur), y: 120 }, b = L(info, 2.98);
  const { GY, CX, M } = noirGym(g, t, cam, { gt: info.globalT });
  layer(g, cam, 1, (g) => { glow(g, CX, GY - 260, 380, CY, 0.35 * prog(t, b - 0.3, b + 0.4));
    neon(g, { x: CX - 10, y: GY, s: 2.5, facing: 1, outfit: HERO, pose: breathe(posesAt(t, [[0, 'kneel'], [0.8, 'stand']]), t), expr: 'determined', blink: blink(t), rim: rim(M) }, 24 + 30 * prog(t, b - 0.3, b + 0.4)); });
  haze(g, t);
  bigWord(g, 'BERUBAH', E.H * 0.17, b - 0.1, t, { size: 130 });
} });

// m03 — "Semua orang nak badan sasa."  double-biceps silhouette
registerShot('m03', { draw(g, t, info) {
  const cam = { z: 1.15 + 0.06 * t, y: 80 }, s = L(info, 5.14);
  const { GY, CX, M } = noirGym(g, t, cam, { gt: info.globalT });
  layer(g, cam, 1, (g) => { neon(g, { x: CX, y: GY, s: 2.6, facing: 1, outfit: HERO, pose: breathe(posesAt(t, [[0, 'stand'], [s - 0.3, FLEX]]), t), expr: 'smirk', blink: blink(t), rim: rim(M) }); });
  haze(g, t);
  bigWord(g, 'BADAN SASA', E.H * 0.15, s - 0.1, t, { size: 110, color: GOLD, glow: GOLD });
} });

// m04 — "Tapi tak ramai sanggup bangun pukul enam pagi,"  alarm 6:00
registerShot('m04', { draw(g, t, info) {
  const cam = { z: 1.0 + 0.05 * t, y: 40 }, six = L(info, 7.44);
  const { GY, CX, M } = bedroom(g, t, cam);
  layer(g, cam, 1, (g) => {
    FX.bed(g, { x: CX - 300, y: GY, w: 560, color: '#1a2440', frame: '#070b14', pillow: '#3a4a6a' });
    neon(g, { x: CX + 75, y: GY - 5, s: 1.6, rot: -Math.PI / 2, facing: 1, outfit: HERO, pose: POSES.lie, expr: 'sleepy', blink: true, rim: rim(M, [0.3, -1]), shadow: false });
    g.fillStyle = '#1a2440'; rr(g, CX - 120, GY - 125, 380, 55, 20); g.fill();
    g.fillStyle = '#070b14'; g.fillRect(CX + 280, GY - 170, 190, 170);
    const on = t < six || Math.floor(t * 4) % 2 === 0;
    rr(g, CX + 290, GY - 260, 170, 90, 14); g.fillStyle = '#05070c'; g.fill();
    if (on) text(g, t < six ? '5:59' : '6:00', CX + 375, GY - 214, { size: 58, color: RED, font: FONTS.ui, weight: 900, glow: 24, glowColor: RED });
    if (t > six) FX.rings(g, CX + 375, GY - 214, t - six, { count: 3, r0: 60, r1: 220, color: RED, a: 0.5, speed: 2 });
  });
  FX.dust(g, t, { count: 25, color: '#cfe4ff', a: 0.3 });
  bigWord(g, '6:00 PAGI', E.H * 0.14, six, t, { size: 110, color: RED, glow: RED });
} });

// m05 — "bila katil tengah panggil nama kau."  bed pulls him back
registerShot('m05', { draw(g, t, info) {
  const cam = { z: 1.12 + 0.05 * t, y: 60 }, k = L(info, 8.6);
  const { GY, CX, M } = bedroom(g, t, cam);
  layer(g, cam, 1, (g) => {
    FX.bed(g, { x: CX - 300, y: GY, w: 560, color: '#1a2440', frame: '#070b14', pillow: '#3a4a6a' });
    glow(g, CX - 40, GY - 100, 420, '#7f9cff', 0.3 + 0.15 * Math.sin(t * 5));
    const up = key(t, [[0, 0], [0.5, 1], [k + 0.6, 1], [k + 1.1, 0.35], [info.dur, 0.25]]);
    neon(g, { x: CX - 150, y: GY - 75, s: 1.6, facing: 1, outfit: HERO, pose: { ...POSES.sit }, rot: (1 - up) * -1.3, expr: up > 0.6 ? 'sleepy' : 'sad', blink: t > k, rim: rim(M, [0.3, -1]), shadow: false });
    g.fillStyle = '#1a2440'; rr(g, CX - 160, GY - 120, 420, 55, 20); g.fill();
    if (t > k) FX.rings(g, CX + 60, GY - 110, t - k, { count: 3, r0: 40, r1: 300, color: '#9fb4ff', a: 0.4, speed: 1.2 });
  });
  const kk = L(info, 9.56); if (t > kk) for (let i = 0; i < 3; i++) text(g, 'z', E.W / 2 + 140 + i * 60, E.H * 0.45 - i * 70 - (t - kk) * 30, { size: 60 + i * 20, color: '#9fb4ff', alpha: clamp((t - kk - i * 0.15) * 3) * 0.8, glow: 20, glowColor: '#9fb4ff' });
  FX.dust(g, t, { count: 25, color: '#cfe4ff', a: 0.3 });
} });

// m06 — "Gym tak kisah kau lemah hari ni."  alone under the light, rain
registerShot('m06', { draw(g, t, info) {
  const cam = { z: 1.2 - 0.06 * t, y: 100 }, l = L(info, 11.94);
  const { GY, CX, M } = noirGym(g, t, cam, { gt: info.globalT });
  layer(g, cam, 1, (g) => neon(g, { x: CX - 10, y: GY, s: 2.4, facing: 1, outfit: HERO, pose: breathe(POSES.sad, t), expr: 'sad', look: [0.3, 0.8], blink: blink(t), rim: rim(M) }, 18));
  haze(g, t); FX.rain(g, t, { count: 120, a: 0.16 });
  bigWord(g, 'LEMAH?', E.H * 0.15, l, t, { size: 120, color: '#9fb4c8', glow: '#2a4a6a' });
} });

// m07 — "Gym cuma tanya satu soalan."  the gym door slowly opens
registerShot('m07', { draw(g, t, info) {
  const cam = { z: 1.0 + 0.08 * ease.inOut(t / info.dur), y: 40 };
  const M = mood('storm'), GY = E.H * 0.68, CX = E.W / 2;
  layer(g, cam, 0.4, (g) => { g.fillStyle = linGrad(g, 0, 0, 0, GY, ['#02040a', '#0b1220']); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H); doorway(g, CX, GY, 300, 640, ease.inOut(prog(t, 0.2, 2.2)) * 0.85, M); });
  layer(g, cam, 0.85, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 700, ['#0a101c', '#02040a']); g.fillRect(-E.W, GY, E.W * 3, E.H); });
  layer(g, cam, 1, (g) => neon(g, { x: CX - 300, y: GY + 120, s: 1.9, facing: 1, outfit: HERO, pose: breathe(POSES.stand, t), expr: 'neutral', look: [1, -0.3], blink: blink(t), rim: { color: '#ffd79a', dir: [1, -0.3], w: 5 } }));
  FX.dust(g, t, { count: 50, color: '#ffe6c0', a: 0.4, area: [CX - 300, 300, 600, 1000] });
  pill(g, 'SATU SOALAN', E.W / 2, E.H * 0.13, { size: 66, line: GOLD, sc: popIn(t, L(info, 13.82)) });
} });

// m08 — "Kau datang, ke tak?"  silhouette in the doorway light
registerShot('m08', { draw(g, t, info) {
  const cam = { z: 1.2 + 0.08 * t, y: 60 };
  const M = mood('storm'), GY = E.H * 0.68, CX = E.W / 2;
  layer(g, cam, 0.4, (g) => { g.fillStyle = '#02040a'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); doorway(g, CX, GY, 320, 680, 1, M); });
  layer(g, cam, 0.85, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 700, ['#0a101c', '#02040a']); g.fillRect(-E.W, GY, E.W * 3, E.H); });
  layer(g, cam, 1, (g) => drawFigure(g, { x: CX - 10, y: GY, s: 2.6, facing: 1, outfit: HERO, pose: breathe(POSES.stand, t), expr: 'determined', ink: '#03060c', inkFar: '#0a0f1a', rim: { color: '#ffd79a', dir: [0, -1], w: 7 } }));
  FX.dust(g, t, { count: 50, color: '#ffe6c0', a: 0.45, area: [CX - 300, 300, 600, 1000] });
  bigWord(g, 'KAU DATANG?', E.H * 0.13, L(info, 15.52), t, { size: 118, color: '#ffffff', glow: GOLD });
} });

// m09 — "Satu rep lagi. Satu set lagi."  heavy press, counters
registerShot('m09', { draw(g, t, info) {
  const cam = { z: 1.12 + 0.05 * t, x: 30, y: 40 }, r1 = L(info, 18.16), s1 = L(info, 19.64);
  const { GY, CX, M } = noirGym(g, t, cam, { gt: info.globalT });
  const up = key(t, [[0, 0], [r1 - 0.45, 0.3], [r1 - 0.2, 0.5], [r1, 1], [r1 + 0.5, 1], [r1 + 1.0, 0], [s1 - 0.4, 0], [s1, 1], [info.dur, 1]]);
  const sh = t > r1 - 0.6 && t < r1 ? shake(t, 5, 20) : [0, 0];
  layer(g, cam, 1, (g) => {
    const x = CX - 30 + sh[0], s = 2.5, pose = lerpPose(PRESS_DN, PRESS_UP, up);
    neon(g, { x, y: GY, s, facing: 1, outfit: HERO, pose, expr: up > 0.9 ? 'determined' : 'angry', blink: false, rim: rim(M) }, 24 + 20 * up);
    const hy = GY + pose.hF[1] * s, hx = x + pose.hF[0] * s;
    seg(g, [[hx - 260, hy], [hx + 260, hy]], 14, '#05080f');
    for (const d of [-1, 1]) { const px = hx + d * 210; rr(g, px - 26, hy - 130, 52, 260, 10); g.fillStyle = '#05080f'; g.fill(); rr(g, px - 22 + d * 50, hy - 105, 40, 210, 8); g.fill(); g.strokeStyle = alpha(CY, 0.6); g.lineWidth = 3; rr(g, px - 26, hy - 130, 52, 260, 10); g.stroke(); }
    sweat(g, t, x + 20, GY - 520, 60);
  });
  haze(g, t);
  pill(g, 'REP ' + (t < r1 ? 9 : 10), E.W / 2 - 200, E.H * 0.12, { size: 70, sc: 1 + 0.15 * clamp(1 - Math.abs(t - r1) / 0.15) });
  pill(g, 'SET ' + (t < s1 ? 3 : 4), E.W / 2 + 210, E.H * 0.12, { size: 70, line: GOLD, sc: 1 + 0.15 * clamp(1 - Math.abs(t - s1) / 0.15) });
} });

// m10 — "Itu je beza kau dengan orang yang berhenti."  hero lifts, a grey figure walks away
registerShot('m10', { draw(g, t, info) {
  const cam = { z: 1.05 + 0.04 * t, y: 60 }, q = L(info, 22.34);
  const { GY, CX, M } = noirGym(g, t, cam, { gt: info.globalT, spot: E.W / 2 - 200 });
  layer(g, cam, 1, (g) => {
    const up = 0.5 + 0.5 * Math.sin(t * 3.2);
    neon(g, { x: CX - 220, y: GY, s: 2.3, facing: 1, outfit: HERO, pose: lerpPose(PRESS_DN, PRESS_UP, up), expr: 'determined', blink: false, rim: rim(M) });
    const p = lerpPose(PRESS_DN, PRESS_UP, up), hx = CX - 220 + p.hF[0] * 2.3, hy = GY + p.hF[1] * 2.3;
    seg(g, [[hx - 200, hy], [hx + 200, hy]], 12, '#05080f'); for (const d of [-1, 1]) { rr(g, hx + d * 170 - 22, hy - 100, 44, 200, 10); g.fillStyle = '#05080f'; g.fill(); }
    const wx = CX + 260 + t * 90; drawFigure(g, { x: wx, y: GY, s: 2.0, facing: 1, pose: walkPose(t * 6.28 * 0.9), outfit: { top: 'none' }, expr: 'sad', ink: '#2a3346', inkFar: '#1a2030', rim: false, alpha: 1 - prog(t, 1.6, 2.7) });
  });
  haze(g, t);
  text(g, 'KAU', E.W * 0.3, E.H * 0.16, { size: 90, color: CY, glow: 30, glowColor: CY, alpha: ease.out(prog(t, 0.2, 0.5)), spacing: 6 });
  text(g, 'BERHENTI', E.W * 0.72, E.H * 0.16, { size: 76, color: '#6a7488', alpha: ease.out(prog(t, q - 0.2, q + 0.2)), spacing: 4 });
} });

// m11 — "Jangan tunggu motivasi."  MOTIVASI crossed out
registerShot('m11', { draw(g, t, info) {
  const cam = { z: 1.1 + 0.05 * t, y: 80 }, m = L(info, 24.38);
  const { GY, CX, M } = noirGym(g, t, cam, { gt: info.globalT });
  layer(g, cam, 1, (g) => neon(g, { x: CX, y: GY, s: 2.5, facing: 1, outfit: HERO, pose: breathe(posesAt(t, [[0, 'crossArms'], [m + 0.3, 'point']]), t), expr: 'determined', blink: blink(t), rim: rim(M) }));
  haze(g, t);
  const a = popIn(t, m - 0.1); if (a > 0) { g.save(); g.translate(E.W / 2 - 50, E.H * 0.14); g.scale(a, a); pill(g, 'MOTIVASI', 0, 0, { size: 76, line: RED, color: '#9aa4b8' }); g.restore();
    if (t > m + 0.4) { const p = ease.out(prog(t, m + 0.4, m + 0.6)); seg(g, [[E.W / 2 - 280, E.H * 0.14], [E.W / 2 - 280 + 460 * p, E.H * 0.14]], 10, RED); cross(g, E.W / 2 + 290, E.H * 0.14, 1.2 * p, RED); } }
} });

// m12 — "Disiplin yang bawa kau sampai."  walking forward with afterimages
registerShot('m12', { draw(g, t, info) {
  const cam = { z: 1.05 + 0.05 * t, x: -60 + 60 * t, y: 60 }, d = L(info, 25.64);
  const { GY, CX, M } = noirGym(g, t, cam, { gt: info.globalT, spot: E.W / 2 + 60 * t });
  layer(g, cam, 1, (g) => neon(g, { x: CX - 240 + t * 160, y: GY, s: 2.4, facing: 1, outfit: HERO, pose: walkPose(t * 6.28 * 0.9), expr: 'determined', blink: false, rim: rim(M), trail: { count: 3, dx: -50, a: 0.25 } }, 34));
  haze(g, t);
  const a = popIn(t, d); if (a > 0) { g.save(); g.translate(E.W / 2 - 50, E.H * 0.14); g.scale(a, a); pill(g, 'DISIPLIN', 0, 0, { size: 80, line: '#5fffb0' }); check(g, 300, 0, 1.3, '#5fffb0'); g.restore(); }
} });

// m13 — "Esok pagi, jumpa kat gym."  walks into the bright doorway, fade to black
registerShot('m13', { draw(g, t, info) {
  const cam = { z: 1.0 + 0.12 * ease.inOut(t / info.dur), y: 30 }, j = L(info, 29.0);
  const M = mood('storm'), GY = E.H * 0.68, CX = E.W / 2;
  layer(g, cam, 0.4, (g) => { g.fillStyle = '#02040a'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); doorway(g, CX, GY, 320, 680, 1, M); });
  layer(g, cam, 0.85, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 700, ['#0a101c', '#02040a']); g.fillRect(-E.W, GY, E.W * 3, E.H); });
  const w = prog(t, 0, 2.6), sc = lerp(2.6, 1.3, ease.inOut(w));
  layer(g, cam, 1, (g) => drawFigure(g, { x: CX, y: lerp(GY + 380, GY, ease.inOut(w)), s: sc, facing: 1, outfit: HERO, pose: w < 1 ? walkPose(t * 6.28 * 0.9) : POSES.stand, expr: 'determined', ink: '#03060c', inkFar: '#0a0f1a', rim: { color: '#ffd79a', dir: [0, -1], w: 6 } }));
  FX.dust(g, t, { count: 50, color: '#ffe6c0', a: 0.45, area: [CX - 300, 300, 600, 1000] });
  bigWord(g, 'JUMPA KAT GYM.', E.H * 0.13, j, t, { size: 104, glow: GOLD });
  veil(g, '#000', prog(t, info.dur - 0.9, info.dur - 0.1));
} });
