/* "What if Earth had two moons?" — 26 shots cut to the voiceover (99.55 s). */
const K = KAZ, T = K.THREE, PI = Math.PI;
K.config({ leftLabel: 'MOONS', rightLabel: 'TONIGHT', prefix: '', capIn: .08, capOut: .18 });

const B = [0, 3.68, 6.27, 9.73, 11.76, 14.70, 16.89, 20.39, 22.75, 27.81, 32.07, 37.95, 42.70, 46.08, 48.95, 54.56, 60.32, 63.90, 66.95, 71.82, 77.05, 81.27, 84.97, 88.51, 92.61, 96.27, 99.55];
let n = 0;
const S = o => { const i = n++; K.shot(Object.assign({ dur: (Math.round(B[i + 1] * 30) - Math.round(B[i] * 30)) / 30, value: '2' }, o)); };
const CORAL = '#ff7a66', GOLD = '#e8c56a';
const pop = (t, t0, len = .35) => { const r = K.ramp(t, t0, len); return Math.max(.001, r * (1 + .3 * Math.sin(r * PI))); };
const M1 = '#ece8dc', M2 = '#f0c9a0';   // our Moon, the second moon

// ---------- text label sprite ----------
function label(text, size = 1, color = '#ffffff') {
  const mc = document.createElement('canvas').getContext('2d'); mc.font = '800 58px Inter, Arial, sans-serif'; const w = Math.ceil(mc.measureText(text).width) + 48;
  const c = document.createElement('canvas'); c.width = w; c.height = 128; const g = c.getContext('2d');
  g.font = '800 58px Inter, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = color; g.fillText(text, w / 2, 68);
  const tx = new T.CanvasTexture(c); tx.colorSpace = T.SRGBColorSpace;
  const s = new T.Sprite(new T.SpriteMaterial({ map: tx, transparent: true, depthTest: false, depthWrite: false, fog: false }));
  s.sy = size * .4; s.sx = s.sy * w / 128; s.scale.set(s.sx, s.sy, 1); s.renderOrder = 10; s.pop = k => s.scale.set(s.sx * k, s.sy * k, 1); return s;
}
function glowTex(col) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, col); gr.addColorStop(.25, col.replace('1)', '.35)')); gr.addColorStop(1, col.replace('1)', '0)')); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
}

// ---------- a moon as seen in the sky, with a drawn phase ----------
// phase: 0 new, .25 first quarter (right half lit), .5 full, .75 last quarter
function drawMoon(g, cx, cy, r, phase, tint, seed, dark = 'rgba(10,14,32,.92)') {
  g.save(); g.translate(cx, cy);
  g.beginPath(); g.arc(0, 0, r, 0, PI * 2); g.fillStyle = dark; g.fill();
  const k = Math.cos(phase * 2 * PI), s = phase < .5 ? 1 : -1, termSide = k > 0 ? s : -s;
  g.beginPath(); g.arc(0, 0, r, -PI / 2, PI / 2, s < 0); g.ellipse(0, 0, Math.max(.01, r * Math.abs(k)), r, 0, PI / 2, -PI / 2, termSide > 0);
  g.closePath(); g.fillStyle = tint; g.fill();
  g.save(); g.clip(); const rr = K.rng(seed); g.fillStyle = 'rgba(80,70,70,.22)';
  for (let i = 0; i < 7; i++) { g.beginPath(); g.arc((rr() - .5) * 1.2 * r, (rr() - .5) * 1.2 * r, (.1 + rr() * .2) * r, 0, PI * 2); g.fill(); }
  g.restore(); g.restore();
}
function skyMoon(tint = M1, seed = 1, glowCol = 'rgba(220,230,255,1)') {
  const c = document.createElement('canvas'); c.width = c.height = 256; const ctx = c.getContext('2d'), tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace;
  const disc = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, fog: false, depthWrite: false }));
  const glow = new T.Sprite(new T.SpriteMaterial({ map: glowTex(glowCol), transparent: true, fog: false, depthWrite: false, blending: T.AdditiveBlending }));
  const g = new T.Group(); g.add(glow, disc); let last = -1, size = 10;
  g.setPhase = p => { if (Math.abs(p - last) < .002) return; last = p; ctx.clearRect(0, 0, 256, 256); drawMoon(ctx, 128, 128, 118, p, tint, seed); tex.needsUpdate = true; const lit = (1 - Math.cos(p * 2 * PI)) / 2; glow.material.opacity = .15 + .85 * lit; };
  g.setSize = s => { size = s; disc.scale.set(s, s, 1); glow.scale.set(s * 3.2, s * 3.2, 1); };
  g.setOpacity = a => { disc.material.opacity = a; glow.material.opacity = Math.min(glow.material.opacity, a); g.visible = a > .01; };
  g.place = (az, el, D = 150) => g.position.set(Math.sin(az) * Math.cos(el) * D, Math.sin(el) * D, -Math.cos(az) * Math.cos(el) * D);
  g.setPhase(.5); g.setSize(10); return g;
}

