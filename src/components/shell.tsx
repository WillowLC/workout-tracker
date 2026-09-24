// App-shell visual pieces: tab bar, resume bar, toast, banners.
import { NavLink } from 'react-router-dom';
import { Banner, Button } from './ui';
import { IconExercises, IconHistory, IconSettings, IconWorkout } from './icons';

const TABS = [
  { to: '/', label: 'Workout', icon: <IconWorkout /> },
  { to: '/history', label: 'History', icon: <IconHistory /> },
  { to: '/exercises', label: 'Exercises', icon: <IconExercises /> },
  { to: '/settings', label: 'Settings', icon: <IconSettings /> },
];

export function TabBar() {
  return (
    <nav aria-label="Main" className="fixed bottom-0 inset-x-0 z-30 bg-surface border-t border-border pb-safe">
      <ul className="flex max-w-2xl mx-auto">
        {TABS.map((t) => (
          <li key={t.to} className="flex-1">
            <NavLink
              to={t.to}
              end={t.to === '/'}
              className={({ isActive }) => `flex flex-col items-center justify-center gap-0.5 min-h-[56px] text-xs ${isActive ? 'text-accent font-semibold' : 'text-muted'}`}
            >
              {t.icon}
              {t.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Collapsed mini-bar for an in-progress workout, shown on every tab. */
export function ResumeBar({ name, elapsed, onClick }: { name: string; elapsed: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="w-full bg-accent text-accent-contrast rounded-lg px-4 py-2 flex items-center gap-3 shadow-lg text-left">
      <span className="flex-1 min-w-0">
        <span className="block text-xs opacity-70">Workout in progress</span>
        <span className="block font-semibold truncate">{name}</span>
      </span>
      <span className="tabular font-semibold">{elapsed}</span>
      <span aria-hidden>▲</span>
    </button>
  );
}

export function ToastView({ message, onUndo, onDismiss }: { message: string; onUndo?: () => void; onDismiss: () => void }) {
  return (
    <div role="status" className="bg-accent text-accent-contrast rounded-lg px-4 py-2 flex items-center gap-3 shadow-lg">
      <span className="flex-1 text-sm">{message}</span>
      {onUndo && (
        <button type="button" className="font-semibold min-h-[40px] px-2 underline" onClick={onUndo}>
          Undo
        </button>
      )}
      <button type="button" aria-label="Dismiss" className="min-h-[40px] px-2" onClick={onDismiss}>✕</button>
    </div>
  );
}

export function UpdateBanner({ duringWorkout, onReload }: { duringWorkout: boolean; onReload: () => void }) {
  return (
    <Banner action={duringWorkout ? undefined : <Button size="sm" variant="primary" onClick={onReload}>Reload</Button>}>
      {duringWorkout ? 'Update available — it will be applied when you finish or cancel this workout.' : 'Update available'}
    </Banner>
  );
}

export function InstallHint({ ios, onDismiss }: { ios: boolean; onDismiss: () => void }) {
  return (
    <Banner onDismiss={onDismiss}>
      <p className="font-semibold">Install Jim on your home screen</p>
      <p className="text-muted">
        {ios ? 'In Safari tap Share → Add to Home Screen.' : 'Open the browser menu and tap “Install app”.'} It then works offline like a normal app
        {ios ? ', and on iPhone installed apps keep their data more reliably than browser tabs.' : '.'}
      </p>
    </Banner>
  );
}

export function BackupBanner({ onBackup, onDismiss }: { onBackup: () => void; onDismiss: () => void }) {
  return (
    <Banner tone="warning" onDismiss={onDismiss} action={<Button size="sm" variant="primary" onClick={onBackup}>Export</Button>}>
      <p className="font-semibold">Back up your data</p>
      <p className="text-muted">Your workouts are stored only on this device.</p>
    </Banner>
  );
}
