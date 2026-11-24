<script>
  import { onMount } from 'svelte';
  import { nav, profile, loadState, go } from './lib/state.svelte.js';
  import Onboarding from './screens/Onboarding.svelte';
  import Home from './screens/Home.svelte';
  import Course from './screens/Course.svelte';
  import Lesson from './screens/Lesson.svelte';
  import Review from './screens/Review.svelte';
  import Tutor from './screens/Tutor.svelte';
  import Us from './screens/Us.svelte';
  import Sounds from './screens/Sounds.svelte';
  import Reference from './screens/Reference.svelte';
  import Settings from './screens/Settings.svelte';

  onMount(loadState);
  const tabs = [
    { id: 'home', icon: '🏠', label: 'Главная' },
    { id: 'course', icon: '🗺️', label: 'Курс' },
    { id: 'review', icon: '🔁', label: 'Повторение' },
    { id: 'tutor', icon: '💬', label: 'Репетитор' },
    { id: 'us', icon: '💞', label: 'Мы' }
  ];
  const screens = { lesson: Lesson, sounds: Sounds, reference: Reference, settings: Settings };
  const main = { home: Home, course: Course, review: Review, tutor: Tutor, us: Us };
  const Screen = $derived(nav.screen ? screens[nav.screen] : main[nav.tab]);
</script>

{#if !profile.loaded}
  <div class="page center soft">…</div>
{:else if !profile.ready}
  <Onboarding />
{:else}
  {#key nav.screen + nav.tab + JSON.stringify(nav.params)}
    <Screen params={nav.params} />
  {/key}
  {#if nav.screen !== 'lesson'}
    <nav class="tabs">
      {#each tabs as t}
        <button class:on={nav.tab === t.id && !nav.screen} onclick={() => go(t.id)}><b>{t.icon}</b>{t.label}</button>
      {/each}
    </nav>
  {/if}
{/if}
