<script>
  // Повтори вслух: образец → запись → распознанный текст с подсветкой слов.
  import Listen from '../ui/Listen.svelte';
  import Mic from '../ui/Mic.svelte';
  import { compareSpeech } from '../lib/text.js';
  import { recordSelf } from '../lib/speech.svelte.js';
  import { say } from '../lib/audio.js';
  import { onMount } from 'svelte';
  let { ex, done } = $props();
  let result = $state(null);
  let tries = $state(0);
  let selfUrl = $state('');
  let selfRec = $state(null);
  onMount(() => say(ex.text));

  function onresult(text) {
    tries++;
    result = { text, ...compareSpeech(ex.text, text) };
  }
  const passed = $derived(result && result.score >= 0.6);
  async function toggleSelf() {
    if (selfRec) { selfUrl = await selfRec.stop(); selfRec = null; return; }
    try { selfRec = await recordSelf(); } catch {}
  }
</script>
<p class="q">Послушайте и повторите вслух</p>
<p class="de">{ex.text} <Listen text={ex.text} /></p>
<p class="soft">{ex.ru}</p>
<Mic {onresult} target={ex.text} />
{#if result}
  <div class="card-soft">
    <p class="soft">Телефон услышал: «{result.text || '…тишина…'}»</p>
    <p class="marks">{#each result.marks as m}<span class:ok={m.ok} class:miss={!m.ok}>{m.w}</span> {/each}</p>
    {#if passed}<p class="good-t">Отлично, все важные слова узнаны!</p>
    {:else}<p class="bad-t">Не все слова узнаны. Красные произнесите чётче, можно ещё раз.</p>{/if}
  </div>
{/if}
<div class="row wrap">
  <button class="secondary" onclick={toggleSelf}>{selfRec ? '⏹ Стоп' : '🎧 Записать себя'}</button>
  {#if selfUrl}<audio src={selfUrl} controls></audio>{/if}
</div>
<div class="row">
  {#if passed || tries >= 2}
    <button class="primary" onclick={() => done({ ok: !!passed, given: result?.text, expected: ex.text, speech: true })}>Дальше</button>
  {/if}
  <button class="link" onclick={() => done({ ok: true, skipped: true, speech: true })}>Не могу говорить сейчас</button>
</div>
<style>
  .de { font-size: 24px; font-weight: 600; margin: 4px 0; }
  .marks span { padding: 1px 4px; border-radius: 6px; font-size: 20px; }
  .marks .ok { background: var(--good-soft); }
  .marks .miss { background: var(--bad-soft); }
  .good-t { color: var(--good); } .bad-t { color: var(--bad); }
  audio { height: 36px; max-width: 200px; }
</style>
