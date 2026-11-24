<script>
  import Listen from '../ui/Listen.svelte';
  import Mascot from '../mascots/Mascot.svelte';
  import { line } from '../mascots/mascots.js';
  import { wordsById, wordLabel } from '../lib/content.js';
  import { dueCards, gradeCard, get, all, markDay } from '../lib/db.js';
  import { profile, go } from '../lib/state.svelte.js';
  import { say } from '../lib/audio.js';
  import { shuffle } from '../lib/text.js';
  let { params } = $props();
  let cards = $state([]);
  let i = $state(0);
  let flipped = $state(false);
  let loaded = $state(false);
  let mistakes = $state([]);
  const started = Date.now();
  (async () => {
    const ids = shuffle(await dueCards()).slice(0, 30);
    const out = [];
    for (const id of ids) {
      const w = wordsById.get(id) || (await get('cards', id))?.word;
      if (w) out.push({ id, w, dir: Math.random() < 0.5 ? 'de' : 'ru' });
    }
    cards = out;
    mistakes = (await all('mistakes')).slice(-8).reverse();
    loaded = true;
  })();
  const cur = $derived(cards[i]);
  async function grade(g) {
    await gradeCard(cur.id, g);
    flipped = false;
    i++;
    if (i >= cards.length) await markDay(Math.max(1, Math.round((Date.now() - started) / 60000)), 0);
    else if (cards[i].dir === 'de') say(label(cards[i].w));
  }
  const label = (w) => (w.article ? wordLabel(w) : w.de);
  function flip() { flipped = true; say(label(cur.w)); }
</script>
<div class="page">
  <h1>Повторение</h1>
  {#if !loaded}<p class="soft">…</p>
  {:else if cur}
    <p class="soft small">{i + 1} / {cards.length} · {cur.dir === 'de' ? 'Вспомните перевод' : (cur.w.article ? 'Вспомните немецкое слово с артиклем' : 'Вспомните по-немецки')}</p>
    <button class="flash card" onclick={flip}>
      {#if cur.dir === 'de' || flipped}
        <span class="de">{#if cur.w.article}<span style="color:var(--{cur.w.article})">{cur.w.article}</span> {/if}{cur.w.de}</span>
      {/if}
      {#if cur.dir === 'ru' || flipped}<span class="ru">{cur.w.ru}</span>{/if}
      {#if !flipped}<span class="soft small">нажмите, чтобы проверить</span>{/if}
    </button>
    {#if flipped}
      <div class="center"><Listen text={label(cur.w)} /></div>
      <div class="grades">
        <button class="g forgot" onclick={() => grade('forgot')}>Не помню</button>
        <button class="g unsure" onclick={() => grade('unsure')}>Сомневаюсь</button>
        <button class="g know" onclick={() => grade('know')}>Знаю</button>
      </div>
    {/if}
  {:else}
    <Mascot id={profile.mascot} emotion="happy" size={100} say={cards.length ? line(profile.mascot, 'done') : 'На сегодня карточек нет. Новые слова появятся после уроков.'} />
    {#if params?.then}<button class="primary" onclick={() => go('course', 'lesson', { id: params.then })}>Дальше: новый урок</button>{/if}
  {/if}

  {#if mistakes.length && (!cur || !loaded)}
    <h2>Последние ошибки</h2>
    <div class="card">
      {#each mistakes as m}
        <div class="list-item small"><span class="bad-t">{m.given || '—'}</span> → <b>{m.expected}</b></div>
      {/each}
    </div>
    <p class="soft small">Разобрать их можно с репетитором: режим «Разбор ошибок».</p>
  {/if}
  <p class="soft small">Сейчас работает простая система коробок (1, 3, 7, 14 дней). На этапе 2 подключим FSRS, как в Anki.</p>
</div>
<style>
  .flash { width: 100%; min-height: 200px; display: grid; place-items: center; align-content: center; gap: 10px; text-align: center; }
  .de { font-size: 32px; font-weight: 800; } .ru { font-size: 22px; }
  .grades { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 12px; }
  .g { border: 0; border-radius: 14px; padding: 14px 4px; font-weight: 700; color: #fff; }
  .forgot { background: var(--bad); } .unsure { background: #d49a2a; } .know { background: var(--good); }
  .bad-t { color: var(--bad); text-decoration: line-through; }
</style>
