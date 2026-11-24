<script>
  import UmlautKeys from '../ui/UmlautKeys.svelte';
  import { check } from '../lib/text.js';
  import { say } from '../lib/audio.js';
  let { ex, done } = $props();
  const [before, after] = ex.text.split('___');
  let input = $state();
  let value = $state('');
  let checked = $state(false);
  function submit(e) {
    e?.preventDefault();
    if (checked || !value.trim()) return;
    checked = true;
    const r = check(value, ex.answers);
    say(before + ex.answers[0] + after);
    done({ ok: r.ok, given: value, expected: ex.answers[0], note: r.note });
  }
</script>
<p class="q">Впишите форму{#if ex.hint} <span class="pill">{ex.hint}</span>{/if}</p>
<form class="sentence" onsubmit={submit}>
  <span>{before}</span>
  <input bind:this={input} bind:value autocapitalize="off" autocomplete="off" spellcheck="false" disabled={checked} size={Math.max(6, ex.answers[0].length + 2)} />
  <span>{after}</span>
</form>
<UmlautKeys {input} onchange={(v) => (value = v)} />
<button class="primary" disabled={checked || !value.trim()} onclick={submit}>Проверить</button>
<style>
  .sentence { font-size: 22px; display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px; margin: 8px 0; }
  input { font-size: 22px; border: 0; border-bottom: 3px solid var(--accent); background: transparent; padding: 2px 4px; color: var(--ink); width: auto; }
  input:focus { outline: none; background: var(--accent-soft); }
</style>
