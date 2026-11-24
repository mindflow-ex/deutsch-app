#!/usr/bin/env python3
"""Озвучка всех фраз нейроголосами Microsoft Edge (бесплатно, через edge-tts).

Катя (de-DE-KatjaNeural) читает весь курс, Киллиан (de-DE-KillianNeural, чуть медленнее)
читает реплики собеседника в диалогах с "voice": "m". Голоса выбраны на слух.
Медленный режим 🐢 делает приложение (playbackRate), отдельные записи не нужны.

Запуск: node scripts/collect-texts.mjs && python3 scripts/gen-audio.py
Нужно: pip install edge-tts. Готовые MP3 не пересоздаются, лишние удаляются.
"""
import asyncio, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "audio")
VOICES = {
    "f": ("de-DE-KatjaNeural", "+0%"),
    "m": ("de-DE-KillianNeural", "-5%"),
}
PARALLEL = 4
TRIES = 5


async def make(item, sem):
    import edge_tts
    path = os.path.join(OUT, item["file"])
    voice, rate = VOICES[item["voice"]]
    async with sem:
        for attempt in range(1, TRIES + 1):
            try:
                tmp = path + ".part"
                await edge_tts.Communicate(item["text"], voice, rate=rate).save(tmp)
                if os.path.getsize(tmp) < 1000:
                    raise RuntimeError("пустой файл")
                os.replace(tmp, path)
                return
            except Exception as e:  # сеть Edge иногда отваливается
                print(f"повтор {attempt}/{TRIES}: {item['text']!r}: {e}", file=sys.stderr)
                await asyncio.sleep(2 * attempt)
    raise RuntimeError(f"не удалось озвучить {item['text']!r}")


async def main():
    texts = json.load(open(os.path.join(ROOT, ".cache", "texts.json"), encoding="utf-8"))
    os.makedirs(OUT, exist_ok=True)
    todo = [t for t in texts if not os.path.exists(os.path.join(OUT, t["file"]))]
    sem = asyncio.Semaphore(PARALLEL)
    await asyncio.gather(*(make(t, sem) for t in todo))
    keep = {t["file"] for t in texts}
    removed = 0
    for f in os.listdir(OUT):
        if f.endswith(".mp3") and f not in keep:
            os.remove(os.path.join(OUT, f)); removed += 1
    manifest = {t["key"]: t["file"] for t in texts}
    json.dump(manifest, open(os.path.join(OUT, "manifest.json"), "w", encoding="utf-8"), ensure_ascii=False)
    print(f"Готово: всего {len(manifest)}, новых {len(todo)}, удалено старых {removed}")


if __name__ == "__main__":
    asyncio.run(main())
