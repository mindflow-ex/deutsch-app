<script>
  import { say } from '../lib/audio.js';
  import { onMount } from 'svelte';
  let { ex, done } = $props();
  let picked = $state(null);
  const target = ex.words[ex.answer];
  onMount(() => say(target));
  function pick(i) {
    if (picked !== null) return;
    picked = i;
    done({ ok: i === ex.answer, given: ex.words[i], expected: target });
  }
</script>
<p class="q">Что прозвучало?</p>
<div class="center"><button class="big-listen" onclick={() => say(target)}>🔊</button> <button class="big-listen" onclick={() => say(target, { slow: true })}>🐢</button></div>
<div class="opts two">
  {#each ex.words as w, i}
    <button class="opt" class:good={picked !== null && i === ex.answer} class:bad={picked === i && i !== ex.answer} onclick={() => pick(i)}>
      <b>{w}</b>{#if ex.ru?.[i]}<small>{ex.ru[i]}</small>{/if}
    </button>
  {/each}
</div>
{#if picked !== null}
  <div class="row center">
    {#each ex.words as w}<button class="secondary" onclick={() => say(w)}>🔊 {w}</button>{/each}
  </div>
{/if}
<style>
  .opts.two { grid-template-columns: 1fr 1fr; }
  .opt small { display: block; font-size: 13px; color: var(--ink-soft); font-weight: 400; }
  .opt b { font-size: 24px; }
  .big-listen { font-size: 30px; border: 2px solid var(--line); background: var(--card); border-radius: 18px; padding: 12px 22px; }
</style>
