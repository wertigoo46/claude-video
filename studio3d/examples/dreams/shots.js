/* "How does your brain create dreams?" — 22 shots cut to the voiceover (77.1 s). */
const K = KAZ, T = K.THREE, PI = Math.PI;
K.config({ leftLabel: 'SLEEP STAGE', rightLabel: 'YOU ARE', prefix: '', capIn: .08, capOut: .18 });

// cut points in seconds, placed in the pauses of the voiceover
const B = [0, 2.25, 4.57, 7.80, 11.88, 15.70, 21.04, 25.99, 31.90, 33.98, 37.0, 39.14, 43.3, 46.0, 49.79, 53.13, 57.85, 63.2, 65.3, 67.97, 71.09, 74.98, 77.1];
let n = 0;
const S = o => { const i = n++; K.shot(Object.assign({ dur: (Math.round(B[i + 1] * 30) - Math.round(B[i] * 30)) / 30, value: 'REM', status: 'DREAMING', sub: '3:12 AM' }, o)); };
const CORAL = '#ff7a66';
const pop = (t, t0, len = .35) => { const r = K.ramp(t, t0, len); return Math.max(.001, r * (1 + .3 * Math.sin(r * PI))); };

// ---------- shared builders ----------
const dream = o => K.outdoor(Object.assign({ skyTop: '#3d2f7a', skyBottom: '#f2b3cd', fog: 0xe3b1cf, grass: 0x79b88a, fogFar: 80 }, o));

function brain() {
  const g = new T.Group(), m = K.mat(0xe89aa8, { emissive: 0xff4f7a, emissiveIntensity: .15 });
  const lobe = () => {
    const geo = new T.IcosahedronGeometry(1, 2), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), s = 1 + .05 * (Math.sin(x * 7) + Math.sin(y * 9 + 1) + Math.sin(z * 8 + 2)); p.setXYZ(i, x * s, y * s, z * s); }
    return geo;
  };
  [-1, 1].forEach(sx => { const l = K.mesh(lobe(), m, sx * .4, 0, 0); l.scale.set(.7, .78, 1.05); g.add(l); });
  g.add(K.ball(.4, 0xd98494, 0, -.52, -.72, 1)); g.add(K.cyl(.14, .1, .6, 0xd9a0a0, 0, -.85, -.35, 7));
  const sm = new T.MeshBasicMaterial({ color: 0xfff2a8, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false });
  const sparks = []; for (let i = 0; i < 18; i++) { const s = new T.Mesh(new T.SphereGeometry(.07, 8, 6), sm); g.add(s); sparks.push(s); }
  g.setActivity = (a, t) => {
    m.emissiveIntensity = .12 + a * (.55 + .25 * Math.sin(t * 9)); sm.opacity = a;
    sparks.forEach((s, i) => {
      const u = t * (1.5 + (i % 5) * .6) + i * 2.4;
      const v = new T.Vector3(Math.sin(u * 1.1 + i), Math.abs(Math.sin(u * .7 + i * .3)) * .9 + .1, Math.cos(u * .9 + i * 1.7)).normalize();
      s.position.set(v.x * .95 + (v.x > 0 ? .15 : -.15), v.y * .84, v.z * 1.12); s.scale.setScalar(.6 + .6 * Math.abs(Math.sin(u * 3)));
    });
  };
  g.setActivity(0, 0); return g;
}

// bedroom at night with the sleeper; everything sits in a group at BED
const BED = [-3.4, 0, -2.6], HEAD = [BED[0], .75, BED[2] - .74];
function bedroom({ blanket = true } = {}) {
  const scene = K.indoor({ mood: 'night', window: false }), g = new T.Group(); g.position.set(...BED); scene.add(g);
  g.add(K.bed());
  const sl = K.person(); sl.rotation.x = -PI / 2; sl.position.set(0, .72, 1.0); sl.parts.eyes.forEach(e => e.scale.set(1.6, .22, 1)); g.add(sl);
  const bl = K.box(1.52, .2, 1.3, 0x4f7fd0, 0, .78, .42); bl.visible = blanket; g.add(bl);
  g.add(K.box(.5, .55, .45, 0x4a3524, 1.25, .28, -.8));
  g.add(K.box(.3, .14, .1, 0x1a1a1a, 1.25, .62, -.8)); g.add(K.box(.22, .07, .02, 0xff3b30, 1.25, .62, -.745, { emissive: 0xff3b30, emissiveIntensity: 2.5 }));
  g.add(K.box(2.6, .02, 1.6, 0x6a5aa0, 1.2, .01, 1.0));
  scene.add(K.box(1.8, 1.4, .08, 0x26386e, -1.0, 2.4, -3.88, { emissive: 0x3a5bb0, emissiveIntensity: .9 }));
  scene.add(K.box(2.0, .1, .14, 0x2a2d4a, -1.0, 1.65, -3.84)); scene.add(K.box(.06, 1.4, .1, 0x2a2d4a, -1.0, 2.4, -3.84));
  const moon = new T.Mesh(new T.SphereGeometry(.16, 16, 12), new T.MeshBasicMaterial({ color: 0xfff6d8 })); moon.position.set(-.55, 2.75, -3.83); scene.add(moon);
  scene.add(new T.AmbientLight(0x8898ff, 1.0)); const fill = new T.PointLight(0xc8d4ff, 34, 14); fill.position.set(BED[0] + 1.6, 3.1, BED[2] + 2.6); scene.add(fill);
  const b = brain(); b.scale.setScalar(.42); b.position.set(HEAD[0], 2.15, HEAD[2] + .1); b.visible = false; scene.add(b);
  const breathe = t => { bl.scale.y = 1 + .12 * Math.sin(t * 1.6); bl.position.y = .78 + .012 * Math.sin(t * 1.6); };
  return { scene, g, sl, bl, brain: b, breathe };
}
const wideCam = (cam, k, a = [0.4, 2.4, 1.6], b = [-.3, 2.1, .9], look = [-3.2, .8, -2.9]) => K.dolly(cam, k, a, b, look);

