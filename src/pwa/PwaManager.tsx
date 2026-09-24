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
    updateServiceWorker,
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
    set({ needRefresh, offlineReady, applyUpdate: () => void updateServiceWorker(true) });
  }, [needRefresh, offlineReady, updateServiceWorker, set]);

  return null;
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
