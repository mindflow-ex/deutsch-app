<script>
  // Перетащить слово в корзину der / das / die. На телефоне проще нажать на корзину.
  import { wordsById } from '../lib/content.js';
  import { say } from '../lib/audio.js';
  import { shuffle } from '../lib/text.js';
  let { ex, done } = $props();
  const queue = shuffle(ex.words.map((id) => wordsById.get(id)));
  let i = $state(0);
  let wrong = $state([]);
  let flash = $state('');
  let dragOver = $state('');
  const cur = $derived(queue[i]);

  function drop(art) {
    if (!cur) return;
    const ok = cur.article === art;
    flash = ok ? 'good' : 'bad';
    say(`${cur.article} ${cur.de}`);
    if (!ok) wrong.push({ given: `${art} ${cur.de}`, expected: `${cur.article} ${cur.de}` });
    setTimeout(() => {
      flash = '';
      i++;
      if (i >= queue.length) done({ ok: wrong.length === 0, given: wrong.map((w) => w.given).join(', '), expected: wrong.map((w) => w.expected).join(', '), note: wrong.length ? 'Запомните цвета: der синий, das зелёный, die красный.' : '' });
    }, ok ? 600 : 1400);
  }
</script>
<p class="q">Какой артикль? Перетащите слово или нажмите на корзину.</p>
<div class="word-area">
  {#if cur}
    <div class="word {flash}" draggable="true" role="listitem" ondragstart={(e) => e.dataTransfer.setData('text', cur.id)}>
      {#if flash === 'bad'}<span class="art" style="color:var(--{cur.article})">{cur.article}</span>{/if} {cur.de}
      <small>{cur.ru}</small>
    </div>
  {/if}
  <p class="count">{Math.min(i + 1, queue.length)} / {queue.length}</p>
</div>
<div class="bins">
  {#each ['der', 'das', 'die'] as a}
    <button class="bin {a}" class:over={dragOver === a}
      ondragover={(e) => { e.preventDefault(); dragOver = a; }} ondragleave={() => (dragOver = '')}
      ondrop={(e) => { e.preventDefault(); dragOver = ''; drop(a); }} onclick={() => drop(a)}>{a}</button>
  {/each}
</div>
<style>
  .word-area { text-align: center; min-height: 110px; }
  .word { display: inline-block; font-size: 28px; font-weight: 700; padding: 14px 22px; border-radius: 16px; background: var(--card); border: 2px solid var(--line); box-shadow: var(--shadow); cursor: grab; }
  .word small { display: block; font-size: 14px; font-weight: 400; color: var(--ink-soft); }
  .word.good { border-color: var(--good); } .word.bad { border-color: var(--bad); animation: shake .3s; }
  .count { color: var(--ink-soft); font-size: 13px; }
  .bins { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 12px; }
  .bin { color: #fff; border: 0; border-radius: 16px 16px 24px 24px; padding: 26px 0; font-size: 22px; font-weight: 700; }
  .bin.der { background: var(--der); } .bin.das { background: var(--das); } .bin.die { background: var(--die); }
  .bin.over { transform: scale(1.06); }
  @keyframes shake { 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
</style>
