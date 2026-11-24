<script>
  // Урок: правило → слова → задания → диалог → итог. Ошибочные задания возвращаются в конец.
  import Mascot from '../mascots/Mascot.svelte';
  import { line } from '../mascots/mascots.js';
  import Exercise from '../exercises/Exercise.svelte';
  import { TYPE_NAMES } from '../exercises/types.js';
  import Listen from '../ui/Listen.svelte';
  import RuleCard from '../ui/RuleCard.svelte';
  import { lessonsById, rulesById, wordsById, wordLabel, allLessons, sounds } from '../lib/content.js';
  import { profile, go } from '../lib/state.svelte.js';
  import { put, addCards, addMistake, markDay } from '../lib/db.js';
  import { beep, say } from '../lib/audio.js';

  let { params } = $props();
  const lesson = lessonsById.get(params.id);
  const rules = lesson.rules.map((id) => rulesById.get(id));
  const words = lesson.words.map((id) => wordsById.get(id));
  const started = Date.now();

  let step = $state('rules'); // rules | words | ex | dialog | summary
  let ruleIdx = $state(0);
  let queue = $state(lesson.exercises.map((ex, i) => ({ ex, key: i, retry: false })));
  let pos = $state(0);
  let result = $state(null); // { ok, note, given, expected }
  let emotion = $state('neutral');
  let quip = $state(line(profile.mascot, 'hello'));
  let stats = $state({ correct: 0, total: 0, wrongTypes: [] });
  let openRule = $state(null);
  let retried = new Set();

  const totalSteps = lesson.exercises.length + 2;
  const progress = $derived(step === 'rules' ? 0 : step === 'words' ? 1 : step === 'ex' ? 2 + Math.min(pos, lesson.exercises.length) : step === 'dialog' ? totalSteps : totalSteps + 1);
  const cur = $derived(queue[pos]);

  function done(r) {
    result = r;
    const ex = cur.ex;
    if (!cur.retry) { stats.total++; if (r.ok) stats.correct++; }
    beep(r.ok);
    emotion = r.ok ? (Math.random() < 0.3 ? 'cheer' : 'happy') : 'sad';
    quip = line(profile.mascot, r.ok ? 'right' : 'wrong');
    if (!r.ok) {
      addMistake({ lesson: lesson.id, type: ex.type, rule: ex.rule || lesson.rules[0], given: r.given || '', expected: r.expected || '' });
      stats.wrongTypes.push(ex.type);
      if (!retried.has(cur.key)) { retried.add(cur.key); queue.push({ ex, key: cur.key, retry: true }); }
    }
  }
  function nextEx() {
    result = null;
    emotion = 'neutral';
    if (pos + 1 < queue.length) pos++;
    else { step = 'dialog'; quip = line(profile.mascot, 'speak'); }
  }
  async function dialogDone(r) {
    beep(r.ok);
    stats.total++; if (r.ok) stats.correct++;
    await finish();
  }
  async function finish() {
    step = 'summary';
    emotion = 'cheer';
    quip = line(profile.mascot, 'done');
    const minutes = Math.max(1, Math.round((Date.now() - started) / 60000));
    await put('progress', { done: true, correct: stats.correct, total: stats.total, date: new Date().toISOString() }, lesson.id);
    await addCards(lesson.words.filter((id) => wordsById.get(id)?.pos !== 'func' || true));
    await markDay(minutes, 1);
  }
  const nextLesson = allLessons[allLessons.findIndex((l) => l.id === lesson.id) + 1];
  const sound = sounds.find((s) => s.id === lesson.sound);
</script>

