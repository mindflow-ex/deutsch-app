// Локальное хранилище прогресса в IndexedDB. Всё работает без сервера.
import { openDB } from 'idb';

const dbp = openDB('deutsch-zu-zweit', 1, {
  upgrade(db) {
    db.createObjectStore('kv');
    db.createObjectStore('progress'); // lessonId -> { done, correct, total, date }
    db.createObjectStore('cards'); // wordId -> { box, due, seen }
    db.createObjectStore('mistakes', { keyPath: 'id', autoIncrement: true });
    db.createObjectStore('days'); // 'YYYY-MM-DD' -> { minutes, lessons }
    db.createObjectStore('tutor', { keyPath: 'id', autoIncrement: true });
  }
});

export const today = () => new Date().toLocaleDateString('sv-SE');

export async function get(store, key) { return (await dbp).get(store, key); }
export async function put(store, value, key) { return (await dbp).put(store, value, key); }
export async function all(store) { return (await dbp).getAll(store); }
export async function allKeys(store) { return (await dbp).getAllKeys(store); }
export async function del(store, key) { return (await dbp).delete(store, key); }

export const getKV = (k, d = null) => get('kv', k).then((v) => v ?? d);
export const setKV = (k, v) => put('kv', v, k);

export async function markDay(minutes = 0, lessons = 0) {
  const d = today();
  const cur = (await get('days', d)) || { minutes: 0, lessons: 0 };
  await put('days', { minutes: cur.minutes + minutes, lessons: cur.lessons + lessons }, d);
}

// Серия: пропуск одного дня в календарной неделе не сбрасывает серию.
export async function streak() {
  const days = new Set(await allKeys('days'));
  let count = 0;
  const skippedWeeks = new Set();
  const d = new Date();
  if (!days.has(today())) d.setDate(d.getDate() - 1);
  for (let i = 0; i < 400; i++) {
    const key = d.toLocaleDateString('sv-SE');
    if (days.has(key)) count++;
    else {
      const week = weekKey(d);
      if (skippedWeeks.has(week) || count === 0) break;
      skippedWeeks.add(week);
    }
    d.setDate(d.getDate() - 1);
  }
  return count;
}
function weekKey(d) {
  const t = new Date(d); t.setHours(0, 0, 0, 0);
  t.setDate(t.getDate() + 3 - ((t.getDay() + 6) % 7));
  const w1 = new Date(t.getFullYear(), 0, 4);
  return t.getFullYear() + '-' + Math.round(((t - w1) / 864e5 - 3 + ((w1.getDay() + 6) % 7)) / 7);
}

// Простое повторение по коробкам (Лейтнер). На этапе 2 заменим на FSRS (ts-fsrs).
const BOX_DAYS = [0, 1, 3, 7, 14, 30, 60];
export async function addCards(wordIds) {
  for (const id of wordIds) {
    if (!(await get('cards', id))) await put('cards', { box: 0, due: today(), seen: 0 }, id);
  }
}
export async function gradeCard(id, grade) { // grade: 'know' | 'unsure' | 'forgot'
  const c = (await get('cards', id)) || { box: 0, seen: 0 };
  const box = grade === 'know' ? Math.min(c.box + 1, BOX_DAYS.length - 1) : grade === 'unsure' ? Math.max(c.box, 1) : 0;
  const due = new Date(); due.setDate(due.getDate() + (grade === 'forgot' ? 0 : BOX_DAYS[box]));
  await put('cards', { ...c, box, due: due.toLocaleDateString('sv-SE'), seen: c.seen + 1 }, id);
}
export async function dueCards() {
  const db = await dbp;
  const keys = await db.getAllKeys('cards');
  const vals = await db.getAll('cards');
  const t = today();
  return keys.filter((k, i) => vals[i].due <= t);
}

export async function addMistake(m) { await put('mistakes', { ...m, date: today() }); }

export async function exportAll() {
  const db = await dbp;
  const out = {};
  for (const s of db.objectStoreNames) {
    const keys = await db.getAllKeys(s);
    const vals = await db.getAll(s);
    out[s] = keys.map((k, i) => [k, vals[i]]);
  }
  return { app: 'deutsch-zu-zweit', version: 1, exported: new Date().toISOString(), data: out };
}
export async function importAll(json) {
  if (json?.app !== 'deutsch-zu-zweit') throw new Error('Это не файл прогресса приложения');
  const db = await dbp;
  for (const [store, rows] of Object.entries(json.data)) {
    if (!db.objectStoreNames.contains(store)) continue;
    const tx = db.transaction(store, 'readwrite');
    await tx.store.clear();
    const inline = !!tx.store.keyPath;
    for (const [k, v] of rows) await (inline ? tx.store.put(v) : tx.store.put(v, k));
    await tx.done;
  }
}
export async function addCustomCard(word) {
  const id = 'x:' + word.de.toLowerCase();
  if (!(await get('cards', id))) await put('cards', { box: 0, due: today(), seen: 0, word }, id);
}
