/* "The road to World War II" — 28 shots cut to the voiceover (88.85 s). */
const K = KAZ, T = K.THREE, PI = Math.PI;
K.config({ leftLabel: 'YEAR', rightLabel: 'LOCATION', prefix: '', capIn: .08, capOut: .18 });

const B = [0, 2.42, 4.47, 8.13, 10.58, 13.15, 16.28, 19.94, 22.85, 28.80, 31.1, 33.1, 36.98, 39.66, 45.37, 48.58, 50.6, 53.6, 57.1, 58.6, 61.5, 65.52, 68.42, 72.57, 74.0, 78.05, 80.5, 84.2, 88.85];
let n = 0;
const S = o => { const i = n++; K.shot(Object.assign({ dur: (Math.round(B[i + 1] * 30) - Math.round(B[i] * 30)) / 30, value: '1939', status: 'EUROPE', sub: '' }, o)); };
const RED = 0xd9382e, CORAL = '#ff7a66';
const pop = (t, t0, len = .35) => { const r = K.ramp(t, t0, len); return Math.max(.001, r * (1 + .3 * Math.sin(r * PI))); };

// ---------- text ----------
function textTex(text, { w = 512, h = 128, font = '800 70px Inter, Arial, sans-serif', color = '#ffffff', bg = null } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
  g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = color; g.fillText(text, w / 2, h / 2 + 4);
  const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
}
function board(text, W, H, o = {}) { return new T.Mesh(new T.PlaneGeometry(W, H), new T.MeshBasicMaterial({ map: textTex(text, Object.assign({ bg: '#f3ead8', color: '#1c1c22' }, o)), side: T.DoubleSide })); }
function label(text, size = 1.6, color = '#ffffff') {
  const mc = document.createElement('canvas').getContext('2d'); mc.font = '800 58px Inter, Arial, sans-serif'; const w = Math.ceil(mc.measureText(text).width) + 48;
  const s = new T.Sprite(new T.SpriteMaterial({ map: textTex(text, { color, w, font: '800 58px Inter, Arial, sans-serif' }), transparent: true, depthTest: false, depthWrite: false }));
  s.sy = size * .4; s.sx = s.sy * w / 128; s.scale.set(s.sx, s.sy, 1); s.renderOrder = 10; return s;
}

// ---------- people and vehicles ----------
function soldier(col = 0x6a6f64, helmet = 0x4a4f48) {
  const p = K.person({ shirt: col, pants: col, hair: 0x2a2018 });
  const h = K.mesh(new T.SphereGeometry(.275, 10, 6, 0, PI * 2, 0, PI * .5), K.mat(helmet), 0, .3, 0); h.scale.set(1.05, .95, 1.1); p.parts.head.add(h);
  p.parts.armR.add(K.box(.05, .05, 1.0, 0x3a2a1a, .03, -.55, .3)); return p;
}
const suit = (o = {}) => K.person(Object.assign({ shirt: 0x2a2d35, pants: 0x2a2d35 }, o));
function tank(color = 0x5d6258) {
  const g = new T.Group(), d = new T.Color(color).multiplyScalar(.55).getHex();
  g.add(K.box(1.9, .6, 3.4, color, 0, .7, 0), K.box(.42, .6, 3.6, d, -.98, .35, 0), K.box(.42, .6, 3.6, d, .98, .35, 0), K.box(1.2, .45, 1.3, color, 0, 1.2, -.15));
  const b = K.cyl(.07, .07, 1.9, d, 0, 1.2, 1.3, 8); b.rotation.x = PI / 2; g.add(b); return g;
}
function smoke(scene, x, y, z, nb = 6, col = 0x55565c) {
  const balls = []; for (let i = 0; i < nb; i++) { const b = K.ball(.5, col, x, y, z, 0); b.castShadow = false; scene.add(b); balls.push(b); }
  return t => balls.forEach((b, i) => { const u = (t * .35 + i / nb) % 1; b.position.set(x + Math.sin(i * 2 + u * 3) * .5 * u + u * 1.5, y + u * 6, z); b.scale.setScalar(.5 + u * 2.2); b.rotation.y = u * 3 + i; });
}