// ---------- night landscape ----------
function nightLand({ moons = 2, p1 = .47, p2 = .32, a1 = [.12, .42], a2 = [-.2, .3] } = {}) {
  const scene = K.outdoor({ mood: 'night', grass: 0x2c5238, fogNear: 30, fogFar: 150, sunPos: [-15, 30, -40], range: 30 });
  scene.background = K.skyGradient('#03061a', '#2a3a6e'); scene.fog.color.set(0x1a2448); scene.add(new T.AmbientLight(0x6a7ab8, .75));
  const r = K.rng(7), sp = [];
  for (let i = 0; i < 1600; i++) { const v = new T.Vector3(r() - .5, r() * .9 + .03, r() - .5).normalize().multiplyScalar(190); sp.push(v.x, v.y, v.z); }
  const sg = new T.BufferGeometry(); sg.setAttribute('position', new T.Float32BufferAttribute(sp, 3));
  scene.add(new T.Points(sg, new T.PointsMaterial({ color: 0xdfe6ff, size: .7, sizeAttenuation: true, fog: false })));
  [[-60, -95, 26], [10, -110, 32], [70, -90, 24], [-110, -40, 30], [110, -30, 28]].forEach(([x, z, s]) => { const h = K.ball(s, 0x24452f, x, -s * .55, z, 1); h.scale.y = .55; scene.add(h); });
  [[-6, -9, 1.4, 3], [7, -12, 1.6, 5], [-12, -4, 1.5, 9], [11, -3, 1.3, 12], [-17, -16, 1.7, 15], [16, -18, 1.5, 19]].forEach(a => scene.add(K.tree(...a, [0x2f6a45, 0x387a50, 0x2a5e3d])));
  const moon = skyMoon(M1, 3); moon.setPhase(p1); moon.setSize(12); moon.place(...a1); scene.add(moon);
  const moon2 = skyMoon(M2, 9, 'rgba(255,215,170,1)'); moon2.setPhase(p2); moon2.setSize(8); moon2.place(...a2); moon2.visible = moons > 1; scene.add(moon2);
  const ml = new T.DirectionalLight(0xc8d4ff, 1.5); ml.position.set(10, 30, -30); ml.castShadow = true; ml.shadow.mapSize.set(1024, 1024); const sc = ml.shadow.camera; sc.left = sc.bottom = -15; sc.right = sc.top = 15; scene.add(ml);
  const hero = K.person(); scene.add(hero);
  return { scene, moon, moon2, ml, hero };
}
const lookUp = (hero) => { hero.parts.head.rotation.x = -.45; };

// ---------- space: Earth, Sun, two moons ----------
function starfield(scene, seed = 42, N = 1400) {
  const r = K.rng(seed), sp = []; for (let i = 0; i < N; i++) { const v = new T.Vector3(r() - .5, r() - .5, r() - .5).normalize().multiplyScalar(80 + r() * 30); sp.push(v.x, v.y, v.z); }
  const sg = new T.BufferGeometry(); sg.setAttribute('position', new T.Float32BufferAttribute(sp, 3));
  scene.add(new T.Points(sg, new T.PointsMaterial({ color: 0xdfe6ff, size: .3, sizeAttenuation: true })));
}
const at = (th, r) => new T.Vector3(r * Math.cos(th), 0, -r * Math.sin(th));
function system({ sun = false, sunX = -20, r1 = 8, r2 = 5.4, s1 = .62, s2 = .4, rings = true, bulge = false } = {}) {
  const scene = new T.Scene(); scene.background = new T.Color(0x04050c); starfield(scene);
  scene.add(new T.AmbientLight(0x3a4466, .35));
  const L = new T.DirectionalLight(0xfff4e0, 3.2); L.position.set(-30, 3, 4); scene.add(L);
  const earth = K.planet({ radius: 2, cracks: 0, seed: 21 }); scene.add(earth);
  const moon = K.ball(s1, 0xbdb8ae, 0, 0, 0, 1); const moon2 = K.ball(s2, 0xd9a47a, 0, 0, 0, 1); scene.add(moon, moon2);
  const ring = (r, col, op) => { const m = new T.Mesh(new T.RingGeometry(r - .03, r + .03, 160), new T.MeshBasicMaterial({ color: col, transparent: true, opacity: op, side: T.DoubleSide, depthWrite: false })); m.rotation.x = -PI / 2; scene.add(m); return m; };
  const ring1 = ring(r1, 0x9fb0d0, rings ? .35 : 0), ring2 = ring(r2, 0xf0b98a, rings ? .45 : 0);
  let sunM = null; if (sun) { sunM = new T.Mesh(new T.SphereGeometry(2.6, 32, 20), new T.MeshBasicMaterial({ color: 0xffe08a })); sunM.position.set(sunX, 0, 0); scene.add(sunM); const gl = new T.Sprite(new T.SpriteMaterial({ map: glowTex('rgba(255,200,110,1)'), transparent: true, blending: T.AdditiveBlending, depthWrite: false })); gl.scale.set(18, 18, 1); sunM.add(gl); }
  let bul = null; if (bulge) { bul = new T.Mesh(new T.SphereGeometry(2.04, 48, 32), new T.MeshStandardMaterial({ color: 0x3f9bf0, transparent: true, opacity: .5, roughness: .3, emissive: 0x1a4a90, emissiveIntensity: .35 })); scene.add(bul); }
  const api = {
    scene, earth, moon, moon2, ring1, ring2, sunM, bul, r1, r2,
    set(th1, th2, rr1 = r1, rr2 = r2) { moon.position.copy(at(th1, rr1)); moon2.position.copy(at(th2, rr2)); },
    // tidal stretch: each body pulls a two-sided bulge; they add like vectors at twice the angle
    tide(list) { let x = 0, y = 0; list.forEach(([a, th]) => { x += a * Math.cos(2 * th); y += a * Math.sin(2 * th); }); const A = Math.hypot(x, y), Th = Math.atan2(y, x) / 2; bul.scale.set(.97 + Math.min(A, 2.2) * .2, .965, .965); bul.rotation.set(0, Th, 0); return A; },
    spin(t) { earth.rotation.y = t * .25; },
  };
  return api;
}
const lab = (scene, text, size, color) => { const l = label(text, size, color); scene.add(l); return l; };

