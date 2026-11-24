<script>
  import { norm } from '../lib/text.js';
  import { say } from '../lib/audio.js';
  let { ex, done } = $props();
  const persons = Object.keys(ex.forms);
  let values = $state(Object.fromEntries(persons.map((p) => [p, ex.given.includes(p) ? ex.forms[p] : ''])));
  let checked = $state(false);
  let res = $state({});
  const okCell = (p) => norm(values[p]) === norm(ex.forms[p]) || norm(values[p]).replace(/ss/g, 'ß') === norm(ex.forms[p]);
  function submit() {
    checked = true;
    res = Object.fromEntries(persons.map((p) => [p, okCell(p)]));
    const wrong = persons.filter((p) => !res[p]);
    say(persons.map((p) => `${p} ${ex.forms[p]}`).join(', '));
    done({ ok: !wrong.length, given: wrong.map((p) => `${p} ${values[p]}`).join(', '), expected: wrong.map((p) => `${p} ${ex.forms[p]}`).join(', ') });
  }
</script>
<p class="q">Таблица спряжения: <b>{ex.verb}</b> <span class="soft">({ex.ru})</span></p>
<table class="conj">
  <tbody>
  {#each persons as p}
    <tr>
      <th>{p}</th>
      <td>
        {#if ex.given.includes(p)}<b>{ex.forms[p]}</b>
        {:else}<input bind:value={values[p]} disabled={checked} autocapitalize="off" autocomplete="off" spellcheck="false" class:good={checked && res[p]} class:bad={checked && !res[p]} />
          {#if checked && !res[p]}<span class="fix">{ex.forms[p]}</span>{/if}
        {/if}
      </td>
    </tr>
  {/each}
  </tbody>
</table>
<button class="primary" disabled={checked || persons.some((p) => !values[p].trim())} onclick={submit}>Проверить</button>
<style>
  .conj { width: 100%; border-collapse: collapse; margin: 8px 0 14px; font-size: 20px; }
  th { text-align: left; width: 30%; color: var(--ink-soft); font-weight: 500; padding: 8px 0; }
  input { font-size: 20px; width: 70%; border: 2px solid var(--line); border-radius: 10px; padding: 6px 8px; background: var(--card); color: var(--ink); }
  input.good { border-color: var(--good); } input.bad { border-color: var(--bad); }
  .fix { color: var(--good); font-weight: 700; margin-left: 8px; }
</style>
