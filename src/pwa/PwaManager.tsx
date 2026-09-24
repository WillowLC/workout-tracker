// Registers the service worker (registerType: 'prompt') and checks for updates
// at start-up, when the app returns to the foreground, and every 60 minutes.
import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { usePwaStore } from '../store/pwaStore';

const HOUR = 60 * 60 * 1000;

export function PwaManager() {
  const set = usePwaStore((s) => s.set);
  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady],
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW(_url, r) {
      if (!r) return;
      set({ registration: r });
      const check = () => {
        if (navigator.onLine) r.update().catch(() => {});
      };
      check();
      setInterval(check, HOUR);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check();
      });
    },
  });

  useEffect(() => {
    set({ needRefresh, offlineReady, applyUpdate: () => void applyUpdate() });
  }, [needRefresh, offlineReady, set]);

  return null;
}

/** Activates the waiting service worker and reloads onto the new version.
 *  The plugin's updateServiceWorker() only reloads when workbox reports the
 *  controller change as an "update", which it doesn't when the page was first
 *  loaded without a controller (fresh install) or when iOS standalone never
 *  fires controllerchange — so the Reload button looked dead. Here we reload
 *  on whichever comes first: controllerchange, the new worker activating, or
 *  a short timeout. */
let reloading = false;
async function applyUpdate() {
  const reload = () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  };
  const r = usePwaStore.getState().registration ?? (await navigator.serviceWorker?.getRegistration());
  const waiting = r?.waiting;
  if (!waiting) return reload();
  navigator.serviceWorker.addEventListener('controllerchange', reload);
  waiting.addEventListener('statechange', () => {
    if (waiting.state === 'activated') reload();
  });
  waiting.postMessage({ type: 'SKIP_WAITING' });
  setTimeout(reload, 3000);
}

/** Manual "Check for updates". Resolves to a user-facing status message. */
export async function checkForUpdates(): Promise<string> {
  const r = usePwaStore.getState().registration;
  if (!r) return 'Updates are only available in the installed/production app.';
  if (!navigator.onLine) return "You're offline — try again when connected.";
  try {
    await r.update();
  } catch {
    return 'Could not reach the server.';
  }
  if (r.installing || r.waiting || usePwaStore.getState().needRefresh) return 'Update found — it will be ready in a moment.';
  return "You're on the latest version.";
}
