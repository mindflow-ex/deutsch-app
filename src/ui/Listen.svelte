<script>
  import { say } from '../lib/audio.js';
  let { text, slow = true, big = false, label = '', voice } = $props();
  let playing = $state(false);
  async function play(s) { playing = true; await say(text, { slow: s, voice }); playing = false; }
</script>
<span class="listen">
  <button class="icon {big ? 'big' : ''}" class:on={playing} onclick={() => play(false)} aria-label="Слушать">🔊{label ? ' ' + label : ''}</button>
  {#if slow}<button class="icon" onclick={() => play(true)} aria-label="Медленно">🐢</button>{/if}
</span>
<style>
  .listen { display: inline-flex; gap: 6px; vertical-align: middle; }
  .icon { border: 2px solid var(--line); background: var(--card); border-radius: 12px; padding: 6px 10px; font-size: 18px; min-height: 40px; }
  .icon.big { font-size: 28px; padding: 14px 22px; border-radius: 18px; }
  .icon.on { border-color: var(--accent); }
</style>
