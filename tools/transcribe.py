"""Word-level transcript + lip-sync envelope for a voiceover.

Usage: python3 tools/transcribe.py <voice.mp3|wav> <episode_dir>
Writes <episode_dir>/transcript.json  ([{"text","start","end"}...] per word)
       <episode_dir>/envelope.json    (mouth-open 0..1 at 30 fps)
       <episode_dir>/voice.wav        (48 kHz copy used by the render)
"""
import json, subprocess, sys, pathlib
import numpy as np
from faster_whisper import WhisperModel

src, out = sys.argv[1], pathlib.Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)
wav = out / "voice.wav"
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-ac", "2", "-ar", "48000", str(wav)], check=True)

raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(wav), "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
                     check=True, capture_output=True).stdout
x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768

model = WhisperModel("small", device="cpu", compute_type="int8")
segs, info = model.transcribe(x, word_timestamps=True, vad_filter=True, beam_size=5)
words = []
for s in segs:
    for w in s.words:
        words.append({"text": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)})
(out / "transcript.json").write_text(json.dumps(words, indent=1))

# loudness envelope -> mouth openness
hop = 16000 // 30
n = len(x) // hop
rms = np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
db = 20 * np.log10(rms)
lo, hi = np.percentile(db, 30), np.percentile(db, 97)
env = np.clip((db - lo) / max(hi - lo, 1e-3), 0, 1) ** 0.8
env = np.convolve(env, [0.25, 0.5, 0.25], mode="same")
(out / "envelope.json").write_text(json.dumps([round(float(v), 3) for v in env]))
print(f"{len(words)} words, {n/30:.1f}s, language={info.language}")
