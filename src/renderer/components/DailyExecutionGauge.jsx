import React from "react";

export default function DailyExecutionGauge({ completed, planned, importantTask }) {
  const total = planned || 0;
  const done = completed || 0;
  const percent = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="bg-slate-900/70 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl text-amber-200">Today’s execution</h2>
        <span className="text-sm text-slate-300">{done}/{total} tasks</span>
      </div>
      <div className="w-full bg-slate-800/70 rounded-full h-3">
        <div
          className="bg-emerald-400 h-3 rounded-full"
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-sm text-slate-300">
        <span>{percent}% complete</span>
        <span className="text-amber-200">MOST IMPORTANT</span>
      </div>
      <div className="bg-slate-800/60 rounded-xl p-3 text-sm text-slate-200">
        {importantTask?.title || "No task scheduled yet"}
      </div>
    </div>
  );
}