function hallway() {
  const scene = K.indoor({ window: false, wall: 0xdfe3e8, floor: 0xb9b3a6 });
  for (let i = 0; i < 16; i++) { scene.add(K.box(.72, 2.1, .5, i % 2 ? 0x3f6fa8 : 0x4a7fbd, -5.4 + i * .76, 1.05, -3.6)); scene.add(K.box(.07, .28, .04, 0x1c2a3a, -5.2 + i * .76, 1.3, -3.33)); }
  for (let i = 0; i < 5; i++) scene.add(K.box(1.6, .06, .5, 0xfffbe8, -4 + i * 2.6, 3.4, -1, { emissive: 0xfff4c8, emissiveIntensity: 1.2 }));
  const home = K.house(0, 0, { wall: 0xf0d9a8, roof: 0xb5503c, door: 0x7a4a26 }); home.scale.setScalar(.5); home.position.set(-.9, 0, -.6); home.rotation.y = .35; scene.add(home);
  const hero = K.person(); scene.add(hero);
  return { scene, home, hero };
}

function island(r = 1.6) {
  const g = new T.Group(); g.add(K.cyl(r, r * .85, .35, 0x79b86a, 0, -.175, 0, 9));
  const d = K.mesh(new T.ConeGeometry(r * .85, 1.3, 9), K.mat(0x8a6a48), 0, -1.0, 0); d.rotation.x = PI; g.add(d); return g;
}
function heart() {
  const g = new T.Group(), m = K.mat(0xe8455a, { emissive: 0xff2a4a, emissiveIntensity: .6, flatShading: true });
  [-1, 1].forEach(s => g.add(K.mesh(new T.IcosahedronGeometry(.5, 1), m, s * .36, .28, 0)));
  const c = K.mesh(new T.ConeGeometry(.86, 1.15, 12), m, 0, -.42, 0); c.rotation.x = PI; c.scale.z = .6; g.add(c);
  g.mat = m; return g;
}
function pieces() {
  const scene = new T.Scene(); scene.background = K.skyGradient('#241a55', '#c77fb2');
  K.lights(scene, { sun: 0xffe6f2, sunI: 2.2, sky: 0xd9c2ff, ground: 0x6a4a8a, hemiI: 1.2, pos: [5, 9, 7], range: 10 });
  const a = island(); const h = K.house(0, 0, { wall: 0xf0d9a8, roof: 0xb5503c, door: 0x7a4a26 }); h.scale.setScalar(.36); a.add(h); a.add(K.tree(1.05, .7, .45, 5));
  const b = island(); [[-.6, .1, .4, { shirt: 0xc25b4a, hair: 0x2a1d14 }], [0, -.2, 0, { shirt: 0xd9a441, hair: 0xb08a4a, longHair: true }], [.6, .15, -.4, { shirt: 0x7a5fb0, hair: 0x9a9a9a }]].forEach(([x, z, r, o]) => { const p = K.person(o); p.scale.setScalar(.8); p.position.set(x, 0, z); p.rotation.y = r; b.add(p); });
  const c = island(); const car = K.car(0xe0b23a); car.scale.setScalar(.48); car.rotation.y = .9; car.position.set(-.2, 0, .1); c.add(car); const tl = K.trafficLight(); tl.scale.setScalar(.36); tl.position.set(-.5, 0, -.7); tl.set(1); c.add(tl);
  const base = [[-3.7, -.1, 0], [0, -1.0, 1], [3.7, -.1, 0]];
  const isl = [a, b, c]; isl.forEach((o, i) => { o.position.set(...base[i]); scene.add(o); });
  const ht = heart(); ht.position.set(0, 1.9, 0); ht.visible = false; scene.add(ht);
  const br = brain(); br.scale.setScalar(.62); br.position.set(0, 2.5, -1); scene.add(br);
  return { scene, isl, base, heart: ht, brain: br };
}

