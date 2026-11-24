<script>
  import Listen from './Listen.svelte';
  let { rule } = $props();
</script>
<div class="card rule-card">
  <h2>📘 {rule.title}</h2>
  {#each rule.text as t}<p>{t}</p>{/each}
  {#if rule.table}
    <table class="rule">
      <thead><tr>{#each rule.table.head as h}<th>{h}</th>{/each}</tr></thead>
      <tbody>{#each rule.table.rows as r}<tr>{#each r as c, i}<td class:strong={i > 0}>{c}</td>{/each}</tr>{/each}</tbody>
    </table>
  {/if}
  <h3>Примеры</h3>
  {#each rule.examples as e}
    <div class="ex"><Listen text={e.de} /> <div><b>{e.de}</b><br /><span class="soft small">{e.ru}</span></div></div>
  {/each}
</div>
<style>
  .rule-card h2 { margin-top: 0; }
  .rule-card p { margin: 6px 0; }
  .ex { display: flex; gap: 10px; align-items: center; margin: 8px 0; }
  td.strong { font-weight: 600; }
</style>
