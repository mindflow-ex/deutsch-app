<script>
  // Кнопки ä ö ü ß под полем ввода.
  let { input, onchange = () => {} } = $props();
  function put(ch) {
    if (!input) return;
    const s = input.selectionStart ?? input.value.length;
    const e = input.selectionEnd ?? s;
    input.value = input.value.slice(0, s) + ch + input.value.slice(e);
    input.focus();
    input.setSelectionRange(s + 1, s + 1);
    onchange(input.value);
  }
</script>
<div class="keys">
  {#each ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'] as k}
    <button type="button" onmousedown={(e) => e.preventDefault()} onclick={() => put(k)}>{k}</button>
  {/each}
</div>
<style>
  .keys { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
  button { min-width: 42px; min-height: 40px; border-radius: 10px; border: 2px solid var(--line); background: var(--card); font-size: 18px; }
</style>
