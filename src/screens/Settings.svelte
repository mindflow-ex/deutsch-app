<script>
  import Mascot from '../mascots/Mascot.svelte';
  import { mascots } from '../mascots/mascots.js';
  import { profile, settings, saveProfile, saveSettings, go } from '../lib/state.svelte.js';
  import { browserSpeechAvailable, listen, loadVosk, voskState } from '../lib/speech.svelte.js';
  import { compareSpeech } from '../lib/text.js';
  import { say } from '../lib/audio.js';
  import { testNotification, icsFile, download, notifySupported } from '../lib/remind.js';
  import { exportAll, importAll } from '../lib/db.js';

  let notifyMsg = $state('');
  let ioMsg = $state('');
  // тест распознавания
  const TEST = 'Guten Tag, ich heiße Anna und ich komme aus Russland.';
  let asrSession = $state(null);
  let asrText = $state('');
  let asrResult = $state(null);
  let asrMsg = $state('');
  let t0 = 0;

  const persist = () => { saveProfile(); saveSettings(); };
  async function asrToggle() {
    asrMsg = '';
    if (asrSession) {
      const s = asrSession; asrSession = null;
      const text = await s.stop();
      const ms = Date.now() - t0;
      asrResult = { text, ...compareSpeech(TEST, text), ms };
      return;
    }
    try {
      asrResult = null; asrText = '';
      const t = Date.now();
      asrSession = await listen((p) => (asrText = p), { target: TEST, onAuto: () => asrSession && asrToggle() });
      t0 = Date.now();
      if (settings.asr === 'vosk') asrMsg = `Модель готова за ${((t0 - t) / 1000).toFixed(1)} с`;
    } catch (e) { asrMsg = 'Ошибка: ' + (e?.message || e); }
  }
  async function exp() {
    const data = await exportAll();
    download(new Blob([JSON.stringify(data)], { type: 'application/json' }), `deutsch-progress-${profile.name || 'me'}-${new Date().toLocaleDateString('sv-SE')}.json`);
  }
  async function imp(e) {
    const f = e.target.files[0];
    if (!f) return;
    try { await importAll(JSON.parse(await f.text())); ioMsg = 'Прогресс восстановлен. Перезапустите приложение.'; }
    catch (err) { ioMsg = 'Не получилось: ' + err.message; }
  }
</script>