<div class="page">
  <div class="head">
    <button class="back" onclick={() => go('course')} aria-label="Закрыть">✕</button>
    <div class="bar" style="flex:1"><i style="width:{(progress / (totalSteps + 1)) * 100}%"></i></div>
    {#if rules.length}<button class="back" onclick={() => (openRule = rules[0])} title="Правило">📘</button>{/if}
  </div>

  {#if step === 'rules'}
    <p class="soft small">Урок {lesson.chapter.number}.{lesson.index + 1} · учебник: глава {lesson.chapter.number}, часть {lesson.textbook.part}, стр. {lesson.textbook.pages} · треки {lesson.textbook.tracks.join(', ')}</p>
    <h1>{lesson.title}</h1>
    <p><b>Цель:</b> {lesson.goal}</p>
    <RuleCard rule={rules[ruleIdx]} />
    <p class="soft small center">Правило {ruleIdx + 1} из {rules.length}</p>
    {#if ruleIdx + 1 < rules.length}
      <button class="primary" onclick={() => ruleIdx++}>Следующее правило</button>
    {:else}
      <button class="primary" onclick={() => (step = 'words')}>К словам</button>
    {/if}

  {:else if step === 'words'}
    <h1>Новые слова</h1>
    <p class="soft small">Нажмите 🔊 и повторите вслух. Цвет артикля: <span style="color:var(--der)">der</span>, <span style="color:var(--das)">das</span>, <span style="color:var(--die)">die</span>.</p>
    <div class="card">
      {#each words as w}
        <div class="list-item">
          <Listen text={wordLabel(w)} slow={false} />
          <div style="flex:1">
            <span class="de-word">{#if w.article}<span style="color:var(--{w.article})">{w.article}</span> {/if}{w.de}</span>
            {#if w.plural}<span class="soft small"> · мн. die {w.plural}</span>{/if}
            {#if w.forms}<div class="soft small">{w.forms.join(', ')}</div>{/if}
          </div>
          <span class="soft small" style="text-align:right">{w.ru}</span>
        </div>
      {/each}
    </div>
    <button class="primary" onclick={() => { step = 'ex'; emotion = 'neutral'; }}>К заданиям</button>

  {:else if step === 'ex' && cur}
    <div class="row" style="justify-content:space-between">
      <span class="pill">{TYPE_NAMES[cur.ex.type]}{cur.retry ? ' · повтор' : ''}</span>
      <span class="soft small">{Math.min(pos + 1, queue.length)} / {queue.length}</span>
    </div>
    {#key pos}
      <div class="exercise"><Exercise ex={cur.ex} {done} /></div>
    {/key}
    {#if result}
      <div class="feedback {result.ok ? 'ok' : 'no'}">
        <Mascot id={profile.mascot} {emotion} size={64} />
        <div style="flex:1">
          <b>{result.ok ? (result.skipped ? 'Пропустили' : 'Верно!') : 'Не совсем'}</b>
          <p class="quip">{quip}</p>
          {#if result.note}<p class="small">{result.note}</p>{/if}
          {#if !result.ok && result.expected}<p class="small">Правильно: <b>{result.expected}</b> <Listen text={result.expected} slow={false} /></p>{/if}
          {#if !result.ok && cur.ex.explain}<p class="small">{cur.ex.explain}</p>{/if}
          {#if !result.ok && (cur.ex.rule || lesson.rules[0])}<button class="link small" onclick={() => (openRule = rulesById.get(cur.ex.rule || lesson.rules[0]))}>Открыть правило</button>{/if}
          {#if result.ok && cur.ex.explain && !result.skipped}<p class="small soft">{cur.ex.explain}</p>{/if}
        </div>
      </div>
      <button class="primary" onclick={nextEx}>Дальше</button>
    {/if}

  {:else if step === 'dialog'}
    <h1>Говорим!</h1>
    <Exercise ex={lesson.dialog} done={dialogDone} />
    <button class="link" onclick={finish}>Пропустить диалог</button>

  {:else if step === 'summary'}
    <div class="center"><Mascot id={profile.mascot} emotion="cheer" size={130} /></div>
    <h1 class="center">Урок пройден!</h1>
    <p class="center quip">{quip}</p>
    <div class="card">
      <p>Верно с первого раза: <b>{stats.correct} из {stats.total}</b></p>
      <p>{words.length} слов ушли в повторение.</p>
      {#if stats.wrongTypes.length}<p class="small soft">Ошибки были в заданиях: {[...new Set(stats.wrongTypes)].map((t) => TYPE_NAMES[t]).join(', ')}. Они попадут в разбор у репетитора.</p>{/if}
    </div>
    <div class="card">
      <h3>Закрепить</h3>
      {#each lesson.nicos || [] as n}<p>📺 <a href={n.url} target="_blank" rel="noopener">Nicos Weg: {n.title}</a></p>{/each}
      <p>📗 Учебник: часть {lesson.textbook.part}, стр. {lesson.textbook.pages}, треки {lesson.textbook.tracks.join(', ')}</p>
      {#if sound}<p>🗣 <button class="link" onclick={() => go('course', 'sounds', { id: sound.id })}>Тренажёр: {sound.title}</button></p>{/if}
    </div>
    {#if nextLesson}<button class="primary" onclick={() => go('course', 'lesson', { id: nextLesson.id })}>Следующий урок: {nextLesson.title}</button>{/if}
    <div class="row"><button class="secondary" style="flex:1" onclick={() => go('tutor')}>💬 К репетитору</button><button class="secondary" style="flex:1" onclick={() => go('home')}>🏠 Домой</button></div>
  {/if}
</div>

{#if openRule}
  <div class="modal" role="dialog" onclick={(e) => e.target === e.currentTarget && (openRule = null)} onkeydown={(e) => e.key === 'Escape' && (openRule = null)} tabindex="-1">
    <div class="sheet">
      <RuleCard rule={openRule} />
      <button class="primary" onclick={() => (openRule = null)}>Понятно</button>
    </div>
  </div>
{/if}

<style>
  .head { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; position: sticky; top: 0; background: var(--bg); padding: 6px 0; z-index: 5; }
  .head .back { font-size: 20px; }
  .exercise { min-height: 240px; }
  .feedback { display: flex; gap: 10px; align-items: flex-start; border-radius: 16px; padding: 10px; margin-top: 14px; }
  .feedback.ok { background: var(--good-soft); }
  .feedback.no { background: var(--bad-soft); }
  .feedback p { margin: 2px 0; }
  .quip { font-style: italic; }
  .modal { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: grid; align-items: end; z-index: 20; }
  .sheet { background: var(--bg); border-radius: 22px 22px 0 0; padding: 16px; max-height: 85vh; overflow: auto; max-width: 640px; margin: 0 auto; width: 100%; }
</style>
