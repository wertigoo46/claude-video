# Dizzo YouTube video studio

Long-form (16:9) fitness explainer videos for the **Dizzo** channel, starring the Dizzo Guy:
a bald, muscular ink-style man in a black cap with the Dizzo logo (`assets/dizzo_logo.png`),
yellow Dizzo shirt, dark shorts.

## Style: 3D Kaz look (current)
Low-poly flat-shaded three.js scenes, filmed by `studio3d/render.js` (copy of the 3d-kaz skill
studio, patched to load `studio3d/dizzo.js` and use /opt/pw-browsers/chromium).
- Character: `K.dizzo()` — bald, black cap with the Dizzo logo (drawn on canvas), yellow shirt,
  dark shorts, elbows + knees. Poses in `K.D`: reset, idle, talk (lip-sync from envelope), brows,
  wave, point, flex, curl, squat, rep/reps (rep cycles + counter). Props: `K.gym()` set,
  `K.dumbbell()`, `K.barbell()`, `K.bench()`, `K.rack()`. Call `D.reset(g)` first in every update.
- Kaz overlay: HUD (left REPS/value, right MUSCLE/status), italic serif captions (script verbatim,
  two lines), cards and titles. Slow dolly moves, one subject per shot, cuts in voice pauses.
- Test: `videos3d/00-character-test/shots.js`. Earlier 2D HyperFrames rig kept in `lib/` (unused).

## Workflow per topic
1. User gives a topic → write the script (3–4 min ≈ 480–600 words spoken). Hook in first 10 s,
   subscribe calls to action (early soft ask ~30 s, mid-video, strong ending), open loops.
   Then STOP and wait for the voiceover.
2. User uploads MP3/WAV → `python3 tools/transcribe.py <audio> videos3d/<NN-slug>/`
   (faster-whisper word timings + lip-sync envelope + voice.wav). Cut points from word timings.
3. Write `videos3d/<NN-slug>/shots.js` (embed envelope as `const ENV=[...]`, pass to `D.talk`).
   QC: `node studio3d/render.js videos3d/<slug> --stills --at 0.7 --size 1920x1080`.
4. `node studio3d/render.js videos3d/<slug> --size 1920x1080 --audio videos3d/<slug>/voice.wav --out render.mp4`
   (run in background; ~10 s render per 1 s of video).
5. `tools/youtube_encode.sh videos3d/<slug>/out/render.mp4 "<Title>" "videos3d/<slug>/<Title>.mp4" videos3d/<slug>/voice.wav`
   → 1440p H.264 (YouTube gives 1440p uploads its better codec), CRF 21 (~65–70 MB per 4 min),
   AAC 192k, title metadata. Send the file to the user. Videos are not committed.

## User preference: always include copyable narration
Whenever the user gives a topic, include the clean TTS narration (plain text, no labels/asterisks,
numbers spelled out) in a fenced code block right after the scene breakdown, so they can copy it
without waiting for approval. Default length for shorts: ~30 s (≈75 words), 9:16 Stickman neonGold style.

## Shorts default settings (saved by user — reuse for every new short)
Studio: `growkaz-stickman-studio/` (GrowKaz Stickman), `projects/<slug>/`, 9:16 1080p 30 fps, captions on
(`captionStyle: {hi:'#3fd8ff'}`), hero = neon-blue stick figure with white headband (`scenes/cast.js`, `neon()` glow).
Styles: `neonGold` (yellow cinematic) or `neonNoir` (dark cinematic, `bars: "scope"`) — ask/infer from the request.
Music: the user's track "X-COOL! (Sped Up)" (`projects/creatine-vs-protein/input/music.wav`). Cut it from 0 s to
video length + 1 s with the intro (first 3.8 s) boosted ×2.2:
`ffmpeg -i music.wav -t <dur> -af "volume='if(lt(t,3.8),2.2,if(lt(t,4.1),2.2-1.2*(t-3.8)/0.3,1))':eval=frame" -ar 48000 -ac 2 input/music_cut.wav`
config.json music: `{"enabled":true,"file":"input/music_cut.wav","gainDb":-1,"duckDb":-5,"fadeOut":1.2}`;
sfx `{"enabled":true,"gainDb":-5}` (never use the "buzz" SFX — it's a fly; use "glitch" for wrong/✗).
Final TikTok encode (from build/video_silent.mp4 + build/mix.wav):
`ffmpeg -i build/video_silent.mp4 -i build/mix.wav -map 0:v -map 1:a -c:v libx264 -preset slow -profile:v high -level 4.2 -pix_fmt yuv420p -crf 17 -maxrate 12M -bufsize 24M -r 30 -g 60 -bf 2 -c:a aac -b:a 192k -ar 44100 -shortest -movflags +faststart <out>.mp4`
(~20–28 MB per 30 s). Send with SendUserFile; videos not committed.
