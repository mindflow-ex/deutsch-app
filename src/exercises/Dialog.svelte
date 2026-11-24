<script>
  // Диалог с маскотом: маскот говорит, вы отвечаете голосом или выбираете реплику.
  import Mascot from '../mascots/Mascot.svelte';
  import Mic from '../ui/Mic.svelte';
  import Listen from '../ui/Listen.svelte';
  import { say } from '../lib/audio.js';
  import { norm, shuffle } from '../lib/text.js';
  import { profile } from '../lib/state.svelte.js';
  import { onMount } from 'svelte';
  let { ex, done } = $props();
  let t = $state(0);
  let log = $state([]);
  let emotion = $state('neutral');
  let fb = $state('');
  let mistakes = $state(0);
  let showRu = $state(false);
  const turn = $derived(ex.turns[t]);
  const replies = $derived(turn ? shuffle(turn.replies) : []);

  onMount(() => speakBot());
  async function speakBot() {
    if (!ex.turns[t]) return;
    log = [...log, { who: 'bot', text: ex.turns[t].bot }];
    await say(ex.turns[t].bot);
  }
  function next(ok, text, feedback) {
    log = [...log, { who: 'me', text, ok }];
    if (!ok) {
      mistakes++;
      emotion = 'sad';
      fb = feedback || 'Попробуйте иначе.';
      return; // остаёмся на реплике, можно ответить ещё раз
    }
    emotion = 'happy';
    fb = '';
    t++;
    if (t >= ex.turns.length) {
      emotion = 'cheer';
      setTimeout(() => done({ ok: mistakes === 0, note: mistakes ? `Неточных ответов: ${mistakes}` : '' }), 900);
    } else setTimeout(() => { emotion = 'neutral'; speakBot(); }, 700);
  }
  function voice(text) {
    const n = norm(text);
    const words = new Set(n.split(' '));
    const has = (k) => { const nk = norm(k); return words.has(nk) || (nk.length > 3 && n.includes(nk)); };
    const ok = text && turn.keywords.every((group) => group.some(has));
    // если сказали ровно неверную реплику — покажем её объяснение
    const badMatch = turn.replies.find((r) => !r.ok && norm(r.de) === n);
    next(ok && !badMatch, text || '…', badMatch?.feedback || 'Телефон не услышал нужных слов. Скажите ещё раз или выберите ответ ниже.');
  }
</script>

<p class="q">Диалог: {ex.title}</p>
<Mascot id={profile.mascot || 'shiba'} {emotion} size={86} />
<div class="chat">
  {#each log as m}
    <div class="msg {m.who}" class:bad={m.ok === false}>{m.text}{#if m.who === 'bot'} <Listen text={m.text} slow /> {/if}</div>
  {/each}
</div>
{#if turn}
  {#if showRu}<p class="soft">Перевод: {turn.ru}</p>{:else}<button class="link" onclick={() => (showRu = true)}>Показать перевод</button>{/if}
  {#if fb}<p class="fb">{fb}</p>{/if}
  <Mic onresult={voice} label="Ответить голосом" />
  <p class="soft center">или выберите ответ:</p>
  <div class="opts">
    {#each replies as r}<button class="opt" onclick={() => { say(r.de); next(r.ok, r.de, r.feedback); }}>{r.de}</button>{/each}
  </div>
{/if}
<style>
  .chat { display: grid; gap: 8px; margin: 10px 0; }
  .msg { max-width: 85%; padding: 10px 12px; border-radius: 16px; font-size: 17px; }
  .msg.bot { background: var(--card); border: 2px solid var(--line); justify-self: start; border-bottom-left-radius: 4px; }
  .msg.me { background: var(--accent-soft); justify-self: end; border-bottom-right-radius: 4px; }
  .msg.me.bad { background: var(--bad-soft); text-decoration: line-through; text-decoration-color: var(--bad); }
  .fb { color: var(--bad); }
</style>
