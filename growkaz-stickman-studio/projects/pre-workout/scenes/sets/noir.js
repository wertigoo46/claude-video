// sets/noir.js — dark cinematic sets: night gym in a storm (one hard spotlight), bedroom at night. Plus props.
import { E, V, S, mood, layer, rr, seg, circle, ring, poly, linGrad, radGrad, glow, alpha, shade, text, FONTS, ease, prog, rng } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const GYG = () => E.H * 0.68;
const lightningAt = (t, gt) => { for (const s of [0.05, 9.9, 18.7]) { const d = gt - s; if (d > 0 && d < 0.35) return (d < 0.06 || (d > 0.12 && d < 0.18)) ? 1 : 0.25 * (1 - d / 0.35); } return 0; };
function rack(g, x, GY, s, c) {
  seg(g, [[x, GY], [x, GY - 520 * s]], 16 * s, c); seg(g, [[x + 200 * s, GY], [x + 200 * s, GY - 520 * s]], 16 * s, c);
  seg(g, [[x - 10 * s, GY - 520 * s], [x + 210 * s, GY - 520 * s]], 14 * s, c); seg(g, [[x - 60 * s, GY - 330 * s], [x + 260 * s, GY - 330 * s]], 9 * s, c);
  circle(g, x - 60 * s, GY - 330 * s, 46 * s, c); circle(g, x + 260 * s, GY - 330 * s, 46 * s, c);
}
// night gym: tall rainy window (back-left), hard overhead spotlight at spot.x, fog
export function noirGym(g, t, cam, o = {}) {
  const M = mood('storm'), GY = GYG(), CX = E.W / 2, gt = o.gt ?? t, fl = lightningAt(t, gt), spx = o.spot ?? CX;
  layer(g, cam, 0.25, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [M.dark, M.wall]); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    const wx = CX - V(700, 520), wy = GY - V(800, 1250), ww = V(420, 360), wh = V(640, 980);
    FX.windowFrame(g, { x: wx, y: wy, w: ww, h: wh, cols: 2, rows: 3, frame: '#020409', bar: 14 }, (g, x, y, w, h) => {
      g.fillStyle = linGrad(g, 0, y, 0, y + h, M.sky); g.fillRect(x, y, w, h);
      FX.skyline(g, { x, y: y + h, w, maxH: h * 0.45, color: '#03060d', windowColor: alpha(M.practical, 0.5), lit: 0.2, seed: 3 });
      if (fl > 0) { g.fillStyle = alpha('#dfeaff', 0.7 * fl); g.fillRect(x, y, w, h); }
      FX.rain(g, t, { area: [x, y, w, h], count: 60, color: '#9fc0e8', a: 0.35 });
    });
    glow(g, wx + ww / 2, wy + wh / 2, ww * 1.2, '#4a6a9a', 0.12 + 0.5 * fl);
  });
  layer(g, cam, 0.6, (g) => { rack(g, CX + V(420, 250), GY - 30, V(1, 0.85), '#04070e'); });
  layer(g, cam, 0.85, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 40, 0, GY + 700, [M.floor, M.dark]); g.fillRect(-E.W, GY - 40, E.W * 3, E.H * 2);
    FX.floorLines(g, GY - 40, GY + 700, 'rgba(0,0,0,.35)', 0.07);
    // window light spilling on the floor
    g.save(); g.globalCompositeOperation = 'lighter'; poly(g, [[CX - V(700, 520), GY - 30], [CX - V(280, 160), GY - 30], [CX + V(100, 120), GY + 500], [CX - V(900, 700), GY + 500]], alpha('#6a8ac0', 0.05 + 0.3 * fl)); g.restore();
  });
  layer(g, cam, 0.95, (g) => {
    // hard top spotlight
    seg(g, [[spx, -E.H], [spx, GY - V(900, 1150)]], 6, '#05080f'); rr(g, spx - 50, GY - V(900, 1150), 100, 46, 10); g.fillStyle = '#0a0f1a'; g.fill();
    FX.lightCone(g, spx, GY - V(860, 1110), { angle: Math.PI / 2, spread: 0.42, len: V(1000, 1250), color: M.key, a: 0.22 });
    glow(g, spx, GY - V(860, 1110), 90, M.key, 0.9);
    FX.pool(g, spx, GY + 10, 330, 60, M.key, 0.45);
  });
  return { GY, CX, M, fl };
}
// atmosphere drawn last (fog + dust in light)
export function haze(g, t, o = {}) {
  const M = mood('storm');
  FX.fog(g, E.H * 0.55, E.H * 0.3, M.fog, 0.22);
  FX.dust(g, t, { count: 45, color: '#cfe4ff', a: 0.35, area: [E.W * 0.15, E.H * 0.1, E.W * 0.7, E.H * 0.7] });
}
// bedroom at night: moonlit window, bed, red alarm clock
export function bedroom(g, t, cam) {
  const M = mood('night'), GY = GYG(), CX = E.W / 2;
  layer(g, cam, 0.3, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [M.dark, M.wall]); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    const wx = CX - 180, wy = GY - 1150, ww = 360, wh = 520;
    FX.windowFrame(g, { x: wx, y: wy, w: ww, h: wh, cols: 2, rows: 2, frame: '#020409', bar: 12, blinds: 0 }, (g, x, y, w, h) => {
      g.fillStyle = linGrad(g, 0, y, 0, y + h, M.sky); g.fillRect(x, y, w, h); FX.stars(g, t, { area: [x, y, w, h * 0.7], count: 40 }); FX.moon(g, x + w * 0.65, y + h * 0.3, 40);
    });
    FX.godRays(g, CX + 40, GY - 900, { count: 6, angle: Math.PI / 2 + 0.25, spread: 0.6, len: 1300, color: '#9fc0ff', a: 0.07, t });
  });
  layer(g, cam, 0.85, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 40, 0, GY + 700, [M.floor, M.dark]); g.fillRect(-E.W, GY - 40, E.W * 3, E.H * 2);
  });
  return { GY, CX, M };
}
export function tub(g, x, y, s, label, body = '#0b0f1c', band = '#ff3b3b', a = 1) {
  if (a <= 0) return; g.save(); g.globalAlpha *= a; const w = 150 * s, h = 190 * s;
  rr(g, x - w / 2, y - h, w, h, 18 * s); g.fillStyle = body; g.fill(); g.strokeStyle = alpha('#7fdcff', 0.6); g.lineWidth = 3; g.stroke();
  rr(g, x - w / 2 - 8 * s, y - h - 30 * s, w + 16 * s, 40 * s, 10 * s); g.fillStyle = shade(body, -0.4); g.fill();
  g.fillStyle = band; g.fillRect(x - w / 2, y - h * 0.68, w, h * 0.36);
  g.fillStyle = alpha('#ffffff', 0.12); g.fillRect(x - w / 2 + 12 * s, y - h + 10 * s, 10 * s, h - 20 * s);
  text(g, label, x, y - h * 0.5, { size: Math.min(30 * s, (w * 0.9) / (label.length * 0.62)), color: '#ffffff', font: FONTS.ui, weight: 900, spacing: 1 });
  g.restore();
}
export function pill(g, str, x, y, o = {}) {
  const { size = 64, color = '#ffffff', bg = 'rgba(4,8,18,.88)', line = '#3fd8ff', a = 1, sc = 1 } = o; if (a <= 0 || sc <= 0) return;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(sc, sc);
  g.font = `700 ${size}px "${FONTS.title}"`; const w = g.measureText(str).width + size * 1.1, h = size * 1.45;
  rr(g, -w / 2, -h / 2, w, h, h / 2); g.fillStyle = bg; g.fill(); g.strokeStyle = line; g.lineWidth = 4; g.shadowColor = line; g.shadowBlur = 22; g.stroke(); g.shadowBlur = 0;
  text(g, str, 0, 2, { size, color, spacing: 3 }); g.restore();
}
export const popIn = (t, t0, d = 0.35) => ease.outBack(prog(t, t0, t0 + d));
export function check(g, x, y, s, c) { g.save(); g.shadowColor = c; g.shadowBlur = 20; seg(g, [[x - 30 * s, y], [x - 8 * s, y + 24 * s], [x + 36 * s, y - 28 * s]], 14 * s, c); g.restore(); }
export function cross(g, x, y, s, c) { g.save(); g.shadowColor = c; g.shadowBlur = 20; seg(g, [[x - 26 * s, y - 26 * s], [x + 26 * s, y + 26 * s]], 14 * s, c); seg(g, [[x + 26 * s, y - 26 * s], [x - 26 * s, y + 26 * s]], 14 * s, c); g.restore(); }