// sleep-stage chart drawn as an HTML card
const HYP = [[0, 0], [.2, 0], [.2, 2], [.5, 2], [.5, 3], [.9, 3], [.9, 4], [1.5, 4], [1.5, 3], [1.7, 3], [1.7, 1], [1.9, 1], [1.9, 3], [2.4, 3], [2.4, 4], [3.0, 4], [3.0, 3], [3.3, 3], [3.3, 1], [3.7, 1], [3.7, 3], [4.4, 3], [4.4, 4], [4.7, 4], [4.7, 3], [5.0, 3], [5.0, 1], [5.6, 1], [5.6, 3], [6.3, 3], [6.3, 1], [7.1, 1], [7.1, 3], [7.5, 3], [7.5, 1], [7.9, 1], [7.9, 0], [8, 0]];
const NAMES = ['Awake', 'REM', 'N1', 'N2', 'N3'], hx = h => 70 + h * 68, hy = l => 30 + l * 36;
function chart(p, rem, t) {
  let len = 0; const seg = []; for (let i = 1; i < HYP.length; i++) { const d = Math.hypot(hx(HYP[i][0]) - hx(HYP[i - 1][0]), hy(HYP[i][1]) - hy(HYP[i - 1][1])); seg.push(d); len += d; }
  let rest = p * len, cx = hx(0), cy = hy(0), lvl = 0, pts = `${hx(0)},${hy(0)}`;
  for (let i = 1; i < HYP.length; i++) {
    const x0 = hx(HYP[i - 1][0]), y0 = hy(HYP[i - 1][1]), x1 = hx(HYP[i][0]), y1 = hy(HYP[i][1]), d = seg[i - 1];
    if (rest >= d) { pts += ` ${x1},${y1}`; rest -= d; cx = x1; cy = y1; lvl = HYP[i][1]; }
    else { const f = d ? rest / d : 0; cx = x0 + (x1 - x0) * f; cy = y0 + (y1 - y0) * f; pts += ` ${cx},${cy}`; lvl = y0 === y1 ? HYP[i][1] : HYP[i - 1][1]; break; }
  }
  const labels = NAMES.map((nm, l) => `<text x="58" y="${hy(l) + 4}" text-anchor="end" font-size="14" fill="${l === 1 && rem > 0 ? CORAL : '#cfc8e8'}" font-weight="${l === 1 && rem > 0 ? 700 : 500}">${nm}</text><line x1="70" x2="614" y1="${hy(l)}" y2="${hy(l)}" stroke="rgba(255,255,255,.08)"/>`).join('');
  let rems = ''; if (rem > 0) for (let i = 1; i < HYP.length; i++) if (HYP[i][1] === 1 && HYP[i - 1][1] === 1) rems += `<line x1="${hx(HYP[i - 1][0])}" x2="${hx(HYP[i][0])}" y1="${hy(1)}" y2="${hy(1)}" stroke="${CORAL}" stroke-width="${7 + 2 * Math.sin(t * 6)}" stroke-linecap="round" opacity="${rem}"/>`;
  const f = [9, 8, 6, 4, 1.6][lvl], amp = [5, 6, 8, 11, 19][lvl]; let w = '';
  for (let i = 0; i <= 136; i++) { const x = 70 + i * 4; w += `${x},${232 + Math.sin(i * .09 * f + t * (2 + f * .7)) * amp * (.75 + .25 * Math.sin(i * .21 + t))} `; }
  return `<h4>One night of sleep</h4><svg viewBox="0 0 640 262" style="width:40em;display:block">${labels}${rems}
    <polyline points="${pts}" fill="none" stroke="#f3ead8" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="${cx}" cy="${cy}" r="6" fill="${lvl === 1 ? CORAL : '#e8c56a'}"/>
    <text x="70" y="200" font-size="12" letter-spacing="2" fill="#cfc8e8">BRAIN ACTIVITY · ${NAMES[lvl].toUpperCase()}</text>
    <polyline points="${w}" fill="none" stroke="${lvl === 1 ? CORAL : '#8fd0ff'}" stroke-width="2"/></svg>`;
}

// ================= SHOTS =================

// 1. flying over a city
S({
  caption: 'Last night, you might have<br>flown over a city,',
  setup() {
    const scene = K.outdoor({ mood: 'dusk', grass: 0x2a2f45, fogNear: 40, fogFar: 150, range: 60, sunPos: [20, 30, 10] }), cam = K.camera(46), r = K.rng(11);
    const cols = [0x39406a, 0x4a4f7a, 0x2f355a, 0x5a4a6a];
    for (let gx = -5; gx <= 5; gx++) for (let gz = 0; gz < 26; gz++) {
      const h = 3 + r() * 12, x = gx * 6 + (gx >= 0 ? 3 : -3), z = gz * 6;
      scene.add(K.box(3.8, h, 3.8, cols[Math.floor(r() * 4)], x, h / 2, z));
      scene.add(K.box(3.86, .35, 3.86, 0xffd27a, x, h * (.35 + r() * .5), z, { emissive: 0xffc75a, emissiveIntensity: 1.6 }));
    }
    const hero = K.person(); hero.rotation.x = PI / 2; scene.add(hero);
    return {
      scene, camera: cam, update(t) {
        const z = 8 + t * 15, p = hero.parts;
        hero.position.set(Math.sin(t * 1.3) * .8, 21 + Math.sin(t * 2) * .35, z); hero.rotation.z = Math.sin(t * 1.3) * .18;
        p.armL.rotation.set(PI - .15, 0, -.25); p.armR.rotation.set(PI - .15, 0, .25); p.legL.rotation.x = .1 * Math.sin(t * 5); p.legR.rotation.x = -.1 * Math.sin(t * 5);
        cam.position.set(1.8, 23.4, z - 4.6); cam.lookAt(0, 19.8, z + 9);
      }
    };
  }
});

