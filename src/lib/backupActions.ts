import { useAppStore } from '../store/appStore';
import { makeBackup } from '../domain/backup';
import { workoutsToCsv } from '../domain/csv';
import { downloadFile, dateStamp } from './files';

export async function exportJsonBackup() {
  const s = useAppStore.getState();
  const workouts = s.active ? [...s.workouts, s.active] : s.workouts;
  const backup = makeBackup({ appVersion: __APP_VERSION__, exercises: s.exercises, workouts, templates: s.templates, settings: s.settings, folders: s.folders }, Date.now());
  downloadFile(`jim-backup-${dateStamp()}.json`, JSON.stringify(backup, null, 1), 'application/json');
  await s.setMeta({ lastBackupAt: Date.now(), backupSnoozedUntil: undefined });
}

export function exportCsv() {
  const s = useAppStore.getState();
  const csv = workoutsToCsv(s.workouts, new Map(s.exercises.map((e) => [e.id, e])), s.settings.unit);
  downloadFile(`jim-workouts-${dateStamp()}.csv`, csv, 'text/csv');
}
