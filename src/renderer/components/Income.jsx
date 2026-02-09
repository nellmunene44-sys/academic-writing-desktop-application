import React, { useMemo, useState } from "react";
import { formatDate } from "../utils/date";

export default function Income({ income, onAdd }) {
  const [form, setForm] = useState({
    clientName: "",
    platform: "",
    workType: "",
    amount: 0,
    date: formatDate(new Date()),
    status: "paid"
  });
  const [view, setView] = useState("daily");

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const paidIncome = income.filter((entry) => (entry.status || "paid") === "paid");
  const pendingIncome = income.filter((entry) => (entry.status || "paid") === "pending");
  const incomeTotal = paidIncome.reduce((sum, entry) => sum + entry.amount, 0);
  const pendingTotal = pendingIncome.reduce((sum, entry) => sum + entry.amount, 0);

  const clientProfiles = useMemo(() => {
    const map = {};
    income.forEach((entry) => {
      if (!entry.client_name) return;
      map[entry.client_name] = {
        platform: entry.platform,
        workType: entry.work_type
      };
    });
    return map;
  }, [income]);

  const grouped = useMemo(() => {
    const byKey = {};
    paidIncome.forEach((entry) => {
      const key = view === "daily"
        ? entry.date
        : view === "weekly"
          ? getWeekKey(entry.date)
          : getMonthKey(entry.date);
      byKey[key] = (byKey[key] || 0) + entry.amount;
    });
    return Object.keys(byKey)
      .sort()
      .map((key) => ({ key, total: byKey[key] }));
  }, [paidIncome, view]);

  const avgOrderValue = useMemo(() => {
    if (paidIncome.length === 0) return 0;
    return incomeTotal / paidIncome.length;
  }, [incomeTotal, paidIncome.length]);

  const repeatClientRate = useMemo(() => {
    const counts = {};
    paidIncome.forEach((entry) => {
      counts[entry.client_name] = (counts[entry.client_name] || 0) + 1;
    });
    const clients = Object.keys(counts).filter(Boolean);
    if (clients.length === 0) return 0;
    const repeaters = clients.filter((client) => counts[client] >= 2).length;
    return Math.round((repeaters / clients.length) * 100);
  }, [paidIncome]);

  const handleClientBlur = (value) => {
    const profile = clientProfiles[value];
    if (!profile) return;
    setForm((prev) => ({
      ...prev,
      platform: profile.platform || prev.platform,
      workType: profile.workType || prev.workType
    }));
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-slate-900/70 rounded-2xl p-6 space-y-3">
        <h2 className="text-xl text-amber-200">Log income</h2>
        <div className="bg-slate-900/60 rounded-xl p-3 text-sm text-slate-200">
          <div className="text-xs text-slate-400">Progress to $1,000 (paid)</div>
          <div className="mt-2 w-full bg-slate-800/70 rounded-full h-2">
            <div
              className="bg-emerald-400 h-2 rounded-full"
              style={{ width: `${Math.min(100, (incomeTotal / 1000) * 100)}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-slate-300">${incomeTotal.toFixed(2)} paid · ${pendingTotal.toFixed(2)} pending</div>
          <div className="mt-2 text-xs text-slate-400">Avg order: ${avgOrderValue.toFixed(2)} · Repeat client rate: {repeatClientRate}%</div>
        </div>
        <input
          value={form.clientName}
          onChange={(event) => update("clientName", event.target.value)}
          onBlur={(event) => handleClientBlur(event.target.value)}
          placeholder="Client name"
          list="client-names"
          className="bg-slate-800/70 rounded-lg px-3 py-2"
        />
        <datalist id="client-names">
          {Object.keys(clientProfiles).map((client) => (
            <option key={client} value={client} />
          ))}
        </datalist>
        <input
          value={form.platform}
          onChange={(event) => update("platform", event.target.value)}
          placeholder="Platform source"
          className="bg-slate-800/70 rounded-lg px-3 py-2"
        />
        <input
          value={form.workType}
          onChange={(event) => update("workType", event.target.value)}
          placeholder="Work type"
          className="bg-slate-800/70 rounded-lg px-3 py-2"
        />
        <input
          type="number"
          value={form.amount}
          onChange={(event) => update("amount", Number(event.target.value))}
          placeholder="Amount"
          className="bg-slate-800/70 rounded-lg px-3 py-2"
        />
        <input
          type="date"
          value={form.date}
          onChange={(event) => update("date", event.target.value)}
          className="bg-slate-800/70 rounded-lg px-3 py-2"
        />
        <select
          value={form.status}
          onChange={(event) => update("status", event.target.value)}
          className="bg-slate-800/70 rounded-lg px-3 py-2"
        >
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
        </select>
        <button
          type="button"
          onClick={() => {
            onAdd(form);
            setForm({ ...form, clientName: "", platform: "", workType: "", amount: 0, status: "paid" });
          }}
          className="px-3 py-2 rounded-xl bg-amber-500/30 text-amber-100"
        >
          Add entry
        </button>
      </div>
      <div className="bg-slate-900/60 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl text-amber-200">Income log (paid)</h2>
          <div className="flex gap-2 text-xs">
            {["daily", "weekly", "monthly"].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                className={`px-3 py-1 rounded-full ${view === key ? "bg-amber-500/30 text-amber-100" : "bg-slate-800/70 text-slate-300"}`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3 max-h-[200px] overflow-y-auto mb-6">
          {grouped.map((entry) => (
            <div key={entry.key} className="bg-slate-800/60 rounded-xl p-3 text-sm flex items-center justify-between">
              <span className="text-slate-300">{entry.key}</span>
              <span className="text-amber-200">${entry.total.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <h3 className="text-sm uppercase tracking-wide text-slate-400 mb-2">All entries</h3>
        <div className="space-y-3 max-h-[220px] overflow-y-auto">
          {income.map((entry) => (
            <div key={entry.id} className="bg-slate-800/60 rounded-xl p-3 text-sm">
              <div className="flex justify-between">
                <span>{entry.client_name}</span>
                <span>${entry.amount}</span>
              </div>
              <div className="text-slate-400">{entry.platform} · {entry.work_type}</div>
              <div className="text-slate-500">{entry.date} · {entry.status || "paid"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getWeekKey(dateString) {
  const date = new Date(dateString);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${weekNo.toString().padStart(2, "0")}`;
}

function getMonthKey(dateString) {
  const date = new Date(dateString);
  return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, "0")}`;
}
