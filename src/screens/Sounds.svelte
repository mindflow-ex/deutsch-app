<script>
  import { sounds } from '../lib/content.js';
  import { go } from '../lib/state.svelte.js';
  import Listen from '../ui/Listen.svelte';
  import Mic from '../ui/Mic.svelte';
  import MinimalPair from '../exercises/MinimalPair.svelte';
  import { compareSpeech, shuffle } from '../lib/text.js';
  import { beep } from '../lib/audio.js';
  let { params } = $props();
  let sel = $state(sounds.find((s) => s.id === params?.id) || null);
  let drill = $state(null);
  let score = $state({ ok: 0, n: 0 });
  let said = $state({});
  function newDrill() {
    const [a, b] = shuffle(sel.pairs)[0];
    drill = { key: Math.random(), ex: { type: 'minimal_pair', words: [a, b], answer: Math.random() < 0.5 ? 0 : 1 } };
  }
  function pairDone(r) { beep(r.ok); score = { ok: score.ok + (r.ok ? 1 : 0), n: score.n + 1 }; setTimeout(newDrill, 1300); }
</script>
<div class="page">
  <button class="back" onclick={() => (sel ? ((sel = null), (drill = null)) : go('course'))}>← Назад</button>
  {#if !sel}
    <h1>Звуки</h1>
    <p class="soft">Короткие тренажёры трудных для русскоязычных звуков. Эталон живого произношения — серии Nicos Weg и аудио учебника.</p>
    {#each sounds as s}
      <button class="card item" onclick={() => { sel = s; score = { ok: 0, n: 0 }; }}><b>{s.title}</b><span class="soft small">{s.examples.slice(0, 4).join(', ')}</span></button>
    {/each}
  {:else}
    <h1>{sel.title}</h1>
    <div class="card"><p>{sel.tip}</p></div>
    <h2>Слушай и повторяй</h2>
    <div class="card">
      {#each sel.examples as w}
        <div class="list-item">
          <Listen text={w} />
          <b style="flex:1">{w}</b>
          {#if said[w] !== undefined}<span class={said[w] ? 'ok' : 'no'}>{said[w] ? '✓' : '✗'}</span>{/if}
          <Mic label="" target={w} onresult={(t) => (said = { ...said, [w]: compareSpeech(w, t).score === 1 })} />
        </div>
      {/each}
    </div>
    <h2>Различаем на слух</h2>
    <p class="soft small">Пары: {sel.pairs.map((p) => p.join(' / ')).join(', ')}</p>
    {#if drill}
      {#key drill.key}<MinimalPair ex={drill.ex} done={pairDone} />{/key}
      <p class="center soft">Верно: {score.ok} из {score.n}</p>
    {:else}
      <button class="primary" onclick={newDrill}>Начать тренировку</button>
    {/if}
  {/if}
</div>
<style>
  .item { display: grid; width: 100%; text-align: left; gap: 2px; }
  .ok { color: var(--good); font-weight: 800; } .no { color: var(--bad); font-weight: 800; }
  .list-item :global(.mic) { justify-items: end; }
  .list-item :global(.rec) { padding: 8px 14px; min-height: 40px; font-size: 16px; }
</style>