// ---------- map table ----------
const POLY = {
  eurBase: [[-9.5, 36], [-9.5, 43.5], [-1.8, 43.4], [-4.7, 48.4], [1.6, 50.9], [8.6, 54.9], [8, 57], [10.5, 57.7], [11, 54], [20, 54.5], [21, 57], [24, 59.5], [30, 60], [32, 46], [28, 41], [23, 36.5], [20, 40], [19, 42], [13.6, 45.6], [12.4, 44.2], [18.5, 40.2], [15.7, 38], [12.5, 41.5], [8.8, 44.4], [3.2, 43.2], [3, 42.4], [0, 38.5], [-5, 36]],
  scand: [[5, 58], [7, 62], [11, 64.5], [14, 64.5], [18, 60], [16.5, 56.5], [13, 55.5], [11, 58.8], [8, 57.8]],
  ireland: [[-10, 51.5], [-6, 52], [-6, 54.5], [-7.5, 55.3], [-10, 54]],
  uk: [[-5.7, 50.1], [-3, 50.6], [1.4, 51.2], [1.7, 52.7], [0.2, 53.5], [-1.5, 55], [-2, 57.5], [-3.5, 58.6], [-5.2, 58.5], [-6, 56.5], [-4.8, 54.8], [-3, 54], [-4.5, 53.2], [-4.2, 52.2], [-5.2, 51.7], [-3.5, 51.3]],
  france: [[-4.7, 48.4], [-1.5, 48.7], [-1.8, 49.7], [1.6, 50.9], [2.5, 51.1], [4.2, 49.9], [6.2, 49.5], [8.2, 49], [7.6, 47.6], [6, 46.3], [7, 45.8], [7.6, 43.8], [6, 43.1], [3.2, 43.2], [3, 42.4], [-1.8, 43.4], [-1.2, 46], [-2.5, 47.3]],
  germany: [[6.1, 50.8], [6, 51.8], [7.1, 53.6], [8.6, 54.9], [9.9, 54.8], [11, 54], [14.3, 54], [17.8, 54.8], [17.2, 53], [15.8, 52.3], [18.5, 51], [18.8, 50.3], [17, 50.2], [14.8, 51], [12.2, 50.3], [13.8, 48.8], [13, 47.5], [10, 47.4], [7.6, 47.6], [8.2, 49], [6.2, 49.5]],
  eprussia: [[19.5, 54.4], [22.8, 55.3], [22.8, 54.3], [19.6, 53.4]],
  rhineland: [[6.1, 50.8], [6, 51.8], [7.4, 51.7], [8.3, 50], [8.2, 49], [6.2, 49.5]],
  poland: [[17.8, 54.8], [18.8, 54.4], [19.5, 53.4], [23, 54.2], [26.5, 55.2], [28, 53.5], [26.5, 51.5], [26, 48.9], [22.8, 49.1], [19, 49.4], [18.8, 50.3], [18.5, 51], [15.8, 52.3], [17.2, 53]],
  italy: [[7, 45.8], [8.5, 46.4], [12.3, 47], [13.7, 46.5], [13.6, 45.6], [12.3, 45.3], [12.4, 44.2], [14, 42.5], [16.1, 41.9], [18.5, 40.2], [17, 40.4], [16.6, 38.2], [15.7, 38], [15.6, 40], [12.5, 41.5], [10.5, 42.9], [8.8, 44.4], [7.6, 43.8]],
  asiaBase: [[70, 55], [100, 56], [125, 58], [142, 54], [135, 48.3], [131, 43], [130.5, 42.3], [129.5, 37.5], [129.3, 35.3], [126.4, 34.5], [126, 37.8], [124.5, 40], [122, 40.5], [118, 39], [122, 37], [119, 35], [121.5, 31], [120, 27], [116, 23], [110, 21], [108, 18], [109, 12], [105, 9], [100, 13], [98, 8], [92, 21], [88, 22], [80, 15], [77, 8], [72, 21], [66, 25], [62, 35], [70, 40]],
  china: [[74, 39], [80, 45], [88, 49], [97, 43], [105, 42], [112, 45], [120, 47], [119, 45], [119.5, 41.5], [122, 40.5], [118, 39], [122, 37], [119, 35], [121.5, 31], [120, 27], [116, 23], [110, 21], [108, 21.7], [106, 23], [98, 22], [98, 28], [92, 28], [86, 28], [79, 31], [79, 35]],
  manchuria: [[120, 47], [121, 53.3], [126, 53], [135, 48.3], [131, 43], [124.5, 40], [122, 40.5], [119.5, 41.5], [119, 45]],
  korea: [[124.5, 40], [126, 37.8], [126.4, 34.5], [129.3, 35.3], [129.5, 37.5], [130.5, 42.3], [128, 41.5]],
  japan: [[130, 31.3], [131.8, 33.5], [135, 33.6], [137, 34.6], [140, 35.2], [141, 38.5], [141.8, 41.3], [145, 43.5], [144, 44.3], [141.7, 45.3], [140.2, 42.5], [139.7, 39], [136.8, 37], [132.5, 35.4], [130.9, 34], [129.8, 33]],
  afrBase: [[20, 26], [34, 26], [37, 21], [38.5, 18], [43.1, 12.7], [44, 11.4], [51.2, 11.8], [47, 3.5], [41, -3], [39, -7], [20, -7]],
  arabia: [[35.5, 26], [39, 21], [43, 16.5], [43.5, 12.9], [45, 12.9], [52, 16.5], [56, 22], [56, 26]],
  ethiopia: [[33, 8], [34.5, 10.5], [36.4, 14.6], [38, 14.7], [40, 14.3], [42.4, 12.4], [41.8, 11], [43, 11.2], [42.8, 9.5], [47.9, 8], [45, 5], [42, 4.2], [39.5, 3.5], [36, 4.4], [34.9, 6]],
  eritrea: [[36.4, 14.6], [38.5, 18], [43.1, 12.7], [42.4, 12.4], [40, 14.3], [38, 14.7]],
  somaliland: [[41, -1.5], [42, 4.2], [45, 5], [47.9, 8], [49, 11.3], [51.2, 11.8], [50.8, 9.5], [47, 3.5], [43, -.5]],
};
const REGION = {
  europe: { c: [9, 49.5], s: .42, lands: [['eurBase', 0x2f3b55, .08], ['scand', 0x2f3b55, .08], ['ireland', 0x2f3b55, .08], ['uk', 0x3f6fb8], ['france', 0x4a8fd0], ['germany', 0x62666e], ['eprussia', 0x62666e], ['poland', 0xd9d2c2], ['italy', 0x4f8a5a]] },
  asia: { c: [121, 37], s: .3, lands: [['asiaBase', 0x2f3b55, .08], ['china', 0xd9b45a], ['manchuria', 0xd9b45a], ['korea', 0xb9b2a2], ['japan', 0xe6e0d2]] },
  africa: { c: [40, 9], s: .42, lands: [['afrBase', 0x2f3b55, .08], ['arabia', 0x2f3b55, .08], ['ethiopia', 0x4f9a5a], ['eritrea', 0x8f9a8a], ['somaliland', 0x8f9a8a]] },
};
function mapScene(region, extra = []) {
  const R = REGION[region], scene = new T.Scene(); scene.background = new T.Color(0x0b1222); scene.fog = new T.Fog(0x0b1222, 16, 34);
  K.lights(scene, { sun: 0xfff2dc, sunI: 2.4, sky: 0xbfd0ff, ground: 0x1a2238, hemiI: 1.0, pos: [4, 10, 6], range: 13 });
  scene.add(K.box(60, .1, 44, 0x13203a, 0, -.05, 0));
  const P = (lon, lat) => [(lon - R.c[0]) * Math.cos(R.c[1] * PI / 180) * R.s, -(lat - R.c[1]) * R.s], C = {};
  R.lands.concat(extra).forEach(([name, color, h = .16]) => {
    const sh = new T.Shape(); POLY[name].forEach(([lo, la], i) => { const [x, z] = P(lo, la); i ? sh.lineTo(x, -z) : sh.moveTo(x, -z); });
    const m = K.mesh(new T.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false }), K.mat(color)); m.rotation.x = -PI / 2; scene.add(m);
    C[name] = { mesh: m, mat: m.material, base: new T.Color(color), h, tint(col, a) { this.mat.color.copy(this.base).lerp(new T.Color(col), a); this.mat.emissive.set(col).multiplyScalar(.25 * a); }, rise(a) { m.scale.z = 1 + a; } };
  });
  const api = {
    scene, C, P,
    label(text, lon, lat, size = 1.5, color) { const l = label(text, size, color), [x, z] = P(lon, lat); l.position.set(x, .75, z); scene.add(l); return l; },
    dot(lon, lat, color = RED) {
      const [x, z] = P(lon, lat), g = new T.Group(), m = new T.MeshBasicMaterial({ color }), rm = new T.MeshBasicMaterial({ color, transparent: true, opacity: .8 });
      g.add(new T.Mesh(new T.CylinderGeometry(.1, .1, .12, 14), m)); const ring = new T.Mesh(new T.TorusGeometry(.2, .03, 6, 24), rm); ring.rotation.x = PI / 2; g.add(ring);
      g.position.set(x, .42, z); scene.add(g); g.pulse = (t, on = 1) => { const u = (t * 1.2) % 1; ring.scale.setScalar(1 + u * 2.2); rm.opacity = .8 * (1 - u) * on; g.scale.setScalar(Math.max(.001, on)); }; g.setColor = c => { m.color.set(c); rm.color.set(c); }; return g;
    },
    arrow(a, b, color = RED, w = .24) {
      const [ax, az] = P(...a), [bx, bz] = P(...b), L = Math.hypot(bx - ax, bz - az), g = new T.Group(), m = new T.MeshBasicMaterial({ color });
      const geo = new T.BoxGeometry(1, .07, w); geo.translate(.5, 0, 0); const shaft = new T.Mesh(geo, m); g.add(shaft);
      const head = new T.Mesh(new T.ConeGeometry(w * 1.25, w * 2.4, 3), m); head.rotation.set(0, 0, -PI / 2); head.scale.z = .35; g.add(head);
      g.position.set(ax, .46, az); g.rotation.y = -Math.atan2(bz - az, bx - ax); scene.add(g);
      g.set = p => { g.visible = p > .01; shaft.scale.x = Math.max(.001, (L - w * 1.2) * p); head.position.x = (L - w * 1.2) * p + w * 1.2; }; g.set(0); return g;
    },
    cam(cam, k, a = [0, 10.5, 8], b = [0, 9.4, 7.2], look = [0, 0, .6]) { K.dolly(cam, k, a, b, look); },
  };
  return api;
}

