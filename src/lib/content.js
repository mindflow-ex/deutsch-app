// Загрузка контента: все главы из content/*.json попадают в сборку и работают офлайн.
const modules = import.meta.glob('../../content/ch*.json', { eager: true, import: 'default' });
import soundsJson from '../../content/sounds.json';

export const chapters = Object.values(modules).sort((a, b) => a.number - b.number);
export const sounds = soundsJson.sounds;

export const wordsById = new Map();
export const rulesById = new Map();
export const lessonsById = new Map();
for (const ch of chapters) {
  for (const w of ch.words) wordsById.set(w.id, { ...w, chapter: ch.id });
  for (const r of ch.rules) rulesById.set(r.id, { ...r, chapter: ch.id });
  ch.lessons.forEach((l, i) => lessonsById.set(l.id, { ...l, chapter: ch, index: i }));
}
export const allLessons = chapters.flatMap((c) => c.lessons);

export const wordLabel = (w) => (w.article ? `${w.article} ${w.de}` : w.de);
export const articleColor = { der: 'var(--der)', das: 'var(--das)', die: 'var(--die)' };

// Словарь курса для распознавания: Vosk ищет только эти слова, это сильно повышает точность.
const tok = (s) => (s || '').toLowerCase().match(/[a-zäöüß]+/g) || [];
const vocab = new Set();
for (const ch of chapters) {
  for (const w of ch.words) [w.de, w.plural, ...(w.forms || []), w.article].forEach((x) => tok(x).forEach((t) => vocab.add(t)));
  (ch.names || []).forEach((n) => tok(n).forEach((t) => vocab.add(t)));
  for (const r of ch.rules) r.examples.forEach((e) => tok(e.de).forEach((t) => vocab.add(t)));
  for (const l of ch.lessons) for (const ex of [...l.exercises, l.dialog]) {
    const texts = [ex.text, ex.prompt, ...(ex.words || []).filter((x) => typeof x === 'string' && !wordsById.has(x)), ...(ex.accept || []), ...(ex.lines || []), ...(ex.turns || []).flatMap((t) => [t.bot, ...t.replies.map((r) => r.de)])];
    texts.forEach((x) => typeof x === 'string' && !/[а-яё]/i.test(x) && tok(x).forEach((t) => vocab.add(t)));
  }
}
for (const s of soundsJson.sounds) [...s.examples, ...s.pairs.flat()].forEach((x) => tok(x).forEach((t) => vocab.add(t)));
export const asrVocab = [...vocab].filter((t) => t.length > 1);
