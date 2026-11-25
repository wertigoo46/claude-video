/* Dizzo Guy 3D character test — 5 shots, ~16 s */
const K = KAZ, D = K.D, PI = Math.PI;
K.config({ leftLabel: 'REPS', rightLabel: 'MUSCLE', prefix: '', capIn: .15, capOut: .25 });
let T0 = 0; const at = d => { const s = T0; T0 += d; return s; };   // absolute start time of each shot (lip-sync)

// 1. Gym wide, Dizzo waves hello
{ const st = at(3.6); K.shot({ dur: 3.6, hud: false, caption: "What's up, I'm the Dizzo guy.", setup() {
  const scene = K.gym(), cam = K.camera(36), g = K.dizzo(); g.position.set(0, 0, 0); scene.add(g);
  return { scene, camera: cam, update(t, k) {
    K.dolly(cam, k, [2.6, 1.9, 7.5], [1.5, 1.65, 5.4], [0, 1.35, 0]);
    D.reset(g); D.idle(g, t, .1); D.wave(g, t, K.ramp(t, .5, .4) * (1 - K.ramp(t, 2.9, .4))); D.talk(g, st + t); g.parts.mouth.scale.y *= 1; g.rotation.y = .15;
  } }; } }); }

// 2. Close-up: bald head, cap logo
{ const st = at(3.0); K.shot({ dur: 3.0, hud: false, caption: 'Bald head. Dizzo cap.<br>Always training.', setup() {
  const scene = K.gym(), cam = K.camera(30), g = K.dizzo(); scene.add(g);
  return { scene, camera: cam, update(t, k) {
    K.dolly(cam, k, [1.1, 2.0, 3.1], [.55, 1.95, 2.3], [0, 1.82, 0]);
    D.reset(g); D.idle(g, t, .15); D.talk(g, st + t); g.rotation.y = .2 + Math.sin(t * 1.2) * .1;
  } }; } }); }

// 3. Dumbbell curls with a rep counter
{ const st = at(3.6); K.shot({ dur: 3.6, value: (t) => String(D.reps(t, 1.4, .3)), status: 'BICEPS', sub: 'SET 1', caption: 'Curl it up,<br>squeeze at the top.', setup() {
  const scene = K.gym(), cam = K.camera(34), g = K.dizzo(); g.rotation.y = -.5; scene.add(g);
  const dl = K.dumbbell(), dr = K.dumbbell(); scene.add(dl, dr);
  const v = new K.THREE.Vector3();
  return { scene, camera: cam, update(t, k) {
    K.dolly(cam, k, [-2.8, 1.6, 4.4], [-2.2, 1.5, 3.5], [0, 1.3, 0]);
    D.reset(g); D.idle(g, t, 0); const c = D.rep(t, 1.4, .3); D.curl(g, c); D.brows(g, c * .7); D.talk(g, st + t);
    g.updateMatrixWorld(true);
    [[dl, 'elbowL'], [dr, 'elbowR']].forEach(([d, e]) => { const el = g.parts[e]; el.localToWorld(v.set(0, -.38, 0)); d.position.copy(v); d.quaternion.copy(el.getWorldQuaternion(new K.THREE.Quaternion())); d.rotateY(PI / 2); });
  } }; } }); }

// 4. Squats, side view
{ const st = at(3.4); K.shot({ dur: 3.4, value: (t) => String(D.reps(t, 1.6, .2)), status: 'LEGS', sub: 'SET 1', caption: 'Sit back, chest up,<br>drive through the floor.', setup() {
  const scene = K.gym(), cam = K.camera(36), g = K.dizzo(); g.rotation.y = PI / 2 - .25; scene.add(g);
  return { scene, camera: cam, update(t, k) {
    K.dolly(cam, k, [.6, 1.4, 6.4], [.3, 1.25, 5.4], [0, 1.0, 0]);
    D.reset(g); D.squat(g, D.rep(t, 1.6, .2) * .9); D.talk(g, st + t);
  } }; } }); }

// 5. Outdoor sunset flex + subscribe
{ const st = at(3.4); K.shot({ dur: 3.4, hud: false, caption: 'Subscribe and let’s get<br>stronger together.', setup() {
  const scene = K.outdoor({ mood: 'dusk' }), cam = K.camera(36), g = K.dizzo(); scene.add(g);
  [[-5, -6, 1.3, 3], [6, -8, 1.5, 7], [-9, -14, 1.6, 11], [11, -12, 1.4, 5]].forEach(a => scene.add(K.tree(...a)));
  scene.add(K.mountain(-14, -40, 2.2), K.mountain(16, -46, 2.6));
  return { scene, camera: cam, update(t, k) {
    K.dolly(cam, k, [0, .9, 6.8], [0, 1.15, 5.2], [0, 1.4, 0]);
    D.reset(g); D.idle(g, t, .05); D.flex(g, K.ramp(t, .4, .45)); D.talk(g, st + t);
  } }; } }); }
