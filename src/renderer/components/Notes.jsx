import React, { useMemo, useState } from "react";
import { formatDate } from "../utils/date";

export default function Notes({ notes, onAdd }) {
  const [form, setForm] = useState({
    date: formatDate(new Date()),
    worked: "",
    didnt: "",
    next: "",
    tags: "",
    dayIndex: ""
  });
  const [search, setSearch] = useState("");

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const filteredNotes = useMemo(() => {
    if (!search) return notes;
    const q = search.toLowerCase();
    return notes.filter((note) =>
      [note.worked, note.didnt, note.next, note.tags]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(q))
    );
  }, [notes, search]);

  const weeklySummary = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 6);
    const recent = notes.filter((note) => new Date(note.date) >= cutoff);
    const tags = {};
    recent.forEach((note) => {
      const matches = (note.tags || "").match(/#\w+/g) || [];
      matches.forEach((tag) => {
        tags[tag] = (tags[tag] || 0) + 1;
      });
    });
    const topTags = Object.entries(tags)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => `${tag} (${count})`);
    return {
      count: recent.length,
      topTags
    };
  }, [notes]);

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-slate-900/70 rounded-2xl p-6 space-y-3">
        <h2 className="text-xl text-amber-200">Daily reflection</h2>
        <input
          type="date"
          value={form.date}
          onChange={(event) => update("date", event.target.value)}
          className="bg-slate-800/70 rounded-lg px-3 py-2"
        />
        <input
          value={form.tags}
          onChange={(event) => update("tags", event.target.value)}
          placeholder="Tags (e.g., #facebook #pricing)"
          className="bg-slate-800/70 rounded-lg px-3 py-2"
        />
        <select
          value={form.dayIndex}
          onChange={(event) => update("dayIndex", event.target.value)}
          className="bg-slate-800/70 rounded-lg px-3 py-2"
        >
          <option value="">Link to roadmap day (optional)</option>
          {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
            <option key={day} value={day}>Day {day}</option>
          ))}
        </select>
        <textarea
          value={form.worked}
          onChange={(event) => update("worked", event.target.value)}
          placeholder="What worked"
          className="bg-slate-800/70 rounded-lg px-3 py-2 h-24"
        />
        <textarea
          value={form.didnt}
          onChange={(event) => update("didnt", event.target.value)}
          placeholder="What didn't"
          className="bg-slate-800/70 rounded-lg px-3 py-2 h-24"
        />
        <textarea
          value={form.next}
          onChange={(event) => update("next", event.target.value)}
          placeholder="What to try next"
          className="bg-slate-800/70 rounded-lg px-3 py-2 h-24"
        />
        <button
          type="button"
          onClick={() => {
            onAdd({
              date: form.date,
              worked: form.worked,
              didnt: form.didnt,
              next: form.next,
              tags: form.tags,
              dayIndex: form.dayIndex ? Number(form.dayIndex) : null
            });
            setForm({ ...form, worked: "", didnt: "", next: "", tags: "", dayIndex: "" });
          }}
          className="px-3 py-2 rounded-xl bg-amber-500/30 text-amber-100"
        >
          Save reflection
        </button>
      </div>
      <div className="bg-slate-900/60 rounded-2xl p-6 space-y-4">
        <div className="bg-slate-900/70 rounded-xl p-4 text-sm text-slate-200">
          <div className="text-xs text-slate-400 mb-2">This week’s lessons</div>
          <div className="text-sm text-slate-300">Entries: {weeklySummary.count}</div>
          <div className="text-xs text-slate-400 mt-2">Top tags</div>
          <div className="text-sm text-slate-200">
            {weeklySummary.topTags.length ? weeklySummary.topTags.join(" · ") : "No tags yet"}
          </div>
        </div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search notes or #tags"
          className="bg-slate-800/70 rounded-lg px-3 py-2 text-sm"
        />
        <div>
          <h2 className="text-xl text-amber-200 mb-4">Reflection log</h2>
          <div className="space-y-3 max-h-[420px] overflow-y-auto">
            {filteredNotes.map((entry) => (
              <div key={entry.id} className="bg-slate-800/60 rounded-xl p-3 text-sm">
                <div className="text-slate-400 mb-2">{entry.date}</div>
                {entry.day_index && (
                  <div className="text-xs text-amber-200 mb-2">Linked to Day {entry.day_index}</div>
                )}
                {entry.tags && (
                  <div className="text-xs text-slate-400 mb-2">{entry.tags}</div>
                )}
                <p><span className="text-slate-500">Worked:</span> {entry.worked}</p>
                <p><span className="text-slate-500">Didn't:</span> {entry.didnt}</p>
                <p><span className="text-slate-500">Next:</span> {entry.next}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
