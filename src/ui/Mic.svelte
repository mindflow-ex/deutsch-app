<script>
  // Кнопка записи с распознаванием речи. onresult(text) вызывается после остановки.
  import { listen, loadVosk, voskState, engine } from '../lib/speech.svelte.js';
  let { onresult, label = 'Нажми и говори' } = $props();
  let session = $state(null);
  let partial = $state('');
  let error = $state('');
  let busy = $state(false);

  async function toggle() {
    error = '';
    if (session) {
      busy = true;
      const s = session; session = null;
      const text = await s.stop();
      busy = false;
      onresult(text);
      return;
    }
    try {
      busy = true;
      partial = '';
      session = await listen((p) => (partial = p));
    } catch (e) {
      error = e?.name === 'NotAllowedError' ? 'Нет доступа к микрофону. Разрешите его в настройках браузера.' :
        'Распознавание пока недоступно: ' + (e?.message || e);
    } finally { busy = false; }
  }
</script>

<div class="mic">
  <button class="rec" class:on={!!session} disabled={busy && !session} onclick={toggle}>
    {#if session}⏹ Стоп{:else if busy}…{:else}🎙 {label}{/if}
  </button>
  {#if engine() === 'vosk' && voskState.status === 'loading'}
    <p class="small">Загружаю модель распознавания (~45 МБ, один раз)…</p>
  {/if}
  {#if session}<p class="partial">{partial || 'Слушаю…'}</p>{/if}
  {#if error}<p class="err">{error}</p>{/if}
</div>

<style>
  .mic { display: grid; gap: 6px; justify-items: center; }
  .rec { background: var(--accent); color: #fff; border: 0; border-radius: 999px; padding: 14px 26px; font-size: 18px; font-weight: 600; min-height: 52px; }
  .rec.on { background: var(--bad); animation: pulse 1s infinite; }
  @keyframes pulse { 50% { box-shadow: 0 0 0 10px rgba(217, 72, 59, .15); } }
  .partial { font-style: italic; color: var(--ink-soft); min-height: 1.4em; }
  .err { color: var(--bad); font-size: 14px; text-align: center; }
  .small { font-size: 13px; color: var(--ink-soft); }
</style>
