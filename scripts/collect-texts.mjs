#!/usr/bin/env node
// Собирает все немецкие фразы, которые приложение озвучивает, в .cache/texts.json для Piper.
// Ключи должны совпадать с тем, что передаётся в say() в приложении.
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const c = join(root, 'content');
const texts = new Set();
const add = (s) => s && !/[а-яё]/i.test(s) && texts.add(s.trim());
const label = (w) => (w.article ? `${w.article} ${w.de}` : w.de);

for (const f of readdirSync(c).filter((f) => /^ch\d\d\.json$/.test(f))) {
  const ch = JSON.parse(readFileSync(join(c, f), 'utf8'));
  for (const w of ch.words) add(label(w)), w.article && add(w.de);
  for (const r of ch.rules) for (const e of r.examples) add(e.de);
  for (const l of ch.lessons) {
    for (const ex of [...l.exercises, l.dialog]) {
      switch (ex.type) {
        case 'choice': if (ex.audio) add(ex.prompt); break;
        case 'pairs': ex.pairs.forEach((p) => add(p[0])); break;
        case 'order': add(ex.answer.join(' ')); break;
        case 'fill': { const [a, b] = ex.text.split('___'); add(a + ex.answers[0] + b); break; }
        case 'conjugation': add(Object.entries(ex.forms).map(([p, f]) => `${p} ${f}`).join(', ')); break;
        case 'dictation': case 'speak': case 'listen_choice': add(ex.text); break;
        case 'translate': add(ex.accept[0]); break;
        case 'minimal_pair': ex.words.forEach(add); break;
        case 'reading': ex.lines.forEach(add); break;
        case 'dialog': ex.turns.forEach((t) => { add(t.bot); t.replies.forEach((r) => add(r.de)); }); break;
      }
      if (ex.type === 'article') for (const id of ex.words) { const w = ch.words.find((x) => x.id === id); if (w) add(label(w)); }
    }
  }
}
const sounds = JSON.parse(readFileSync(join(c, 'sounds.json'), 'utf8')).sounds;
for (const s of sounds) { s.examples.forEach(add); s.pairs.flat().forEach(add); }
// фразы из интерфейса
['Guten Tag! Ich heiße Anna. Woher kommen Sie?'].forEach(add);

const list = [...texts].sort().map((text) => ({ text, file: createHash('sha1').update(text).digest('hex').slice(0, 12) + '.mp3' }));
mkdirSync(join(root, '.cache'), { recursive: true });
writeFileSync(join(root, '.cache', 'texts.json'), JSON.stringify(list, null, 1));
console.log(`Фраз для озвучки: ${list.length}`);
