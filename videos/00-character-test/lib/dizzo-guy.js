/*
 * DizzoGuy — bald, muscular ink-style character wearing a Dizzo cap.
 * Manga ink look on black (grey skin, one colour accent), fully rigged:
 * head, brows, eyes (blink), mouth (lip-sync), arms (shoulder/elbow/hand),
 * legs (hip/knee), body lean and bounce.
 *
 * All motion is deterministic: pose values are tweened with GSAP and one
 * driver tween (added LAST with rig.finalize) redraws the rig from the
 * current time, so seeking any frame gives the same picture.
 */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  let uid = 0;

  const REST = {
    x: 960, y: 560, s: 0.82, facing: 1, // placement on the 1920x1080 stage
    lean: 0, bob: 0, crouch: 0,
    head: 0, headY: 0, brow: 0, browTilt: 0, smile: 0.2, eyes: 0, // eyes: -1 left .. 1 right
    armL: 10, elbowL: 4, handL: 0,
    armR: -10, elbowR: -4, handR: 0,
    hipL: 2, kneeL: 0, hipR: -2, kneeR: 0,
    mouthBoost: 0, talk: 1, breathe: 1,
    flexGlow: 0,
  };

  function svgTemplate(id, logo) {
    const S = 'stroke="#050505" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"';
    const L = 'fill="none" stroke="#1d1d1d" stroke-width="2.6" stroke-linecap="round"';
    const skin = `url(#${id}-skin)`;
    const skinV = `url(#${id}-skinV)`;
    const shirt = `url(#${id}-shirt)`;
    const shorts = `url(#${id}-shorts)`;

    const arm = (side) => {
      const m = side === "L" ? -1 : 1; // mirror detail lines
      return `
      <g data-p="arm${side}">
        <path d="M -48 -4 Q -68 40 -56 100 Q -46 160 -31 204 L 31 204 Q 52 150 58 96 Q 66 36 48 -4 Z" fill="${skin}" ${S}/>
        <path d="M ${-10 * m} 110 Q ${6 * m} 140 ${-2 * m} 178" ${L} opacity=".55"/>
        <path d="M ${24 * m} 96 Q ${30 * m} 130 ${20 * m} 170" ${L} opacity=".35"/>
        <path d="M -60 -32 Q -72 30 -64 80 Q 0 94 66 78 Q 74 26 58 -34 Q 0 -50 -60 -32 Z" fill="${shirt}" ${S}/>
        <path d="M -63 72 Q 0 86 65 70" fill="none" stroke="#8a6a00" stroke-width="3"/>
        <path d="M ${-30 * m} 10 Q ${-36 * m} 40 ${-30 * m} 64" fill="none" stroke="#9c7800" stroke-width="2.5" opacity=".7"/>
        <g data-p="elbow${side}" >
          <path d="M -35 -4 Q -52 50 -40 110 Q -30 160 -23 192 L 23 192 Q 35 150 43 100 Q 52 40 33 -4 Z" fill="${skin}" ${S}/>
          <path d="M ${-14 * m} 30 Q ${-4 * m} 80 ${-8 * m} 130" ${L} opacity=".5"/>
          <path d="M ${16 * m} 20 Q ${22 * m} 60 ${14 * m} 100" ${L} opacity=".35"/>
          <rect x="-28" y="152" width="56" height="30" rx="6" fill="#121216" stroke="#3a3a44" stroke-width="2"/>
          <g data-p="hand${side}">
            <path d="M -31 -4 Q -40 32 -27 60 Q 0 72 27 60 Q 40 32 31 -4 Z" fill="${skin}" ${S}/>
            <path d="M -18 30 Q -6 36 0 30 M 0 30 Q 8 36 18 30 M -16 44 Q 0 50 16 44" ${L} opacity=".7"/>
            <path d="M ${-24 * m} 6 Q ${-34 * m} 22 ${-22 * m} 34" ${L} opacity=".7"/>
          </g>
        </g>
      </g>`;
    };

    const leg = (side) => `
      <g data-p="hip${side}">
        <path d="M -68 -14 L 70 -14 L 78 152 Q 6 166 -66 158 Z" fill="${shorts}" stroke="#3b3b47" stroke-width="3" stroke-linejoin="round"/>
        <path d="M ${side === "L" ? -50 : 54} 0 L ${side === "L" ? -48 : 60} 150" stroke="#5a5a68" stroke-width="3" fill="none"/>
        <path d="M -58 150 Q -64 205 -46 264 L 46 264 Q 64 205 66 150 Z" fill="${skin}" ${S}/>
        <path d="M -16 210 Q 0 240 12 212" ${L} opacity=".5"/>
        <g data-p="knee${side}">
          <path d="M -44 -6 Q -56 60 -38 160 L -27 252 L 25 252 Q 42 150 50 60 Q 52 20 44 -6 Z" fill="${skinV}" ${S}/>
          <path d="M ${side === "L" ? 18 : -18} 30 Q ${side === "L" ? 30 : -30} 80 ${side === "L" ? 20 : -20} 130" ${L} opacity=".45"/>
          <g transform="translate(0,250)">
            <path d="M -32 -4 L 32 -4 Q 44 26 42 40 L -42 40 Q -44 26 -32 -4 Z" fill="#1c1c22" stroke="#4a4a56" stroke-width="3" stroke-linejoin="round"/>
            <path d="M -44 40 L 44 40 L 42 50 L -42 50 Z" fill="#d9d9d9" stroke="#050505" stroke-width="2"/>
            <path d="M -14 4 L 14 4 M -16 14 L 16 14" stroke="#777" stroke-width="2.5"/>
          </g>
        </g>
      </g>`;

    return `
<svg xmlns="${NS}" viewBox="0 0 1920 1080" width="1920" height="1080" style="position:absolute;inset:0;overflow:visible">
  <defs>
    <linearGradient id="${id}-skin" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#6f6f6f"/><stop offset=".3" stop-color="#d6d6d6"/>
      <stop offset=".55" stop-color="#f2f2f2"/><stop offset="1" stop-color="#8b8b8b"/>
    </linearGradient>
    <linearGradient id="${id}-skinV" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#5e5e5e"/><stop offset=".4" stop-color="#cfcfcf"/>
      <stop offset=".6" stop-color="#e4e4e4"/><stop offset="1" stop-color="#7a7a7a"/>
    </linearGradient>
    <radialGradient id="${id}-face" cx=".5" cy=".42" r=".62">
      <stop offset="0" stop-color="#f4f4f4"/><stop offset=".7" stop-color="#cdcdcd"/><stop offset="1" stop-color="#7c7c7c"/>
    </radialGradient>
    <linearGradient id="${id}-shirt" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#a87f00"/><stop offset=".3" stop-color="#f6c814"/>
      <stop offset=".55" stop-color="#ffdc3f"/><stop offset="1" stop-color="#b98c00"/>
    </linearGradient>
    <linearGradient id="${id}-shorts" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#0d0d12"/><stop offset=".5" stop-color="#2a2a35"/><stop offset="1" stop-color="#0d0d12"/>
    </linearGradient>
    <linearGradient id="${id}-cap" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#0c0c10"/><stop offset=".5" stop-color="#2c2c36"/><stop offset="1" stop-color="#0c0c10"/>
    </linearGradient>
    <radialGradient id="${id}-glow" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#ffd320" stop-opacity=".55"/><stop offset="1" stop-color="#ffd320" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="${id}-logo"><rect x="-27" y="-198" width="54" height="54" rx="9"/></clipPath>
  </defs>
  <g data-p="root">
    <ellipse data-p="shadow" cx="0" cy="560" rx="190" ry="22" fill="#ffffff" opacity=".07"/>
    <ellipse data-p="glow" cx="0" cy="-200" rx="420" ry="420" fill="url(#${id}-glow)" opacity="0"/>
    <g data-p="legs">
      <g data-p="legLpos" transform="translate(-60,22)">${leg("L")}</g>
      <g data-p="legRpos" transform="translate(60,22)">${leg("R")}</g>
    </g>
    <g data-p="torso">
      <path d="M -112 -6 L 112 -6 L 118 56 Q 0 66 -118 56 Z" fill="${shorts}" stroke="#3b3b47" stroke-width="3"/>
      <path d="M -114 6 L 114 6" stroke="#4d4d5a" stroke-width="5"/>
      <path d="M -8 8 L -14 40 M 8 8 L 14 40" stroke="#888" stroke-width="2.5" fill="none"/>
      <path d="M -36 -360 L -38 -400 L 38 -400 L 36 -360 Z" fill="${skinV}" ${S}/>
      <path d="M -38 -372 Q -92 -350 -136 -328 L 136 -328 Q 92 -350 38 -372 Z" fill="${skin}" ${S}/>
      <path d="M -20 -392 Q -10 -360 -6 -340 M 20 -392 Q 10 -360 6 -340" ${L} opacity=".5"/>
      <g data-p="chest">
        <path d="M -42 -340 Q 0 -318 42 -340 L 120 -326 Q 162 -312 166 -262 L 152 -168 Q 130 -90 114 -10 L 112 18 Q 0 30 -112 18 L -114 -10 Q -130 -90 -152 -168 L -166 -262 Q -162 -312 -120 -326 Z" fill="${shirt}" ${S}/>
        <path d="M -124 -214 Q -64 -186 -10 -206 M 124 -214 Q 64 -186 10 -206" fill="none" stroke="#8a6a00" stroke-width="3.2" stroke-linecap="round"/>
        <path d="M 0 -296 L 0 -214" fill="none" stroke="#a07c00" stroke-width="2.5" opacity=".7"/>
        <path d="M -70 -150 Q -40 -136 -12 -148 M 70 -150 Q 40 -136 12 -148 M -64 -96 Q -36 -84 -10 -94 M 64 -96 Q 36 -84 10 -94" fill="none" stroke="#a07c00" stroke-width="2.4" opacity=".55"/>
        <path d="M -140 -170 Q -118 -110 -104 -40 M 140 -170 Q 118 -110 104 -40" fill="none" stroke="#8a6a00" stroke-width="2.4" opacity=".55"/>
        <path d="M -46 -338 Q 0 -306 46 -338" fill="none" stroke="#6b5200" stroke-width="7"/>
        <path d="M -46 -338 Q 0 -306 46 -338" fill="none" stroke="#e8b800" stroke-width="3"/>
        <image href="${logo}" x="-80" y="-280" width="34" height="34" opacity=".95" clip-path="inset(0 round 6px)"/>
      </g>
      <g data-p="headpos" transform="translate(0,-372)">
        <g data-p="head">
          <path d="M -54 -60 Q -88 -96 -66 -70 Q -78 -40 -56 -36 Z" fill="${skinV}" ${S}/>
          <path d="M 54 -60 Q 88 -96 66 -70 Q 78 -40 56 -36 Z" fill="${skinV}" ${S}/>
          <path d="M -68 -112 Q -72 -36 -54 -8 Q -30 22 0 22 Q 30 22 54 -8 Q 72 -36 68 -112 Q 64 -172 0 -174 Q -64 -172 -66 -112 Z" fill="url(#${id}-face)" ${S}/>
          <path d="M -66 -96 Q -76 -84 -70 -66 Q -76 -60 -66 -52 M 66 -96 Q 76 -84 70 -66 Q 76 -60 66 -52" fill="none" stroke="#050505" stroke-width="3"/>
          <path d="M -58 -132 Q -54 -150 -40 -158" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".85"/>
          <path d="M 58 -132 Q 54 -150 40 -158" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".5"/>
          <path d="M -48 -42 Q -40 -18 -22 -4 M 48 -42 Q 40 -18 22 -4 M -14 10 Q 0 15 14 10" ${L} opacity=".55"/>
          <path d="M -30 -40 Q -24 -32 -30 -24 M 30 -40 Q 24 -32 30 -24" ${L} opacity=".35"/>
          <path d="M -64 -104 Q 0 -86 64 -104 L 64 -88 Q 0 -66 -64 -88 Z" fill="#000" opacity=".28"/>
          <g data-p="browL"><path d="M -12 -92 L -50 -99 L -55 -91 L -16 -84 Z" fill="#050505"/></g>
          <g data-p="browR"><path d="M 12 -92 L 50 -99 L 55 -91 L 16 -84 Z" fill="#050505"/></g>
          <g data-p="eyes">
            <path d="M -16 -76 Q -34 -85 -52 -76 Q -34 -69 -16 -76 Z" fill="#f4f4f4" stroke="#050505" stroke-width="3.2"/>
            <path d="M 16 -76 Q 34 -85 52 -76 Q 34 -69 16 -76 Z" fill="#f4f4f4" stroke="#050505" stroke-width="3.2"/>
            <circle data-p="pupilL" cx="-34" cy="-77" r="5.5" fill="#050505"/>
            <circle data-p="pupilR" cx="34" cy="-77" r="5.5" fill="#050505"/>
            <path d="M -54 -80 Q -34 -92 -14 -80 M 54 -80 Q 34 -92 14 -80" fill="none" stroke="#050505" stroke-width="4"/>
          </g>
          <path d="M -2 -70 L -9 -40 Q -2 -33 8 -37" fill="none" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/>
          <path data-p="mouth" d="M -20 -14 Q 0 -10 20 -14 Q 0 -10 -20 -14 Z" fill="#2a0b0b" stroke="#050505" stroke-width="3.2" stroke-linejoin="round"/>
          <path data-p="teeth" d="" fill="#eee"/>
          <g data-p="cap" transform="translate(0,-10)">
            <path d="M -76 -118 Q -80 -200 0 -206 Q 80 -200 76 -118 Z" fill="url(#${id}-cap)" stroke="#050505" stroke-width="4"/>
            <path d="M -40 -130 Q -44 -190 0 -206 Q 44 -190 40 -130 Z" fill="#1d1d24" stroke="#3a3a46" stroke-width="2"/>
            <path d="M 0 -206 L 0 -200" stroke="#555" stroke-width="3"/>
            <circle cx="0" cy="-208" r="5" fill="#1d1d24" stroke="#555" stroke-width="2"/>
            <image href="${logo}" x="-27" y="-198" width="54" height="54" clip-path="url(#${id}-logo)"/>
            <rect x="-27" y="-198" width="54" height="54" rx="9" fill="none" stroke="#050505" stroke-width="2.5"/>
            <path d="M -60 -150 Q -66 -180 -46 -196" fill="none" stroke="#4a4a58" stroke-width="3" opacity=".8"/>
            <path d="M -84 -124 Q 0 -140 84 -124 Q 100 -104 78 -90 Q 0 -70 -78 -90 Q -100 -104 -84 -124 Z" fill="#17171d" stroke="#050505" stroke-width="4"/>
            <path d="M -78 -118 Q 0 -132 78 -118 M -74 -96 Q 0 -80 74 -96" fill="none" stroke="#3d3d4a" stroke-width="2.5"/>
          </g>
        </g>
      </g>
      <g data-p="armLpos" transform="translate(-130,-302)">${arm("L")}</g>
      <g data-p="armRpos" transform="translate(130,-302)">${arm("R")}</g>
    </g>
  </g>
</svg>`;
  }

  function create(container, opts = {}) {
    const id = "dg" + ++uid;
    const wrap = document.createElement("div");
    wrap.style.cssText = "position:absolute;inset:0;pointer-events:none";
    wrap.innerHTML = svgTemplate(id, opts.logo || "lib/cap_logo.png");
    container.appendChild(wrap);
    const q = (n) => wrap.querySelector(`[data-p="${n}"]`);
    const P = {};
    ["root", "torso", "head", "browL", "browR", "eyes", "pupilL", "pupilR", "mouth", "teeth", "armL", "armR", "elbowL", "elbowR", "handL", "handR", "hipL", "hipR", "kneeL", "kneeR", "glow", "shadow"].forEach((n) => (P[n] = q(n)));
    P.elbowL.dataset.y = 200; P.elbowR.dataset.y = 200;

    const pose = Object.assign({}, REST, opts.pose || {});
    let envelope = opts.envelope || null; // array of 0..1 loudness at envelopeFps
    const envFps = opts.envelopeFps || 30;
    const blinkTimes = opts.blinks || [];

    function mouthAt(t) {
      if (envelope) {
        const i = Math.max(0, Math.min(envelope.length - 1, Math.round(t * envFps)));
        return envelope[i];
      }
      return 0;
    }
    function blinkAt(t) {
      // deterministic blinks every ~3.4 s plus any extra times
      const p = (t + 0.7) % 3.4;
      let b = p < 0.14 ? Math.sin((p / 0.14) * Math.PI) : 0;
      for (const bt of blinkTimes) if (t >= bt && t < bt + 0.14) b = Math.sin(((t - bt) / 0.14) * Math.PI);
      return b;
    }
    const tr = (el, s) => el.setAttribute("transform", s);

    function render(t) {
      const p = pose;
      const br = Math.sin(t * 2.4) * p.breathe;          // breathing
      const sway = Math.sin(t * 1.1) * p.breathe;
      tr(P.root, `translate(${p.x},${p.y + p.bob + p.crouch * 60}) scale(${p.s * p.facing},${p.s})`);
      tr(P.torso, `translate(0,${p.crouch * 40}) rotate(${p.lean + sway * 0.8}) translate(0,${br * -2.5})`);
      tr(P.head, `translate(0,${p.headY}) rotate(${p.head + sway * 1.5})`);
      tr(P.browL, `translate(0,${-p.brow * 7}) rotate(${-p.browTilt * 8},-34,-92)`);
      tr(P.browR, `translate(0,${-p.brow * 7}) rotate(${p.browTilt * 8},34,-92)`);
      const bl = blinkAt(t);
      tr(P.eyes, `translate(0,${-77 * (1 - (1 - bl * 0.9))}) scale(1,${1 - bl * 0.9})`);
      P.pupilL.setAttribute("cx", -34 + p.eyes * 9); P.pupilR.setAttribute("cx", 34 + p.eyes * 9);
      tr(P.armL, `rotate(${p.armL - br * 1.2})`); tr(P.armR, `rotate(${p.armR + br * 1.2})`);
      tr(P.elbowL, `translate(0,200) rotate(${p.elbowL})`); tr(P.elbowR, `translate(0,200) rotate(${p.elbowR})`);
      tr(P.handL, `translate(0,190) rotate(${p.handL})`); tr(P.handR, `translate(0,190) rotate(${p.handR})`);
      tr(P.hipL, `rotate(${p.hipL})`); tr(P.hipR, `rotate(${p.hipR})`);
      tr(P.kneeL, `translate(0,262) rotate(${p.kneeL})`); tr(P.kneeR, `translate(0,262) rotate(${p.kneeR})`);
      // mouth: open from voice envelope, shaped by smile
      const o = Math.min(1, mouthAt(t) * p.talk + p.mouthBoost);
      const sm = p.smile;
      const w = 20 + sm * 4 - o * 4;
      const top = -14 - sm * 2;
      const corner = -14 - sm * 6;
      const bot = -10 + o * 26 + sm * 4;
      P.mouth.setAttribute("d", `M ${-w} ${corner} Q 0 ${top} ${w} ${corner} Q 0 ${bot} ${-w} ${corner} Z`);
      P.teeth.setAttribute("d", o > 0.25 ? `M ${-w + 5} ${corner + 1} Q 0 ${top + 1} ${w - 5} ${corner + 1} Q 0 ${top + 7} ${-w + 5} ${corner + 1} Z` : "");
      P.glow.setAttribute("opacity", p.flexGlow);
    }

    const rig = {
      pose, render, el: wrap,
      setEnvelope(e) { envelope = e; },
      /** tween pose values: rig.to(tl, {armR:-90}, 0.4, atSeconds, ease) */
      to(tl, vars, dur, at, ease) {
        tl.to(pose, Object.assign({ duration: dur, ease: ease || "power2.inOut" }, vars), at);
        return rig;
      },
      set(tl, vars, at) { tl.set(pose, vars, at); return rig; },
      rest(tl, dur, at, keys) {
        const v = {}; (keys || ["lean", "head", "headY", "brow", "browTilt", "eyes", "armL", "elbowL", "handL", "armR", "elbowR", "handR", "hipL", "kneeL", "hipR", "kneeR", "crouch", "bob", "mouthBoost", "flexGlow"]).forEach((k) => (v[k] = REST[k]));
        return rig.to(tl, v, dur, at);
      },
      /** must be called after every other tween is added to the timeline */
      finalize(tl, duration) {
        if (!tl.__rigs) {
          tl.__rigs = [];
          tl.eventCallback("onUpdate", () => { const t = tl.time(); tl.__rigs.forEach((f) => f(t)); });
          tl.to({}, { duration }, 0); // make sure the timeline is long enough
        }
        tl.__rigs.push(render);
        render(0);
      },
    };
    rig.REST = REST;
    render(0);
    return rig;
  }

  // ---------- gesture library (each returns end time) ----------
  const G = {
    wave(r, tl, at, side = "R") {
      const a = "arm" + side, e = "elbow" + side, sgn = side === "R" ? -1 : 1;
      r.to(tl, { [a]: 150 * sgn, [e]: 40 * sgn, smile: 1 }, 0.35, at, "back.out(1.6)");
      for (let i = 0; i < 3; i++) {
        r.to(tl, { [e]: 10 * sgn }, 0.18, at + 0.35 + i * 0.36, "sine.inOut");
        r.to(tl, { [e]: 45 * sgn }, 0.18, at + 0.53 + i * 0.36, "sine.inOut");
      }
      r.to(tl, { [a]: REST[a], [e]: REST[e], smile: 0.2 }, 0.4, at + 1.45);
      return at + 1.85;
    },
    point(r, tl, at, side = "R", up = 0) {
      const sgn = side === "R" ? -1 : 1;
      r.to(tl, { ["arm" + side]: (95 + up) * sgn, ["elbow" + side]: 8 * sgn, ["hand" + side]: 10 * sgn, eyes: -sgn, head: -6 * sgn, lean: -3 * sgn }, 0.35, at, "back.out(1.4)");
      return at + 0.35;
    },
    flex(r, tl, at, hold = 1) {
      r.to(tl, { armL: 95, elbowL: 120, armR: -95, elbowR: -120, handL: 20, handR: -20, brow: -1, browTilt: 1, smile: 0.6, crouch: 0.1, flexGlow: 1 }, 0.35, at, "back.out(2)");
      r.to(tl, { bob: -8 }, 0.12, at + 0.35, "sine.inOut");
      r.to(tl, { bob: 0 }, 0.2, at + 0.47, "sine.out");
      r.rest(tl, 0.45, at + 0.35 + hold);
      return at + 0.8 + hold;
    },
    shrug(r, tl, at) {
      r.to(tl, { armL: 30, elbowL: -70, handL: -40, armR: -30, elbowR: 70, handR: 40, brow: 1, head: 8, smile: -0.2 }, 0.3, at, "back.out(1.5)");
      r.rest(tl, 0.4, at + 1.1);
      return at + 1.5;
    },
    nod(r, tl, at, n = 2) {
      for (let i = 0; i < n; i++) {
        r.to(tl, { headY: 6, head: 2 }, 0.14, at + i * 0.3);
        r.to(tl, { headY: 0, head: 0 }, 0.16, at + i * 0.3 + 0.14);
      }
      return at + n * 0.3;
    },
    think(r, tl, at, hold = 1.2) {
      r.to(tl, { armR: -40, elbowR: 150, handR: -30, head: -8, eyes: 1, brow: 0.6, browTilt: -0.6, smile: 0 }, 0.4, at);
      r.rest(tl, 0.4, at + 0.4 + hold);
      return at + 0.8 + hold;
    },
    curl(r, tl, at, reps = 2, side = "R") {
      const sgn = side === "R" ? -1 : 1;
      r.to(tl, { ["arm" + side]: 5 * sgn, ["elbow" + side]: 0 }, 0.25, at);
      for (let i = 0; i < reps; i++) {
        r.to(tl, { ["elbow" + side]: -140 * sgn, brow: -0.8, browTilt: 1 }, 0.45, at + 0.25 + i * 0.9, "power2.out");
        r.to(tl, { ["elbow" + side]: 5 * sgn, brow: 0, browTilt: 0 }, 0.45, at + 0.7 + i * 0.9, "power2.in");
      }
      return at + 0.25 + reps * 0.9;
    },
    squat(r, tl, at, reps = 2) {
      for (let i = 0; i < reps; i++) {
        const t = at + i * 1.4;
        r.to(tl, { crouch: 2.3, hipL: 40, kneeL: -78, hipR: -40, kneeR: 78, armL: 80, armR: -80, elbowL: 0, elbowR: 0, lean: 0 }, 0.6, t, "power2.inOut");
        r.to(tl, { crouch: 0, hipL: 2, kneeL: 0, hipR: -2, kneeR: 0, armL: 10, armR: -10 }, 0.6, t + 0.7, "power2.inOut");
      }
      return at + reps * 1.4;
    },
    jumpIn(r, tl, at) {
      r.set(tl, { bob: -900 }, at);
      r.to(tl, { bob: 0 }, 0.5, at, "power3.in");
      r.to(tl, { crouch: 0.6 }, 0.1, at + 0.5, "power2.out");
      r.to(tl, { crouch: 0 }, 0.3, at + 0.6, "back.out(2)");
      return at + 0.9;
    },
  };

  window.DizzoGuy = { create, G, REST };
})();
