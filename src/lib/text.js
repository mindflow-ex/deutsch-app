// Сравнение ответов: регистр, пунктуация и лишние пробелы не важны.
// ae/oe/ue/ss вместо ä/ö/ü/ß принимаем, но подсказываем правильное написание.
export function norm(s) {
  return s
    .toLowerCase()
    .replace(/[–—-]/g, ' ')
    .replace(/[.,!?;:«»"„“()…]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
const translit = (s) => s.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');

export function check(input, accepted) {
  const n = norm(input);
  if (!n) return { ok: false };
  for (const a of accepted) {
    if (norm(a) === n) return { ok: true, exact: true, best: a };
  }
  for (const a of accepted) {
    if (translit(norm(a)) === translit(n)) return { ok: true, exact: false, best: a, note: 'Почти! Обратите внимание на ä, ö, ü, ß.' };
  }
  // одна опечатка в длинной фразе: засчитываем с замечанием
  for (const a of accepted) {
    const na = translit(norm(a));
    if (na.length > 8 && lev(na, translit(n)) === 1) return { ok: true, exact: false, best: a, note: 'Засчитано, но есть опечатка.' };
  }
  return { ok: false, best: accepted[0] };
}

export function lev(a, b) {
  const m = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) m[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return m[a.length][b.length];
}

// Сравнение распознанной речи с образцом: какие слова совпали.
export function compareSpeech(target, heard) {
  const words = norm(target).split(' ');
  const got = new Set(translit(norm(heard)).split(' '));
  const marks = words.map((w) => ({ w, ok: got.has(translit(w)) }));
  const score = marks.filter((m) => m.ok).length / Math.max(words.length, 1);
  return { marks, score };
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
