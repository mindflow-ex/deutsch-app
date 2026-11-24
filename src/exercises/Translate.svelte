<script>
  import UmlautKeys from '../ui/UmlautKeys.svelte';
  import { check } from '../lib/text.js';
  import { say } from '../lib/audio.js';
  let { ex, done } = $props();
  let input = $state();
  let value = $state('');
  let checked = $state(false);
  let selfMode = $state(false);
  function submit(e) {
    e?.preventDefault();
    if (checked) return;
    if (ex.selfCheck) { selfMode = true; checked = true; say(ex.accept[0]); return; }
    checked = true;
    const r = check(value, ex.accept);
    say(ex.accept[0]);
    done({ ok: r.ok, given: value, expected: r.best || ex.accept[0], note: r.note });
  }
</script>
<p class="q">Переведите на немецкий</p>
<p class="ru">{ex.ru}</p>
<form onsubmit={submit}><textarea bind:this={input} bind:value rows="3" spellcheck="false" disabled={checked}></textarea></form>
<UmlautKeys {input} onchange={(v) => (value = v)} />
{#if selfMode}
  <div class="card-soft">
    <p>Образец: <b>{ex.accept[0]}</b></p>
    {#if ex.explain}<p class="soft">{ex.explain}</p>{/if}
    <p>Сравните сами:</p>
    <div class="row">
      <button class="primary" onclick={() => done({ ok: true, given: value, expected: ex.accept[0] })}>Всё верно</button>
      <button class="secondary" onclick={() => done({ ok: false, given: value, expected: ex.accept[0] })}>Есть ошибки</button>
    </div>
  </div>
{:else}
  <button class="primary" disabled={checked || !value.trim()} onclick={submit}>Проверить</button>
{/if}
<style>.ru { font-size: 20px; margin: 4px 0 10px; }</style>
