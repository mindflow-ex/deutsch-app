<script>
  import Listen from '../ui/Listen.svelte';
  import UmlautKeys from '../ui/UmlautKeys.svelte';
  import { check } from '../lib/text.js';
  import { say } from '../lib/audio.js';
  import { onMount } from 'svelte';
  let { ex, done } = $props();
  let input = $state();
  let value = $state('');
  let checked = $state(false);
  onMount(() => say(ex.text));
  function submit(e) {
    e?.preventDefault();
    if (checked) return;
    checked = true;
    const r = check(value, [ex.text, ...(ex.accept || [])]);
    done({ ok: r.ok, given: value, expected: ex.text, note: r.note });
  }
</script>
<p class="q">Диктант: прослушайте и напишите</p>
<div class="center"><Listen text={ex.text} big /></div>
<form onsubmit={submit}><textarea bind:this={input} bind:value rows="2" autocapitalize="sentences" spellcheck="false" disabled={checked}></textarea></form>
<UmlautKeys {input} onchange={(v) => (value = v)} />
<button class="primary" disabled={checked || !value.trim()} onclick={submit}>Проверить</button>