// 2. talking to someone you haven't seen in years
S({
  caption: 'talked to someone you<br>haven\'t seen in years,',
  setup() {
    const scene = dream(), cam = K.camera(36);
    scene.add(K.tree(-3, -2.5, 1.4, 4, [0xd98ab0, 0xe6a3c2, 0xc777a0]), K.tree(3.4, -3.5, 1.6, 8, [0xd98ab0, 0xe6a3c2, 0xc777a0]), K.tree(-6.5, -6, 1.5, 15), K.house(8, -9, { wall: 0xe9dcc0, roof: 0x7a5fb0 }));
    scene.add(K.box(2.2, .1, .5, 0x8a5a2f, 0, .5, -1.6), K.box(2.2, .5, .1, 0x8a5a2f, 0, .85, -1.85), K.box(.1, .5, .4, 0x5f381c, -.9, .25, -1.6), K.box(.1, .5, .4, 0x5f381c, .9, .25, -1.6));
    const hero = K.person(); hero.position.set(-.62, 0, 0); hero.rotation.y = PI / 2 - .25; scene.add(hero);
    const old = K.person({ shirt: 0x8a6fc2, pants: 0x4a4f66, hair: 0xb9b9b9 }); old.position.set(.62, 0, 0); old.rotation.y = -PI / 2 + .25; scene.add(old);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [.5, 1.55, 4.6], [.2, 1.5, 3.8], [0, 1.25, 0]);
        hero.parts.head.rotation.x = .08 * Math.sin(t * 6); hero.parts.armR.rotation.x = -.5 - .3 * Math.sin(t * 5); hero.parts.mouth.scale.y = 1 + 2.5 * Math.abs(Math.sin(t * 9));
        old.parts.armL.rotation.z = -2.5 + .35 * Math.sin(t * 10); old.parts.head.rotation.z = .08 * Math.sin(t * 3);
      }
    };
  }
});

// 3. a test you never studied for
S({
  caption: 'or found yourself taking a test<br>you never studied for.',
  setup() {
    const scene = K.indoor({ wall: 0xd9dfd2, floor: 0x9a8a6a }), cam = K.camera(36);
    scene.add(K.box(4.6, 1.7, .08, 0x2f5a45, -.5, 2.2, -3.86), K.box(4.8, .1, .14, 0x8a5a2f, -.5, 1.3, -3.82));
    const desk = (x, z) => { const d = K.table({ w: 1.1, d: .65, h: .72, color: 0xc9a56a }); d.position.set(x, 0, z); scene.add(d); return d; };
    desk(0, .3); scene.add(K.box(.36, .012, .48, 0xffffff, .02, .73, .34));
    const pen = K.box(.03, .03, .2, 0x2f5fb0, .3, .745, .3); pen.rotation.y = .5; scene.add(pen);
    const hero = K.person(); K.sit(hero); hero.position.set(0, -.32, -.25); scene.add(hero);
    [[-1.8, -1.4, { shirt: 0xc25b4a }], [1.8, -1.4, { shirt: 0xd9a441, longHair: true, hair: 0x2a1d14 }], [0, -2.2, { shirt: 0x7a5fb0, hair: 0x151515 }]].forEach(([x, z, o]) => { desk(x, z + .55); const p = K.person(o); K.sit(p); p.position.set(x, -.32, z); p.parts.head.rotation.x = .35; scene.add(p); });
    const clock = K.cyl(.32, .32, .06, 0xffffff, 2.6, 2.9, -3.86, 20); clock.rotation.x = PI / 2; scene.add(clock);
    const hand = K.box(.03, .26, .02, 0xd93b30, 2.6, 2.9, -3.8); scene.add(hand);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [1.5, 1.7, 3.2], [.9, 1.5, 2.5], [0, 1.0, 0]);
        hero.parts.head.rotation.y = .5 * Math.sin(t * 4.2); hero.parts.head.rotation.x = .12; hand.rotation.z = -t * 3;
        hero.parts.armL.rotation.set(-2.6, 0, .5); hero.parts.armR.rotation.set(-2.6, 0, -.5);
      }
    };
  }
});

// 4. meanwhile, in bed
S({
  status: 'ASLEEP', caption: 'While all of this was happening, you were<br>lying in bed with your eyes closed.',
  setup() { const b = bedroom(), cam = K.camera(38); return { scene: b.scene, camera: cam, update(t, k) { wideCam(cam, k, [1.6, 2.9, 2.6], [.2, 2.2, 1.3]); b.breathe(t); } }; }
});

