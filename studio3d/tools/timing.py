#!/usr/bin/env python3
"""3D Kaz timing helper: suggest shot cut points for a voiceover.

Copyright (c) 2026 GrowKaz. See LICENSE at the plugin root.

usage: python3 timing.py voice.mp3 script.txt [--noise -35] [--min-gap 0.18]

script.txt holds one beat per line (usually one sentence or clause).
Prints, for each beat, the estimated start and end in seconds and the cut
point to use (the middle of the nearest pause), then a ready-to-paste
JavaScript array of cut points for shots.js.

How it works: ffmpeg's silencedetect finds the pauses; the speaking time
between them is shared out by word count; each beat's end is snapped to
the nearest pause. If faster-whisper is installed it is used instead for
word-level timing, which is more accurate.
"""
import re, subprocess, sys, json


def args():
    a = sys.argv[1:]
    if len(a) < 2:
        sys.exit(__doc__)
    opt = {'noise': -35.0, 'min-gap': 0.18}
    for k in list(opt):
        if '--' + k in a:
            i = a.index('--' + k); opt[k] = float(a[i + 1]); del a[i:i + 2]
    return a[0], a[1], opt


def duration(audio):
    out = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', audio], capture_output=True, text=True)
    return float(out.stdout.strip())


def pauses(audio, noise, gap):
    out = subprocess.run(['ffmpeg', '-i', audio, '-af', f'silencedetect=noise={noise}dB:d={gap}', '-f', 'null', '-'], capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', out)]
    en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', out)]
    return list(zip(st, en))


def words(s):
    return re.findall(r"[\w'’]+", s)


def by_whisper(audio, beats):
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        return None
    try:
        m = WhisperModel('base.en', device='cpu', compute_type='int8')
        segs, _ = m.transcribe(audio, word_timestamps=True)
        ws = [(w.start, w.end) for s in segs for w in s.words]
    except Exception as e:  # model download blocked, etc.
        print(f'(whisper unavailable: {e}; using pause matching)', file=sys.stderr)
        return None
    ends, i = [], 0
    for b in beats:
        i += len(words(b)); ends.append(ws[min(i, len(ws)) - 1][1])
    return ends


def by_pauses(total, sil, beats):
    lead = sil[0][1] if sil and sil[0][0] < 0.05 else 0.0
    tail = sil[-1][0] if sil and sil[-1][1] > total - 0.05 else total
    inner = [p for p in sil if p[0] > lead and p[1] < tail]
    speech = (tail - lead) - sum(b - a for a, b in inner)
    W = sum(len(words(b)) for b in beats)

    def real(st):
        t, acc = lead, 0.0
        for a, b in inner:
            if acc + (a - t) >= st:
                return t + (st - acc)
            acc += a - t; t = b
        return t + (st - acc)

    ends, cum = [], 0
    for b in beats:
        cum += len(words(b)); ends.append(real(cum / W * speech))
    return ends, tail


def align(total, sil, beats, wends=None):
    """Pick one pause per beat boundary so each beat's speaking time best
    matches its word count (or the whisper estimate). Dynamic programming over
    the pauses; longer pauses are preferred, since sentences end on them."""
    lead = sil[0][1] if sil and sil[0][0] < 0.05 else 0.0
    tail = sil[-1][0] if sil and sil[-1][1] > total - 0.05 else total
    inner = [p for p in sil if p[0] > lead + .3 and p[1] < tail - .3]
    nodes = [(0.0, 0.0, 0.0)] + [((a + b) / 2, a, b) for a, b in inner] + [(total, total, total)]
    ws = [max(1, len(words(b))) for b in beats]
    speech = (tail - lead) - sum(b - a for a, b in inner)
    rate = speech / sum(ws)
    def talk(i, j):  # speaking time between nodes i and j
        t = nodes[j][1] - nodes[i][2] if i else nodes[j][1] - lead
        return t - sum(b - a for _, a, b in nodes[i + 1:j])
    INF = float('inf'); N, Bn = len(nodes), len(beats)
    best = [[INF] * N for _ in range(Bn + 1)]; prev = [[-1] * N for _ in range(Bn + 1)]
    best[0][0] = 0.0
    for k in range(1, Bn + 1):
        for j in range(1, N):
            if (k == Bn) != (j == N - 1):
                continue
            pen = 0 if j == N - 1 else max(0, .35 - (nodes[j][2] - nodes[j][1])) * 6
            if wends is not None and j < N - 1:
                pen += (nodes[j][0] - wends[k - 1]) ** 2 * 4
            for i in range(j):
                if best[k - 1][i] == INF:
                    continue
                exp = ws[k - 1] * rate
                c = best[k - 1][i] + ((talk(i, j) - exp) / max(exp, .8)) ** 2 + pen
                if c < best[k][j]:
                    best[k][j] = c; prev[k][j] = i
    if best[Bn][N - 1] == INF:  # fewer pauses than beats
        ends, _ = by_pauses(total, sil, beats)
        return [0.0] + [round(e, 2) for e in ends[:-1]] + [round(total, 2)]
    path, j = [], N - 1
    for k in range(Bn, 0, -1):
        path.append(j); j = prev[k][j]
    return [0.0] + [round(nodes[j][0], 2) for j in reversed(path)][:-1] + [round(total, 2)]


def main():
    audio, script, opt = args()
    beats = [l.strip() for l in open(script, encoding='utf-8') if l.strip()]
    total = duration(audio)
    sil = pauses(audio, opt['noise'], opt['min-gap'])
    ends = by_whisper(audio, beats)
    method = 'whisper words'
    if ends is None:
        ends, _ = by_pauses(total, sil, beats); method = 'pauses + word counts'
    cuts = align(total, sil, beats, ends if method == 'whisper words' else None)
    print(f'# {audio}: {total:.2f}s, {len(sil)} pauses, method: {method}')
    for i, b in enumerate(beats):
        print(f'{i + 1:>3}  {cuts[i]:7.2f} -> {cuts[i + 1]:7.2f}  ({cuts[i + 1] - cuts[i]:5.2f}s)  {b[:70]}')
    print('\nconst B = ' + json.dumps(cuts) + ';')
    short = [i + 1 for i in range(len(beats)) if cuts[i + 1] - cuts[i] < 1.2]
    if short:
        print(f'# beats shorter than 1.2s (consider merging): {short}')


if __name__ == '__main__':
    main()
