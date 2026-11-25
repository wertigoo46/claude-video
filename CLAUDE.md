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