// 5. the question
S({
  value: '?', status: 'ASLEEP', caption: 'So how does your brain create<br>dreams that can feel so real?',
  setup() {
    const scene = K.space({ stars: 500, seed: 3 }); scene.background = new T.Color(0x0d0a22); const cam = K.camera(36), b = brain(); scene.add(b);
    scene.add(new T.HemisphereLight(0xcdb8ff, 0x3a2a55, 1.1));
    return { scene, camera: cam, update(t, k) { b.rotation.y = -.7 + t * .35; b.rotation.x = .1; b.setActivity(.25 + .5 * K.ramp(t, 1.2, 1.5), t); K.dolly(cam, k, [0, .6, 7.5], [0, .3, 5.4], [0, 0, 0]); } };
  }
});

// 6. the brain stays active
S({
  value: 'N2', status: 'ASLEEP', sub: '11:48 PM', caption: 'The answer begins with something surprising:<br>your brain stays active while you sleep.',
  setup() {
    const b = bedroom(), cam = K.camera(38); b.brain.visible = true;
    for (let i = 0; i < 5; i++) { const d = new T.Mesh(new T.SphereGeometry(.035, 8, 6), new T.MeshBasicMaterial({ color: 0xffc7d6 })); d.position.set(HEAD[0], 1.1 + i * .16, HEAD[2] + .05); b.scene.add(d); }
    return { scene: b.scene, camera: cam, update(t, k) { wideCam(cam, k, [.4, 2.5, 1.8], [-.5, 2.3, 1.0], [-3.2, 1.25, -2.9]); b.breathe(t); b.brain.rotation.y = .5 + t * .25; b.brain.position.y = 2.15 + .05 * Math.sin(t * 2); b.brain.setActivity(.1 + .9 * K.ramp(t, 2.5, .7), t); } };
  }
});

// 7. stages through the night
S({
  value: 'N1 – N3', status: 'ASLEEP', sub: '11 PM – 7 AM', caption: 'Throughout the night, it moves through different stages,<br>each with its own patterns of brain activity.',
  card: (t, k) => chart(K.clamp(t / 4.4) * .62, 0, t),
  setup() { const b = bedroom(), cam = K.camera(38); return { scene: b.scene, camera: cam, update(t, k) { wideCam(cam, k, [.6, 2.6, 2.2], [.3, 2.5, 1.9]); b.breathe(t); } }; }
});

// 8a. REM
S({
  statusColor: CORAL, caption: 'You can dream during several of these stages, but especially<br>vivid dreams often happen during REM sleep,',
  card: (t, k) => chart(.62 + .38 * K.clamp(t / 4.6), K.ramp(t, 2.6, .6), t),
  setup() { const b = bedroom(), cam = K.camera(38); return { scene: b.scene, camera: cam, update(t, k) { wideCam(cam, k, [.3, 2.5, 1.9], [0, 2.4, 1.6]); b.breathe(t); } }; }
});

// 8b. rapid eye movement
S({
  statusColor: CORAL, caption: 'which stands for rapid eye movement.',
  card: t => `<h4>REM</h4><b><span style="color:${CORAL}">R</span>apid <span style="color:${CORAL}">E</span>ye <span style="color:${CORAL}">M</span>ovement</b>`,
  setup() { const b = bedroom(), cam = K.camera(38); return { scene: b.scene, camera: cam, update(t, k) { wideCam(cam, k, [0, 2.4, 1.6], [-.4, 2.3, 1.2]); b.breathe(t); } }; }
});

// 9a. eyes moving under the lids
S({
  statusColor: CORAL, caption: 'During this stage, your eyes<br>move beneath your eyelids,',
  setup() {
    const b = bedroom(), cam = K.camera(30); cam.up.set(0, 0, -1);
    const cl = new T.PointLight(0xdfe6ff, 6, 6); cl.position.set(HEAD[0] + .7, 2.0, HEAD[2] + .9); b.scene.add(cl);
    const base = b.sl.parts.eyes.map(e => e.position.x);
    return {
      scene: b.scene, camera: cam, update(t, k) {
        const dart = Math.sin(t * 13) * .6 + Math.sin(t * 7.3 + 1) * .4, e = K.smooth(k);
        b.sl.parts.eyes.forEach((ey, i) => { ey.position.x = base[i] + dart * .03; ey.scale.set(1.6, .22 + .1 * Math.abs(dart), 1); });
        cam.position.set(HEAD[0] + .05, K.lerp(2.5, 1.95, e), HEAD[2] + .12); cam.lookAt(HEAD[0], .9, HEAD[2] + .02); b.breathe(t);
      }
    };
  }
});

