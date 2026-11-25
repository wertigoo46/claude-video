# Dizzo YouTube video studio

Long-form (16:9) fitness explainer videos for the **Dizzo** channel, starring the Dizzo Guy:
a bald, muscular ink-style man in a black cap with the Dizzo logo (`assets/dizzo_logo.png`),
yellow Dizzo shirt, dark shorts.

## Style (reference: youtube.com/watch?v=HldH9VW_htk)
- Manga / ink illustration on a **pure black** background, grey skin, one colour accent
  (brand yellow `#FFD320`, orange `#FF4F1F` for warnings/"wrong").
- Hand-drawn white uppercase labels + arrows (font `lib/fonts/marker.woff2`), floor line, soft spotlight.
- Unlike the reference, the character is **always moving**: rig in `lib/dizzo-guy.js`
  (gestures in `DizzoGuy.G`: wave, point, flex, shrug, nod, think, curl, squat, jumpIn; any joint via `rig.to`).
  Lip-sync comes from `envelope.json`. Call `rig.finalize(tl, duration)` after all tweens.
- Camera moves (push-ins, pans) on the `#cam` wrapper every few seconds; no static shots over ~4 s.
- Subtitles: 2–4 word chunks, bottom centre, white marker font, keywords in yellow, from word timings.

## Workflow per topic
1. User gives a topic → write the script (3–4 min ≈ 480–600 words spoken). Hook in first 10 s,
   subscribe calls to action (early soft ask ~30 s, mid-video, strong ending), open loops.
   Then STOP and wait for the voiceover.
2. User uploads MP3/WAV → `python3 tools/transcribe.py <audio> videos/<NN-slug>/`
   (faster-whisper word timings + lip-sync envelope + voice.wav). Fix words against the script.
3. Build `videos/<NN-slug>/index.html` (HyperFrames, 1920x1080, 30 fps); copy `lib/` into the
   episode folder (the renderer does not follow symlinks). `npx hyperframes snapshot` to check.
4. `npx hyperframes render -o render.mp4` in the episode folder.
5. `tools/youtube_encode.sh render.mp4 "<Title>" "<Title>.mp4" voice.wav` → 1440p H.264 master
   (YouTube gives 1440p uploads its better codec), CRF 18 animation tune, AAC 192k, title metadata.
   Send the final file to the user. Videos are not committed (gitignored).