// ---------- beach ----------
function beach({ day = true } = {}) {
  const scene = K.outdoor({ skyTop: '#5fa6e6', skyBottom: '#f3e7c9', fog: 0xe9e0c6, fogNear: 40, fogFar: 160, sunPos: [12, 16, 10], range: 30 });
  const gnd = scene.children.find(o => o.isMesh && o.geometry.type === 'PlaneGeometry'); scene.remove(gnd);
  const sand = K.box(240, .6, 90, 0xead7a2, 0, -.3, 10); sand.rotation.x = .08; scene.add(sand);
  scene.add(K.box(240, 4, 80, 0x6dae4a, 0, -.8, -45));
  const water = K.box(500, 6, 320, 0x2f86c4, 0, -3, 154, { roughness: .25, flatShading: false, transparent: true, opacity: .93 }); water.castShadow = false; scene.add(water);
  const foam = K.box(500, .08, .8, 0xf4fbff, 0, 0, 0); foam.castShadow = false; scene.add(foam);
  const walls = [0xf0e2c4, 0xe6cfa8, 0xd9e2e0, 0xf2d0c0], roofs = [0x3f6f8f, 0xb5503c, 0x4f5d53, 0x7a5fb0];
  for (let i = 0; i < 7; i++) { const h = K.house(-27 + i * 9, -14 - (i % 2) * 3, { wall: walls[i % 4], roof: roofs[i % 4] }); h.position.y = 1.2; h.scale.setScalar(.8); scene.add(h); }
  for (let i = 0; i < 10; i++) { const tr = K.tree(-32 + i * 7, -8 - (i % 3), 1.2, 30 + i); tr.position.y = 1.2; scene.add(tr); }
  const pole = new T.Group(); for (let i = 0; i < 10; i++) pole.add(K.box(.22, .5, .22, i % 2 ? 0xffffff : 0xd9382e, 0, .25 + i * .5, 0)); pole.position.set(2.5, -.4, 14); scene.add(pole);
  const boat = new T.Group(); boat.add(K.box(1.2, .5, 3, 0xf2efe6, 0, .25, 0), K.box(.08, 2.6, .08, 0x5f381c, 0, 1.5, 0)); const sail = K.mesh(new T.ConeGeometry(.9, 2, 3), K.mat(0xf8f4ea), .02, 1.7, .2); sail.scale.x = .06; boat.add(sail); scene.add(boat);
  const level = y => { water.position.y = y - 3; const z = 10 - y / .08; foam.position.set(0, y + .02, z); boat.position.set(-6, y, z + 9); };
  level(-.5); return { scene, level, foam, boat };
}

// ---------- animals ----------
function fox() {
  const g = new T.Group(), o = 0xd9742a, legs = [];
  g.add(K.box(.95, .38, .34, o, 0, .5, 0), K.box(.38, .3, .3, o, .58, .62, 0), K.box(.22, .14, .16, 0xf2efe6, .82, .56, 0));
  [-.08, .08].forEach(z => { const e = K.mesh(new T.ConeGeometry(.07, .2, 4), K.mat(0x2a1a12), .55, .86, z); g.add(e); });
  const tail = K.box(.6, .16, .16, o, -.72, .55, 0); tail.rotation.z = .35; g.add(tail); g.add(K.box(.16, .17, .17, 0xf2efe6, -1.0, .66, 0));
  [[.32, .12], [.32, -.12], [-.32, .12], [-.32, -.12]].forEach(([x, z]) => { const p = new T.Group(); p.position.set(x, .38, z); p.add(K.box(.08, .38, .08, 0x3a2418, 0, -.19, 0)); g.add(p); legs.push(p); });
  g.legs = legs; return g;
}
function rabbit() {
  const g = new T.Group(), c = 0xc9c2b8; const b = K.ball(.22, c, 0, .22, 0, 1); b.scale.set(1.25, .95, 1); g.add(b, K.ball(.14, c, .22, .38, 0, 1), K.ball(.07, 0xffffff, -.27, .26, 0, 0));
  [-.05, .05].forEach(z => { const e = K.box(.05, .26, .07, c, .2, .6, z); e.rotation.z = -.15; g.add(e); }); return g;
}
function bird() {
  const g = new T.Group(); g.add(K.box(.3, .1, .1, 0x10131f));
  const wl = new T.Group(), wr = new T.Group(); wl.add(K.box(.08, .03, .45, 0x10131f, 0, 0, .22)); wr.add(K.box(.08, .03, .45, 0x10131f, 0, 0, -.22)); g.add(wl, wr); g.flap = a => { wl.rotation.x = a; wr.rotation.x = -a; }; return g;
}

// ================= SHOTS =================

// 1. look up at the night sky
S({
  value: '1', status: 'NIGHT SKY', sub: '11:40 PM', caption: 'Look up at the night sky<br>and imagine seeing two moons.',
  setup() {
    const N = nightLand({ moons: 1 }), cam = K.camera(42); N.hero.rotation.y = PI;
    return { scene: N.scene, camera: cam, update(t, k) { K.idle(N.hero, t); N.hero.parts.head.rotation.x = -.45 * K.ramp(t, .6, 1.2); const e = K.smooth(k); cam.position.set(1.1, K.lerp(1.9, 1.2, e), 4.2); cam.lookAt(K.lerp(.3, 6, e), K.lerp(1.6, 30, e), K.lerp(0, -60, e)); } };
  }
});

// 2. the familiar Moon
S({
  value: '1', status: 'THE MOON', caption: 'One is the familiar<br>Moon we know today.',
  setup() {
    const N = nightLand({ moons: 1 }), cam = K.camera(26); N.hero.visible = false;
    return { scene: N.scene, camera: cam, update(t, k) { cam.position.set(0, 1.5, 0); const d = N.moon.position.clone().normalize(); cam.lookAt(d.x * 10 - .5 + k * .4, 1.5 + d.y * 10 - 1.0, d.z * 10); } };
  }
});

// 3. a second moon glows above the horizon
S({
  value: t => t < 1.6 ? '1' : '2', status: t => t < 1.6 ? 'THE MOON' : 'TWO MOONS', statusColor: t => t < 1.6 ? '#f3ead8' : GOLD,
  caption: 'Beside it, a second moon<br>glows above the horizon.',
  setup() {
    const N = nightLand(), cam = K.camera(40); N.hero.visible = false;
    return { scene: N.scene, camera: cam, update(t, k) { const a = K.ramp(t, .5, 1.6); N.moon2.setPhase(.32); N.moon2.setOpacity(a); N.moon2.setSize(8 * (.6 + .4 * a)); N.moon2.place(-.2, K.lerp(.22, .3, a)); cam.position.set(0, 2, 6); cam.lookAt(-1.2 + .4 * k, 30, -100); } };
  }
});

