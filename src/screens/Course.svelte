<script>
  import { chapters } from '../lib/content.js';
  import { all, allKeys } from '../lib/db.js';
  import { go } from '../lib/state.svelte.js';
  let done = $state(new Set());
  (async () => {
    const k = await allKeys('progress'); const v = await all('progress');
    done = new Set(k.filter((_, i) => v[i]?.done));
  })();
  const PLANNED = ['Meine Familie', 'Essen und Trinken', 'Meine Wohnung', 'Mein Tag', 'Freizeit', 'Lernen – ein Leben lang'];
</script>
<div class="page">
  <h1>Курс A1.1</h1>
  <div class="row"><button class="secondary" style="flex:1" onclick={() => go('course', 'sounds')}>🗣 Звуки</button><button class="secondary" style="flex:1" onclick={() => go('course', 'reference')}>📖 Справочник</button></div>
  {#each chapters as ch}
    <h2>Глава {ch.number}. {ch.title}</h2>
    <p class="soft small">{ch.titleRu} · {ch.textbook}</p>
    <div class="path">
      {#each ch.lessons as l, i}
        {@const unlocked = i === 0 || done.has(ch.lessons[i - 1].id) || done.has(l.id)}
        <button class="stop" class:done={done.has(l.id)} class:open={unlocked && !done.has(l.id)} style="margin-left:{[0, 40, 70, 40, 0, 30][i % 6]}px"
          onclick={() => go('course', 'lesson', { id: l.id })}>
          <span class="dot">{done.has(l.id) ? '✓' : i + 1}</span>
          <span class="txt"><b>{l.title}</b><small>{l.titleRu} · учебник {l.textbook.part}, стр. {l.textbook.pages}</small></span>
        </button>
      {/each}
    </div>
  {/each}
  {#each PLANNED as t, i}
    <h2 class="soft">Глава {i + 2}. {t}</h2><p class="soft small">Появится на этапе 2.</p>
  {/each}
  <p class="small soft">Видео к курсу: <a href="https://learngerman.dw.com/ru/nicos-weg/c-45476888" target="_blank" rel="noopener">Nicos Weg на DW</a></p>
</div>
<style>
  .path { display: grid; gap: 10px; margin: 8px 0 18px; }
  .stop { display: flex; gap: 10px; align-items: center; background: none; border: 0; text-align: left; padding: 0; }
  .dot { flex: none; width: 54px; height: 54px; border-radius: 50%; display: grid; place-items: center; font-weight: 800; font-size: 20px; background: var(--line); color: var(--ink-soft); box-shadow: 0 4px 0 rgba(0,0,0,.12); }
  .open .dot { background: var(--accent); color: #fff; }
  .done .dot { background: var(--gold); color: #5a4200; }
  .txt { display: grid; } .txt small { color: var(--ink-soft); font-size: 13px; }
</style>
