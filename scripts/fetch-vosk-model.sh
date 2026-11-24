#!/usr/bin/env bash
# Скачивает немецкую small-модель Vosk и упаковывает в tar.gz для vosk-browser.
set -euo pipefail
NAME=vosk-model-small-de-0.15
OUT=public/models/vosk-model-small-de.tar.gz
[ -f "$OUT" ] && { echo "модель уже есть"; exit 0; }
mkdir -p .cache public/models
cd .cache
[ -f "$NAME.zip" ] || curl -fsSL -o "$NAME.zip" "https://alphacephei.com/vosk/models/$NAME.zip"
rm -rf "$NAME" && unzip -q "$NAME.zip"
tar -czf "../$OUT" "$NAME"
echo "модель: $(du -h ../$OUT | cut -f1)"
