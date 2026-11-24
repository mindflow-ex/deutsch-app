<script>
  import Listen from '../ui/Listen.svelte';
  import { shuffle } from '../lib/text.js';
  let { ex, done } = $props();
  const opts = shuffle(ex.options.map((o, i) => ({ o, i })));
  let picked = $state(null);
  function pick(x) {
    if (picked !== null) return;
    picked = x.i;
    done({ ok: x.i === ex.answer, given: x.o, expected: ex.options[ex.answer] });
  }
</script>
<p class="q">{ex.prompt} {#if ex.audio}<Listen text={ex.prompt} />{/if}</p>
<div class="opts">
  {#each opts as x}
    <button class="opt" class:good={picked !== null && x.i === ex.answer} class:bad={picked === x.i && x.i !== ex.answer} onclick={() => pick(x)}>{x.o}</button>
  {/each}
</div>