// ---------- sets ----------
function border() {
  const scene = K.outdoor({ skyTop: '#3a4a7a', skyBottom: '#f2c9a0', fog: 0xdcc0a8, fogNear: 14, fogFar: 60, grass: 0x6a9a52 });
  scene.add(K.road({ length: 160, z: 0 }));
  [[-6, -3, 1.3, 3], [7, -8, 1.5, 5], [-8, 9, 1.4, 9], [8, 14, 1.2, 12], [-7, 22, 1.5, 15], [9, 28, 1.6, 21], [-10, -14, 1.5, 25]].forEach(a => scene.add(K.tree(...a)));
  const hut = new T.Group(); hut.add(K.box(1.6, 2.2, 1.6, 0xf3ead8, 0, 1.1, 0)); for (let i = 0; i < 4; i++) hut.add(K.box(1.64, .26, 1.64, 0xc8102e, 0, .35 + i * .55, 0));
  const rf = K.mesh(new T.ConeGeometry(1.4, .8, 4), K.mat(0x4a3a2a), 0, 2.6, 0); rf.rotation.y = PI / 4; hut.add(rf); hut.position.set(-5.2, 0, -1.5); scene.add(hut);
  scene.add(K.box(.2, 1.2, .2, 0x3a3a3a, -3.8, .6, 0), K.box(.2, 1.2, .2, 0x3a3a3a, 3.8, .6, 0));
  const bar = new T.Group(); for (let i = 0; i < 10; i++) bar.add(K.box(.76, .14, .14, i % 2 ? 0xffffff : 0xc8102e, .38 + i * .76, 0, 0)); bar.position.set(-3.8, 1.1, 0); scene.add(bar);
  const sg = board('POLSKA', 2.2, .55); sg.position.set(5.4, 2.0, -.7); sg.rotation.y = PI; scene.add(sg); scene.add(K.box(.12, 2, .12, 0x3a3a3a, 5.4, 1, -.65));
  const guard = soldier(0x7a6a45, 0x5a5238); guard.position.set(-4.3, .12, -.2); guard.rotation.y = .3; guard.baseY = .12; scene.add(guard);
  const tanks = [0, 1, 2].map(i => { const tk = tank(); tk.rotation.y = PI; tk.position.x = i === 1 ? -1.7 : 1.7; scene.add(tk); return tk; });
  const men = []; for (let i = 0; i < 8; i++) { const s = soldier(); s.rotation.y = PI; s.baseY = .12; scene.add(s); men.push(s); }
  return { scene, bar, guard, tanks, men };
}
function yearRoad() {
  const scene = K.outdoor({ mood: 'dusk', fogNear: 14, fogFar: 70, grass: 0x6a7a52 }); scene.add(K.road({ length: 240, z: -80 }));
  [['1939', -6], ['1936', -22], ['1933', -38], ['1931', -54], ['1919', -72]].forEach(([y, z], i) => {
    const b = board(y, 2.6, 1.1, { font: '800 92px Inter, Arial', bg: i === 4 ? '#e8c56a' : '#f3ead8' }); b.position.set(5.4, 2.6, z); b.rotation.y = -.35; scene.add(b); scene.add(K.box(.16, 2.2, .16, 0x3a3a3a, 5.4, 1.1, z - .05));
  });
  for (let i = 0; i < 22; i++) scene.add(K.tree(i % 2 ? -7 - (i % 3) : 8 + (i % 3), 4 - i * 4.2, 1.1 + (i % 4) * .15, 40 + i, [0x8a7a3a, 0xa0803a, 0x6f7a3a]));
  return scene;
}
function city(mood) {
  const scene = K.outdoor(mood === 'night' ? { skyTop: '#141a33', skyBottom: '#4a3a4a', fog: 0x2a2433, fogNear: 10, fogFar: 46, grass: 0x3a3d42 } : { skyTop: '#7a8088', skyBottom: '#c9c4b8', fog: 0xbdb8ae, fogNear: 10, fogFar: 46, grass: 0x6a6d68 }), r = K.rng(4);
  scene.add(K.road({ length: 120, z: -30 }));
  const cols = [0x8a7a68, 0x7a6f66, 0x9a8a72, 0x6f6a66];
  for (let i = 0; i < 10; i++) [-1, 1].forEach(sd => {
    const h = 6 + r() * 5, z = 8 - i * 7.2, x = sd * 10.2; scene.add(K.box(8, h, 6.6, cols[Math.floor(r() * 4)], x, h / 2, z));
    for (let wy = 0; wy < 3; wy++) for (let wz = 0; wz < 3; wz++) scene.add(K.box(.1, .9, .8, mood === 'night' && r() > .5 ? 0xffd27a : 0x39404a, x - sd * 4.02, 1.6 + wy * 1.7, z - 2 + wz * 2, mood === 'night' ? { emissive: 0xffc75a, emissiveIntensity: r() > .5 ? 1 : 0 } : {}));
  });
  return scene;
}
const drab = [0x5a5650, 0x6a6258, 0x4a4f58, 0x70685a, 0x55504a];
function crowdOf(scene, nx, nz, x0, z0, dx, dz, seed, faceY = 0) {
  const r = K.rng(seed), out = [];
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) { const p = K.person({ shirt: drab[Math.floor(r() * 5)], pants: drab[Math.floor(r() * 5)], hair: [0x2a1d14, 0x4a3324, 0x6a5a48, 0x8a8a8a][Math.floor(r() * 4)], longHair: r() > .7 }); p.position.set(x0 + i * dx + (r() - .5) * .3, .12, z0 + j * dz + (r() - .5) * .3); p.rotation.y = faceY + (r() - .5) * .4; p.ph = r() * 6; scene.add(p); out.push(p); }
  return out;
}
function govBuilding(scene) {
  const g = new T.Group(), st = 0xbdb6a6;
  g.add(K.box(22, 6, 7, st, 0, 4, 0), K.box(24, 1, 9, 0xa9a292, 0, .5, 0), K.box(16, .5, 3, 0xa9a292, 0, .25, 5.4), K.box(13, .5, 2, 0xb3ac9c, 0, .75, 5.2));
  for (let i = 0; i < 8; i++) g.add(K.cyl(.38, .42, 5.2, 0xd2cbbb, -7 + i * 2, 3.6, 3.9, 10));
  g.add(K.box(17, .7, 1.6, st, 0, 6.5, 3.9));
  const psh = new T.Shape(); psh.moveTo(-8.7, 0); psh.lineTo(8.7, 0); psh.lineTo(0, 2.3); const ped = K.mesh(new T.ExtrudeGeometry(psh, { depth: 1.6, bevelEnabled: false }), K.mat(st), 0, 6.85, 3.1); g.add(ped);
  const dome = K.mesh(new T.SphereGeometry(3.2, 10, 6, 0, PI * 2, 0, PI / 2), K.mat(0x6f8f8a), 0, 7, -.5); g.add(dome); g.add(K.box(.2, 2.2, .2, 0x3a3a3a, 0, 11, -.5));
  const banners = [-6, -2, 2, 6].map(x => { const geo = new T.BoxGeometry(1.2, 4.6, .08); geo.translate(0, -2.3, 0); const b = K.mesh(geo, K.mat(0xb3261e), x, 6.1, 4.4); b.scale.y = .001; g.add(b); return b; });
  g.position.set(0, 0, -8); scene.add(g); return { g, banners };
}

// ================= SHOTS =================

// 1. September 1, 1939
S({
  status: 'POLISH BORDER', sub: '4:45 AM', caption: 'On September 1, 1939,',
  card: () => `<h4>Friday</h4><b>September 1, 1939</b>`,
  setup() {
    const b = border(), cam = K.camera(40);
    return { scene: b.scene, camera: cam, update(t, k) { K.dolly(cam, k, [6.5, 2.4, -10], [6, 2.2, -9], [0, 1.2, 2]); b.tanks.forEach((tk, i) => tk.position.z = 46 + i * 9 - t * 2); b.men.forEach(m => m.visible = false); K.idle(b.guard, t); } };
  }
});

// 2. German troops invade Poland
S({
  status: 'POLAND', sub: 'SEPTEMBER 1', statusColor: CORAL, caption: 'German troops invaded Poland.',
  setup() {
    const b = border(), cam = K.camera(40), puff = smoke(b.scene, 0, .5, 3, 5, 0x8a8478); b.guard.visible = false;
    return {
      scene: b.scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [6, 2.2, -9], [5.2, 1.9, -7.6], [0, 1.1, 2]);
        b.tanks.forEach((tk, i) => { tk.position.z = 9 + i * 8.5 - t * 8.5; tk.position.y = .03 * Math.sin(t * 30 + i); });
        b.men.forEach((m, i) => { m.position.set((i % 2 ? 4.4 : -4.4) + (i % 4 > 1 ? .9 : 0), .12, 12 + Math.floor(i / 2) * 2.2 - t * 5); K.walk(m, t * 10 + i); });
        const hit = K.ramp(t, .95, .3); b.bar.rotation.z = hit * 1.35; b.bar.rotation.y = hit * .5; puff(t);
      }
    };
  }
});

