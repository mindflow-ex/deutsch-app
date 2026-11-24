<script>
  import Mascot from '../mascots/Mascot.svelte';
  import { profile } from '../lib/state.svelte.js';
  import { MODES, PROJECT_INSTRUCTIONS, buildTask, parseSummary, saveSummary } from '../lib/tutor.js';
  import { addCustomCard, all } from '../lib/db.js';
  let mode = $state('role');
  let extra = $state('');
  let task = $state('');
  let copied = $state('');
  let pasted = $state('');
  let parsed = $state(null);
  let saved = $state(false);
  let showSetup = $state(false);
  let history = $state([]);
  all('tutor').then((h) => (history = h.reverse().slice(0, 5)));

  async function build() { task = await buildTask({ mode, profile, extra }); copied = ''; }
  async function copy(text, what) {
    try { await navigator.clipboard.writeText(text); copied = what; }
    catch { copied = 'manual'; }
  }
  async function copyAndOpen() {
    await copy(task, 'task');
    window.open('https://claude.ai/new', '_blank', 'noopener');
  }
  function parse() { parsed = parseSummary(pasted); saved = false; }
  async function save() {
    for (const w of parsed.words) await addCustomCard(w);
    await saveSummary(parsed);
    saved = true;
    history = [{ ...parsed, date: new Date().toISOString() }, ...history].slice(0, 5);
  }
  const needsText = $derived(mode === 'text' || mode === 'question');
</script>
<div class="page">
  <h1>Репетитор</h1>
  <Mascot id={profile.mascot} emotion="think" size={80} say="Соберу задание для Claude. Вставьте его в проект «Немецкий репетитор» и говорите голосом." />

  <button class="link" onclick={() => (showSetup = !showSetup)}>{showSetup ? 'Скрыть' : 'Первый раз? Как настроить проект в Claude'}</button>
  {#if showSetup}
    <div class="card small">
      <ol>
        <li>В Claude создайте проект «Немецкий репетитор».</li>
        <li>Скопируйте инструкции ниже и вставьте в настройки проекта (Instructions).</li>
        <li>Дальше для каждого занятия: собрать задание здесь → «Скопировать и открыть Claude» → открыть новый чат в проекте → вставить.</li>
        <li>В конце напишите репетитору «ИТОГ» и вставьте его ответ внизу этой страницы.</li>
      </ol>
      <button class="secondary" onclick={() => copy(PROJECT_INSTRUCTIONS, 'setup')}>📋 Скопировать инструкции</button>
      {#if copied === 'setup'}<span class="small ok"> Скопировано</span>{/if}
    </div>
  {/if}

  <h2>1. Вид занятия</h2>
  <div class="opts">
    {#each MODES as m}
      <button class="opt" class:sel={mode === m.id} onclick={() => { mode = m.id; task = ''; }}><b>{m.label}</b><br /><span class="soft small">{m.hint}</span></button>
    {/each}
  </div>
  {#if needsText}
    <textarea bind:value={extra} rows="4" placeholder={mode === 'text' ? 'Hallo! Ich heiße … Ich komme aus …' : 'Почему говорят aus der Schweiz?'}></textarea>
  {/if}
  {#if mode === 'duo' && !profile.partner}<p class="small soft">Имя партнёра можно указать в настройках.</p>{/if}
  <button class="primary" onclick={build}>Собрать задание</button>

  {#if task}
    <h2>2. Задание</h2>
    <textarea readonly rows="9">{task}</textarea>
    <button class="primary" onclick={copyAndOpen}>📋 Скопировать и открыть Claude</button>
    {#if copied === 'task'}<p class="small ok">Скопировано. Откройте новый чат в проекте и вставьте.</p>{/if}
    {#if copied === 'manual'}<p class="small">Не удалось скопировать автоматически: выделите текст выше и скопируйте вручную.</p>{/if}
  {/if}

  <h2>3. Итог занятия</h2>
  <p class="soft small">Напишите репетитору «ИТОГ» и вставьте сюда его ответ целиком. Новые слова попадут в повторение.</p>
  <textarea bind:value={pasted} rows="5" placeholder="=== ИТОГ === …"></textarea>
  <button class="secondary" disabled={!pasted.trim()} onclick={parse}>Разобрать итог</button>
  {#if parsed === null && pasted && !pasted.includes('ИТОГ')}<p class="small">В тексте нет блока «=== ИТОГ ===».</p>{/if}
  {#if parsed}
    <div class="card">
      <p><b>Новые слова:</b> {parsed.words.map((w) => `${w.de} — ${w.ru}`).join('; ') || 'нет'}</p>
      <p><b>Ошибки:</b> {parsed.errors || '—'}</p>
      <p><b>Получилось:</b> {parsed.good || '—'}</p>
      <p><b>Совет:</b> {parsed.tip || '—'}</p>
      <button class="primary" disabled={saved} onclick={save}>{saved ? 'Сохранено ✓' : 'Сохранить и добавить слова в повторение'}</button>
    </div>
  {/if}
  {#if history.length}
    <h2>Прошлые занятия</h2>
    {#each history as h}<div class="card small"><b>{new Date(h.date).toLocaleDateString('ru-RU')}</b> · {h.good}<br /><span class="soft">{h.tip}</span></div>{/each}
  {/if}
</div>
<style>
  .opt.sel { border-color: var(--accent); background: var(--accent-soft); }
  .ok { color: var(--good); }
  textarea[readonly] { font-size: 14px; font-family: ui-monospace, monospace; }
  ol { padding-left: 20px; }
</style>
