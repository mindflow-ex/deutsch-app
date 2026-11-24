<script>
  import Mascot from '../mascots/Mascot.svelte';
  import { line } from '../mascots/mascots.js';
  import { profile, go } from '../lib/state.svelte.js';
  import { allLessons, lessonsById } from '../lib/content.js';
  import { all, allKeys, dueCards, streak, get, today } from '../lib/db.js';
  let next = $state(null);
  let due = $state(0);
  let days = $state(0);
  let doneCount = $state(0);
  let todayMin = $state(0);
  (async () => {
    const keys = await allKeys('progress');
    const vals = await all('progress');
    const done = new Set(keys.filter((_, i) => vals[i]?.done));
    doneCount = done.size;
    next = allLessons.find((l) => !done.has(l.id)) || null;
    due = (await dueCards()).length;
    days = await streak();
    todayMin = (await get('days', today()))?.minutes || 0;
  })();
  const hello = line(profile.mascot, 'hello');
  function study() {
    if (due > 0) go('review', null, { then: next?.id });
    else if (next) go('course', 'lesson', { id: next.id });
    else go('review');
  }
</script>
<div class="page">
  <div class="top">
    <h1>Hallo, {profile.name}!</h1>
    <button class="back" onclick={() => go('home', 'settings')} aria-label="Настройки">⚙️</button>
  </div>
  <Mascot id={profile.mascot} emotion="happy" size={110} say={hello} />
  <div class="stats">
    <div class="card stat"><b>🔥 {days}</b><span>дней подряд</span></div>
    <div class="card stat"><b>🔁 {due}</b><span>карточек ждут</span></div>
    <div class="card stat"><b>⏱ {todayMin}</b><span>минут сегодня</span></div>
  </div>
  <div class="card">
    <p class="soft small">Урок дня ≈ 30 минут: 10 повторение, 15 новое, 5 диалог</p>
    {#if next}
      <h2 style="margin-top:4px">{lessonsById.get(next.id).chapter.number}.{lessonsById.get(next.id).index + 1} {next.title}</h2>
      <p class="soft">{next.titleRu}</p>
    {:else}
      <h2>Все уроки пройдены! 🎉</h2><p class="soft">Повторяйте карточки и говорите с репетитором.</p>
    {/if}
    <button class="primary" onclick={study}>Заниматься</button>
  </div>
  <p class="soft small center">Пройдено уроков: {doneCount} из {allLessons.length}</p>
  <div class="row">
    <button class="secondary" style="flex:1" onclick={() => go('course', 'sounds')}>🗣 Звуки</button>
    <button class="secondary" style="flex:1" onclick={() => go('course', 'reference')}>📖 Справочник</button>
  </div>
</div>
<style>
  .top { display: flex; justify-content: space-between; align-items: center; }
  .top .back { font-size: 24px; }
  .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 12px 0 0; }
  .stat { display: grid; text-align: center; padding: 10px 4px; }
  .stat b { font-size: 20px; } .stat span { font-size: 12px; color: var(--ink-soft); }
</style>