// 3. Britain and France declare war
S({
  status: 'LONDON · PARIS', sub: 'SEPTEMBER 3', caption: 'Within days, Britain and France<br>declared war on Germany.',
  setup() {
    const M = mapScene('europe'), cam = K.camera(40);
    M.label('BRITAIN', -1.5, 53.6, 1.5); M.label('FRANCE', 2.2, 46.6, 1.5); M.label('GERMANY', 11.2, 51.2, 1.6); M.label('POLAND', 22, 52, 1.5, '#1c1c22');
    const a1 = M.arrow([-.1, 51.5], [12.2, 52.3], 0x8fc0ff, .2), a2 = M.arrow([2.35, 48.85], [11, 50.6], 0x8fc0ff, .2), inv = M.arrow([14.5, 52.4], [20.5, 52.2]); inv.set(1);
    return { scene: M.scene, camera: cam, update(t, k) { M.cam(cam, k); M.C.poland.tint(RED, .45); const u = K.ramp(t, .9, .5); M.C.uk.rise(u * 1.2); M.C.france.rise(u * 1.2); a1.set(K.ramp(t, 1.5, .7)); a2.set(K.ramp(t, 1.7, .7)); M.C.germany.tint(RED, K.ramp(t, 2.1, .5) * (.7 + .3 * Math.sin(t * 8))); M.C.eprussia.tint(RED, K.ramp(t, 2.1, .5)); } };
  }
});

// 4. World War II had begun in Europe
S({
  status: 'EUROPE', sub: 'AT WAR', statusColor: CORAL, caption: 'World War II had begun in Europe—', title: 'World War II',
  setup() {
    const M = mapScene('europe'), cam = K.camera(40);
    return { scene: M.scene, camera: cam, update(t, k) { M.cam(cam, k, [0, 9.4, 7.2], [0, 12.5, 9.6]);['germany', 'eprussia', 'poland'].forEach(c => M.C[c].tint(RED, .6 + .2 * Math.sin(t * 5))); M.C.uk.rise(1.2); M.C.france.rise(1.2); } };
  }
});

// 5a. the road to war
S({
  value: (t, k) => String(Math.round(K.lerp(1939, 1934, K.smooth(k)))), status: 'THE ROAD TO WAR', caption: 'but the road to war<br>stretched back years,',
  setup() { const scene = yearRoad(), cam = K.camera(42); return { scene, camera: cam, update(t, k) { const z = K.lerp(8, -26, K.smooth(k)); cam.position.set(0, 2.2, z); cam.lookAt(1.6, 1.9, z - 12); } }; }
});

// 5b. war already underway in Asia
S({
  value: '1937', status: 'CHINA', sub: 'AT WAR', statusColor: CORAL, caption: 'and a devastating war was<br>already underway in Asia.',
  setup() {
    const M = mapScene('asia'), cam = K.camera(40); M.label('CHINA', 109, 33.5, 1.7, '#1c1c22'); M.label('JAPAN', 137.4, 36.4, 1.0);
    const dots = [[116.4, 39.9], [121.5, 31.2], [118.8, 32.06], [114.3, 30.6], [113.3, 23.1]].map(p => M.dot(...p));
    const ar = [M.arrow([123, 43], [117.2, 40.3]), M.arrow([129, 32.5], [122.2, 31.3])];
    return { scene: M.scene, camera: cam, update(t, k) { M.cam(cam, k, [1.8, 11, 8.4], [1.4, 9.8, 7.4], [1.2, 0, .4]); M.C.manchuria.tint(RED, .8); M.C.korea.tint(RED, .6); M.C.japan.tint(RED, .75); dots.forEach((d, i) => d.pulse(t + i * .3, K.ramp(t, .3 + i * .25, .3))); ar.forEach((a, i) => a.set(K.ramp(t, .2 + i * .3, .7))); } };
  }
});

// 6. a global catastrophe
S({
  value: '1939–1945', status: 'WORLDWIDE', caption: 'To understand how these conflicts<br>became a global catastrophe,',
  setup() {
    const scene = K.space(), cam = K.camera(36), pl = K.planet({ cracks: 14, seed: 12 }); scene.add(pl);
    return { scene, camera: cam, update(t, k) { pl.rotation.set(0, .6 + t * .16, .2); pl.setCracks(K.ramp(t, .2, 2.6), t); K.dolly(cam, k, [0, .6, 12.5], [0, .3, 15.5], [0, -.6, 0]); } };
  }
});

// 7. back to the aftermath of World War I
S({
  value: (t, k) => String(Math.round(K.lerp(1934, 1919, K.smooth(k * 1.15)))), status: 'REWIND', caption: 'we need to go back to the<br>aftermath of World War I.',
  setup() { const scene = yearRoad(), cam = K.camera(42); return { scene, camera: cam, update(t, k) { const z = K.lerp(-26, -61, K.smooth(k * 1.15)); cam.position.set(.4, 2.2, z); cam.lookAt(2.6, 2.1, z - 10); } }; }
});

// 8. the Treaty of Versailles
S({
  value: '1919', status: 'VERSAILLES', sub: 'JUNE 28', caption: 'The Treaty of Versailles imposed territorial losses,<br>military restrictions, and reparations on Germany.',
  setup() {
    const scene = K.indoor({ wall: 0xcbbd9c, floor: 0x8a6a48, window: false }), cam = K.camera(38);
    for (let i = 0; i < 6; i++) { scene.add(K.box(1.5, 3.4, .08, 0x9fbfd6, -5 + i * 2.4, 2.4, -3.86, { emissive: 0x9fbfd6, emissiveIntensity: .12 })); scene.add(K.box(1.8, .16, .14, 0xd9b45a, -5 + i * 2.4, 4.2, -3.84), K.box(.14, 3.6, .14, 0xd9b45a, -5.9 + i * 2.4, 2.4, -3.84)); }
    const tb = K.table({ w: 6.4, d: 1.3, h: .8, color: 0x5f381c }); tb.position.set(0, 0, -1); scene.add(tb); scene.add(K.box(6.2, .03, 1.1, 0x2f6f4a, 0, .81, -1), K.box(.5, .015, .66, 0xffffff, 0, .835, -.9));
    const seats = [-2.6, -1.5, 1.5, 2.6].map((x, i) => { const p = suit({ hair: [0x8a8a8a, 0x2a1d14, 0xd9d2c2, 0x4a3324][i] }); K.sit(p); p.position.set(x, -.3, -1.75); scene.add(p); return p; });
    const signer = suit({ hair: 0x4a3324 }); signer.position.set(0, 0, -1.8); signer.parts.head.rotation.x = .35; scene.add(signer);
    const mk = (x, lab) => { const g = new T.Group(); g.position.set(x, 3.2, -.9); scene.add(g); const l = label(lab, 1.0, '#2a1c10'); l.position.set(0, -.7, 0); g.add(l); return g; };
    const a = mk(-2.3, 'TERRITORY'), pa = K.mesh(new T.CylinderGeometry(.46, .46, .12, 6), K.mat(0x6a8f5a), -.1, 0, 0), pb = K.mesh(new T.CylinderGeometry(.24, .24, .12, 5), K.mat(0xd9382e), .5, 0, 0); pa.rotation.x = pb.rotation.x = PI / 2 - .3; a.add(pa, pb);
    const b = mk(0, 'MILITARY'); const hm = K.mesh(new T.SphereGeometry(.36, 10, 6, 0, PI * 2, 0, PI / 2), K.mat(0x5d6258), 0, -.15, 0); const xb = K.box(1.1, .1, .08, 0xd9382e, 0, .02, .3); xb.rotation.z = .6; b.add(hm, K.box(.86, .05, .86, 0x5d6258, 0, -.15, 0), xb);
    const c = mk(2.3, 'REPARATIONS');[[-.25, 3], [0, 5], [.27, 2]].forEach(([x, nn]) => { for (let i = 0; i < nn; i++) c.add(K.cyl(.13, .13, .05, 0xe9b93a, x, -.3 + i * .065, 0, 12, { metalness: .5, roughness: .4 })); });
    const chand = new T.Group(); for (let i = 0; i < 6; i++) chand.add(K.ball(.12, 0xffe6a8, Math.cos(i) * .5, 0, Math.sin(i) * .5, 1, { emissive: 0xffd27a, emissiveIntensity: 1.5 })); chand.add(K.cyl(.03, .03, 1.2, 0xd9b45a, 0, .6, 0)); chand.position.set(0, 5.4, -1); scene.add(chand);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [.8, 2.4, 7.6], [0, 2.3, 6.6], [0, 2.0, -1]);
        [[a, 2.0], [b, 3.3], [c, 4.4]].forEach(([g, t0], i) => { g.scale.setScalar(pop(t, t0)); g.position.y = 3.2 + .05 * Math.sin(t * 2 + i); });
        pb.position.x = .5 + .25 * K.ramp(t, 2.5, .5); signer.parts.armR.rotation.x = -1.0 + .08 * Math.sin(t * 14); seats.forEach((p, i) => p.parts.head.rotation.y = .3 * Math.sin(t * .8 + i));
      }
    };
  }
});

