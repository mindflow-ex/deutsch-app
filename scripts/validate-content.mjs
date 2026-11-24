#!/usr/bin/env node
// Автопроверки контента: схема, лексика только из пройденных глав, артикли, ссылки между частями.
// Запуск: npm run check   (код выхода 1, если есть ошибки)
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'content');
const schema = JSON.parse(readFileSync(join(root, 'schema', 'chapter.schema.json'), 'utf8'));
const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(schema);

const files = readdirSync(root).filter((f) => /^ch\d\d\.json$/.test(f)).sort();
const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

const hasCyrillic = (s) => /[а-яё]/i.test(s);
const tokens = (s) =>
  s
    .replace(/\S+@\S+/g, ' ')
    .toLowerCase()
    .match(/[a-zäöüß]+(?:-[a-zäöüß]+)*/g) || [];

// Накопленный словарь: формы слов всех глав до текущей включительно.
const known = new Set();
const nouns = new Map(); // форма ед. ч. (lower) -> { article, plural }
const addWord = (w) => {
  for (const t of tokens(w.de)) known.add(t);
  if (w.plural) for (const t of tokens(w.plural)) known.add(t);
  for (const f of w.forms || []) for (const t of tokens(f)) known.add(t);
  if (w.article) known.add(w.article);
  if (w.pos === 'noun') nouns.set(w.de.toLowerCase(), { article: w.article, plural: w.plural.toLowerCase() });
};

function checkGerman(where, text, names) {
  if (!text || hasCyrillic(text)) return;
  for (const t of tokens(text)) {
    if (t.length === 1) continue; // буквы при диктовке
    if (!known.has(t) && !names.has(t)) err(where, `слово «${t}» не из пройденной лексики (добавьте в words или names)`);
  }
  // артикли: der/das/die + существительное из словаря
  const re = /\b(der|das|die)\s+([A-ZÄÖÜ][a-zäöüß-]+)/g;
  let m;
  while ((m = re.exec(text))) {
    const art = m[1];
    const noun = m[2].toLowerCase();
    const n = nouns.get(noun);
    if (!n) continue;
    if (art !== n.article && !(art === 'die' && noun === n.plural)) {
      // «aus der Schweiz» и т. п. — датив женского рода допустим после aus
      const before = text.slice(Math.max(0, m.index - 4), m.index).toLowerCase();
      if (art === 'der' && n.article === 'die' && before.includes('aus')) continue;
      err(where, `артикль «${art} ${m[2]}», а в словаре ${n.article}`);
    }
  }
}

function germanFields(ex) {
  const out = [];
  switch (ex.type) {
    case 'choice':
      out.push(...ex.options);
      if (ex.audio) out.push(ex.prompt);
      break;
    case 'pairs':
      out.push(...ex.pairs.map((p) => p[0]));
      break;
    case 'order':
      out.push(ex.answer.join(' '), ...(ex.extra || []));
      break;
    case 'fill':
      out.push(ex.text.replace('___', ex.answers[0]));
      break;
    case 'conjugation':
      out.push(...Object.values(ex.forms));
      break;
    case 'dictation':
    case 'speak':
      out.push(ex.text);
      break;
    case 'listen_choice':
      out.push(ex.text, ...ex.options);
      break;
    case 'translate':
      out.push(ex.accept[0]);
      break;
    case 'reading':
      out.push(...ex.lines);
      break;
    case 'dialog':
      for (const t of ex.turns) out.push(t.bot, ...t.replies.map((r) => r.de));
      break;
  }
  return out;
}

const sounds = JSON.parse(readFileSync(join(root, 'sounds.json'), 'utf8')).sounds;
const soundIds = new Set(sounds.map((s) => s.id));
const lessonIds = new Set();

for (const file of files) {
  const ch = JSON.parse(readFileSync(join(root, file), 'utf8'));
  if (!validate(ch)) {
    for (const e of validate.errors) err(file, `схема ${e.instancePath || '/'} ${e.message}`);
    continue;
  }
  const names = new Set((ch.names || []).flatMap(tokens));
  const wordIds = new Set();
  for (const w of ch.words) {
    if (wordIds.has(w.id)) err(file, `повтор id слова ${w.id}`);
    wordIds.add(w.id);
    addWord(w);
  }
  const allWords = new Map(ch.words.map((w) => [w.id, w]));
  const ruleIds = new Set(ch.rules.map((r) => r.id));
  for (const r of ch.rules) for (const [i, e] of r.examples.entries()) checkGerman(`${file} правило ${r.id} пример ${i + 1}`, e.de, names);

  for (const l of ch.lessons) {
    const where = `${file} ${l.id}`;
    if (lessonIds.has(l.id)) err(where, 'повтор id урока');
    lessonIds.add(l.id);
    if (l.sound && !soundIds.has(l.sound)) err(where, `нет тренажёра звука ${l.sound}`);
    for (const r of l.rules) if (!ruleIds.has(r)) err(where, `нет правила ${r}`);
    for (const w of l.words) if (!allWords.has(w)) err(where, `нет слова ${w}`);
    if (l.exercises.length < 12) warn(where, `заданий ${l.exercises.length}, советуем 12–15`);
    const types = new Set(l.exercises.map((e) => e.type));
    if (types.size < 6) warn(where, `мало разных типов заданий (${types.size})`);
    if (!l.nicos?.length) warn(where, 'нет ссылки на Nicos Weg');

    [...l.exercises, l.dialog].forEach((ex, i) => {
      const w = `${where} задание ${i + 1} (${ex.type})`;
      if (ex.rule && !ruleIds.has(ex.rule)) err(w, `нет правила ${ex.rule}`);
      if ('answer' in ex && Array.isArray(ex.options) && ex.answer >= ex.options.length) err(w, 'answer вне списка вариантов');
      if (ex.type === 'article') for (const id of ex.words) {
        const word = allWords.get(id);
        if (!word) err(w, `нет слова ${id}`);
        else if (!word.article) err(w, `у слова ${id} нет артикля`);
      }
      if (ex.type === 'reading') ex.questions.forEach((q, k) => q.answer >= q.options.length && err(w, `вопрос ${k + 1}: answer вне списка`));
      if (ex.type === 'conjugation') for (const g of ex.given) if (!(g in ex.forms)) err(w, `given ${g} нет в forms`);
      if (ex.type === 'dialog') ex.turns.forEach((t, k) => {
        if (!t.replies.some((r) => r.ok)) err(w, `реплика ${k + 1}: нет верного ответа`);
        if (t.replies.some((r) => !r.ok && !r.feedback)) warn(w, `реплика ${k + 1}: у неверного ответа нет объяснения`);
      });
      if (ex.type === 'minimal_pair') return; // слова-пары звуковые, вне лексики
      for (const text of germanFields(ex)) checkGerman(w, text, names);
    });
  }
}

for (const wmsg of warnings) console.log('⚠️ ', wmsg);
for (const e of errors) console.log('❌', e);
console.log(`\nПроверено глав: ${files.length}. Ошибок: ${errors.length}, предупреждений: ${warnings.length}.`);
process.exit(errors.length ? 1 : 0);
