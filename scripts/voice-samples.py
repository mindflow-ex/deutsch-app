#!/usr/bin/env python3
"""Образцы голосов для сравнения: одни и те же фразы разными бесплатными синтезаторами."""
import asyncio, os, subprocess, sys, wave
OUT = "voice-samples"
PHRASES = [
    "Guten Morgen! Wie heißen Sie?",
    "Ich heiße Anna. Ich komme aus Russland.",
    "Woher kommst du? – Ich komme aus der Schweiz.",
    "Ich spreche nur ein bisschen Deutsch.",
    "schon – schön, Wein – Wien",
]
EDGE = ["de-DE-KatjaNeural", "de-DE-ConradNeural", "de-DE-FlorianMultilingualNeural", "de-DE-KillianNeural"]

async def edge():
    import edge_tts
    for v in EDGE:
        for i, p in enumerate(PHRASES, 1):
            await edge_tts.Communicate(p, v).save(f"{OUT}/{i}-edge0-{v.split('-')[2]}.mp3")

def piper():
    sys.path.insert(0, "scripts")
    os.environ.setdefault("PIPER_VOICE", "de_DE-thorsten-high")
    import importlib.util
    spec = importlib.util.spec_from_file_location("ga", "scripts/gen-audio.py"); ga = importlib.util.module_from_spec(spec); spec.loader.exec_module(ga)
    from piper import PiperVoice, SynthesisConfig
    for name in ["de_DE-thorsten-high", "de_DE-kerstin-low", "de_DE-thorsten_emotional-medium"]:
        ga.VOICE = name
        try:
            voice = PiperVoice.load(ga.ensure_voice())
        except Exception as e:
            print("skip", name, e); continue
        for i, p in enumerate(PHRASES, 1):
            w = f"{OUT}/tmp.wav"
            with wave.open(w, "wb") as wf:
                voice.synthesize_wav(p, wf, syn_config=SynthesisConfig(length_scale=1.08))
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", w, "-b:a", "64k", f"{OUT}/{i}-piper-{name.split('_DE-')[1]}.mp3"], check=True)
        os.remove(f"{OUT}/tmp.wav")

os.makedirs(OUT, exist_ok=True)
asyncio.run(edge())
print(sorted(os.listdir(OUT)))