// 9b. brain highly active
S({
  statusColor: CORAL, caption: 'and your brain becomes highly active.',
  setup() {
    const b = bedroom(), cam = K.camera(36); b.brain.visible = true; const pl = new T.PointLight(0xff7a9a, 0, 6); pl.position.copy(b.brain.position); b.scene.add(pl);
    return { scene: b.scene, camera: cam, update(t, k) { b.brain.rotation.y = .3 + t * .5; b.brain.setActivity(1, t); b.brain.scale.setScalar(.46 + .03 * Math.sin(t * 10)); pl.intensity = 5 + 2 * Math.sin(t * 9); K.dolly(cam, k, [-1.6, 2.2, .4], [-2.0, 2.3, -.3], [HEAD[0], 1.75, HEAD[2]]); b.breathe(t); } };
  }
});

// 10a. muscles held still
function locked() {
  const b = bedroom({ blanket: false }), rm = new T.MeshBasicMaterial({ color: 0x6fe0ff, transparent: true, opacity: 0 }), rings = [];
  [[-.34, -.15, .13], [.34, -.15, .13], [-.13, .48, .16], [.13, .48, .16], [-.13, .2, .16], [.13, .2, .16], [-.34, .08, .13], [.34, .08, .13]].forEach(([x, z, r]) => { const m = new T.Mesh(new T.TorusGeometry(r, .022, 8, 20), rm); m.position.set(x, .72, z); b.g.add(m); rings.push(m); });
  b.rings = rings; b.rm = rm; return b;
}
S({
  status: 'HELD STILL', caption: 'Meanwhile, most of your voluntary muscles<br>are temporarily prevented from moving,',
  setup() {
    const b = locked(), cam = K.camera(36);
    return { scene: b.scene, camera: cam, update(t, k) { b.rm.opacity = .9; b.rings.forEach((r, i) => r.scale.setScalar(pop(t, .5 + i * .16, .3) * (1 + .06 * Math.sin(t * 6 + i)))); K.dolly(cam, k, [-1.2, 3.6, .2], [-1.8, 3.2, -.3], [BED[0], .6, BED[2] + .1]); } };
  }
});

// 10b. so you don't act out the dream
S({
  status: 'HELD STILL', caption: 'which usually keeps you from<br>acting out your dreams.',
  setup() {
    const b = locked(), cam = K.camera(38), gm = new T.MeshBasicMaterial({ color: 0x9fe8ff, transparent: true, opacity: .0, depthWrite: false });
    const ghost = K.person(); ghost.traverse(o => { if (o.isMesh) { o.material = gm; o.castShadow = false; } }); ghost.rotation.y = PI / 2; ghost.baseY = 1.25; b.g.add(ghost);
    return { scene: b.scene, camera: cam, update(t, k) { b.rm.opacity = .9; gm.opacity = .5 * K.ramp(t, .15, .5); K.walk(ghost, t * 12, .9); ghost.position.x = -.3 + .25 * Math.sin(t * 1.5); wideCam(cam, k, [.4, 2.5, 1.7], [0, 2.4, 1.3]); } };
  }
});

// 11. inside your head
S({
  statusColor: CORAL, caption: 'But inside your head,<br>a whole experience can unfold.',
  setup() {
    const b = bedroom(), cam = K.camera(36), gm = new T.MeshBasicMaterial({ color: 0xcdb0ff, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false, depthTest: false, side: T.DoubleSide });
    const glowS = new T.Mesh(new T.SphereGeometry(1, 32, 20), gm); glowS.position.set(...HEAD); b.scene.add(glowS);
    return { scene: b.scene, camera: cam, update(t, k) { const e = K.smooth(k); cam.position.set(K.lerp(-.6, HEAD[0] + .35, e * e), K.lerp(2.3, 1.25, e), K.lerp(.9, HEAD[2] + .7, e * e)); cam.lookAt(HEAD[0], .85, HEAD[2]); gm.opacity = .95 * K.ramp(t, 1.7, 1.8); glowS.scale.setScalar(.05 + 7 * K.ramp(t, .9, 1.5)); b.breathe(t); } };
  }
});

// 12. cut off from the outside world
S({
  caption: 'Without the usual stream of information<br>from the world around you,',
  setup() {
    const b = bedroom(), cam = K.camera(38), pm = new T.MeshBasicMaterial({ color: 0xbfe0ff, transparent: true, opacity: 1 }), ps = [];
    for (let i = 0; i < 36; i++) { const m = new T.Mesh(new T.SphereGeometry(.045, 8, 6), pm); b.scene.add(m); ps.push(m); }
    const L = []; b.scene.traverse(o => { if (o.isLight) L.push([o, o.intensity]); });
    const bg0 = b.scene.background.clone(), from = [new T.Vector3(-1.0, 2.4, -3.8), new T.Vector3(1.5, 1.6, 1.5)], to = new T.Vector3(HEAD[0], .95, HEAD[2]);
    return {
      scene: b.scene, camera: cam, update(t, k) {
        const off = K.ramp(t, .9, 1.6); pm.opacity = 1 - off;
        ps.forEach((m, i) => { const u = ((t * .45 + i / 36) % 1) * (1 - .55 * off); m.position.lerpVectors(from[i % 2], to, u); m.position.y += Math.sin(u * PI) * .5; });
        L.forEach(([l, i0]) => l.intensity = i0 * (1 - .6 * off)); b.scene.background.copy(bg0).multiplyScalar(1 - .75 * off); b.scene.fog.color.copy(b.scene.background);
        wideCam(cam, k, [.6, 2.6, 2.1], [0, 2.3, 1.4]); b.breathe(t);
      }
    };
  }
});

