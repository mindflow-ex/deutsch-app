<script>
  import { say } from '../lib/audio.js';
  import { shuffle } from '../lib/text.js';
  let { ex, done } = $props();
  const left = shuffle(ex.pairs.map((p, i) => ({ t: p[0], i })));
  const right = shuffle(ex.pairs.map((p, i) => ({ t: p[1], i })));
  let selL = $state(null), selR = $state(null);
  let matched = $state(new Set());
  let bad = $state(null);
  let errors = $state(0);
  function tryMatch() {
    if (selL === null || selR === null) return;
    if (selL === selR) {
      matched = new Set([...matched, selL]);
      if (matched.size === ex.pairs.length) setTimeout(() => done({ ok: errors < 2, note: errors ? `Ошибок: ${errors}` : '' }), 300);
    } else { errors++; bad = [selL, selR]; setTimeout(() => (bad = null), 500); }
    selL = selR = null;
  }
  const pickL = (x) => { if (matched.has(x.i)) return; selL = x.i; say(x.t); tryMatch(); };
  const pickR = (x) => { if (matched.has(x.i)) return; selR = x.i; tryMatch(); };
</script>
<p class="q">Соедините пары</p>
<div class="cols">
  <div>{#each left as x}<button class="tile" class:sel={selL === x.i} class:done={matched.has(x.i)} class:bad={bad?.[0] === x.i} onclick={() => pickL(x)}>{x.t}</button>{/each}</div>
  <div>{#each right as x}<button class="tile" class:sel={selR === x.i} class:done={matched.has(x.i)} class:bad={bad?.[1] === x.i} onclick={() => pickR(x)}>{x.t}</button>{/each}</div>
</div>
<style>
  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .cols div { display: grid; gap: 8px; }
  .tile { width: 100%; }
  .tile.done { opacity: .35; border-color: var(--good); }
</style>