<div class="page">
  <button class="back" onclick={() => go('home')}>← Назад</button>
  <h1>Настройки</h1>

  <h2>Профиль</h2>
  <label class="field">Имя<input bind:value={profile.name} onchange={persist} /></label>
  <label class="field">Партнёр по учёбе<input bind:value={profile.partner} onchange={persist} /></label>
  <div class="grid">
    {#each Object.entries(mascots) as [id, m]}
      <button class="mcard" class:sel={profile.mascot === id} onclick={() => { profile.mascot = id; persist(); }}>
        <Mascot {id} emotion={profile.mascot === id ? 'happy' : 'neutral'} size={46} /><small>{m.name}</small>
      </button>
    {/each}
  </div>

  <h2>Озвучка</h2>
  <label class="field">Скорость: {settings.rate.toFixed(2)}×
    <input type="range" min="0.6" max="1.2" step="0.05" bind:value={settings.rate} onchange={persist} />
  </label>
  <button class="secondary" onclick={() => say('Guten Tag! Ich heiße Anna. Woher kommen Sie?')}>🔊 Проверить голос</button>
  <label class="check"><input type="checkbox" bind:checked={settings.sfx} onchange={persist} /> Звуки «верно / ошибка»</label>

  <h2>Распознавание речи</h2>
  <div class="card">
    <label class="check"><input type="radio" bind:group={settings.asr} value="vosk" onchange={persist} /> Vosk, офлайн (подходит для Huawei без Google)</label>
    <label class="check" class:soft={!browserSpeechAvailable()}><input type="radio" bind:group={settings.asr} value="browser" disabled={!browserSpeechAvailable()} onchange={persist} /> Встроенное в браузер {browserSpeechAvailable() ? '(Samsung, Chrome)' : '(недоступно на этом телефоне)'}</label>
    {#if settings.asr === 'vosk'}
      <p class="small soft">Модель {voskState.status === 'ready' ? 'загружена' : voskState.status === 'loading' ? 'загружается…' : 'ещё не загружена'} (около 45 МБ, скачивается один раз).</p>
      {#if voskState.status === 'idle' || voskState.status === 'error'}<button class="secondary" onclick={() => loadVosk().catch(() => {})}>Скачать модель сейчас</button>{/if}
      {#if voskState.error}<p class="small" style="color:var(--bad)">{voskState.error}</p>{/if}
    {/if}
    {#if settings.asr === 'vosk'}
      <label class="check"><input type="checkbox" bind:checked={settings.asrVocab} onchange={persist} /> Искать только слова курса (точнее, рекомендуем)</label>
      <label class="check"><input type="checkbox" bind:checked={settings.micRaw} onchange={persist} /> Выключить шумодав микрофона (попробуйте, если распознаёт плохо)</label>
    {/if}
    <h3>Проверка качества</h3>
    <p>Нажмите «Начать» и прочитайте вслух:</p>
    <p><b>{TEST}</b></p>
    <button class="primary" onclick={asrToggle}>{asrSession ? '⏹ Стоп' : '🎙 Начать'}</button>
    {#if asrMsg}<p class="small soft">{asrMsg}</p>{/if}
    {#if asrSession}<p class="soft"><i>{asrText || 'Слушаю…'}</i></p>{/if}
    {#if asrResult}
      <p>Услышано: «{asrResult.text}»</p>
      <p>Узнано слов: <b>{Math.round(asrResult.score * 100)}%</b>. {asrResult.score >= 0.8 ? 'Отлично, распознавание подходит для занятий.' : asrResult.score >= 0.5 ? 'Терпимо. Говорите чуть медленнее и ближе к микрофону.' : 'Плохо. Попробуйте в тишине или другой движок.'}</p>
      <p class="small soft">Режим: {settings.asr === 'vosk' ? `Vosk, ${settings.asrVocab !== false ? 'слова курса' : 'свободно'}, шумодав ${settings.micRaw ? 'выкл' : 'вкл'}` : 'браузер'} · {(asrResult.ms / 1000).toFixed(1)} с. Пришлите процент и режим Claude.</p>
    {/if}
  </div>

  <h2>Напоминания</h2>
  <div class="card">
    <label class="field">Время занятий<input type="time" bind:value={settings.remindTime} onchange={persist} /></label>
    <button class="primary" onclick={() => download(icsFile(settings.remindTime), 'deutsch-reminder.ics')}>📅 Добавить в календарь телефона</button>
    <p class="small soft">Скачается файл .ics с ежедневным событием. Откройте его, и календарь предложит добавить напоминание. Это работает на Huawei и Samsung без интернета.</p>
    {#if notifySupported()}
      <button class="secondary" onclick={async () => (notifyMsg = await testNotification())}>🔔 Проверить веб-уведомления</button>
      {#if notifyMsg}<p class="small">{notifyMsg}</p>{/if}
      <p class="small soft">Уведомления по расписанию без своего сервера браузеры не присылают, поэтому основной вариант — календарь.</p>
    {/if}
  </div>

  <h2>Резервная копия</h2>
  <div class="row wrap">
    <button class="secondary" onclick={exp}>⬇️ Экспорт прогресса</button>
    <label class="secondary file">⬆️ Импорт<input type="file" accept="application/json" onchange={imp} hidden /></label>
  </div>
  {#if ioMsg}<p class="small">{ioMsg}</p>{/if}
  <p class="small soft" style="margin-top:24px">Deutsch zu zweit · этап 1 · тексты упражнений свои, учебник и Nicos Weg только по ссылкам.</p>
</div>

<style>
  .field { display: grid; gap: 4px; margin: 10px 0; font-weight: 600; }
  .field input:not([type=range]) { font-weight: 400; border: 2px solid var(--line); border-radius: 12px; padding: 10px; font-size: 18px; background: var(--card); }
  .check { display: flex; gap: 8px; align-items: center; margin: 8px 0; }
  .grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 4px; }
  .mcard { background: var(--card); border: 2px solid var(--line); border-radius: 12px; padding: 4px 0; display: grid; justify-items: center; }
  .mcard.sel { border-color: var(--accent); background: var(--accent-soft); }
  .mcard small { font-size: 10px; overflow: hidden; text-overflow: ellipsis; max-width: 100%; white-space: nowrap; }
  .file { display: inline-flex; align-items: center; }
</style>
