<script>
  import Mascot from '../mascots/Mascot.svelte';
  import { profile } from '../lib/state.svelte.js';
  import { allKeys, all, streak } from '../lib/db.js';
  const GOAL = 10;
  let weekLessons = $state(0);
  let days = $state(0);
  (async () => {
    const keys = await allKeys('days'); const vals = await all('days');
    const now = new Date(); const monday = new Date(now); monday.setDate(now.getDate() - ((now.getDay() + 6) % 7)); monday.setHours(0, 0, 0, 0);
    weekLessons = keys.reduce((s, k, i) => (new Date(k) >= monday ? s + (vals[i].lessons || 0) : s), 0);
    days = await streak();
  })();
  const partner = profile.partner || 'партнёр';
  const tasks = [
    `Спросите ${partner} по-немецки: Wie heißt du? Woher kommst du? Was sprichst du? Потом поменяйтесь.`,
    'Познакомьтесь заново на «Вы»: Guten Tag! Wie heißen Sie? Woher kommen Sie?',
    'Продиктуйте друг другу по буквам имя любимого актёра. Кто записал верно?',
    'Утром скажите друг другу Guten Morgen!, вечером Gute Nacht!, весь день здоровайтесь только по-немецки.'
  ];
</script>
<div class="page">
  <h1>Мы вдвоём</h1>
  <div class="card">
    <h3 style="margin-top:0">Общая цель недели: {GOAL} уроков вместе</h3>
    <div class="bar"><i style="width:{Math.min(100, (weekLessons / GOAL) * 100)}%"></i></div>
    <p class="small soft">С этого телефона на этой неделе: {weekLessons}. Вклад партнёра появится после синхронизации на этапе 2. Кто сколько сделал, отдельно не показываем.</p>
  </div>
  <div class="card"><b>🔥 Серия: {days} дн.</b><p class="small soft">Один пропущенный день в неделю серию не сбрасывает.</p></div>
  <h2>Совместные задания</h2>
  {#each tasks as t}<div class="card">💬 {t}</div>{/each}
  <Mascot id={profile.mascot} emotion="happy" size={70} say="Вместе учиться веселее!" />
</div>
