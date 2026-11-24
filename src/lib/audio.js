// Озвучка: заранее сгенерированные Piper MP3 (public/audio), иначе голос телефона.
import { settings } from './state.svelte.js';

let manifest = null;
const ready = fetch('./audio/manifest.json')
  .then((r) => (r.ok ? r.json() : {}))
  .then((m) => (manifest = m))
  .catch(() => (manifest = {}));

let current = null;
export async function say(text, { slow = false } = {}) {
  await ready;
  stop();
  const rate = slow ? 0.7 : settings.rate || 1;
  const file = manifest[text.trim()];
  if (file) {
    const a = new Audio('./audio/' + file);
    a.playbackRate = rate;
    a.preservesPitch = true;
    current = a;
    return new Promise((res) => {
      a.onended = res;
      a.onerror = () => res(speakTTS(text, rate));
      a.play().catch(() => res(speakTTS(text, rate)));
    });
  }
  return speakTTS(text, rate);
}
export function stop() {
  if (current) { current.pause(); current = null; }
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}
export const hasRecorded = async (text) => { await ready; return !!manifest[text.trim()]; };

function speakTTS(text, rate) {
  return new Promise((res) => {
    if (!('speechSynthesis' in window)) return res();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'de-DE';
    u.rate = rate * 0.95;
    const v = speechSynthesis.getVoices().find((v) => v.lang?.startsWith('de'));
    if (v) u.voice = v;
    u.onend = res;
    u.onerror = res;
    speechSynthesis.speak(u);
  });
}

// Короткие звуки «верно / ошибка» без файлов.
let ctx;
export function beep(ok) {
  if (!settings.sfx) return;
  try {
    ctx ||= new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    const t = ctx.currentTime;
    o.frequency.setValueAtTime(ok ? 660 : 220, t);
    if (ok) o.frequency.setValueAtTime(880, t + 0.09);
    g.gain.setValueAtTime(0.08, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    o.start(t); o.stop(t + 0.26);
  } catch {}
}
