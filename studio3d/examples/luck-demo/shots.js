/* 3D Kaz example: "What if your luck kept doubling?" — four 5-second shots.
   Copy this file into a new project folder and edit it. */
const K = KAZ;
K.config({ leftLabel: 'YOUR LUCK', rightLabel: 'YOU ARE', prefix: '×' });

// 1. Street: the hero outside his house, slow push-in
K.shot({
  dur: 5, value: '1', status: 'AVERAGE', sub: 'DAY 0',
  caption: 'One morning, your luck doubles.<br>The next day, it doubles again.',
  setup(K) {
    const scene = K.outdoor(), cam = K.camera(38);
    scene.add(K.road({ along: 'x', z: 7, x: 0, width: 6 }));
    scene.add(K.house(0, -3.2), K.house(-11, -3.6, { wall: 0xdccbb0, roof: 0x8a4b3c }), K.house(11.5, -3.4, { wall: 0xcfd6d2, roof: 0x4f5d53 }));
    scene.add(K.box(1.4, .05, 3.6, 0xb9ad98, 0, .03, 1.1));
    [[-4.6, .4, 1.1, 3], [5.2, -.2, 1.25, 7], [-7, -8, 1.5, 11], [7.5, -9, 1.6, 13], [-16, -2, 1.3, 17], [17, -1, 1.2, 19]].forEach(a => scene.add(K.tree(...a)));
    scene.add(K.fence(-4.2, 2, 4));
    const hero = K.person(); hero.baseY = .12; hero.position.set(.9, .12, 3.1); hero.rotation.y = .35; scene.add(hero);
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [5.2, 2.1, 10.5], [3.4, 1.75, 8.2], [.7, 1.25, 2.5]);
        K.idle(hero, t);
        hero.parts.armR.rotation.x = -K.ramp(t, 2.2, .8) * .5 * (1 - K.ramp(t, 3.8, .8));
      }
    };
  }
});

// 2. Kitchen: a coin drops, bounces and settles on its edge
K.shot({
  dur: 5, value: '1,000', status: 'LUCKY', sub: 'DAY 3',
  caption: 'You drop a coin.<br>It lands on its edge.',
  setup(K) {
    const scene = K.indoor(), cam = K.camera(34);
    const tb = K.table(); scene.add(tb);
    const ch = K.chair(); ch.position.set(-.5, 0, -1.05); ch.rotation.y = .25; scene.add(ch);
    scene.add(K.mug(-.7, tb.top, -.2), K.plate(.75, tb.top, -.25));
    const R = .075, coin = K.coin(R); scene.add(coin);
    const rest = tb.top + R, drop = 1, T0 = .5, g = 9.8, tf = Math.sqrt(2 * drop / g);
    const bounces = [.22, .09, .03].map(h => ({ h })); let tb2 = T0 + tf;
    bounces.forEach(b => { b.t0 = tb2; b.d = 2 * Math.sqrt(2 * b.h / g); tb2 += b.d; }); const tSettle = tb2;
    return {
      scene, camera: cam, update(t, k) {
        K.dolly(cam, k, [1.9, 1.35, 2.5], [1.25, 1.08, 1.75], [.15, tb.top + .06, 0]);
        let y = rest;
        if (t < T0) y = rest + drop;
        else if (t < T0 + tf) { const u = t - T0; y = rest + drop - .5 * g * u * u; }
        else for (const b of bounces) if (t >= b.t0 && t < b.t0 + b.d) { const u = t - b.t0; y = rest + Math.sqrt(2 * g * b.h) * u - .5 * g * u * u; }
        const air = K.clamp((tSettle - t) / (tSettle - T0));
        const wob = t > tSettle ? Math.sin((t - tSettle) * 11) * .22 * Math.exp(-(t - tSettle) * 1.8) : 0;
        coin.rotation.set(Math.max(0, t - T0) * 9 * air, .5 + Math.min(t, tSettle + 1.6) * 1.3, Math.PI / 2 + wob);
        coin.position.set(K.lerp(-.25, .15, K.smooth((t - T0) / (tSettle - T0 + .6))), y, 0);
      }
    };
  }
});

// 3. Road: every traffic light flips to green as he walks
K.shot({
  dur: 5, value: '1,000,000,000', status: 'UNBEATABLE', sub: 'DAY 9',
  caption: 'Every light turns green<br>the second you arrive.',
  setup(K) {
    const scene = K.outdoor({ sunPos: [-8, 12, 6], range: 30, fogNear: 20, fogFar: 95 }), cam = K.camera(40);
    scene.add(K.road());
    const lamps = []; for (let i = 0; i < 7; i++) { const l = K.trafficLight(); l.position.z = -4 - i * 11; l.at = 1 + i * .42; scene.add(l); lamps.push(l); }
    const walls = [0xe9dcc0, 0xdccbb0, 0xcfd6d2], roofs = [0x3f6f8f, 0x8a4b3c, 0x4f5d53];
    for (let i = 0; i < 9; i++) {
      scene.add(K.house(i % 2 ? -11 : 11, -8 - i * 13, { wall: walls[i % 3], roof: roofs[i % 3], rot: i % 2 ? Math.PI / 2 : -Math.PI / 2 }));
      scene.add(K.tree(i % 2 ? 7 : -7, -2 - i * 9, 1.1 + ((i * 7) % 4) * .1, 31 + i), K.tree(i % 2 ? -6.6 : 6.8, -6.5 - i * 9, 1.2, 57 + i));
    }
    const car = K.car(); scene.add(car);
    const hero = K.person(); hero.baseY = .12; hero.rotation.y = Math.PI; scene.add(hero);
    return {
      scene, camera: cam, update(t, k) {
        hero.position.x = 4.4; hero.position.z = 5.5 - t * 1.5; K.walk(hero, t * 7.2);
        car.position.set(-1.7, 0, -70 + t * 9);
        lamps.forEach(l => l.set(K.ramp(t, l.at, .12)));
        cam.position.set(K.lerp(1.2, .6, k), K.lerp(1.5, 1.9, k), K.lerp(11, 8.5, k)); cam.lookAt(1.6, 2.6, -22);
      }
    };
  }
});

// 4. Space: the planet starts to crack
K.shot({
  dur: 5, value: '10<sup>98</sup>', status: '???', statusColor: '#ff7a66', sub: 'DAY 50',
  caption: 'And it keeps multiplying.',
  setup(K) {
    const scene = K.space(), cam = K.camera(36), planet = K.planet(); scene.add(planet);
    return {
      scene, camera: cam, update(t, k) {
        planet.rotation.set(0, .4 + t * .09, .18);
        planet.setCracks(K.ramp(t, .6, 3.2), t);
        K.dolly(cam, k, [-1.2, .8, 17], [.2, .4, 13.5], [0, -.7, 0]);
      }
    };
  }
});