// 9. resentment
S({
  value: '1920s', status: 'GERMANY', caption: 'Many Germans resented the settlement,',
  setup() {
    const scene = city(), cam = K.camera(38), cr = crowdOf(scene, 6, 3, -3.6, -1, 1.4, -1.5, 9);
    const nb = board('VERSAILLES', 3.4, .8, { bg: '#f3ead8', font: '800 60px Inter, Arial' }); nb.position.set(0, 2.9, -1.2); nb.rotation.z = -.06; scene.add(nb); scene.add(K.box(.1, 2.6, .1, 0x4a3a2a, -1.5, 1.4, -1.25), K.box(.1, 2.6, .1, 0x4a3a2a, 1.5, 1.4, -1.25));
    const xa = K.box(3.6, .14, .05, 0xd9382e, 0, 2.9, -1.15), xb2 = K.box(3.6, .14, .05, 0xd9382e, 0, 2.9, -1.15); xa.rotation.z = .2; xb2.rotation.z = -.2; scene.add(xa, xb2);
    return { scene, camera: cam, update(t, k) { K.dolly(cam, k, [1.6, 2.0, 6.6], [.8, 1.8, 5.4], [0, 1.5, -1]); cr.forEach((p, i) => { p.parts.head.rotation.x = .12; if (i % 3 === 0) { p.parts.armR.rotation.z = 2.6; p.parts.armR.rotation.x = .3 * Math.sin(t * 9 + p.ph); } p.position.y = .12 + .02 * Math.abs(Math.sin(t * 4 + p.ph)); }); } };
  }
});

// 10. Hitler exploits the anger
S({
  value: '1920s', status: 'GERMANY', caption: 'and Adolf Hitler exploited that anger,',
  setup() {
    const scene = city('night'), cam = K.camera(38), cr = crowdOf(scene, 7, 3, -4.2, 2.6, 1.4, 1.3, 21, PI);
    scene.add(K.box(6, 1, 2.6, 0x4a3a2a, 0, .5, -3), K.box(.9, 1.1, .6, 0x2a2018, 0, 1.55, -2.2));
    const sp = K.person({ shirt: 0x6a5a40, pants: 0x2a2620, hair: 0x1f1812 }); sp.position.set(0, 1, -2.9); scene.add(sp);
    const spot = new T.SpotLight(0xfff2d8, 220, 30, .32, .5); spot.position.set(2, 10, 5); spot.target.position.set(0, 1.8, -2.9); scene.add(spot, spot.target);
    return { scene, camera: cam, update(t, k) { K.dolly(cam, k, [2.2, 2.6, 9.4], [1.4, 2.4, 8.2], [0, 1.9, -2]); sp.parts.armR.rotation.set(-1.9 + .5 * Math.sin(t * 7), 0, .3); sp.parts.head.rotation.y = .3 * Math.sin(t * 3); sp.rotation.y = .15 * Math.sin(t * 2.2); cr.forEach((p, i) => { p.position.y = .12 + .03 * Math.abs(Math.sin(t * 5 + p.ph)); if (i % 4 === 0) p.parts.armL.rotation.z = -2.7 + .2 * Math.sin(t * 8 + p.ph); }); } };
  }
});

// 11. hardship, instability, support
S({
  value: '1928–1932', status: 'GERMANY', caption: 'along with economic hardship and<br>political instability, to gain support.',
  card: t => { const d = [['1928', 2.6], ['1930', 18.3], ['1932', 37.3]]; return `<h4>Nazi Party share of the vote</h4><div style="display:flex;gap:1.6em;align-items:flex-end;justify-content:center;height:10.5em;padding:.4em 1em 0">` + d.map(([y, v], i) => { const a = K.ramp(t, .9 + i * .55, .5); return `<div style="width:4.6em"><div style="font-size:1.05em;font-weight:700;opacity:${a}">${(v * a).toFixed(1)}%</div><div style="height:${v * a * .19}em;background:${i === 2 ? CORAL : '#b9b2c8'};border-radius:.2em .2em 0 0;margin-top:.2em"></div><div style="font-size:.75em;opacity:.8;margin-top:.35em">${y}</div></div>`; }).join('') + `</div>`; },
  setup() {
    const scene = city(), cam = K.camera(38); const q = crowdOf(scene, 9, 1, -5.6, 1.4, 1.2, 0, 33, PI / 2);
    const cl = board('NO WORK', 2.6, .7, { bg: '#2a2620', color: '#f3ead8', font: '800 64px Inter, Arial' }); cl.position.set(3.4, 2.6, 0); cl.rotation.y = -PI / 2 + .5; scene.add(cl);
    return { scene, camera: cam, update(t, k) { K.dolly(cam, k, [.4, 3.4, 9.8], [0, 3.2, 9], [0, 2.3, 0]); q.forEach(p => { p.parts.head.rotation.x = .25; p.position.y = .12 + .01 * Math.sin(t * 2 + p.ph); }); } };
  }
});

// 12. never inevitable
S({
  value: '?', status: 'A CHOICE', caption: 'But another world war<br>was never inevitable.',
  setup() {
    const scene = K.outdoor({ skyTop: '#6f9fd8', skyBottom: '#e9e2cf', fogFar: 80 }), cam = K.camera(40);
    scene.add(K.road({ length: 40, z: 20 }));
    [-.5, .5].forEach(a => { const pv = new T.Group(); pv.rotation.y = a; pv.add(K.road({ length: 90, z: -45 })); scene.add(pv); });
    scene.add(K.box(.18, 3.4, .18, 0x4a3a2a, 0, 1.7, -2.2));
    const pe = board('PEACE', 2.2, .6, { bg: '#f3ead8' }); pe.position.set(-1.25, 3, -2.1); pe.rotation.y = .3; scene.add(pe);
    const wa = board('WAR', 2.2, .6, { bg: '#b3261e', color: '#ffffff' }); wa.position.set(1.25, 2.3, -2.1); wa.rotation.y = -.3; scene.add(wa);
    for (let i = 0; i < 8; i++) { scene.add(K.tree(-9 - i * 3.5, -8 - i * 5, 1.3, 60 + i)); scene.add(K.tree(8 + i * 3.6, -8 - i * 5, 1.2, 80 + i, [0x5a4a3a, 0x6a4a3a, 0x4a3a2a])); }
    const dark = K.box(60, .03, 80, 0x4a3a34, 34, .02, -40); dark.rotation.y = -.5; scene.add(dark);
    const p = suit({ hair: 0x4a3324 }); p.position.set(0, .05, 3.2); p.rotation.y = PI; scene.add(p);
    return { scene, camera: cam, update(t, k) { K.dolly(cam, k, [.6, 2.6, 9.5], [.2, 2.9, 8], [0, 1.9, -3]); p.parts.head.rotation.y = .5 * Math.sin(t * 1.6); } };
  }
});

