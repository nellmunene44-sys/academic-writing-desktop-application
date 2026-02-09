import React from "react";

const platforms = ["Facebook", "Telegram", "Reddit", "LinkedIn", "Website", "Outreach"];

export default function PlatformEffectiveness({ totals }) {
  const values = platforms.map((platform) => ({
    platform,
    total: totals[platform] || 0
  }));
  const max = Math.max(1, ...values.map((item) => item.total));

  return (
    <div className="bg-slate-900/60 rounded-2xl p-4">
      <h4 className="text-sm uppercase tracking-wide text-slate-400 mb-4">Platform effectiveness</h4>
      <div className="space-y-3">
        {values.map((item) => (
          <div key={item.platform} className="space-y-1">
            <div className="flex items-center justify-between text-sm text-slate-200">
              <span>{item.platform}</span>
              <span>${item.total.toFixed(2)}</span>
            </div>
            <div className="w-full bg-slate-800/70 rounded-full h-2">
              <div
                className="bg-amber-400 h-2 rounded-full"
                style={{ width: `${Math.round((item.total / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