// 4. they rise together
S({
  status: 'MOONRISE', sub: 'TOGETHER', caption: 'Some nights,<br>they rise together.',
  setup() {
    const N = nightLand(), cam = K.camera(48); N.hero.position.set(-1.2, 0, -2); N.hero.rotation.y = PI + .2;
    return { scene: N.scene, camera: cam, update(t, k) { const e = K.lerp(-.04, .2, K.smooth(k)); N.moon.place(-.1, e); N.moon2.place(.12, e - .015); K.idle(N.hero, t); lookUp(N.hero); cam.position.set(0, 1.3, 4); cam.lookAt(0, 13, -100); } };
  }
});

// 5. one rises as the other sets
S({
  status: 'ONE RISES', sub: 'ONE SETS', caption: 'Other nights, one appears<br>as the other sets.',
  setup() {
    const N = nightLand(), cam = K.camera(56); N.hero.visible = false;
    return { scene: N.scene, camera: cam, update(t, k) { const e = K.smooth(k); N.moon.place(-.3, K.lerp(-.04, .24, e)); N.moon2.place(.3, K.lerp(.24, -.05, e)); cam.position.set(0, 1.4, 4); cam.lookAt(0, 14, -100); } };
  }
});

// 6. an incredible sight
S({
  status: 'TWO MOONS', statusColor: GOLD, caption: 'It would be an incredible sight—', title: 'Two Moons',
  setup() {
    const N = nightLand({ a1: [.18, .32], a2: [-.12, .24] }), cam = K.camera(42); N.hero.rotation.y = PI; N.hero.position.set(0, 0, -1);
    return { scene: N.scene, camera: cam, update(t, k) { K.idle(N.hero, t); lookUp(N.hero); K.dolly(cam, k, [2.4, .9, 6.5], [1.6, 1.1, 5], [-.6, 7, -30]); } };
  }
});

// 7. what would it mean for Earth?
S({
  rightLabel: 'VIEW', status: 'FROM SPACE', caption: 'but what would having two moons<br>actually mean for Earth?',
  setup() {
    const Y = system(), cam = K.camera(38);
    return { scene: Y.scene, camera: cam, update(t, k) { Y.spin(t); Y.set(.9 + t * .12, 2.6 + t * .3); K.dolly(cam, k, [0, 4, 9], [0, 7.5, 16], [0, -.3, 0]); } };
  }
});

// 8. it depends on three things
S({
  rightLabel: 'VIEW', status: 'IT DEPENDS', caption: 'The answer depends on three things:',
  card: () => `<h4>The answer depends on</h4><b>3 things</b>`,
  setup() {
    const Y = system(), cam = K.camera(38);
    return { scene: Y.scene, camera: cam, update(t, k) { Y.spin(t + 3.5); Y.set(1.32 + t * .12, 3.65 + t * .3); K.dolly(cam, k, [0, 7.5, 16], [1, 7, 15], [0, -.3, 0]); } };
  }
});

// 9. size, distance, path
const st9 = t => t < 1.85 ? 'SIZE' : t < 3.35 ? 'DISTANCE' : 'PATH';
S({
  rightLabel: 'DEPENDS ON', status: st9, statusColor: GOLD, sub: t => (t < 1.85 ? '1' : t < 3.35 ? '2' : '3') + ' OF 3',
  caption: 'how big the second moon is, how far away it orbits,<br>and the path it follows.',
  setup() {
    const Y = system({ rings: false }), cam = K.camera(38), path = new T.Mesh(new T.RingGeometry(.97, 1.03, 160), new T.MeshBasicMaterial({ color: 0xf0b98a, transparent: true, opacity: 0, side: T.DoubleSide, depthWrite: false }));
    Y.scene.add(path); Y.ring1.material.opacity = .25;
    return {
      scene: Y.scene, camera: cam, update(t, k) {
        Y.spin(t); const sz = 1 + .9 * Math.sin(PI * K.clamp((t - .2) / 1.5));
        const dist = 5.4 + 3.4 * Math.sin(PI * K.clamp((t - 1.95) / 1.35));
        Y.moon2.scale.setScalar(sz);
        const pa = K.ramp(t, 3.45, .5); path.material.opacity = .6 * pa;
        const th2 = .5 + Math.max(0, t - 3.45) * 1.1, tilt = .45;
        path.scale.set(7.2, 4.6, 1); path.rotation.set(-PI / 2 + tilt, 0, 0);
        if (t < 3.45) { Y.moon2.position.copy(at(.5, dist)); }
        else { const p = new T.Vector3(7.2 * Math.cos(th2), 4.6 * Math.sin(th2), 0).applyEuler(path.rotation); Y.moon2.position.copy(p); }
        Y.moon.position.copy(at(2.4 + t * .08, 8));
        K.dolly(cam, k, [2, 6, 14], [1.5, 6.5, 15], [1.5, -.5, 0]);
      }
    };
  }
});

// 10. a tiny moon far away
S({
  rightLabel: 'IF THE MOON IS', status: 'TINY · FAR', sub: 'LITTLE DIFFERENCE', caption: 'A tiny moon far from Earth might make<br>little difference to our daily lives.',
  setup() {
    const Y = system({ r2: 16, s2: .16 }), cam = K.camera(40); const lb = lab(Y.scene, 'TINY MOON', 2.2, '#f0c9a0');
    return { scene: Y.scene, camera: cam, update(t, k) { Y.spin(t); Y.set(1.0 + t * .1, .55 + t * .03); lb.position.copy(Y.moon2.position).add(new T.Vector3(0, 1.6, 0)); lb.pop(pop(t, .5)); K.dolly(cam, k, [2, 11, 19], [3, 12, 21], [3, -1, -3]); } };
  }
});

