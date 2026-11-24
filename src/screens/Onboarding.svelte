<script>
  import Mascot from '../mascots/Mascot.svelte';
  import { mascots, line } from '../mascots/mascots.js';
  import { profile, saveProfile } from '../lib/state.svelte.js';
  let name = $state(profile.name || '');
  let partner = $state(profile.partner || '');
  let pick = $state(profile.mascot || 'shiba');
  async function start() {
    Object.assign(profile, { name: name.trim(), partner: partner.trim(), mascot: pick, ready: true });
    await saveProfile();
  }
</script>
<div class="page">
  <h1>Willkommen! 👋</h1>
  <p>Это ваш тренажёр немецкого по учебнику Schritte International Neu A1.1. Каждый занимается на своём телефоне, а цели и серия общие.</p>
  <label class="field">Как вас зовут?<input bind:value={name} placeholder="Антон" /></label>
  <label class="field">Как зовут вашего партнёра по учёбе?<input bind:value={partner} placeholder="необязательно" /></label>
  <h2>Выберите маскота</h2>
  <div class="grid">
    {#each Object.entries(mascots) as [id, m]}
      <button class="mcard" class:sel={pick === id} onclick={() => (pick = id)}>
        <Mascot {id} emotion={pick === id ? 'happy' : 'neutral'} size={84} />
        <b>{m.name}</b><small>{m.character}</small>
      </button>
    {/each}
  </div>
  <div class="card"><Mascot id={pick} emotion="cheer" size={70} say={line(pick, 'hello')} /></div>
  <button class="primary" disabled={!name.trim()} onclick={start}>Начать</button>
  <p class="soft small">Маскота можно сменить в настройках. Характер влияет только на реплики, программа у всех одинаковая.</p>
</div>
<style>
  .field { display: grid; gap: 4px; margin: 10px 0; font-weight: 600; }
  .field input { font-weight: 400; border: 2px solid var(--line); border-radius: 12px; padding: 10px; font-size: 18px; background: var(--card); }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px; }
  .mcard { background: var(--card); border: 2px solid var(--line); border-radius: 16px; padding: 8px 4px; display: grid; justify-items: center; gap: 2px; }
  .mcard.sel { border-color: var(--accent); background: var(--accent-soft); }
  .mcard small { font-size: 11px; color: var(--ink-soft); text-align: center; line-height: 1.2; }
</style>
