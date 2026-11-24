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