// 11. a large moon close in
S({
  rightLabel: 'IF THE MOON IS', status: 'LARGE · CLOSE', statusColor: CORAL, sub: 'BIGGER TIDES', caption: 'A large moon orbiting close to us could reshape our tides<br>and create a much more complicated system.',
  setup() {
    const Y = system({ r2: 4.2, s2: 1.05, bulge: true }), cam = K.camera(38); Y.ring2.material.opacity = .5;
    return { scene: Y.scene, camera: cam, update(t, k) { Y.spin(t); const th2 = .3 + t * .45, th1 = 1.9 + t * .1; Y.set(th1, th2); const g = K.ramp(t, .6, 1.4); Y.tide([[1, th1], [.46 * 0, PI], [2.6 * g, th2]]); K.dolly(cam, k, [0, 7, 11], [1.5, 5.5, 9], [0, -.2, 0]); } };
  }
});

// 12. smaller than our current Moon
S({
  rightLabel: 'IN THIS WORLD', status: t => t < 2.6 ? 'A SECOND MOON' : 'SMALLER', statusColor: GOLD, caption: 'For this imaginary world, let\'s give Earth a second moon<br>smaller than our current one,',
  setup() {
    const scene = new T.Scene(); scene.background = new T.Color(0x04050c); starfield(scene, 8); scene.add(new T.AmbientLight(0x3a4466, .45)); const L = new T.DirectionalLight(0xfff4e0, 3); L.position.set(-6, 3, 8); scene.add(L);
    const a = K.ball(1.6, 0xbdb8ae, -2.4, 0, 0, 2), b = K.ball(1.6, 0xd9a47a, 2.4, 0, 0, 2); scene.add(a, b);
    const la = lab(scene, 'OUR MOON', 1.3), lb2 = lab(scene, 'SECOND MOON', 1.3, '#f0c9a0'); la.position.set(-2.4, 1.95, 0); lb2.position.set(2.4, 1.95, 0);
    const cam = K.camera(36);
    return { scene, camera: cam, update(t, k) { a.rotation.y = t * .2; b.rotation.y = -t * .25; b.scale.setScalar(K.lerp(1, .6, K.ramp(t, 2.6, 1.0))); b.position.y = 0; la.pop(pop(t, .3)); lb2.pop(pop(t, 1.2)); K.dolly(cam, k, [0, .4, 10.5], [0, .3, 9.4], [0, -.4, 0]); } };
  }
});

// 13. a separate, stable orbit
S({
  rightLabel: 'ITS ORBIT', status: t => t < 1.9 ? 'SEPARATE' : 'STABLE', statusColor: GOLD, caption: 'in a separate orbit that allows<br>both moons to remain stable.',
  setup() {
    const Y = system(), cam = K.camera(38); const l1 = lab(Y.scene, 'MOON', .9), l2 = lab(Y.scene, 'MOON 2', .9, '#f0c9a0');
    return {
      scene: Y.scene, camera: cam, update(t, k) {
        Y.spin(t); Y.ring2.material.opacity = .55 * K.ramp(t, .2, .6); Y.ring2.scale.setScalar(.2 + .8 * K.ramp(t, .2, .8)); Y.ring1.material.opacity = .4;
        const th1 = 1.2 + t * .18, th2 = 3.5 + t * .45; Y.set(th1, th2); Y.moon2.position.multiplyScalar(.2 + .8 * K.ramp(t, .2, .8));
        l1.position.copy(Y.moon.position).add(new T.Vector3(0, 1.2, 0)); l2.position.copy(Y.moon2.position).add(new T.Vector3(0, 1.0, 0)); l2.pop(pop(t, .7));
        K.dolly(cam, k, [0, 13, 9], [0, 11.5, 11], [0, -.5, 0]);
      }
    };
  }
});

// 14. the first change: the night sky
S({
  status: 'NIGHT SKY', sub: 'FIRST CHANGE', caption: 'The first change you would<br>notice is the night sky.',
  setup() {
    const N = nightLand({ a1: [.25, .36], a2: [-.05, .28] }), cam = K.camera(44); N.hero.rotation.y = PI + .3; N.hero.position.set(.4, 0, -.5);
    return { scene: N.scene, camera: cam, update(t, k) { K.idle(N.hero, t); N.hero.parts.head.rotation.x = -.5 * K.ramp(t, .3, .8); K.dolly(cam, k, [-2.2, .6, 3.4], [-1.4, 3.4, 4.6], [.6, 9, -30]); } };
  }
});

// 15. phases depend on position relative to Earth and the Sun
S({
  rightLabel: 'VIEW', status: 'PHASES', sub: 'SUNLIGHT FROM ONE SIDE', caption: 'Each moon would have its own cycle of phases, depending<br>on its position relative to Earth and the Sun.',
  setup() {
    const Y = system({ sun: true, sunX: -21 }), cam = K.camera(40), ls = lab(Y.scene, 'SUN', 1.1, '#ffe08a'); ls.position.set(-21, 3.8, 0);
    const rays = []; for (let i = 0; i < 5; i++) { const r = K.box(9, .03, .03, 0xffe9b0); r.material = new T.MeshBasicMaterial({ color: 0xffe9b0, transparent: true, opacity: .35 }); Y.scene.add(r); rays.push(r); }
    return {
      scene: Y.scene, camera: cam, update(t, k) {
        Y.spin(t); Y.set(.6 + t * .32, 2.2 + t * .55);
        rays.forEach((r, i) => { const u = (t * .6 + i / 5) % 1; r.position.set(-15 + u * 10, 0, -6 + i * 3); r.material.opacity = .35 * Math.sin(u * PI); });
        K.dolly(cam, k, [-4, 15, 13], [-3, 12, 14], [-3, -1, 0]);
      }
    };
  }
});

