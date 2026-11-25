#!/usr/bin/env node
/* 3D Kaz renderer — films a project's shots.js frame by frame and writes an MP4.
   Copyright (c) 2026 GrowKaz. See LICENSE at the plugin root.

   node render.js <project-dir> --stills            one still per shot + stills/sheet.jpg
   node render.js <project-dir> --stills --at 0.9   still at 90% through each shot (default 0.6)
   node render.js <project-dir>                     full render -> <project-dir>/out/video.mp4
   node render.js <project-dir> --shots 2,5         re-render only shots 2 and 5 (0-based), then rejoin
   Options: --size 1280x720 | 1920x1080 | 1080x1920 | 3840x2160   --fps 30
            --audio voice.mp3   --out name.mp4                                              */
const http = require('http'), fs = require('fs'), path = require('path');
const { spawn, spawnSync } = require('child_process');

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf('--' + n); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };
const project = path.resolve(args.find(a => !a.startsWith('--') && args[args.indexOf(a) - 1]?.startsWith('--') !== true) || args[0] || '.');
const studio = __dirname;
const [W, H] = String(flag('size', '1280x720')).split('x').map(Number);
const FPS = +flag('fps', 30), stills = !!flag('stills', false), at = +flag('at', .6);
const only = flag('shots', null) ? String(flag('shots')).split(',').map(Number) : null;
const audio = flag('audio', null), outName = flag('out', 'video.mp4');

function die(m) { console.error('3D Kaz: ' + m); process.exit(1); }
if (!fs.existsSync(path.join(project, 'shots.js'))) die(`no shots.js in ${project}`);
if (spawnSync('ffmpeg', ['-version']).status !== 0) die('ffmpeg is not installed or not on PATH');
const threePath = [path.join(studio, 'node_modules/three/build/three.min.js'), path.join(project, 'node_modules/three/build/three.min.js')].find(fs.existsSync);
if (!threePath) die('three.js is missing — run "npm install" inside the studio folder first');
let chromium; try { ({ chromium } = require('playwright')); } catch { die('Playwright is missing — run "npm install playwright && npx playwright install chromium"'); }

const files = { '/three.min.js': threePath, '/kit.js': path.join(studio, 'kit.js'), '/dizzo.js': path.join(studio, 'dizzo.js'), '/shots.js': path.join(project, 'shots.js') };
const srv = http.createServer((q, r) => {
  const u = q.url.split('?')[0], f = files[u] || (u === '/' ? path.join(studio, 'page.html') : null);
  if (!f) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': f.endsWith('.js') ? 'text/javascript' : 'text/html' }); fs.createReadStream(f).pipe(r);
});
const ff = a => new Promise((res, rej) => { const p = spawn('ffmpeg', ['-y', '-v', 'error', ...a], { stdio: ['ignore', 'inherit', 'inherit'] }); p.on('exit', c => c === 0 ? res() : rej(new Error('ffmpeg exited ' + c))); });

(async () => {
  await new Promise(r => srv.listen(0, r));
  const port = srv.address().port;
  const browser = await chromium.launch({ executablePath: process.env.KAZ_CHROME || (require('fs').existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined), args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', e => { errors.push(e.message); console.error('[shots.js error]', e.message); });
  await page.goto(`http://localhost:${port}/?w=${W}&h=${H}&fps=${FPS}`);
  await page.waitForFunction('window.KAZ_READY===true', null, { timeout: 30000 }).catch(() => die('page did not load: ' + (errors[0] || 'unknown error')));
  await page.evaluate(() => document.fonts.ready);
  const { durs } = await page.evaluate('window.KAZ_INFO()');
  if (!durs.length) die('shots.js registered no shots (call KAZ.shot({...}))');
  const pad = n => String(n).padStart(3, '0');
  const draw = (s, f) => page.evaluate(([s, f]) => window.KAZ_DRAW(s, f), [s, f]);

  if (stills) {
    const dir = path.join(project, 'stills'); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    for (let s = 0; s < durs.length; s++) {
      if (only && !only.includes(s)) continue;
      await draw(s, Math.min(Math.round(durs[s] * FPS) - 1, Math.round(durs[s] * FPS * at)));
      await page.screenshot({ path: path.join(dir, `shot${pad(s)}.jpg`), type: 'jpeg', quality: 90 });
      await page.evaluate(s => window.KAZ_FREE(s), s);
    }
    const n = fs.readdirSync(dir).length, cols = Math.min(4, n), rows = Math.ceil(n / cols), tw = W >= H ? 480 : 270;
    await ff(['-pattern_type', 'glob', '-i', path.join(dir, 'shot*.jpg'), '-vf', `scale=${tw}:-1,tile=${cols}x${rows}`, '-frames:v', '1', '-q:v', '3', path.join(dir, 'sheet.jpg')]);
    console.log(`stills: ${n} shots -> ${path.join(dir, 'sheet.jpg')}`);
  } else {
    const dir = path.join(project, 'out'), parts = path.join(dir, 'shots'); fs.mkdirSync(parts, { recursive: true });
    const total = durs.reduce((a, b) => a + b, 0), t00 = Date.now();
    for (let s = 0; s < durs.length; s++) {
      const out = path.join(parts, `shot${pad(s)}.mp4`), tmp = path.join(parts, `shot${pad(s)}.tmp.mp4`);
      if (only && !only.includes(s)) { if (!fs.existsSync(out)) die(`--shots given but ${out} has not been rendered yet`); continue; }
      const enc = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
        '-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-r', String(FPS), tmp], { stdio: ['pipe', 'inherit', 'inherit'] });
      const done = new Promise(r => enc.on('exit', r)), n = Math.round(durs[s] * FPS), t0 = Date.now();
      for (let f = 0; f < n; f++) {
        await draw(s, f);
        const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
        if (!enc.stdin.write(buf)) await new Promise(r => enc.stdin.once('drain', r));
      }
      enc.stdin.end();
      if ((await done) !== 0) die('ffmpeg failed on shot ' + s);
      fs.renameSync(tmp, out);
      await page.evaluate(s => window.KAZ_FREE(s), s);
      console.log(`shot ${s + 1}/${durs.length}: ${n} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    }
    if (errors.length) die('shots.js threw errors during the render; fix them and render again');
    const list = path.join(parts, 'list.txt');
    fs.writeFileSync(list, durs.map((_, s) => `file 'shot${pad(s)}.mp4'`).join('\n'));
    const silent = path.join(dir, audio ? 'silent.tmp.mp4' : outName), final = path.join(dir, outName);
    await ff(['-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', silent]);
    if (audio) {
      await ff(['-i', silent, '-i', path.resolve(audio), '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', final]);
      fs.rmSync(silent);
    }
    console.log(`done: ${final} (${total.toFixed(1)}s of video, ${W}x${H}@${FPS}, rendered in ${((Date.now() - t00) / 1000).toFixed(0)}s)`);
  }
  await browser.close(); srv.close();
})().catch(e => { console.error(e); process.exit(1); });