// 13. leaders who chose expansion, repression, aggression
S({
  value: '1930s', status: 'DECISIONS', caption: 'It grew out of decisions made by leaders who chose<br>expansion, repression, and military aggression.',
  setup() {
    const scene = new T.Scene(); scene.background = new T.Color(0x0d0a12); scene.fog = new T.Fog(0x0d0a12, 10, 30);
    scene.add(new T.HemisphereLight(0x6a5a7a, 0x1a1418, .8)); const fl = K.mesh(new T.PlaneGeometry(60, 60), K.mat(0x241c22)); fl.rotation.x = -PI / 2; scene.add(fl);
    const cam = K.camera(38), words = ['EXPANSION', 'REPRESSION', 'AGGRESSION'], ls = [];
    [-3.4, 0, 3.4].forEach((x, i) => {
      scene.add(K.box(1.6, .6, 1.6, 0x3a2f36, x, .3, 0)); const f = K.person({ shirt: [0x4a4038, 0x2a2a2e, 0x4a4a3a][i], pants: 0x1c1a1c, hair: 0x141012 }); f.position.set(x, .6, 0); f.parts.armR.rotation.set(-1.2, 0, .2); scene.add(f);
      const sl = new T.SpotLight(0xff5a4a, 160, 16, .4, .6); sl.position.set(x, 7, -3.5); sl.target.position.set(x, 1.5, 0); scene.add(sl, sl.target);
      const ky = new T.SpotLight(0xfff0e0, 60, 16, .35, .6); ky.position.set(x * .6, 5, 7); ky.target.position.set(x, 1.6, 0); scene.add(ky, ky.target);
      const l = label(words[i], 1.5, '#ff7a66'); l.position.set(x, 3.45, 0); scene.add(l); ls.push(l);
    });
    return { scene, camera: cam, update(t, k) { K.dolly(cam, k, [0, 2.6, 11.5], [0, 2.3, 9.6], [0, 1.9, 0]); ls.forEach((l, i) => { const s = pop(t, [3.1, 3.8, 4.4][i], .3); l.scale.set(l.sx * s, l.sy * s, 1); }); } };
  }
});

// 14. chancellor, 1933
S({
  value: '1933', status: 'BERLIN', sub: 'JANUARY 30', caption: 'After becoming Germany\'s<br>chancellor in 1933,',
  setup() {
    const scene = K.outdoor({ skyTop: '#8a93a0', skyBottom: '#d9d4c8', fog: 0xcfcabd, fogNear: 18, fogFar: 70, grass: 0x8a8a80 }), cam = K.camera(40), G = govBuilding(scene);
    const f = K.person({ shirt: 0x2a2620, pants: 0x2a2620, hair: 0x1f1812 }); f.baseY = 1; scene.add(f); const cr = crowdOf(scene, 8, 2, -5.6, 3.5, 1.6, 1.5, 51, PI);
    return { scene, camera: cam, update(t, k) { K.dolly(cam, k, [4, 2.4, 20], [3, 2.8, 17], [0, 4.6, -6]); f.position.set(0, 1, 2.2 - t * 1.1); f.rotation.y = PI; K.walk(f, t * 7); cr.forEach(p => p.position.y = .12 + .02 * Math.abs(Math.sin(t * 4 + p.ph))); } };
  }
});

// 15. dictatorship
S({
  value: '1933', status: 'BERLIN', sub: 'ONE-PARTY STATE', statusColor: CORAL, caption: 'Hitler established a dictatorship',
  setup() {
    const scene = K.outdoor({ skyTop: '#6a707c', skyBottom: '#c9bfb4', fog: 0xbdb4aa, fogNear: 18, fogFar: 70, grass: 0x7a7a72 }), cam = K.camera(40), G = govBuilding(scene), men = [];
    for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) { const s = soldier(0x4a4038, 0x2f2a26); s.position.set(-5 + i * 2, 0, 2.5 + j * 1.8); s.rotation.y = PI / 2; s.baseY = 0; scene.add(s); men.push(s); }
    return { scene, camera: cam, update(t, k) { K.dolly(cam, k, [3, 2.8, 18.5], [2, 3.2, 16.5], [0, 4.6, -6]); G.banners.forEach((b, i) => b.scale.y = Math.max(.001, K.ramp(t, .15 + i * .12, .45))); men.forEach((m, i) => { K.walk(m, t * 9, .5); m.position.x = -5 + (i - i % 3) / 3 * 2 + t * .9; }); } };
  }
});

// 16. a racist vision of territorial conquest
S({
  value: '1933', status: 'GERMANY', sub: 'PLANS FOR CONQUEST', statusColor: CORAL, caption: 'and pursued a racist vision<br>of territorial conquest.',
  setup() {
    const M = mapScene('europe'), cam = K.camera(40); M.label('GERMANY', 11.2, 51.2, 1.6);
    const ar = [[[15, 53], [24, 54]], [[16, 51.3], [26, 50.5]], [[14, 49.5], [22, 47]], [[13, 48.5], [16.5, 46]]].map(([a, b]) => M.arrow(a, b));
    return { scene: M.scene, camera: cam, update(t, k) { M.cam(cam, k, [1, 10.2, 7.6], [1.6, 9, 6.8], [1.2, 0, .3]); M.C.germany.tint(RED, .7); M.C.eprussia.tint(RED, .7); M.C.germany.rise(.8 * K.ramp(t, .1, .5)); ar.forEach((a, i) => a.set(K.ramp(t, .5 + i * .3, .8))); } };
  }
});

// 17. rearmament
S({
  value: '1935', status: 'GERMANY', sub: 'REARMAMENT', caption: 'His government expanded the armed forces<br>in defiance of the treaty,',
  alert: { label: 'ARMY · TREATY LIMIT 100,000', value: (t, k) => Math.round(K.lerp(100000, 550000, K.smooth(k * 1.2)) / 1000) * 1000 >= 0 ? (Math.round(K.lerp(100000, 550000, K.smooth(k * 1.2)) / 1000) * 1000).toLocaleString('en-US') : '' },
  setup() {
    const scene = K.outdoor({ mood: 'dust', fogFar: 60 }), cam = K.camera(40), puffs = [];
    for (let i = 0; i < 3; i++) { const x = -9 + i * 9; scene.add(K.box(8, 5, 6, 0x7a5a4a, x, 2.5, -9)); for (let j = 0; j < 4; j++) { const rf = K.mesh(new T.CylinderGeometry(1.2, 1.2, 6, 3), K.mat(0x5a4a44), x - 3 + j * 2, 5.3, -9); rf.rotation.x = PI / 2; rf.scale.y = 1; scene.add(rf); } scene.add(K.cyl(.5, .7, 9, 0x6a4a3a, x + 3, 4.5, -11.5, 8)); puffs.push(smoke(scene, x + 3, 9, -11.5, 5)); scene.add(K.box(2.4, 2.6, .2, 0x2a2420, x, 1.3, -5.95)); }
    scene.add(K.box(60, .05, 5, 0x4a4640, 0, .03, -2.4));
    const tanks = []; for (let i = 0; i < 6; i++) { const tk = tank(); tk.rotation.y = PI / 2; scene.add(tk); tanks.push(tk); }
    const men = []; for (let i = 0; i < 10; i++) { const s = soldier(); s.rotation.y = PI / 2; s.baseY = 0; scene.add(s); men.push(s); }
    return { scene, camera: cam, update(t, k) { K.dolly(cam, k, [-3, 3.2, 11], [-1.5, 2.6, 9.5], [1, 1.6, -3]); tanks.forEach((tk, i) => tk.position.set(-22 + i * 6 + t * 3.2, 0, -2.4)); men.forEach((m, i) => { m.position.set(-12 + i * 1.5 + t * 1.6, 0, 1.4 + (i % 2) * 1.2); K.walk(m, t * 9 + i * PI); }); puffs.forEach(p => p(t)); } };
  }
});