// 16. two crescents, two full moons, full beside a crescent
const ph16 = t => t < 2.5 ? [.16, .86] : t < 3.75 ? [.5, .5] : [.5, .9];
S({
  status: t => t < 2.5 ? 'TWO CRESCENTS' : t < 3.75 ? 'TWO FULL MOONS' : 'FULL + CRESCENT', statusColor: GOLD,
  caption: 'You might see two crescents, two full moons,<br>or a bright full moon beside a thin crescent.',
  setup() {
    const N = nightLand({ a1: [.1, .3], a2: [-.14, .26] }), cam = K.camera(30); N.hero.visible = false;
    const st = [[.16, .86], [.5, .5], [.5, .9]], mix = (a, b, u) => a + (((b - a + 1.5) % 1) - .5) * u;
    return {
      scene: N.scene, camera: cam, update(t, k) {
        const u1 = K.ramp(t, 2.3, .45), u2 = K.ramp(t, 3.55, .45); const p = [0, 1].map(i => (mix(mix(st[0][i], st[1][i], u1), st[2][i], u2) + 1) % 1);
        N.moon.setPhase(p[0]); N.moon2.setPhase(p[1]); cam.position.set(0, 1.5, 0); cam.lookAt(-.4 + k * .4, 28.5, -100);
      }
    };
  }
});

// 17. both full: brighter nights
S({
  status: 'BRIGHTER NIGHTS', statusColor: GOLD, sub: 'BOTH MOONS FULL', caption: 'When both were full and above the horizon,<br>nights could be brighter,',
  setup() {
    const N = nightLand({ p1: .5, p2: .5, a1: [.22, .33], a2: [-.12, .28] }), cam = K.camera(42), cottage = K.house(4, -8, { wall: 0xc9c2b4, roof: 0x4a5a7a }); N.scene.add(cottage);
    N.hero.rotation.y = PI + .4; N.hero.position.set(-.6, 0, 0);
    const lights = []; N.scene.traverse(o => { if (o.isLight) lights.push([o, o.intensity]); }); const bg0 = new T.Color(0x0c1230), bg1 = new T.Color(0x3a5a90);
    const fog0 = new T.Color(0x121a33), fog1 = new T.Color(0x4a6a98);
    return {
      scene: N.scene, camera: cam, update(t, k) {
        const b = K.ramp(t, .8, 1.8); N.scene.background = bg0.clone().lerp(bg1, b); N.scene.fog.color.copy(fog0).lerp(fog1, b);
        lights.forEach(([l, i0]) => l.intensity = i0 * (1 + 1.6 * b)); N.ml.intensity = .9 + 1.8 * b;
        K.idle(N.hero, t); lookUp(N.hero); K.dolly(cam, k, [3.2, 1.6, 6.5], [2.4, 1.8, 5.4], [0, 2.6, -8]);
      }
    };
  }
});

// 18. depending on size and reflectivity
S({
  rightLabel: 'BRIGHTNESS', status: t => t < 1.55 ? 'SIZE' : 'REFLECTIVITY', statusColor: GOLD, caption: 'depending on how large and<br>reflective the new moon was.',
  setup() {
    const scene = new T.Scene(); scene.background = new T.Color(0x04050c); starfield(scene, 12); scene.add(new T.AmbientLight(0x3a4466, .4)); const L = new T.DirectionalLight(0xfff4e0, 2.6); L.position.set(-6, 3, 8); scene.add(L);
    const m = K.ball(1.4, 0xd9a47a, 0, 0, 0, 2, { emissive: 0xffd2a0, emissiveIntensity: 0 }); scene.add(m);
    const gl = new T.Sprite(new T.SpriteMaterial({ map: glowTex('rgba(255,215,170,1)'), transparent: true, blending: T.AdditiveBlending, depthWrite: false, opacity: 0 })); gl.scale.set(9, 9, 1); scene.add(gl);
    const l1 = lab(scene, 'SIZE', 1.2, GOLD), l2 = lab(scene, 'REFLECTIVITY', 1.2, GOLD); l1.position.set(-3.2, 1.7, 0); l2.position.set(3.2, -1.3, 0);
    const cam = K.camera(36);
    return { scene, camera: cam, update(t, k) { m.rotation.y = t * .3; m.scale.setScalar(.7 + .5 * K.ramp(t, .6, .8)); const r = K.ramp(t, 1.6, .9); m.material.emissiveIntensity = .55 * r; L.intensity = 2.6 + 1.6 * r; gl.material.opacity = .55 * r; l1.pop(pop(t, .6)); l2.pop(pop(t, 1.6)); K.dolly(cam, k, [0, .2, 10], [0, .1, 9], [0, 0, 0]); } };
  }
});

// 19. animals that hunt, hide, or navigate in darkness
S({
  rightLabel: 'WILDLIFE', status: t => t < 2.55 ? 'HUNT' : t < 3.2 ? 'HIDE' : 'NAVIGATE', statusColor: GOLD, caption: 'That extra light could affect animals that<br>hunt, hide, or navigate in darkness.',
  setup() {
    const N = nightLand({ p1: .5, p2: .5, a1: [.05, .3], a2: [-.25, .26] }), cam = K.camera(40); N.hero.visible = false; N.ml.intensity = 2.0;
    const f = fox(); N.scene.add(f); const rb = rabbit(); N.scene.add(rb);
    const hole = new T.Mesh(new T.CircleGeometry(.32, 16), new T.MeshBasicMaterial({ color: 0x0a0a0a })); hole.rotation.x = -PI / 2; hole.position.set(2.6, .02, -1.2); N.scene.add(hole); N.scene.add(K.ball(.5, 0x3a2c22, 2.75, .05, -1.55, 0));
    const birds = []; for (let i = 0; i < 7; i++) { const b = bird(); b.scale.setScalar(1.6); N.scene.add(b); birds.push(b); }
    return {
      scene: N.scene, camera: cam, update(t, k) {
        const fx = K.lerp(-3.4, -.4, K.smooth(t / 2.4)) + 1.1 * K.ramp(t, 2.25, .3); f.position.set(fx, 0, -.2); f.rotation.y = -.25; f.legs.forEach((l, i) => l.rotation.z = .45 * Math.sin(t * 9 + i * PI) * (t < 2.5 ? 1 : 0)); f.position.y = .55 * Math.sin(PI * K.clamp((t - 2.25) / .35));
        const rx = K.lerp(.6, 2.6, K.ramp(t, 2.2, .6)); rb.position.set(rx, Math.abs(Math.sin(t * 12)) * .18 * (t > 2.2 ? 1 : 0), K.lerp(-.3, -1.2, K.ramp(t, 2.2, .6))); rb.rotation.y = -.4; rb.scale.setScalar(Math.max(.001, 1 - K.ramp(t, 2.85, .2)));
        birds.forEach((b, i) => { const j = i - 3; b.position.set(-30 + t * 9 - Math.abs(j) * 1.3, 10 + Math.abs(j) * .6, -40 + j * 1.6); b.rotation.y = 0; b.flap(.6 * Math.sin(t * 10 + i)); });
        K.dolly(cam, k, [0, 1.3, 7], [.6, 2.4, 7.5], [0, 1.6, -3]);
      }
    };
  }
});