// 13. the brain generates everything itself
S({
  statusColor: CORAL, caption: 'your brain generates images, sounds,<br>feelings, and stories internally.',
  setup() {
    const scene = K.space({ stars: 300, seed: 8 }); scene.background = new T.Color(0x120b28); scene.add(new T.HemisphereLight(0xd9c8ff, 0x3a2a55, 1.3));
    const cam = K.camera(36), b = brain(); scene.add(b);
    const pic = new T.Group(); pic.add(K.box(1.1, .85, .06, 0xffffff), K.box(.94, .69, .07, 0x8fc9f2), K.box(.94, .22, .08, 0x6dae4a, 0, -.235, 0)); const sun = K.ball(.11, 0xffd24a, .25, .15, .05, 1, { emissive: 0xffc21a, emissiveIntensity: 1 }); pic.add(sun);
    const note = new T.Group(), nm = { emissive: 0x3fb0ff, emissiveIntensity: .7 }; note.add(K.ball(.2, 0x6fd0ff, -.12, -.3, 0, 1, nm), K.box(.06, .75, .06, 0x6fd0ff, .05, .05, 0, nm), K.box(.3, .12, .06, 0x6fd0ff, .2, .38, 0, nm));
    const ht = heart(); ht.scale.setScalar(.62);
    const book = new T.Group(); book.add(K.box(.8, .12, 1.0, 0xfff7e6), K.box(.84, .04, 1.04, 0x8a5fc2, 0, -.08, 0), K.box(.84, .04, 1.04, 0x8a5fc2, 0, .08, 0), K.box(.04, .2, 1.04, 0x8a5fc2, -.42, 0, 0)); book.rotation.set(.9, .4, .2);
    const items = [[pic, [-3.3, .95, 0], 1.35], [note, [-2.5, -.75, .4], 2.05], [ht, [2.5, -.75, .4], 2.75], [book, [3.3, .95, 0], 3.5]];
    items.forEach(([o]) => scene.add(o));
    return {
      scene, camera: cam, update(t, k) {
        b.rotation.y = -.4 + t * .3; b.setActivity(1, t);
        items.forEach(([o, p, t0], i) => { const s = pop(t, t0), e = K.ramp(t, t0, .5); o.scale.setScalar(s * (o === ht ? .62 : 1)); o.position.set(p[0] * e, p[1] * e + .12 * Math.sin(t * 2 + i), p[2]); if (o !== book) o.rotation.y = .25 * Math.sin(t * 1.3 + i); });
        K.dolly(cam, k, [0, .2, 9.6], [0, .1, 8.8], [0, -.75, 0]);
      }
    };
  }
});

// 14. pieces of your life
S({
  caption: 'It draws on pieces of your life, including memories,<br>familiar faces, recent experiences,',
  setup() {
    const P = pieces(), cam = K.camera(38);
    return {
      scene: P.scene, camera: cam, update(t, k) {
        P.brain.rotation.y = t * .4; P.brain.setActivity(.8, t);
        P.isl.forEach((o, i) => { const t0 = [2.45, 3.35, 4.2][i], e = K.ramp(t, t0, .5); o.scale.setScalar(pop(t, t0)); o.position.set(P.base[i][0] * e, K.lerp(2.3, P.base[i][1], e) + .1 * Math.sin(t * 1.5 + i * 2), P.base[i][2]); o.rotation.y = .3 * Math.sin(t * .6 + i); });
        K.dolly(cam, k, [0, 1.6, 9.5], [0, 1.2, 10.8], [0, -.2, 0]);
      }
    };
  }
});

// 15. what matters emotionally
S({
  caption: 'and things that matter to you emotionally.',
  setup() {
    const P = pieces(), cam = K.camera(38); P.heart.visible = true; P.brain.visible = false; const pl = new T.PointLight(0xff4a6a, 6, 9); pl.position.set(0, 1.9, 1); P.scene.add(pl);
    return { scene: P.scene, camera: cam, update(t, k) { const beat = 1 + .12 * Math.pow(Math.abs(Math.sin(t * 5.2)), 6); P.heart.scale.setScalar(pop(t, .1, .3) * 1.15 * beat); P.heart.rotation.y = .3 * Math.sin(t * 1.2); P.heart.mat.emissiveIntensity = .5 + .6 * (beat - 1) * 8; P.isl.forEach((o, i) => o.position.y = P.base[i][1] + .1 * Math.sin(t * 1.5 + i * 2)); K.dolly(cam, k, [0, 1.3, 10.8], [0, 1.5, 9.2], [0, .2, 0]); } };
  }
});

