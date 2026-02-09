import React from "react";

export default function Settings({
  notificationsEnabled,
  onToggleNotifications,
  onResetProfile,
  workdayStart,
  onWorkdayStartChange,
  backupFolder,
  autoBackup,
  onChooseBackupFolder,
  onToggleAutoBackup,
  onExportJson,
  onImportJson,
  onExportIncomeCsv,
  onExportNotesCsv
}) {
  return (
    <div className="bg-slate-900/70 rounded-2xl p-6 space-y-6 max-w-2xl">
      <div className="space-y-3">
        <h2 className="text-xl text-amber-200">Settings</h2>
        <label className="flex items-center gap-3 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(event) => onToggleNotifications(event.target.checked)}
          />
          Enable native notifications
        </label>
        <p className="text-xs text-slate-400">
          Notifications are scheduled when you press “Start day” in Today view.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm uppercase tracking-wide text-slate-400">Workday</h3>
        <label className="flex items-center gap-3 text-sm text-slate-200">
          Start hour (0–23)
          <input
            type="number"
            min="0"
            max="23"
            value={workdayStart}
            onChange={(event) => onWorkdayStartChange(Number(event.target.value))}
            className="bg-slate-800/70 rounded-lg px-3 py-2 w-24"
          />
        </label>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm uppercase tracking-wide text-slate-400">Backup</h3>
        <div className="flex items-center gap-3 text-sm text-slate-200">
          <button
            type="button"
            onClick={onChooseBackupFolder}
            className="px-3 py-2 rounded-xl bg-slate-800/80 text-slate-200"
          >
            Choose backup folder
          </button>
          <span className="text-xs text-slate-400">{backupFolder || "No folder selected"}</span>
        </div>
        <label className="flex items-center gap-3 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={autoBackup}
            onChange={(event) => onToggleAutoBackup(event.target.checked)}
          />
          Enable auto-backup on app start
        </label>
        <div className="flex flex-wrap gap-2 text-sm">
          <button
            type="button"
            onClick={onExportJson}
            className="px-3 py-2 rounded-xl bg-amber-500/30 text-amber-100"
          >
            Export JSON backup
          </button>
          <button
            type="button"
            onClick={onImportJson}
            className="px-3 py-2 rounded-xl bg-slate-800/80 text-slate-200"
          >
            Import JSON backup
          </button>
          <button
            type="button"
            onClick={onExportIncomeCsv}
            className="px-3 py-2 rounded-xl bg-slate-800/80 text-slate-200"
          >
            Export income CSV
          </button>
          <button
            type="button"
            onClick={onExportNotesCsv}
            className="px-3 py-2 rounded-xl bg-slate-800/80 text-slate-200"
          >
            Export notes CSV
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm uppercase tracking-wide text-slate-400">Profile</h3>
        <button
          type="button"
          onClick={onResetProfile}
          className="px-3 py-2 rounded-xl bg-rose-500/20 text-rose-100 text-sm"
        >
          Reset onboarding (edit targets)
        </button>
      </div>
    </div>
  );
}
