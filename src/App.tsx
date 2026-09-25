import { useEffect } from 'react';
import { createBrowserRouter, Outlet, RouterProvider, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from './store/appStore';
import { useUiStore } from './store/uiStore';
import { usePwaStore } from './store/pwaStore';
import { formatClock } from './domain/units';
import { useNow } from './lib/useNow';
import { PwaManager } from './pwa/PwaManager';
import { requestPersistentStorage } from './pwa/storage';
import { TabBar, ResumeBar, ToastView, UpdateBanner } from './components/shell';
import { WorkoutHome } from './screens/WorkoutHome';
import { ActiveWorkoutScreen } from './screens/workout/ActiveWorkoutScreen';
import { SummaryScreen } from './screens/workout/SummaryScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { EditWorkoutScreen, WorkoutDetailScreen } from './screens/WorkoutDetailScreen';
import { ExercisesScreen } from './screens/ExercisesScreen';
import { TemplateEditorScreen } from './screens/TemplateEditorScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { FolderPlanScreen } from './screens/FolderPlanScreen';
import { EmptyState, Button } from './components/ui';

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const active = useAppStore((s) => s.active);
  const { toast, dismissToast } = useUiStore();
  const { needRefresh, applyUpdate } = usePwaStore();
  const now = useNow(1000, !!active);

  const path = location.pathname;
  const fullScreen = path.startsWith('/workout') || path.startsWith('/dev') || path.startsWith('/templates/') || path.endsWith('/edit');
  const onWorkoutTab = path === '/';
  // Never interrupt an active workout: during one, the banner shows only on the Workout tab
  // and the update is applied after finish/cancel.
  const showUpdate = needRefresh && (!active || onWorkoutTab) && path !== '/workout';

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(dismissToast, 5000);
    return () => clearTimeout(id);
  }, [toast, dismissToast]);

  return (
    <div className={`min-h-full ${fullScreen ? '' : 'pb-[calc(var(--tabbar-height)+env(safe-area-inset-bottom)+72px)]'}`}>
      {showUpdate && <div className="pt-safe"><UpdateBanner duringWorkout={!!active} onReload={applyUpdate} /></div>}
      <div className="max-w-2xl mx-auto">
        <Outlet />
      </div>
      <div className={`fixed inset-x-0 z-40 px-3 flex flex-col gap-2 max-w-2xl mx-auto ${fullScreen ? 'bottom-3 pb-safe' : 'bottom-[calc(var(--tabbar-height)+env(safe-area-inset-bottom)+8px)]'}`}>
        {toast && <ToastView key={toast.id} message={toast.message} onUndo={toast.undo && (() => { toast.undo!(); dismissToast(); })} onDismiss={dismissToast} />}
        {active && !fullScreen && (
          <ResumeBar name={active.name} elapsed={formatClock((now - active.startedAt) / 1000)} onClick={() => navigate('/workout')} />
        )}
      </div>
      {!fullScreen && <TabBar />}
    </div>
  );
}

function NotFound() {
  const navigate = useNavigate();
  return <EmptyState title="Page not found" action={<Button onClick={() => navigate('/')}>Go home</Button>} />;
}

const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { path: '/', element: <WorkoutHome /> },
        { path: '/workout', element: <ActiveWorkoutScreen /> },
        { path: '/workout/summary', element: <SummaryScreen /> },
        { path: '/history', element: <HistoryScreen /> },
        { path: '/history/:id', element: <WorkoutDetailScreen /> },
        { path: '/history/:id/edit', element: <EditWorkoutScreen /> },
        { path: '/exercises', element: <ExercisesScreen /> },
        { path: '/exercises/:id', lazy: () => import('./screens/ExerciseDetailScreen').then((m) => ({ Component: m.ExerciseDetailScreen })) },
        { path: '/templates/new', element: <TemplateEditorScreen /> },
        { path: '/templates/:id', element: <TemplateEditorScreen /> },
        { path: '/folders/:name', element: <FolderPlanScreen /> },
        { path: '/settings', element: <SettingsScreen /> },
        { path: '/dev/components', lazy: () => import('./screens/DevComponentsScreen').then((m) => ({ Component: m.DevComponentsScreen })) },
        { path: '*', element: <NotFound /> },
      ],
    },
  ],
  // Must match Vite's `base` so deep links work under a sub-path (GitHub Pages).
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
);

export function App() {
  const ready = useAppStore((s) => s.ready);
  const init = useAppStore((s) => s.init);
  const setMeta = useAppStore((s) => s.setMeta);

  useEffect(() => {
    void init().then(async () => {
      const granted = await requestPersistentStorage();
      await setMeta({ persistGranted: granted });
    });
  }, [init, setMeta]);

  return (
    <>
      <PwaManager />
      {ready ? <RouterProvider router={router} /> : <p className="p-8 text-center text-muted">Loading…</p>}
    </>
  );
}