// 16. no logic required
S({
  caption: 'These pieces don\'t have to<br>fit together logically.',
  setup() {
    const P = pieces(), cam = K.camera(40); P.brain.visible = false;
    const rot = [[PI, .3, .2], [.5, 0, -PI / 2], [-.4, 1.2, PI / 2 + .3]], pos = [[-2.4, 1.6, 0], [.3, -.6, 1.2], [2.6, 1.0, -.5]];
    return {
      scene: P.scene, camera: cam, update(t, k) {
        const e = K.ramp(t, .1, 1.3);
        P.isl.forEach((o, i) => { o.position.set(K.lerp(P.base[i][0], pos[i][0], e), K.lerp(P.base[i][1], pos[i][1], e), K.lerp(P.base[i][2], pos[i][2], e)); o.rotation.set(rot[i][0] * e, rot[i][1] * e + t * .15, rot[i][2] * e); });
        cam.position.set(Math.sin(t * .3) * 1.5, 1.2, 10.2); cam.up.set(Math.sin(.18 * e), Math.cos(.18 * e), 0); cam.lookAt(0, 0, 0);
      }
    };
  }
});

// 17. childhood home inside your school
S({
  caption: 'Your childhood home might appear<br>in the middle of your current school,',
  setup() {
    const H = hallway(), cam = K.camera(38); H.hero.position.set(2.3, 0, .9); H.hero.rotation.y = -1.1;
    return { scene: H.scene, camera: cam, update(t, k) { H.home.scale.setScalar(.5 * pop(t, .75, .4)); K.idle(H.hero, t); H.hero.parts.head.rotation.y = -.25; H.hero.parts.head.rotation.z = .12 * K.ramp(t, 1.2, .4); K.dolly(cam, k, [2.6, 1.9, 7.4], [1.9, 1.7, 6.2], [0, 1.2, -.5]); } };
  }
});

// 18. a friend becomes someone else
S({
  caption: 'or a friend might suddenly turn into<br>a completely different person.',
  setup() {
    const scene = dream(), cam = K.camera(36);
    scene.add(K.tree(-3.4, -2.8, 1.4, 4, [0xd98ab0, 0xe6a3c2, 0xc777a0]), K.tree(3.6, -3.2, 1.5, 9), K.house(-9, -10, { roof: 0x7a5fb0 }), K.fence(1.6, -1.6, 4));
    const hero = K.person(); hero.position.set(-.75, 0, 0); hero.rotation.y = PI / 2 - .35; scene.add(hero);
    const A = K.person({ shirt: 0xc25b4a, pants: 0x3d4a66, hair: 0x2a1d14 }), Bp = K.person({ shirt: 0xe0b23a, pants: 0x6a4a8a, skin: 0x9a6a4a, hair: 0xd9d2c2, longHair: true });
    const holder = new T.Group(); holder.position.set(.75, 0, 0); holder.add(A, Bp); scene.add(holder);
    const fm = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false }), flash = new T.Mesh(new T.SphereGeometry(1.3, 20, 14), fm); flash.position.set(.75, 1.1, 0); scene.add(flash);
    const T0 = 1.75;
    return {
      scene, camera: cam, update(t, k) {
        const sw = K.ramp(t, T0, .45); holder.rotation.y = -PI / 2 + .35 + sw * PI * 4;
        A.visible = sw < .5; Bp.visible = sw >= .5; const sq = 1 - .25 * Math.sin(sw * PI); holder.scale.set(sq, 1 + .12 * Math.sin(sw * PI), sq);
        fm.opacity = .8 * Math.sin(sw * PI); flash.scale.setScalar(.6 + sw);
        A.parts.armR.rotation.x = -.5 - .3 * Math.sin(t * 5); Bp.parts.armL.rotation.z = -2.4 + .3 * Math.sin(t * 9);
        hero.parts.head.rotation.z = -.2 * K.ramp(t, T0 + .4, .4); hero.parts.head.rotation.x = .05 * Math.sin(t * 5) * (1 - sw);
        K.dolly(cam, k, [.3, 1.55, 4.9], [.1, 1.5, 4.1], [0, 1.2, 0]);
      }
    };
  }
});

// 19. and you accept it
S({
  caption: 'And somehow, you accept it.',
  setup() {
    const H = hallway(), cam = K.camera(34); H.hero.position.set(1.6, 0, 1.6); H.hero.rotation.y = .15;
    return {
      scene: H.scene, camera: cam, update(t, k) {
        const s = K.ramp(t, .25, .35) * (1 - .6 * K.ramp(t, 1.5, .5)), p = H.hero.parts;
        p.armL.rotation.set(-.5 * s, 0, -.75 * s); p.armR.rotation.set(-.5 * s, 0, .75 * s); p.torso.position.y = 1.12 + .03 * s; p.head.rotation.z = .16 * s; p.armL.position.y = p.armR.position.y = 1.38 + .05 * s;
        K.dolly(cam, k, [2.3, 1.6, 6.2], [2.1, 1.55, 5.4], [1.1, 1.2, .6]);
      }
    };
  }
});
