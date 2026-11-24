// Распознавание речи на телефоне.
// vosk — офлайн-модель (работает на Huawei без Google), browser — Web Speech API (Samsung/Chrome).
import { settings } from './state.svelte.js';

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
export async function listen(onPartial = () => {}) {
  if (engine() === 'browser') return listenBrowser(onPartial);
  const model = await loadVosk();
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 }
  });
  const ctx = new AudioContext();
  const rec = new model.KaldiRecognizer(ctx.sampleRate);
  let text = [];
  let finalResolve;
  rec.on('result', (m) => {
    if (m.result.text) text.push(m.result.text);
    if (finalResolve) finalResolve();
  });
  rec.on('partialresult', (m) => onPartial([...text, m.result.partial].join(' ').trim()));
  const src = ctx.createMediaStreamSource(stream);
  const proc = ctx.createScriptProcessor(4096, 1, 1);
  proc.onaudioprocess = (e) => { try { rec.acceptWaveform(e.inputBuffer); } catch {} };
  src.connect(proc);
  proc.connect(ctx.destination);
  return {
    async stop() {
      const done = new Promise((r) => (finalResolve = r));
      proc.disconnect(); src.disconnect();
      stream.getTracks().forEach((t) => t.stop());
      rec.retrieveFinalResult();
      await Promise.race([done, new Promise((r) => setTimeout(r, 1500))]);
      ctx.close();
      try { rec.remove(); } catch {}
      return text.join(' ').trim();
    }
  };
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
      return finalText.trim();
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