// 18. 1936
S({
  value: '1936', status: 'RHINELAND', sub: 'DEMILITARIZED ZONE', caption: 'and in 1936,',
  setup() {
    const M = mapScene('europe', [['rhineland', 0xe8c56a, .2]]), cam = K.camera(40); M.label('RHINELAND', 5.2, 52.9, 1.5, '#e8c56a'); M.label('FRANCE', 2.2, 46.8, 1.3); M.label('GERMANY', 12.4, 51.4, 1.3);
    return { scene: M.scene, camera: cam, update(t, k) { M.cam(cam, k, [-.6, 8, 5.4], [-.9, 6.6, 4.4], [-.8, 0, -.2]); M.C.rhineland.rise(.5 + .3 * Math.sin(t * 5)); } };
  }
});

// 19. troops enter the Rhineland
S({
  value: '1936', status: 'RHINELAND', sub: 'MARCH 7', statusColor: CORAL, caption: 'German troops entered the<br>demilitarized Rhineland.',
  setup() {
    const scene = K.outdoor({ fogFar: 70 }), cam = K.camera(40), men = [];
    scene.add(K.box(200, .06, 9, 0x3a78c2, 0, .03, 0, { roughness: .3 })); scene.add(K.box(4.4, .5, 13, 0x9a9488, 0, 1.6, 0));
    [-4.5, 0, 4.5].forEach(z => scene.add(K.box(3.6, 1.5, 1.2, 0x8a8478, 0, .75, z)));[-2.1, 2.1].forEach(x => scene.add(K.box(.2, .7, 13, 0x7a7468, x, 2.1, 0)));
    scene.add(K.road({ along: 'z', length: 60, z: -36.5 }), K.road({ along: 'z', length: 60, z: 36.5 }));
    scene.add(K.house(-9, -12, { roof: 0x8a4b3c }), K.house(10, -14, { wall: 0xdccbb0, roof: 0x4f5d53 }), K.box(2.6, 7, 2.6, 0xd9d2c2, 16, 3.5, -18)); const sp = K.mesh(new T.ConeGeometry(2.1, 4, 4), K.mat(0x4a5a6a), 16, 9, -18); sp.rotation.y = PI / 4; scene.add(sp);
    [[-7, -8, 1.3, 2], [7, -9, 1.4, 6], [-8, 9, 1.4, 8], [8, 11, 1.2, 10], [-13, -16, 1.6, 14]].forEach(a => scene.add(K.tree(...a)));
    for (let i = 0; i < 3; i++) for (let j = 0; j < 6; j++) { const s = soldier(); s.rotation.y = PI; s.baseY = 1.85; s.col = i; s.row = j; scene.add(s); men.push(s); }
    return { scene, camera: cam, update(t, k) { K.dolly(cam, k, [15, 5.5, 11], [13, 4.8, 9], [0, 2.0, 0]); men.forEach(m => { const z = 10 + m.row * 1.7 - t * 3.2; m.baseY = Math.abs(z) < 6.5 ? 1.85 : .12; m.position.set(-1.1 + m.col * 1.1, m.baseY, z); K.walk(m, t * 9 + m.row * PI); }); } };
  }
});

// 20. protests, but no intervention
S({
  value: '1936', status: 'LONDON · PARIS', sub: 'NO MILITARY RESPONSE', caption: 'Britain and France protested but<br>did not intervene militarily.',
  setup() {
    const M = mapScene('europe', [['rhineland', RED, .2]]), cam = K.camera(40); M.label('BRITAIN', -1.5, 53.6, 1.4); M.label('FRANCE', 2.2, 46.6, 1.4); M.label('GERMANY', 12.4, 51.4, 1.4);
    const notes = [[[-.1, 51.5], 0], [[2.35, 48.85], .25], [[-.1, 51.5], .9], [[2.35, 48.85], 1.15]].map(([from, d]) => { const m = K.box(.42, .03, .3, 0xffffff); m.castShadow = false; M.scene.add(m); return { m, a: M.P(...from), b: M.P(12.6, 52.2), d }; });
    return { scene: M.scene, camera: cam, update(t, k) { M.cam(cam, k, [-.4, 9.4, 7], [-.6, 8.4, 6.2], [-.5, 0, .2]); M.C.germany.tint(RED, .5); notes.forEach(o => { const u = K.clamp((t - .4 - o.d) / 1.5); o.m.visible = u > 0 && u < 1; o.m.position.set(K.lerp(o.a[0], o.b[0], u), .6 + Math.sin(u * PI) * 1.6, K.lerp(o.a[1], o.b[1], u)); o.m.rotation.y = u * 5; }); } };
  }
});

// 21. meanwhile, elsewhere
S({
  value: '1930s', status: 'WORLDWIDE', caption: 'Meanwhile, aggression was<br>spreading elsewhere.',
  setup() {
    const scene = K.space({ seed: 5 }), cam = K.camera(36), pl = K.planet({ cracks: 8, seed: 31 }); scene.add(pl);
    return { scene, camera: cam, update(t, k) { pl.rotation.set(0, 1.2 + t * .7, .2); pl.setCracks(.35 + .55 * K.ramp(t, .3, 2), t); K.dolly(cam, k, [0, .5, 14.5], [0, .4, 13], [0, -.6, 0]); } };
  }
});

// 22. Japan seizes Manchuria, 1931
S({
  value: '1931', status: 'MANCHURIA', sub: 'SEPTEMBER 18', statusColor: CORAL, caption: 'Japan had seized Manchuria in<br>northeastern China in 1931,',
  setup() {
    const M = mapScene('asia'), cam = K.camera(40); M.label('CHINA', 109, 33.5, 1.7, '#1c1c22'); M.label('JAPAN', 137.4, 36.4, 1.0); const ml = M.label('MANCHURIA', 126.5, 47.8, 1.6);
    const ar = [M.arrow([127.5, 39.5], [124.5, 44.5]), M.arrow([130, 41.5], [127.5, 46.5])];
    return { scene: M.scene, camera: cam, update(t, k) { M.cam(cam, k, [1.8, 10.4, 7.6], [2, 8.8, 5.8], [2, 0, -1.2]); M.C.japan.tint(RED, .75); M.C.korea.tint(RED, .6); ar.forEach((a, i) => a.set(K.ramp(t, .5 + i * .25, .7))); const u = K.ramp(t, 1.3, .8); M.C.manchuria.tint(RED, u * .85); M.C.manchuria.rise(u * .8); } };
  }
});

// 23. 1937
S({
  value: '1937', status: 'CHINA', sub: 'JULY 7', caption: 'and in 1937,',
  setup() {
    const M = mapScene('asia'), cam = K.camera(40); M.label('CHINA', 109, 33.5, 1.7, '#1c1c22'); M.label('JAPAN', 137.4, 36.4, 1.0); const d = M.dot(116.4, 39.9); M.label('BEIJING', 113, 41.6, 1.2);
    return { scene: M.scene, camera: cam, update(t, k) { M.cam(cam, k, [2, 8.8, 5.8], [1.4, 10, 7.2], [1.2, 0, -.2]); M.C.japan.tint(RED, .75); M.C.korea.tint(RED, .6); M.C.manchuria.tint(RED, .85); M.C.manchuria.rise(.8); d.pulse(t, 1); } };
  }
});

