<script>
  import Listen from '../ui/Listen.svelte';
  import { say } from '../lib/audio.js';
  import { onMount } from 'svelte';
  let { ex, done } = $props();
  let picked = $state(null);
  onMount(() => { say(ex.text); });
  function pick(i) {
    if (picked !== null) return;
    picked = i;
    done({ ok: i === ex.answer, given: ex.options[i], expected: ex.options[ex.answer] });
  }
</script>
<p class="hint">Послушайте</p>
<div class="center"><Listen text={ex.text} big /></div>
<p class="q">{ex.question}</p>
<div class="opts">
  {#each ex.options as o, i}
    <button class="opt" class:good={picked !== null && i === ex.answer} class:bad={picked === i && i !== ex.answer} onclick={() => pick(i)}>{o}</button>
  {/each}
</div>
{#if picked !== null}<p class="reveal">«{ex.text}»</p>{/if}
