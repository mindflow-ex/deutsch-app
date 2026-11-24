// Задания для ИИ-репетитора в Claude: собираем текст, пользователь копирует его в проект Claude.
import { chapters, lessonsById, wordsById, rulesById, wordLabel } from './content.js';
import { all, allKeys, put } from './db.js';
import { mascots } from '../mascots/mascots.js';

export const PROJECT_INSTRUCTIONS = `Ты — репетитор немецкого для супружеской пары, родной язык русский, уровень A1.
Они идут по учебнику Schritte International Neu A1.1 и смотрят сериал DW Nicos Weg.

Главное:
- Используй только лексику и грамматику из блока «ПРОЙДЕНО» в задании.
  Новое слово — максимум одно за реплику, с переводом в скобках.
- Говори коротко: 1–2 простых предложения по-немецки, потом жди ответа.
- Ошибки исправляй после ответа ученика в формате:
  ❌ как сказали → ✅ как правильно → почему (одна строка по-русски).
  Не больше двух исправлений за раз, самые важные.
- Объяснения правил — по-русски, коротко, с 1–2 примерами.
- В голосовом режиме говори медленно и чётко; если ученик не понял,
  повтори проще, а не переводи сразу.
- Если в задании два ученика, обращайся к ним по очереди по имени
  и иногда проси их спросить что-то друг у друга.
- Поддерживай тон маскота из задания.

Режимы (указаны в задании):
- РОЛЕВАЯ ИГРА: веди сцену 8–12 реплик, сам играй продавца/соседа и т.п.
- ПРОВЕРКА ТЕКСТА: исправленная версия, список ошибок, одно упражнение на главную ошибку.
- РАЗБОР ОШИБОК: объясни правило и дай 5 коротких заданий по одному.
- ВОПРОС: ответь на вопрос ученика о языке.
- РАЗГОВОР ВДВОЁМ: ты ведущий, ученики отвечают по очереди и спрашивают друг друга.

Когда ученик пишет «ИТОГ», выдай блок:
=== ИТОГ ===
новые_слова: слово (артикль) — перевод; ...
ошибки: тема — пример; ...
что_получилось: одна строка
совет: одна строка
=== КОНЕЦ ===`;

export const MODES = [
  { id: 'role', label: 'Ролевая игра', hint: 'Сцена по теме главы: кафе, знакомство, отель.' },
  { id: 'text', label: 'Проверка текста', hint: 'Напишите 3–5 предложений о себе, репетитор исправит.' },
  { id: 'errors', label: 'Разбор ошибок', hint: 'Репетитор объяснит ваши частые ошибки и даст задания.' },
  { id: 'question', label: 'Вопрос', hint: 'Спросите «а почему так?» про любое правило.' },
  { id: 'duo', label: 'Разговор вдвоём', hint: 'Вы оба отвечаете по очереди, репетитор ведёт.' }
];

const SCENES = {
  ch01: ['знакомство на курсах немецкого', 'регистрация в отеле, ты администратор', 'вечеринка у соседей, ты сосед из Австрии']
};

export async function buildTask({ mode, profile, extra = '' }) {
  const progress = await all('progress');
  const keys = await allKeys('progress');
  const done = new Set(keys.filter((_, i) => progress[i]?.done));
  const passedLessons = chapters.flatMap((c) => c.lessons).filter((l) => done.has(l.id));
  const lastCh = passedLessons.length ? lessonsById.get(passedLessons.at(-1).id).chapter : chapters[0];
  const passedChapters = chapters.filter((c) => c.number <= lastCh.number);
  const ruleTitles = [...new Set(passedLessons.flatMap((l) => l.rules))].map((r) => rulesById.get(r)?.title).filter(Boolean);
  const words = [...new Set(passedLessons.flatMap((l) => l.words))].map((id) => wordsById.get(id)).filter(Boolean).map(wordLabel);

  const mistakes = await all('mistakes');
  const topics = {};
  for (const m of mistakes.slice(-60)) if (m.rule) topics[m.rule] = (topics[m.rule] || 0) + 1;
  const freq = Object.entries(topics).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([r]) => rulesById.get(r)?.title).filter(Boolean);
  const examples = mistakes.slice(-5).map((m) => `«${m.given}» вместо «${m.expected}»`);

  const m = mascots[profile.mascot];
  const students = mode === 'duo' && profile.partner ? `${profile.name} и ${profile.partner}` : profile.name || 'ученик';
  const modeName = MODES.find((x) => x.id === mode).label.toUpperCase();
  const scene = (SCENES[lastCh.id] || ['свободная тема главы'])[Math.floor(Math.random() * (SCENES[lastCh.id]?.length || 1))];

  const lines = [
    `РЕЖИМ: ${modeName}`,
    `УЧЕНИКИ: ${students}${m ? ` (маскот: ${m.name.toLowerCase()}, характер: ${m.character})` : ''}`,
    mode === 'role' || mode === 'duo' ? `СЦЕНА: ${scene}` : null,
    `ПРОЙДЕНО: ${passedChapters.length > 1 ? `главы 1–${passedChapters.at(-1).number}` : `глава 1${passedLessons.length < chapters[0].lessons.length ? ` (уроков: ${passedLessons.length} из ${chapters[0].lessons.length})` : ''}`}. ${ruleTitles.join('; ') || 'приветствия, ich/du/Sie'}.`,
    `СЛОВА: ${words.slice(0, 60).join(', ') || 'hallo, guten Tag, ich heiße, ich komme aus'}`,
    freq.length ? `ЧАСТЫЕ ОШИБКИ: ${freq.join('; ')}` : null,
    examples.length ? `ПРИМЕРЫ ОШИБОК: ${examples.join('; ')}` : null,
    extra ? (mode === 'text' ? `ТЕКСТ УЧЕНИКА:\n${extra}` : `ВОПРОС УЧЕНИКА: ${extra}`) : null,
    'Начинай.'
  ];
  return lines.filter(Boolean).join('\n');
}

// Разбор блока ИТОГ, который репетитор выдаёт в конце.
export function parseSummary(text) {
  const block = text.match(/=== ИТОГ ===([\s\S]*?)(=== КОНЕЦ ===|$)/);
  if (!block) return null;
  const field = (name) => (block[1].match(new RegExp(name + '\\s*:\\s*(.*)')) || [])[1]?.trim() || '';
  const words = field('новые_слова')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const [de, ru] = s.split(/\s+[—-]\s+/);
      return { de: de?.trim(), ru: ru?.trim() || '' };
    })
    .filter((w) => w.de);
  return {
    words,
    errors: field('ошибки'),
    good: field('что_получилось'),
    tip: field('совет')
  };
}

export async function saveSummary(summary) {
  await put('tutor', { ...summary, date: new Date().toISOString() });
}
