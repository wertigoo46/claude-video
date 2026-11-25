#!/usr/bin/env bash
# Usage: tools/youtube_encode.sh <rendered.mp4> "<Video Title>" <out.mp4> [voiceover.(mp3|wav)]
# YouTube-ready master: 2560x1440 (YouTube serves 1440p uploads with its higher-quality
# VP9/AV1 encode, so 1080p viewers see less blocking), H.264 High, 30 fps, CRF 18
# tuned for flat animation (stays small), AAC 192k 48 kHz, faststart, title metadata.
set -euo pipefail
in="$1"; title="$2"; out="$3"; audio="${4:-}"
args=(-y -hide_banner -loglevel error -i "$in")
if [ -n "$audio" ]; then args+=(-i "$audio" -map 0:v:0 -map 1:a:0 -shortest); else args+=(-map 0:v:0 -map "0:a?"); fi
ffmpeg "${args[@]}" \
  -vf "scale=2560:1440:flags=lanczos,format=yuv420p" -r 30 \
  -c:v libx264 -profile:v high -level 5.1 -preset slow -crf 18 -tune animation \
  -g 60 -bf 2 \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a aac -b:a 192k -ar 48000 -ac 2 \
  -movflags +faststart -metadata title="$title" "$out"
ls -lh "$out" | awk '{print $5, $9}'
