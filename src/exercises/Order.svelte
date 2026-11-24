<script>
  // Собрать предложение из плиток. Глагол подсвечен как «второе место».
  import { say } from '../lib/audio.js';
  import { shuffle, norm } from '../lib/text.js';
  let { ex, done } = $props();
  const tiles = shuffle([...ex.answer.map((t, i) => ({ t, i, verb: i === ex.verbIndex })), ...(ex.extra || []).map((t, k) => ({ t, i: 100 + k }))]);
  let chosen = $state([]); // индексы плиток
  let checked = $state(false);
  const left = $derived(tiles.map((x, k) => ({ ...x, k })).filter((x) => !chosen.includes(x.k)));
  const line = $derived(chosen.map((k) => tiles[k]));
  function check() {
    checked = true;
    const given = line.map((x) => x.t).join(' ');
    const expected = ex.answer.join(' ');
    const ok = norm(given) === norm(expected);
    say(expected);
    done({ ok, given, expected });
  }
</script>
<p class="q">{ex.ru}</p>
<div class="line">
  {#each chosen as k, n}<button class="tile" class:verb={tiles[k].verb} onclick={() => !checked && (chosen = chosen.filter((_, m) => m !== n))}>{tiles[k].t}</button>{/each}
  {#if !chosen.length}<span class="placeholder">Нажимайте на слова по порядку</span>{/if}
</div>
<div class="bank">
  {#each left as x}<button class="tile" class:verb={x.verb} disabled={checked} onclick={() => (chosen = [...chosen, x.k])}>{x.t}</button>{/each}
</div>
{#if ex.verbIndex !== undefined}<p class="hint">Глагол подсвечен: он стоит на {ex.verbIndex + 1}-м месте.</p>{/if}
<button class="primary" disabled={checked || chosen.length !== ex.answer.length} onclick={check}>Проверить</button>
<style>
  .line { min-height: 58px; border-bottom: 2px dashed var(--line); padding: 8px 0; display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
  .bank { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
  .placeholder { color: var(--ink-soft); font-size: 14px; align-self: center; }
  .tile.verb { border-color: var(--accent); background: var(--accent-soft); }
</style>
