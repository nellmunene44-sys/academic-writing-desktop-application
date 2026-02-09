import React from "react";

export default function Milestones({ milestones, totalIncome }) {
  return (
    <div className="bg-slate-900/60 rounded-2xl p-4">
      <h4 className="text-sm uppercase tracking-wide text-slate-400 mb-4">Milestones</h4>
      <div className="space-y-3">
        {milestones.map((milestone) => {
          const achieved = milestone.achieved_date || totalIncome >= milestone.amount;
          return (
            <div
              key={milestone.id}
              className={`flex items-center justify-between px-3 py-2 rounded-xl ${
                achieved ? "bg-emerald-500/20 text-emerald-100" : "bg-slate-800/50 text-slate-300"
              }`}
            >
              <span>{milestone.title}</span>
              <span>${milestone.amount}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
