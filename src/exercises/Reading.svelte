<script>
  import Listen from '../ui/Listen.svelte';
  let { ex, done } = $props();
  let answers = $state(ex.questions.map(() => null));
  const all = $derived(answers.every((a) => a !== null));
  function finish() {
    const wrong = ex.questions.map((_, i) => i).filter((i) => answers[i] !== ex.questions[i].answer);
    done({ ok: !wrong.length, given: wrong.map((i) => ex.questions[i].options[answers[i]]).join('; '), expected: wrong.map((i) => ex.questions[i].options[ex.questions[i].answer]).join('; ') });
  }
</script>
<p class="q">Прочитайте и ответьте</p>
<div class="paper">
  <h3>{ex.title}</h3>
  {#each ex.lines as l}<p>{l} <Listen text={l} slow={false} /></p>{/each}
</div>
{#each ex.questions as q, qi}
  <p class="q2">{qi + 1}. {q.q}</p>
  <div class="opts">
    {#each q.options as o, i}
      <button class="opt small" class:sel={answers[qi] === i} onclick={() => (answers[qi] = i)}>{o}</button>
    {/each}
  </div>
{/each}
<button class="primary" disabled={!all} onclick={finish}>Проверить</button>
<style>
  .paper { background: #fffdf6; color: #2b2b2b; border: 1px solid var(--line); border-radius: 12px; padding: 12px 14px; box-shadow: var(--shadow); margin-bottom: 10px; }
  .paper h3 { margin: 0 0 6px; font-size: 16px; color: var(--accent); }
  .paper p { margin: 4px 0; font-size: 17px; }
  .q2 { font-weight: 600; margin: 12px 0 6px; }
  .opt.small { padding: 10px; font-size: 16px; }
  .opt.sel { border-color: var(--accent); background: var(--accent-soft); }
</style>