// 20. stories, calendars, traditions
function calendarTex() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const g = c.getContext('2d');
  g.fillStyle = '#6a4a30'; g.fillRect(0, 0, 1024, 512); g.fillStyle = '#5a3c26'; for (let i = 0; i < 8; i++) g.fillRect(0, i * 64, 1024, 4);
  g.fillStyle = '#f3e2c0'; g.font = '800 46px Inter, Arial'; g.textAlign = 'center'; g.fillText('THE TWO-MOON CALENDAR', 512, 70);
  for (let i = 0; i < 9; i++) drawMoon(g, 90 + i * 105, 190, 38, (i / 8) % 1, '#ece8dc', 3, 'rgba(30,20,12,.9)');
  for (let i = 0; i < 12; i++) drawMoon(g, 70 + i * 81, 330, 26, (i / 5.5) % 1, '#f0c9a0', 9, 'rgba(30,20,12,.9)');
  g.font = '600 28px Inter, Arial'; g.fillStyle = '#e9d2a8'; g.fillText('BIG MOON', 512, 255); g.fillText('SMALL MOON', 512, 390);
  for (let i = 0; i < 6; i++) { g.fillStyle = '#e8c56a'; g.beginPath(); g.arc(150 + i * 145, 455, 12, 0, PI * 2); g.fill(); }
  const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
}
S({
  rightLabel: 'PEOPLE', status: t => t < 2.0 ? 'STORIES' : t < 3.3 ? 'CALENDARS' : 'TRADITIONS', statusColor: GOLD, caption: 'And humans would probably build stories, calendars,<br>and traditions around both moons.',
  setup() {
    const N = nightLand({ p1: .5, p2: .4, a1: [.3, .42], a2: [.02, .36] }), cam = K.camera(40); N.hero.visible = false;
    const fire = new T.Group(); fire.add(K.box(.8, .1, .12, 0x4a3020, 0, .05, 0)); const fl = K.mesh(new T.ConeGeometry(.35, .9, 6), new T.MeshBasicMaterial({ color: 0xffa040 }), 0, .5, 0); fire.add(fl);
    const pl = new T.PointLight(0xff9a40, 30, 10); pl.position.set(0, 1, 0); fire.add(pl); fire.position.set(0, 0, 0); N.scene.add(fire);
    const shirts = [0xc25b4a, 0x4a6fc2, 0xd9a441, 0x7a5fb0, 0x4f9a6a, 0xd97a9a], ppl = [];
    for (let i = 0; i < 6; i++) { const a = i / 6 * PI * 2 + .3, p = K.person({ shirt: shirts[i], pants: 0x3d4a66, hair: [0x2a1d14, 0x4a3324, 0xb08a4a][i % 3], longHair: i % 2 === 0 }); K.sit(p); p.position.set(Math.sin(a) * 1.7, -.3, Math.cos(a) * 1.7); p.rotation.y = a + PI; N.scene.add(p); N.scene.add(K.box(.6, .3, .4, 0x5f381c, Math.sin(a) * 1.75, .15, Math.cos(a) * 1.75)); ppl.push(p); }
    const brd = new T.Mesh(new T.BoxGeometry(4.2, 2.1, .12), [K.mat(0x4a3020), K.mat(0x4a3020), K.mat(0x4a3020), K.mat(0x4a3020), new T.MeshStandardMaterial({ map: calendarTex(), roughness: .9 }), K.mat(0x4a3020)]);
    brd.position.set(-1.2, 2.2, -4.2); brd.castShadow = true; N.scene.add(brd); N.scene.add(K.box(.16, 3.2, .16, 0x3a2418, -3.2, 1.6, -4.3), K.box(.16, 3.2, .16, 0x3a2418, .8, 1.6, -4.3));
    const lm = new T.MeshBasicMaterial({ color: 0xffd27a }); for (let i = 0; i < 9; i++) { const l = new T.Mesh(new T.SphereGeometry(.08, 8, 6), lm); l.position.set(-4 + i, 3.3 - .3 * Math.sin(i / 8 * PI), -4.6); N.scene.add(l); }
    return {
      scene: N.scene, camera: cam, update(t, k) {
        fl.scale.set(1 + .1 * Math.sin(t * 13), 1 + .18 * Math.sin(t * 9), 1); pl.intensity = 28 + 6 * Math.sin(t * 11);
        ppl[1].parts.armR.rotation.x = -1.6 - .4 * Math.sin(t * 4); ppl[1].parts.armR.rotation.z = .3; ppl.forEach((p, i) => { if (i !== 1) p.parts.head.rotation.x = .1 * Math.sin(t + i); });
        K.dolly(cam, k, [3.4, 2.2, 6.4], [1.2, 2.4, 4.4], [-.8, 1.7, -3]);
      }
    };
  }
});

