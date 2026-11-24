// Распознавание речи на телефоне.
// vosk — офлайн-модель (работает на Huawei без Google), browser — Web Speech API (Samsung/Chrome).
import { settings } from './state.svelte.js';
import { asrVocab } from './content.js';
import { norm, compareSpeech } from './text.js';

const MODEL_URL = new URL('./models/vosk-model-small-de.tar.gz', location.href).href;
let modelPromise = null;
export const voskState = $state({ status: 'idle', error: '' }); // idle | loading | ready | error

export const browserSpeechAvailable = () => !!(window.SpeechRecognition || window.webkitSpeechRecognition);
export const engine = () => (settings.asr === 'browser' && browserSpeechAvailable() ? 'browser' : 'vosk');

export function loadVosk() {
  if (modelPromise) return modelPromise;
  voskState.status = 'loading';
  modelPromise = import('vosk-browser')
    .then(({ createModel }) => createModel(MODEL_URL))
    .then((m) => { voskState.status = 'ready'; return m; })
    .catch((e) => {
      voskState.status = 'error';
      voskState.error = String(e?.message || e);
      modelPromise = null;
      throw e;
    });
  return modelPromise;
}

// Начинает запись. Возвращает объект с stop(): Promise<string>.
// Начинает запись. Возвращает объект с stop(): Promise<string>.
// onAuto() вызывается, когда пора остановиться самим: тишина после речи или целевая фраза узнана.
export async function listen(onPartial = () => {}, { target = '', onAuto = () => {} } = {}) {
  const watcher = autoStop(target, onAuto);
  const partial = (t) => { const c = clean(t); onPartial(c); watcher(c); };
  if (engine() === 'browser') return listenBrowser(partial);
  const model = await loadVosk();
  // Обработку звука браузера можно выключить: на некоторых телефонах шумодав портит речь.
  const raw = settings.micRaw;
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: !raw, noiseSuppression: !raw, autoGainControl: true, channelCount: 1 }
  });
  let ctx;
  try { ctx = new AudioContext({ sampleRate: 16000 }); } catch { ctx = new AudioContext(); }
  let src;
  try { src = ctx.createMediaStreamSource(stream); }
  catch { // Firefox не умеет соединять микрофон с контекстом другой частоты
    await ctx.close(); ctx = new AudioContext(); src = ctx.createMediaStreamSource(stream);
  }
  if (ctx.state === 'suspended') await ctx.resume();
  // Грамматика: только слова курса + [unk]. Выключается в настройках для сравнения.
  const grammar = settings.asrVocab !== false ? JSON.stringify([asrVocab.join(' '), '[unk]']) : undefined;
  const rec = grammar ? new model.KaldiRecognizer(ctx.sampleRate, grammar) : new model.KaldiRecognizer(ctx.sampleRate);
  const text = [];
  let finalResolve;
  rec.on('result', (m) => {
    if (m.result.text) text.push(m.result.text);
    partial(text.join(' '));
    if (finalResolve) finalResolve();
  });
  rec.on('partialresult', (m) => partial([...text, m.result.partial].join(' ')));
  const proc = ctx.createScriptProcessor(4096, 1, 1);
  proc.onaudioprocess = (e) => { try { rec.acceptWaveform(e.inputBuffer); } catch {} };
  src.connect(proc);
  proc.connect(ctx.destination);
  let stopped = false;
  return {
    async stop() {
      if (stopped) return clean(text.join(' '));
      stopped = true;
      watcher.cancel();
      const done = new Promise((r) => (finalResolve = r));
      proc.disconnect(); src.disconnect();
      stream.getTracks().forEach((t) => t.stop());
      rec.retrieveFinalResult();
      await Promise.race([done, new Promise((r) => setTimeout(r, 1500))]);
      ctx.close();
      try { rec.remove(); } catch {}
      return clean(text.join(' '));
    }
  };
}

// Убираем служебное [unk] и случайные грубые слова, которые распознаватель иногда «слышит» в шуме.
const BAD = /\b(scheiße|scheisse|scheiß|arsch|fick\w*|hure|mist)\b/gi;
function clean(t) { return (t || '').replace(/\[unk\]/g, ' ').replace(BAD, ' ').replace(/\s+/g, ' ').trim(); }

// Автостоп: 1,6 с тишины после начала речи, или сразу после того, как узнаны все слова цели.
function autoStop(target, onAuto) {
  let timer = null, last = '', fired = false;
  const goal = target ? norm(target).split(' ') : [];
  const fire = () => { if (!fired) { fired = true; onAuto(); } };
  const w = (t) => {
    if (fired || !t) return;
    if (goal.length && compareSpeech(target, t).score === 1) { clearTimeout(timer); timer = setTimeout(fire, 500); return; }
    if (t !== last) { last = t; clearTimeout(timer); timer = setTimeout(fire, 1600); }
  };
  const cap = setTimeout(fire, 12000); // в шуме (музыка) тишины может не быть
  w.cancel = () => { fired = true; clearTimeout(timer); clearTimeout(cap); };
  return w;
}

function listenBrowser(onPartial) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const r = new SR();
  r.lang = 'de-DE';
  r.interimResults = true;
  r.continuous = true;
  let finalText = '';
  let ended;
  const endP = new Promise((res) => (ended = res));
  r.onresult = (e) => {
    let interim = '';
    finalText = '';
    for (const res of e.results) (res.isFinal ? (finalText += res[0].transcript + ' ') : (interim += res[0].transcript));
    onPartial((finalText + interim).trim());
  };
  r.onend = () => ended();
  r.onerror = () => ended();
  r.start();
  return Promise.resolve({
    async stop() {
      r.stop();
      await Promise.race([endP, new Promise((res) => setTimeout(res, 2000))]);
      return clean(finalText);
    }
  });
}

// Запись своего голоса, чтобы сравнить с образцом.
export async function recordSelf() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mr = new MediaRecorder(stream);
  const chunks = [];
  mr.ondataavailable = (e) => chunks.push(e.data);
  mr.start();
  return {
    stop: () => new Promise((res) => {
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        res(URL.createObjectURL(new Blob(chunks, { type: mr.mimeType })));
      };
      mr.stop();
    })
  };
}
