// sets/gym.js — yellow cinematic gym: huge bright window, racks in silhouette, warm haze. Plus props.
import { E, V, S, mood, layer, rr, seg, circle, ring, linGrad, radGrad, glow, alpha, shade, text, FONTS, ease, prog, clamp } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const gymGround = () => E.H * V(0.8, 0.68);
function rack(g, x, GY, s, c) {        // squat rack silhouette
  seg(g, [[x, GY], [x, GY - 520 * s]], 16 * s, c); seg(g, [[x + 200 * s, GY], [x + 200 * s, GY - 520 * s]], 16 * s, c);
  seg(g, [[x - 10 * s, GY - 520 * s], [x + 210 * s, GY - 520 * s]], 14 * s, c);
  seg(g, [[x - 60 * s, GY - 330 * s], [x + 260 * s, GY - 330 * s]], 9 * s, c);
  circle(g, x - 60 * s, GY - 330 * s, 46 * s, c); circle(g, x + 260 * s, GY - 330 * s, 46 * s, c);
}
function dbRack(g, x, GY, s, c) {      // dumbbell rack
  seg(g, [[x, GY], [x + 40 * s, GY - 200 * s]], 10 * s, c); seg(g, [[x + 360 * s, GY], [x + 320 * s, GY - 200 * s]], 10 * s, c);
  for (const yy of [-200, -110]) { seg(g, [[x + 20 * s, GY + yy * s + 10 * s], [x + 340 * s, GY + yy * s + 10 * s]], 8 * s, c); for (let i = 0; i < 5; i++) { const cx = x + 50 * s + i * 62 * s; circle(g, cx, GY + yy * s - 14 * s, 22 * s, c); } }
}
export function gym(g, t, cam, o = {}) {
  const M = mood(o.mood || 'golden'), GY = gymGround(), CX = E.W / 2;
  layer(g, cam, 0.25, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [M.dark, shade(M.wall, -0.15), M.wall]); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    const ww = V(980, 820), wh = V(560, 980), wx = CX - ww / 2, wy = GY - V(720, 1220);
    glow(g, CX, wy + wh * 0.5, ww * 1.1, M.sky[2], 0.55);
    FX.windowFrame(g, { x: wx, y: wy, w: ww, h: wh, cols: 3, rows: 2, frame: shade(M.wall, -0.65), bar: 16, arch: true }, (g, x, y, w, h) => {
      g.fillStyle = linGrad(g, 0, y, 0, y + h, [M.sky[2], M.sky[3], M.sky[2], M.sky[1]]); g.fillRect(x, y, w, h);
      FX.sun(g, x + w / 2, y + h * 0.5, 80, '#fffbe8', M.key, 4.5);
      FX.skyline(g, { x, y: y + h, w, maxH: h * 0.28, minH: h * 0.08, color: alpha(shade(M.sky[1], -0.25), 0.85), windowColor: alpha('#fff6c8', 0.6), seed: 9 });
    });
    FX.godRays(g, CX, wy + wh * 0.45, { count: 9, angle: Math.PI / 2, spread: 1.1, len: 2000, color: M.key, a: 0.09, t });
  });
  layer(g, cam, 0.6, (g) => {
    const c = shade(M.dark, -0.2);
    rack(g, CX - V(900, 560), GY - 30, V(1, 0.9), c); dbRack(g, CX + V(480, 210), GY - 30, V(1, 0.8), c);
  });
  layer(g, cam, 0.85, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 40, 0, GY + 700, [shade(M.floor, 0.15), M.dark]); g.fillRect(-E.W, GY - 40, E.W * 3, E.H * 2);
    FX.floorLines(g, GY - 40, GY + 700, 'rgba(0,0,0,.22)', 0.07);
    FX.pool(g, CX, GY + 20, V(620, 520), 90, M.key, 0.35);
  });
  return { GY, CX, M };
}
// plain warm studio backdrop for graphic shots
export function studio(g, t, cam, o = {}) {
  const M = mood('void'), CX = E.W / 2, GY = gymGround();
  layer(g, cam, 0.3, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H * 0.2, 0, E.H * 1.2, [M.dark, M.wall, M.sky[2], M.wall, M.dark]); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    glow(g, CX, E.H * (o.gy ?? 0.42), E.W * 0.9, M.sky[2], 0.6);
    g.strokeStyle = alpha(M.dark, 0.18); g.lineWidth = 2; for (let x = -E.W; x < E.W * 2; x += 90) { g.beginPath(); g.moveTo(x, -E.H); g.lineTo(x, E.H * 2); g.stroke(); } for (let y = -E.H; y < E.H * 2; y += 90) { g.beginPath(); g.moveTo(-E.W, y); g.lineTo(E.W * 2, y); g.stroke(); }
  });
  return { GY, CX, M };
}
// supplement tub: x centre, y bottom
export function tub(g, x, y, s, label, body = '#1a1630', band = '#ff3d6e', a = 1) {
  if (a <= 0) return; g.save(); g.globalAlpha *= a;
  const w = 150 * s, h = 190 * s;
  glow(g, x, y - h / 2, w * 1.3, '#3fd8ff', 0.25);
  rr(g, x - w / 2, y - h, w, h, 18 * s); g.fillStyle = body; g.fill();
  rr(g, x - w / 2 - 8 * s, y - h - 30 * s, w + 16 * s, 40 * s, 10 * s); g.fillStyle = shade(body, -0.35); g.fill();
  g.fillStyle = band; g.fillRect(x - w / 2, y - h * 0.68, w, h * 0.36);
  g.fillStyle = alpha('#ffffff', 0.18); g.fillRect(x - w / 2 + 12 * s, y - h + 10 * s, 12 * s, h - 20 * s);
  const fs = Math.min(30 * s, (w * 0.9) / (label.length * 0.62));
  text(g, label, x, y - h * 0.5, { size: fs, color: '#ffffff', font: FONTS.ui, weight: 900, spacing: 1 });
  g.restore();
}
// dark pill label for readable text on yellow
export function pill(g, str, x, y, o = {}) {
  const { size = 64, color = '#ffffff', bg = 'rgba(14,20,44,.9)', line = '#3fd8ff', a = 1, sc = 1 } = o; if (a <= 0) return;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(sc, sc);
  g.font = `700 ${size}px "${FONTS.title}"`; const w = g.measureText(str).width + size * 1.1, h = size * 1.45;
  rr(g, -w / 2, -h / 2, w, h, h / 2); g.fillStyle = bg; g.fill(); g.strokeStyle = line; g.lineWidth = 4; g.shadowColor = line; g.shadowBlur = 18; g.stroke(); g.shadowBlur = 0;
  text(g, str, 0, 2, { size, color, spacing: 2 }); g.restore();
}
export const popIn = (t, t0, d = 0.35) => ease.outBack(prog(t, t0, t0 + d));
