import React, { useEffect, useMemo, useState } from "react";
import recommendations from "../data/recommendations";
import { generateTimeBlocks } from "../utils/timeblock";

export default function Today({ today, profile, notificationsEnabled, onNotify, onUpdateDay, workdayStart }) {
  if (!today) {
    return <div className="text-slate-300">No roadmap day selected.</div>;
  }

  const importantTask = today.tasks.find((task) => task.important) || today.tasks[0];
  const timeBlocks = useMemo(
    () => generateTimeBlocks(today.tasks, workdayStart ?? 9, profile?.dailyHours || 6),
    [today.tasks, profile?.dailyHours, workdayStart]
  );

  const recs = recommendations[importantTask?.category] || recommendations.Outreach;
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000 * 30);
    return () => clearInterval(id);
  }, []);

  const updateTask = (index, patch) => {
    const tasks = [...today.tasks];
    tasks[index] = { ...tasks[index], ...patch };
    onUpdateDay({ ...today, tasks });
  };

  const startTimer = (index) => {
    updateTask(index, { timerRunning: true, lastStart: Date.now() });
  };

  const stopTimer = (index) => {
    const task = today.tasks[index];
    const lastStart = task.lastStart || Date.now();
    const minutes = Math.max(1, Math.round((Date.now() - lastStart) / 60000));
    updateTask(index, {
      timerRunning: false,
      lastStart: null,
      timeSpentMinutes: (task.timeSpentMinutes || 0) + minutes
    });
  };

  const completeWithOutcome = (index) => {
    const task = today.tasks[index];
    const note = task.note || "";
    const outcomeLine = task.outcome ? `Outcome: ${task.outcome}` : "";
    const nextNote = note || outcomeLine ? [note, outcomeLine].filter(Boolean).join("\n") : note;
    updateTask(index, { completed: true, note: nextNote });
  };

  const getNextBlock = () => {
    const current = new Date(now);
    for (const block of timeBlocks) {
      const [sh, sm] = block.start.split(":").map(Number);
      const [eh, em] = block.end.split(":").map(Number);
      const start = new Date(current.getFullYear(), current.getMonth(), current.getDate(), sh, sm).getTime();
      const end = new Date(current.getFullYear(), current.getMonth(), current.getDate(), eh, em).getTime();
      if (now < start) return { type: "next", block, ms: start - now };
      if (now >= start && now <= end) return { type: "current", block, ms: end - now };
    }
    return null;
  };

  const nextBlock = getNextBlock();

  const startDay = () => {
    if (!notificationsEnabled) return;
    onNotify({ title: "Today’s priority task", body: importantTask?.title || "Start your day" });
    const nowDate = new Date();
    timeBlocks.forEach((block) => {
      const [hour, minute] = block.start.split(":").map(Number);
      const startTime = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), hour, minute);
      const delay = startTime.getTime() - nowDate.getTime();
      if (delay > 0) {
        setTimeout(() => onNotify({ title: `Start: ${block.title}`, body: `${block.start} - ${block.end}` }), delay);
        setTimeout(() => onNotify({ title: `Mid-task: ${block.title}`, body: "Keep the momentum." }), delay + (block.duration * 60000) / 2);
        setTimeout(() => onNotify({ title: `End: ${block.title}`, body: "Log your result." }), delay + block.duration * 60000);
      }
    });
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-slate-900/70 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl text-amber-200">Today’s tasks</h2>
        {nextBlock && (
          <div className="text-xs text-slate-300 bg-slate-800/60 rounded-lg px-3 py-2">
            {nextBlock.type === "current" ? (
              <>Current: {nextBlock.block.title} · ends in {Math.ceil(nextBlock.ms / 60000)} min</>
            ) : (
              <>Next: {nextBlock.block.title} · starts in {Math.ceil(nextBlock.ms / 60000)} min</>
            )}
          </div>
        )}
        <div className="space-y-3">
          {today.tasks.map((task, index) => (
            <div key={`${task.title}-${index}`} className="bg-slate-800/70 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-100">{task.title}</p>
                  <p className="text-xs text-slate-400">{task.category} · {task.estimateMinutes} min</p>
                </div>
                {task.important && (
                  <span className="text-xs text-amber-200">MOST IMPORTANT</span>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(task.completed)}
                      onChange={(event) => updateTask(index, { completed: event.target.checked })}
                    />
                    Completed
                  </label>
                  <span className="text-slate-500">Time spent: {task.timeSpentMinutes || 0} min</span>
                </div>
                <div className="flex items-center gap-2">
                  {!task.timerRunning ? (
                    <button
                      type="button"
                      onClick={() => startTimer(index)}
                      className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-200"
                    >
                      Start timer
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => stopTimer(index)}
                      className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-200"
                    >
                      Stop timer
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => completeWithOutcome(index)}
                    className="px-2 py-1 rounded-lg bg-amber-500/30 text-amber-100"
                  >
                    Complete + log outcome
                  </button>
                </div>
              </div>
              <textarea
                value={task.note || ""}
                onChange={(event) => updateTask(index, { note: event.target.value })}
                placeholder="Add task notes..."
                className="mt-2 w-full bg-slate-900/60 rounded-lg px-3 py-2 text-sm"
                rows={2}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={startDay}
          className="px-4 py-3 rounded-xl bg-amber-500/30 text-amber-100 hover:bg-amber-500/50"
        >
          Start day + schedule notifications
        </button>
      </div>
      <div className="space-y-6">
        <div className="bg-slate-900/60 rounded-2xl p-4">
          <h3 className="text-sm uppercase tracking-wide text-slate-400">Time blocking</h3>
          <div className="mt-3 space-y-2">
            {timeBlocks.map((block, index) => (
              <div key={`${block.title}-${index}`} className="flex justify-between text-sm text-slate-200">
                <span>{block.title}</span>
                <span>{block.start} - {block.end}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-900/60 rounded-2xl p-4">
          <h3 className="text-sm uppercase tracking-wide text-slate-400">Contextual recommendations</h3>
          <div className="mt-3 text-sm text-slate-200 space-y-2">
            {recs.groups && <p>Groups: {recs.groups.join(", ")}</p>}
            {recs.keywords && <p>Keywords: {recs.keywords.join(", ")}</p>}
            {recs.channels && <p>Channels: {recs.channels.join(", ")}</p>}
            {recs.templates && <p>Templates: {recs.templates.join(" · ")}</p>}
            {recs.subreddits && <p>Subreddits: {recs.subreddits.join(", ")}</p>}
            {recs.rules && <p>Rules: {recs.rules}</p>}
            {recs.ideas && <p>Ideas: {recs.ideas.join(" · ")}</p>}
            {recs.strategy && <p>Strategy: {recs.strategy}</p>}
            {recs.dm && <p>DM: {recs.dm}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