// 24. full-scale war between Japan and China
S({
  value: '1937', status: 'CHINA', sub: 'FULL-SCALE WAR', statusColor: CORAL, caption: 'fighting escalated into a full-scale<br>war between Japan and China.',
  setup() {
    const scene = K.outdoor({ mood: 'dusk', fogNear: 14, fogFar: 60, grass: 0x6a6a48 }), cam = K.camera(40), men = [], fl = [];
    scene.add(K.box(60, 4.5, 2.4, 0x7a7468, 0, 2.25, -14)); for (let i = 0; i < 30; i++) scene.add(K.box(1, .7, 2.5, 0x7a7468, -29 + i * 2, 4.85, -14));
    scene.add(K.box(7, 6, 3.4, 0x6f695e, 0, 3, -14), K.box(2.2, 3, 3.5, 0x1c1a18, 0, 1.5, -13.9));
    [[8.6, 6.3, 7, 1.2], [6.6, 8.4, 5, 1]].forEach(([w, y, bw, bh]) => { const rf = K.mesh(new T.ConeGeometry(w * .75, 1.3, 4), K.mat(0x3a4a44), 0, y + .4, -14); rf.rotation.y = PI / 4; rf.scale.z = .55; scene.add(rf); scene.add(K.box(bw, bh * 1.2, 2.6, 0x9a3a2e, 0, y + 1.6, -14)); });
    const top = K.mesh(new T.ConeGeometry(4.4, 1.5, 4), K.mat(0x3a4a44), 0, 9.9, -14); top.rotation.y = PI / 4; top.scale.z = .55; scene.add(top);
    const puffs = [-14, -5, 9, 17].map((x, i) => smoke(scene, x, 4 + (i % 2), -17, 6, 0x4a4648));
    for (let i = 0; i < 4; i++) { const l = new T.PointLight(0xffa24a, 0, 22); l.position.set(-12 + i * 8, 3, -11); scene.add(l); fl.push(l); }
    for (let i = 0; i < 12; i++) { const s = soldier(0xa08f5a, 0x7a6f48); s.rotation.y = PI; s.baseY = 0; scene.add(s); men.push(s); }
    const tk = tank(0x8a7f58); tk.rotation.y = PI; scene.add(tk);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [3, 2.4, 12], [2, 2.1, 9.5], [0, 2.6, -8]);
        men.forEach((m, i) => { m.position.set(-8 + (i % 6) * 3 + (i > 5 ? 1.4 : 0), 0, 5 + Math.floor(i / 6) * 2.5 - t * 2.4); K.walk(m, t * 10 + i, .7); });
        tk.position.set(4.5, .03 * Math.sin(t * 30), 3 - t * 2); puffs.forEach(p => p(t)); fl.forEach((l, i) => l.intensity = 260 * Math.pow(Math.max(0, Math.sin(t * (5 + i) + i * 2)), 12));
      }
    };
  }
});

// 25. major cities captured
S({
  value: '1937', status: 'CHINA', sub: 'BEIJING · SHANGHAI · NANJING', caption: 'Japanese forces captured major cities',
  setup() {
    const M = mapScene('asia'), cam = K.camera(40); M.label('CHINA', 106, 34.5, 1.7, '#1c1c22');
    const cs = [[116.4, 39.9, 'BEIJING', 112.6, 41.7], [121.5, 31.2, 'SHANGHAI', 126.2, 29.6], [118.8, 32.06, 'NANJING', 114.6, 33.6]].map(([lo, la, nm, llo, lla], i) => { const d = M.dot(lo, la, 0xf3ead8); const l = M.label(nm, 1.25); const [x, z] = M.P(llo, lla); l.position.set(x, .8, z); return { d, t0: .25 + i * .65 }; });
    const ar = [M.arrow([120.5, 43], [117, 40.5]), M.arrow([127.5, 31.8], [122.4, 31.3]), M.arrow([121.2, 31.5], [119.2, 32])];
    return { scene: M.scene, camera: cam, update(t, k) { M.cam(cam, k, [-.6, 8.6, 6.2], [-.9, 7.4, 5.4], [-.9, 0, .4]); M.C.japan.tint(RED, .75); M.C.korea.tint(RED, .6); M.C.manchuria.tint(RED, .85); cs.forEach((c, i) => { const on = K.ramp(t, c.t0, .25); c.d.setColor(on > .5 ? RED : 0xf3ead8); c.d.pulse(t + i * .3, 1); ar[i].set(K.ramp(t, c.t0 - .2, .4)); }); } };
  }
});

// 26. the Nanjing Massacre — shown as remembrance, not violence
S({
  value: '1937', status: 'NANJING', sub: 'DECEMBER', caption: 'and committed mass atrocities,<br>including the Nanjing Massacre.',
  setup() {
    const scene = K.outdoor({ skyTop: '#0b0d18', skyBottom: '#3a2a30', fog: 0x1c181e, fogNear: 10, fogFar: 46, grass: 0x24242a }), cam = K.camera(38), r = K.rng(6);
    scene.traverse(o => { if (o.isLight) o.intensity *= .55; }); scene.add(new T.AmbientLight(0x6a6a9a, .9));
    scene.add(K.box(70, 5, 2.4, 0x2f2c30, 0, 2.5, -16)); for (let i = 0; i < 35; i++) scene.add(K.box(1, .7, 2.5, 0x2f2c30, -34 + i * 2, 5.35, -16));
    scene.add(K.box(7, 6.5, 3.4, 0x2a272b, 0, 3.25, -16)); const top = K.mesh(new T.ConeGeometry(6, 1.8, 4), K.mat(0x1f1d22), 0, 7.4, -16); top.rotation.y = PI / 4; top.scale.z = .55; scene.add(top);
    const puffs = [-12, 7, 18].map(x => smoke(scene, x, 5, -20, 6, 0x2a282c));
    const cm = new T.MeshBasicMaterial({ color: 0xffd98a }), flames = [];
    for (let i = 0; i < 90; i++) { const x = (r() - .5) * 22, z = -8 + r() * 12; scene.add(K.cyl(.05, .05, .22, 0xe9e2d0, x, .11, z, 6)); const f = new T.Mesh(new T.SphereGeometry(.085, 6, 5), cm); f.position.set(x, .28, z); f.ph = r() * 6; scene.add(f); flames.push(f); }
    const gl = new T.PointLight(0xffb45a, 70, 26); gl.position.set(0, 2.2, 0); scene.add(gl);
    [[-3.2, 2.6, .2], [-2.1, 3.0, -.1], [2.0, 2.8, .15], [3.2, 3.2, -.2]].forEach(([x, z, ry], i) => { const p = K.person({ shirt: drab[i], pants: 0x2a2a2e, hair: 0x151515, longHair: i % 2 === 1 }); p.position.set(x, 0, z); p.rotation.y = PI + ry; p.parts.head.rotation.x = .4; scene.add(p); });
    return { scene, camera: cam, update(t, k) { K.dolly(cam, k, [0, 3.2, 12], [0, 3.6, 10.6], [0, 1.4, -5]); flames.forEach(f => f.scale.setScalar(.8 + .35 * Math.sin(t * 9 + f.ph))); gl.intensity = 66 + 8 * Math.sin(t * 7); puffs.forEach(p => p(t * .6)); } };
  }
});

// 27. Italy invades Ethiopia, 1935
S({
  value: '1935', status: 'ETHIOPIA', sub: 'OCTOBER 3', statusColor: CORAL, caption: 'In Africa, Fascist Italy<br>invaded Ethiopia in 1935.',
  setup() {
    const M = mapScene('africa'), cam = K.camera(40); M.label('ETHIOPIA', 39.8, 6.6, 1.5); M.label('ITALIAN ERITREA', 36.5, 17.6, 1.1, '#cfd6cf'); M.label('ITALIAN SOMALILAND', 48.5, 1.4, 1.1, '#cfd6cf');
    const ar = [M.arrow([39, 15.2], [39.3, 11.2]), M.arrow([40.6, 14.2], [41, 10.6]), M.arrow([45.6, 3.2], [42.2, 7])], cap = M.dot(38.75, 9.0, 0xf3ead8);
    return { scene: M.scene, camera: cam, update(t, k) { M.cam(cam, k, [.4, 10.2, 7.6], [.2, 8.6, 6.2], [.2, 0, .2]); M.C.eritrea.tint(RED, .7); M.C.somaliland.tint(RED, .7); ar.forEach((a, i) => a.set(K.ramp(t, 1.5 + i * .3, .8))); M.C.ethiopia.tint(RED, .45 * K.ramp(t, 2.6, 1.2)); cap.pulse(t, 1); } };
  }
});