// 21. the biggest changes: coastlines
S({
  rightLabel: 'TIDES', status: 'COASTLINES', caption: 'But the biggest everyday changes might<br>happen along our coastlines.',
  setup() { const Bc = beach(), cam = K.camera(42); return { scene: Bc.scene, camera: cam, update(t, k) { Bc.level(-.5 + .05 * Math.sin(t * 2)); Bc.boat.rotation.z = .05 * Math.sin(t * 2.4); K.dolly(cam, k, [-24, 9, 24], [-18, 8, 23], [4, 0, 8]); } }; }
});

// tide diagram (shots 22–24, 26)
function tideScene() {
  const Y = system({ sun: true, sunX: -17, bulge: true }), cam = K.camera(40);
  const ls = lab(Y.scene, 'SUN', 1.1, '#ffe08a'); ls.position.set(-17, 3.6, 0);
  const l1 = lab(Y.scene, 'MOON', 1.5), l2 = lab(Y.scene, 'MOON 2', 1.5, '#f0c9a0');
  const pull = (col) => { const m = K.box(1, .05, .05, col); m.material = new T.MeshBasicMaterial({ color: col, transparent: true, opacity: .5 }); m.castShadow = false; Y.scene.add(m); return m; };
  const p1 = pull(0xc8d4ff), p2 = pull(0xf0b98a);
  const aim = (m, pos) => { const L = pos.length() - 2.6; m.scale.x = Math.max(.01, L); m.position.copy(pos.clone().normalize().multiplyScalar(2.3 + L / 2)); m.rotation.set(0, Math.atan2(-pos.z, pos.x), 0); };
  return {
    Y, cam, l1, l2,
    frame(t, k, th1, th2, a2, camA, camB) {
      Y.spin(t); Y.set(th1, th2); Y.moon2.visible = a2 > .01; Y.ring2.material.opacity = .45 * Math.min(1, a2 * 2); Y.moon2.scale.setScalar(Math.max(.001, Math.min(1, a2 * 2)));
      l1.position.copy(Y.moon.position).add(new T.Vector3(0, 1.3, 0)); l2.position.copy(Y.moon2.position).add(new T.Vector3(0, 1.1, 0)); l2.visible = a2 > .01;
      aim(p1, Y.moon.position); aim(p2, Y.moon2.position); p2.visible = a2 > .01; p2.material.opacity = .5 * Math.min(1, a2 * 2);
      const A = Y.tide([[1, th1], [.46, PI], [a2, th2]]); K.dolly(cam, k, camA, camB, [-2.5, -.6, 0]); return A;
    }
  };
}
const CAM_A = [-1, 15, 13], CAM_B = [-1.5, 13.5, 12];

// 22. the Moon and the Sun already produce tides
S({
  rightLabel: 'TIDES', status: 'TODAY', sub: 'MOON + SUN', caption: 'Our current Moon and the Sun already<br>help produce Earth\'s tides.',
  setup() { const D = tideScene(); D.Y.bul.material.opacity = 0; return { scene: D.Y.scene, camera: D.cam, update(t, k) { D.Y.bul.material.opacity = .6 * K.ramp(t, .3, .8); D.frame(t, k, .35 + t * .06, 2.0, 0, CAM_A, CAM_B); } }; }
});

// 23. a second moon adds another pull
S({
  rightLabel: 'TIDES', status: 'ANOTHER PULL', statusColor: GOLD, sub: '+ MOON 2', caption: 'A second moon would add another<br>gravitational influence.',
  setup() { const D = tideScene(); return { scene: D.Y.scene, camera: D.cam, update(t, k) { D.l2.pop(pop(t, .5)); D.frame(t, k, .57 + t * .03, 2.0 + t * .05, .5 * K.ramp(t, .3, .9), CAM_B, [-1.2, 13, 12.5]); } }; }
});

// 24. reinforcing: everything lines up
S({
  rightLabel: 'TIDES', status: t => t < 2.6 ? 'LINING UP' : 'REINFORCING', statusColor: CORAL, sub: 'MOONS + SUN', caption: 'When the tidal effects of both moons and the Sun<br>reinforced one another,',
  setup() { const D = tideScene(); return { scene: D.Y.scene, camera: D.cam, update(t, k) { const e = K.ramp(t, .2, 2.6); D.frame(t, k, K.lerp(.68, 0, e), K.lerp(2.18, PI, e), .5, [-1.2, 13, 12.5], [-2, 10.5, 10]); } }; }
});

// 25. especially large tidal ranges
S({
  rightLabel: 'TIDES', status: t => t < 1.9 ? 'EXTRA-HIGH TIDE' : 'EXTRA-LOW TIDE', statusColor: CORAL, sub: 'LARGE TIDAL RANGE', caption: 'some places could experience especially<br>large tidal ranges.',
  setup() {
    const Bc = beach(), cam = K.camera(42);
    return { scene: Bc.scene, camera: cam, update(t, k) { const h = t < 1.9 ? K.lerp(-.5, 1.05, K.smooth(t / 1.7)) : K.lerp(1.05, -2.2, K.smooth((t - 1.9) / 1.6)); Bc.level(h + .04 * Math.sin(t * 3)); Bc.boat.rotation.z = .05 * Math.sin(t * 2.4); K.dolly(cam, k, [-11, 4.6, 25], [-10, 4.4, 24], [3, .2, 11]); } };
  }
});

// 26. at other times, partly offset
S({
  rightLabel: 'TIDES', status: 'PARTLY CANCELLING', sub: 'MOONS PULL APART', caption: 'At other times, their effects would<br>partly offset one another.',
  setup() { const D = tideScene(); return { scene: D.Y.scene, camera: D.cam, update(t, k) { const e = K.ramp(t, .2, 2.0); D.frame(t, k, K.lerp(0, PI / 2, e), PI, .45, [-2, 10.5, 10], [-1, 14, 13]); } }; }
});
