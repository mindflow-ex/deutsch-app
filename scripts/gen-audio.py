#!/usr/bin/env python3
"""Озвучка всех фраз через Piper (бесплатный офлайн-синтезатор).

Запуск: node scripts/collect-texts.mjs && python3 scripts/gen-audio.py
Нужно: pip install piper-tts, ffmpeg. Голос скачивается с Hugging Face (rhasspy/piper-voices).
Готовые MP3 не пересоздаются, поэтому повторный запуск быстрый.
"""
import json, os, subprocess, sys, tempfile, urllib.request, wave

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE = os.environ.get("PIPER_VOICE", "de_DE-thorsten-high")
VOICE_DIR = os.path.join(ROOT, ".cache", "piper")
OUT = os.path.join(ROOT, "public", "audio")
BASE = "https://huggingface.co/rhasspy/piper-voices/resolve/main/de/de_DE/{spk}/{q}/{name}"


def ensure_voice():
    os.makedirs(VOICE_DIR, exist_ok=True)
    _, spk, q = VOICE.split("-")
    for ext in (".onnx", ".onnx.json"):
        path = os.path.join(VOICE_DIR, VOICE + ext)
        if not os.path.exists(path):
            url = BASE.format(spk=spk, q=q, name=VOICE + ext)
            print("скачиваю", url)
            urllib.request.urlretrieve(url, path)
    return os.path.join(VOICE_DIR, VOICE + ".onnx")


def main():
    from piper import PiperVoice  # piper-tts

    texts = json.load(open(os.path.join(ROOT, ".cache", "texts.json"), encoding="utf-8"))
    os.makedirs(OUT, exist_ok=True)
    voice = PiperVoice.load(ensure_voice())
    syn_cfg = None
    try:
        from piper import SynthesisConfig
        syn_cfg = SynthesisConfig(length_scale=1.08, noise_scale=0.55, noise_w_scale=0.7)
    except Exception:
        pass
    made = 0
    manifest = {}
    for item in texts:
        mp3 = os.path.join(OUT, item["file"])
        if not os.path.exists(mp3):
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                wav_path = tmp.name
            with wave.open(wav_path, "wb") as wf:
                if hasattr(voice, "synthesize_wav"):
                    voice.synthesize_wav(item["text"], wf, syn_config=syn_cfg) if syn_cfg else voice.synthesize_wav(item["text"], wf)
                else:  # piper-tts < 1.3
                    voice.synthesize(item["text"], wf, length_scale=1.08)
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", wav_path, "-af",
                            "silenceremove=start_periods=1:start_threshold=-50dB,apad=pad_dur=0.15",
                            "-ac", "1", "-ar", "22050", "-b:a", "48k", mp3], check=True)
            os.unlink(wav_path)
            made += 1
        manifest[item["text"]] = item["file"]
    json.dump(manifest, open(os.path.join(OUT, "manifest.json"), "w", encoding="utf-8"), ensure_ascii=False)
    print(f"Готово: всего {len(manifest)}, новых {made}")


if __name__ == "__main__":
    sys.exit(main())
