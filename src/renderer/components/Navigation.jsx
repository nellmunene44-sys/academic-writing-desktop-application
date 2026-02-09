import React from "react";

const navItems = [
  "Dashboard",
  "Roadmap",
  "Today",
  "Income",
  "Notes",
  "Settings"
];

export default function Navigation({ active, onChange }) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      {navItems.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={`px-4 py-3 text-left rounded-xl transition ${
            active === item
              ? "bg-amber-500/20 text-amber-200"
              : "bg-slate-800/40 text-slate-200 hover:bg-slate-800/70"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
