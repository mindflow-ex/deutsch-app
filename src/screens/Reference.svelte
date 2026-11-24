<script>
  import { chapters, wordLabel } from '../lib/content.js';
  import { go } from '../lib/state.svelte.js';
  import RuleCard from '../ui/RuleCard.svelte';
  import Listen from '../ui/Listen.svelte';
  let q = $state('');
  let open = $state(null);
  const words = chapters.flatMap((c) => c.words.map((w) => ({ ...w, ch: c.number })));
  const found = $derived(q.trim() ? words.filter((w) => (w.de + ' ' + w.ru + ' ' + (w.forms || []).join(' ')).toLowerCase().includes(q.trim().toLowerCase())).slice(0, 40) : []);
</script>
<div class="page">
  <button class="back" onclick={() => go('course')}>← Назад</button>
  <h1>Справочник</h1>
  <input class="search" bind:value={q} placeholder="Поиск слова: Name, страна, sprechen…" />
  {#if q.trim()}
    <div class="card">
      {#each found as w}
        <div class="list-item"><Listen text={wordLabel(w)} slow={false} /><b style="flex:1">{#if w.article}<span style="color:var(--{w.article})">{w.article}</span> {/if}{w.de}{#if w.plural}<span class="soft small"> · die {w.plural}</span>{/if}</b><span class="soft small">{w.ru}</span></div>
      {:else}<p class="soft">Ничего не нашлось.</p>{/each}
    </div>
  {/if}
  {#each chapters as ch}
    <h2>Глава {ch.number}. {ch.title}</h2>
    {#each ch.rules as r}
      {#if open === r.id}<RuleCard rule={r} /><button class="link" onclick={() => (open = null)}>Свернуть</button>
      {:else}<button class="card item" onclick={() => (open = r.id)}>📘 {r.title}</button>{/if}
    {/each}
  {/each}
</div>
<style>
  .search { width: 100%; font-size: 18px; padding: 12px; border-radius: 14px; border: 2px solid var(--line); background: var(--card); margin-bottom: 10px; }
  .item { display: block; width: 100%; text-align: left; }
</style>
