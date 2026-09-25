import { useRef, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { useUiStore } from '../store/uiStore';
import { usePwaStore } from '../store/pwaStore';
import { backupSummary, validateBackup, type Backup } from '../domain/backup';
import { fromDisplayWeight, toDisplayWeight } from '../domain/units';
import { formatDateTime, relativeDays } from '../lib/format';
import { exportCsv, exportJsonBackup } from '../lib/backupActions';
import { checkForUpdates } from '../pwa/PwaManager';
import { Button, Card, ConfirmDialog, PageHeader } from '../components/ui';
import { NumberInput } from '../components/inputs';
import { IconAlert, IconCheckCircle } from '../components/icons';

function Row({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-center gap-3 px-3 min-h-[52px] py-2 border-b border-border last:border-0">
      <div className="flex-1">
        <p className="text-sm">{label}</p>
        {hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={`w-12 h-7 rounded-full relative ${checked ? 'bg-accent' : 'bg-border-strong'}`}>
      <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  );
}

export function SettingsScreen() {
  const { settings, updateSettings, meta, workouts, importBackup, resetAll } = useAppStore();
  const showToast = useUiStore((s) => s.showToast);
  const { needRefresh, applyUpdate } = usePwaStore();
  const active = useAppStore((s) => s.active);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<Backup | null>(null);
  const [resetStep, setResetStep] = useState<0 | 1 | 2>(0);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);
  const unit = settings.unit;

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    try {
      const res = validateBackup(JSON.parse(await f.text()));
      if (!res.ok) showToast(`Import failed: ${res.error}`);
      else setPendingImport(res.backup);
    } catch {
      showToast('Import failed: the file is not valid JSON.');
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  const summary = pendingImport ? backupSummary(pendingImport) : null;

  return (
    <div className="pb-8">
      <PageHeader title="Settings" />
      <main className="px-4 flex flex-col gap-4 max-w-2xl mx-auto">
        <section>
          <h2 className="text-sm font-semibold text-muted uppercase mb-2">Workout</h2>
          <Card>
            <Row label="Units">
              <div className="flex bg-surface-2 rounded p-1 gap-1" role="radiogroup" aria-label="Units">
                {(['kg', 'lb'] as const).map((u) => (
                  <button key={u} type="button" role="radio" aria-checked={unit === u} onClick={() => void updateSettings({ unit: u })}
                    className={`px-4 min-h-[36px] rounded text-sm ${unit === u ? 'bg-surface font-semibold shadow-sm' : 'text-muted'}`}>{u}</button>
                ))}
              </div>
            </Row>
            <Row label="Weight increment" hint={`± step in ${unit}`}>
              <div className="w-20"><NumberInput aria-label="Weight increment" value={toDisplayWeight(settings.weightIncrementKg, unit)} onChange={(v) => v && void updateSettings({ weightIncrementKg: fromDisplayWeight(v, unit) })} /></div>
            </Row>
            <Row label="Barbell weight" hint={`For the plate calculator (${unit})`}>
              <div className="w-20"><NumberInput aria-label="Barbell weight" value={toDisplayWeight(settings.barWeightKg, unit)} onChange={(v) => v !== undefined && void updateSettings({ barWeightKg: fromDisplayWeight(v, unit) })} /></div>
            </Row>
            <Row label="Count warm-ups in stats" hint="Best sets, PRs and volume">
              <Toggle label="Count warm-ups in stats" checked={settings.countWarmupsInStats} onChange={(v) => void updateSettings({ countWarmupsInStats: v })} />
            </Row>
            <Row label="Show RPE column">
              <Toggle label="Show RPE column" checked={settings.showRpe} onChange={(v) => void updateSettings({ showRpe: v })} />
            </Row>
          </Card>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-muted uppercase mb-2">Data</h2>
          <Card>
            <Row label="Export JSON backup" hint={`Last backup: ${meta.lastBackupAt ? `${formatDateTime(meta.lastBackupAt)} (${relativeDays(meta.lastBackupAt)})` : 'never'}`}>
              <Button size="sm" onClick={() => void exportJsonBackup()}>Export</Button>
            </Row>
            <Row label="Import JSON backup">
              <Button size="sm" onClick={() => fileRef.current?.click()}>Import</Button>
              <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" aria-label="Backup file" onChange={(e) => void onFile(e.target.files?.[0])} />
            </Row>
            <Row label="Export CSV" hint={`${workouts.length} workouts, Strong-style columns`}>
              <Button size="sm" onClick={exportCsv}>Export</Button>
            </Row>
            <Row label="Persistent storage" hint={meta.persistGranted === true ? 'Granted — the browser won’t evict your data.' : meta.persistGranted === false ? 'Not granted — install the app to the home screen and back up regularly.' : 'Not supported by this browser — back up regularly.'}>
              {meta.persistGranted ? <IconCheckCircle className="text-success" /> : <IconAlert className="text-warning" />}
            </Row>
          </Card>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-muted uppercase mb-2">App</h2>
          <Card>
            <Row label={`Version ${__APP_VERSION__}`} hint={`Built ${formatDateTime(Date.parse(__BUILD_DATE__))}`}>
              {needRefresh ? (
                active ? <span className="text-xs text-muted text-right">Update ready after workout</span> : <Button size="sm" variant="primary" onClick={applyUpdate}>Reload</Button>
              ) : (
                <Button size="sm" onClick={async () => setUpdateMsg(await checkForUpdates())}>Check for updates</Button>
              )}
            </Row>
            {updateMsg && <p role="status" className="px-3 py-2 text-xs text-muted">{updateMsg}</p>}
          </Card>
        </section>

        <Button className="!text-danger" onClick={() => setResetStep(1)}>Reset all data</Button>
        <p className="text-xs text-muted text-center">Jim stores everything on this device only. Deleting the home-screen app (iOS) or clearing site data erases it — export a backup first.</p>
      </main>

      <ConfirmDialog
        open={!!pendingImport}
        title="Import backup"
        message={summary && (
          <span>
            This file contains <b>{summary.workouts}</b> workouts, <b>{summary.exercises}</b> exercises ({summary.customExercises} custom) and <b>{summary.templates}</b> templates.
            <br />Replace deletes everything currently in the app. Merge adds only items that aren’t already here.
          </span>
        )}
        onClose={() => setPendingImport(null)}
        actions={[
          { label: 'Merge', variant: 'primary', onClick: async () => { const b = pendingImport!; setPendingImport(null); const r = await importBackup(b, 'merge'); showToast(`Merged: ${r.added} added, ${r.skipped} already present`); } },
          { label: 'Replace all data', variant: 'danger', onClick: async () => { const b = pendingImport!; setPendingImport(null); await importBackup(b, 'replace'); showToast('Backup restored'); } },
        ]}
      />
      <ConfirmDialog open={resetStep === 1} title="Reset all data?" message="This deletes every workout, template and custom exercise on this device." onClose={() => setResetStep(0)}
        actions={[{ label: 'Continue', variant: 'danger', onClick: () => setResetStep(2) }]} />
      <ConfirmDialog open={resetStep === 2} title="Are you absolutely sure?" message="This cannot be undone. Consider exporting a backup first." onClose={() => setResetStep(0)}
        actions={[
          { label: 'Export backup first', onClick: () => void exportJsonBackup() },
          { label: 'Delete everything', variant: 'danger', onClick: async () => { setResetStep(0); await resetAll(); showToast('All data reset'); } },
        ]} />
    </div>
  );
}
