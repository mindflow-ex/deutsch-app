// Общее состояние приложения (Svelte 5 runes) с сохранением в IndexedDB.
import { getKV, setKV } from './db.js';

export const settings = $state({
  rate: 1,
  sfx: true,
  asr: 'vosk', // 'vosk' | 'browser'
  remindTime: '19:30'
});
export const profile = $state({ name: '', mascot: '', partner: '', ready: false, loaded: false });
export const nav = $state({ tab: 'home', screen: null, params: {} });

export async function loadState() {
  Object.assign(settings, await getKV('settings', {}));
  const p = await getKV('profile', null);
  if (p) Object.assign(profile, p, { ready: !!p.mascot });
  profile.loaded = true;
}
export const saveSettings = () => setKV('settings', $state.snapshot(settings));
export const saveProfile = () => {
  const { loaded, ...p } = $state.snapshot(profile);
  return setKV('profile', p);
};

export function go(tab, screen = null, params = {}) {
  nav.tab = tab;
  nav.screen = screen;
  nav.params = params;
  window.scrollTo(0, 0);
}
