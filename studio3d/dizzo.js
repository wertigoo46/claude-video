/* Dizzo add-on for the 3D Kaz kit: the Dizzo Guy (bald, muscular, black cap with the Dizzo
   logo, yellow shirt, dark shorts) with elbows/knees for exercise poses, lip-sync, and a gym set.
   Loaded after kit.js. Everything is a pure function of time. */
(function () {
  const K = window.KAZ, THREE = K.THREE, { mat, mesh, box, cyl, ball, clamp, lerp, ramp, smooth } = K;
  const SKIN = 0xd59b72, YELLOW = 0xffd320, ORANGE = 0xff4f1f, INK = 0x16161c, SHORTS = 0x2a2b33;

  // Dizzo logo drawn on a canvas (sync, no image loading): yellow tile, barbell, "dizzo".
  function logoCanvas(size = 256) {
    const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d'), u = size / 1080;
    g.fillStyle = '#ffd320'; g.fillRect(0, 0, size, size);
    g.fillStyle = '#151520';
    const rr = (x, y, w, h, r) => { g.beginPath(); g.roundRect(x * u, y * u, w * u, h * u, r * u); g.fill(); };
    rr(135, 364, 810, 28, 8);                       // bar
    rr(202, 256, 54, 243, 14); rr(824, 256, 54, 243, 14);   // big plates
    rr(307, 337, 22, 82, 6); rr(750, 337, 22, 82, 6);       // collars
    g.fillStyle = '#ff4f1f'; rr(264, 289, 36, 177, 10); rr(780, 289, 36, 177, 10);
    g.fillStyle = '#151520'; g.font = `800 ${300 * u}px Inter, "Helvetica Neue", Arial, sans-serif`;
    g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillText('dizzo', size / 2, 766 * u);
    return c;
  }
  let logoTex = null;
  function logoMat() {
    if (!logoTex) { logoTex = new THREE.CanvasTexture(logoCanvas(512)); logoTex.colorSpace = THREE.SRGBColorSpace; logoTex.anisotropy = 8; }
    return new THREE.MeshStandardMaterial({ map: logoTex, roughness: .8 });
  }

  /** The Dizzo Guy. ~2.0 m tall, faces +z. parts: legL/R kneeL/R armL/R elbowL/R head eyes mouth browL/R torso cap */
  function dizzo({ shirt = YELLOW, shorts = SHORTS, skin = SKIN } = {}) {
    const g = new THREE.Group(), p = {};
    const seg = (rt, rb, len, c, s = 8) => { const m = cyl(rt, rb, len, c, 0, -len / 2, 0, s); return m; };
    // legs: hip pivot -> thigh (shorts over top) -> knee pivot -> shin -> shoe
    [['L', -.15], ['R', .15]].forEach(([s, x]) => {
      const hip = new THREE.Group(); hip.position.set(x, .9, 0);
      hip.add(seg(.135, .12, .3, shorts)); hip.add(cyl(.115, .1, .46, skin, 0, -.23, 0, 8));
      const knee = new THREE.Group(); knee.position.y = -.46;
      knee.add(cyl(.1, .075, .4, skin, 0, -.2, 0, 8));
      knee.add(box(.17, .1, .32, 0xf2f2f2, 0, -.43, .06)); knee.add(box(.18, .04, .33, INK, 0, -.47, .06));
      hip.add(knee); g.add(hip); p['leg' + s] = hip; p['knee' + s] = knee;
    });
    // pelvis + V-taper torso
    g.add(cyl(.27, .25, .22, shorts, 0, .95, 0, 10)).scale;
    const torso = new THREE.Group(); torso.position.y = 1.04; g.add(torso); p.torso = torso;
    const chest = cyl(.38, .26, .6, shirt, 0, .3, 0, 10); chest.scale.z = .62; torso.add(chest);
    const pecs = box(.5, .2, .1, shirt, 0, .44, .17); torso.add(pecs);
    torso.add(cyl(.27, .25, .12, YELLOW === shirt ? 0xe8bd10 : shirt, 0, .02, 0, 10)).scale.z = .7; // hem band
    const badge = new THREE.Mesh(new THREE.PlaneGeometry(.09, .09), logoMat()); badge.position.set(-.14, .47, .222); torso.add(badge);
    // traps + neck
    const trap = cyl(.07, .2, .16, skin, 0, .64, -.01, 8); trap.scale.z = .7; torso.add(trap);
    torso.add(cyl(.11, .13, .16, skin, 0, .68, 0, 8));
    // arms: shoulder pivot -> deltoid ball + sleeve + upper arm -> elbow pivot -> forearm, wristband, fist
    [['L', -1], ['R', 1]].forEach(([s, m]) => {
      const sh = new THREE.Group(); sh.position.set(.4 * m, .58, 0);
      sh.add(ball(.13, shirt, 0, -.02, 0, 1));
      sh.add(cyl(.125, .115, .2, shirt, 0, -.09, 0, 8));
      sh.add(cyl(.105, .085, .36, skin, 0, -.2, 0, 8));
      const bicep = ball(.085, skin, 0, -.2, .04, 1); bicep.scale.set(1, 1.4, 1); sh.add(bicep);
      const el = new THREE.Group(); el.position.y = -.38;
      el.add(cyl(.085, .065, .34, skin, 0, -.17, 0, 8));
      el.add(cyl(.072, .072, .07, INK, 0, -.3, 0, 8));
      el.add(ball(.08, skin, 0, -.38, 0, 1));
      sh.add(el); torso.add(sh); p['arm' + s] = sh; p['elbow' + s] = el; p['hand' + s] = el;
    });
    // head (bald) + cap with logo
    const head = new THREE.Group(); head.position.y = .68; torso.add(head); p.head = head;
    const skull = mesh(new THREE.SphereGeometry(.22, 20, 14), mat(skin, { flatShading: false }), 0, .24, 0); skull.scale.set(1.02, 1.12, 1.04); head.add(skull);
        [-1, 1].forEach(m => { const e = ball(.05, skin, .215 * m, .23, 0, 1); e.scale.set(.6, 1, 1); head.add(e); });
    const ink = new THREE.MeshBasicMaterial({ color: 0x14110f });
    p.eyes = [-.075, .075].map(x => { const e = new THREE.Mesh(new THREE.SphereGeometry(.024, 8, 6), ink); e.position.set(x, .25, .21); head.add(e); return e; });
    p.browL = new THREE.Mesh(new THREE.BoxGeometry(.09, .022, .02), ink); p.browL.position.set(-.075, .3, .205); head.add(p.browL);
    p.browR = new THREE.Mesh(new THREE.BoxGeometry(.09, .022, .02), ink); p.browR.position.set(.075, .3, .205); head.add(p.browR);
    p.mouth = new THREE.Mesh(new THREE.BoxGeometry(.1, .02, .012), new THREE.MeshBasicMaterial({ color: 0x3a1410 })); p.mouth.position.set(0, .12, .215); head.add(p.mouth);
    const cap = new THREE.Group(); cap.position.set(0, .3, -.005); cap.rotation.x = -.12; head.add(cap); p.cap = cap;
    const dome = mesh(new THREE.SphereGeometry(.235, 18, 10, 0, Math.PI * 2, 0, Math.PI * .5), mat(INK, { flatShading: false, roughness: .7 })); dome.scale.set(1, .78, 1.05); cap.add(dome);
    const band = cyl(.237, .237, .035, 0x24242c, 0, .005, 0, 18); band.scale.z = 1.05; cap.add(band);
    const brim = mesh(new THREE.CylinderGeometry(.2, .2, .02, 18, 1, false, -Math.PI / 2, Math.PI), mat(0x202028, { roughness: .7 }), 0, -.005, .16); brim.scale.set(1.08, 1, 1.45); brim.rotation.x = .22; cap.add(brim);
    cap.add(ball(.022, 0x24242c, 0, .185, 0, 1));
    const lg = new THREE.Mesh(new THREE.PlaneGeometry(.13, .13), logoMat()); lg.position.set(0, .1, .215); lg.rotation.x = -.42; cap.add(lg);
    g.parts = p; g.baseY = 0;
    p.armL.rotation.z = -.12; p.armR.rotation.z = .12;
    return g;
  }

  // ---------- poses (all pure functions of t / k) ----------
  const D = {};
  /** reset joints to the neutral stance */
  D.reset = (g) => {
    const p = g.parts;
    ['legL', 'legR', 'kneeL', 'kneeR', 'armL', 'armR', 'elbowL', 'elbowR', 'head', 'torso'].forEach(n => p[n].rotation.set(0, 0, 0));
    p.armL.rotation.z = -.12; p.armR.rotation.z = .12; p.torso.position.y = 1.04; p.browL.rotation.z = p.browR.rotation.z = 0;
    p.browL.position.y = p.browR.position.y = .3; g.position.y = g.baseY;
  };
  /** breathing, gentle sway, blinking */
  D.idle = (g, t, look = .25) => {
    const p = g.parts;
    p.torso.position.y = 1.04 + Math.sin(t * 2.2) * .006;
    p.head.rotation.y += Math.sin(t * .8) * look; p.head.rotation.x += Math.sin(t * 1.3) * .03;
    p.armL.rotation.z += Math.sin(t * 2.2) * .02; p.armR.rotation.z -= Math.sin(t * 2.2) * .02;
    const b = (t + .4) % 3.3 < .13 ? .1 : 1; p.eyes.forEach(e => e.scale.y = b);
  };
  /** mouth from a loudness envelope (array at 30 fps, absolute video time T) or a fake talk pattern */
  D.talk = (g, T, env) => {
    let o;
    if (env) o = env[clamp(Math.round(T * 30), 0, env.length - 1)] || 0;
    else o = Math.max(0, Math.sin(T * 17) * .5 + Math.sin(T * 7.3) * .45);
    g.parts.mouth.scale.y = 1 + o * 3.2; g.parts.mouth.scale.x = 1 - o * .25;
  };
  D.brows = (g, a) => { const p = g.parts; p.browL.rotation.z = -a * .35; p.browR.rotation.z = a * .35; p.browL.position.y = p.browR.position.y = .3 - Math.abs(a) * .01; };
  /** wave with right hand; a = 0..1 raise amount */
  D.wave = (g, t, a = 1) => {
    const p = g.parts; p.armR.rotation.z = lerp(.12, 2.5, a); p.elbowR.rotation.z = lerp(0, .5 + Math.sin(t * 9) * .45, a);
  };
  /** point toward screen-left (character's right hand) at height h (-1..1) */
  D.point = (g, a = 1, h = 0) => { const p = g.parts; p.armR.rotation.z = lerp(.12, 1.45 + h * .4, a); p.armR.rotation.y = lerp(0, -.3, a); };
  /** double-biceps flex */
  D.flex = (g, a = 1) => {
    const p = g.parts; p.armL.rotation.z = lerp(-.12, -1.5, a); p.armR.rotation.z = lerp(.12, 1.5, a);
    p.elbowL.rotation.z = lerp(0, -1.9, a); p.elbowR.rotation.z = lerp(0, 1.9, a); D.brows(g, a * .8);
  };
  /** bicep curl; c = 0 (arm down) .. 1 (top). side 'R' | 'L' | 'both' */
  D.curl = (g, c, side = 'both') => {
    const p = g.parts;
    ['L', 'R'].forEach(s => { if (side !== 'both' && side !== s) return; p['arm' + s].rotation.x = -.15 * c; p['elbow' + s].rotation.x = -2.3 * c; p['arm' + s].rotation.z = s === 'L' ? -.08 : .08; });
  };
  /** bodyweight/barbell squat; d = 0 standing .. 1 deep */
  D.squat = (g, d, armsForward = true) => {
    const p = g.parts, hip = 1.55 * d, knee = 2.0 * d;
    p.legL.rotation.x = p.legR.rotation.x = -hip; p.kneeL.rotation.x = p.kneeR.rotation.x = knee;
    p.torso.rotation.x = .55 * d;
    const drop = .9 - (.46 * Math.cos(hip) + .44 * Math.cos(hip - knee));
    g.position.y = g.baseY - drop;
    if (armsForward) { p.armL.rotation.x = p.armR.rotation.x = -1.5 * d - .1 * d; }
  };
  /** cyclic rep value 0..1..0 with a pause at the bottom: period seconds */
  D.rep = (t, period = 1.6, start = 0) => { if (t < start) return 0; const x = ((t - start) % period) / period; return x < .45 ? smooth(x / .45) : x < .55 ? 1 : 1 - smooth((x - .55) / .45); };
  D.reps = (t, period = 1.6, start = 0) => t < start ? 0 : Math.floor((t - start) / period + .5);

  // ---------- gym props + set ----------
  function dumbbell(len = .32, plate = INK) {
    const g = new THREE.Group(); g.add(cyl(.022, .022, len, 0x9a9aa2, 0, 0, 0, 8));
    [-1, 1].forEach(m => { const h = cyl(.07, .07, .09, plate, 0, m * len * .42, 0, 6); g.add(h); });
    g.rotation.z = Math.PI / 2; const w = new THREE.Group(); w.add(g); return w;
  }
  function barbell(len = 2.2) {
    const g = new THREE.Group(); g.add(cyl(.02, .02, len, 0xb5b5bd, 0, 0, 0, 8));
    [-1, 1].forEach(m => { g.add(cyl(.22, .22, .06, INK, 0, m * (len / 2 - .28), 0, 14)); g.add(cyl(.17, .17, .05, ORANGE, 0, m * (len / 2 - .36), 0, 14)); g.add(cyl(.04, .04, .05, 0x777, 0, m * (len / 2 - .42), 0, 8)); });
    g.rotation.z = Math.PI / 2; const w = new THREE.Group(); w.add(g); return w;
  }
  function bench() {
    const g = new THREE.Group();
    g.add(box(.36, .1, 1.3, INK, 0, .45, 0)); g.add(box(.34, .02, 1.28, 0x2c2c34, 0, .51, 0));
    [-.5, .5].forEach(z => { g.add(box(.08, .42, .08, 0x55555e, 0, .2, z)); g.add(box(.42, .05, .08, 0x55555e, 0, .02, z)); });
    return g;
  }
  function rack() {
    const g = new THREE.Group();
    g.add(box(2.4, .08, .5, 0x3a3a42, 0, .55, 0)); g.add(box(2.4, .08, .5, 0x3a3a42, 0, .95, 0));
    [-1.15, 1.15].forEach(x => g.add(box(.08, 1.1, .5, 0x3a3a42, x, .5, 0)));
    for (let i = 0; i < 6; i++) { const d = dumbbell(.28, i % 2 ? INK : 0x33333b); d.position.set(-.95 + i * .38, 1.05, 0); d.rotation.y = Math.PI / 2; g.add(d); const e = dumbbell(.26); e.position.set(-.95 + i * .38, .65, 0); e.rotation.y = Math.PI / 2; g.add(e); }
    return g;
  }
  /** Warm Kaz-style gym room: rubber floor, painted walls, brand stripe, racks, a window. */
  function gym({ mood } = {}) {
    const sc = K.indoor({ wall: mood === 'night' ? 0x3a3f5a : 0xd8cdb8, floor: 0x3b3d44, window: true, mood });
    sc.add(box(30, .5, .22, YELLOW, 0, 1.3, -3.86));
    sc.add(box(.22, .5, 30, YELLOW, -5.86, 1.3, 0));
    for (let i = -6; i <= 6; i++) sc.add(box(.02, .005, 30, 0x34363c, i * 1.2, .003, 0));
    const r = rack(); r.position.set(-2.6, 0, -3.4); sc.add(r);
    const b = bench(); b.position.set(3.2, 0, -1.6); b.rotation.y = .4; sc.add(b);
    const s = K.sign('DIZZO GYM', 2.6, .5, { bg: '#16161c', color: '#ffd320' }); s.position.set(0, 3.1, -3.85); sc.add(s);
    const plt = cyl(.22, .22, .06, INK, 4.5, .22, -3.2, 14); plt.rotation.x = Math.PI / 2 - .2; sc.add(plt);
    const plt2 = cyl(.17, .17, .05, ORANGE, 4.1, .17, -3.25, 14); plt2.rotation.x = Math.PI / 2 - .15; sc.add(plt2);
    return sc;
  }

  Object.assign(K, { dizzo, D, dumbbell, barbell, bench, rack, gym, logoCanvas, YELLOW, ORANGE });
})();
