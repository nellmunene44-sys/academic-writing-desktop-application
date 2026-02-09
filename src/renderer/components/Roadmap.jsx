import React, { useMemo, useState } from "react";

const categories = [
  "All",
  "Facebook",
  "Telegram",
  "Reddit",
  "LinkedIn",
  "Website",
  "Outreach"
];

const templatePacks = {
  "Client Acquisition Day": [
    {
      title: "Primary outreach + lead list",
      estimateMinutes: 120,
      category: "Outreach",
      outcome: "10 new qualified leads",
      important: true,
      completed: false,
      note: ""
    },
    {
      title: "Follow-ups on warm leads",
      estimateMinutes: 60,
      category: "Outreach",
      outcome: "5 follow-ups sent",
      important: false,
      completed: false,
      note: ""
    },
    {
      title: "Update CRM + reply to messages",
      estimateMinutes: 30,
      category: "Outreach",
      outcome: "Pipeline updated",
      important: false,
      completed: false,
      note: ""
    }
  ],
  "Portfolio Day": [
    {
      title: "Refresh writing samples",
      estimateMinutes: 120,
      category: "Website",
      outcome: "1 upgraded sample",
      important: true,
      completed: false,
      note: ""
    },
    {
      title: "Update testimonials + proof",
      estimateMinutes: 60,
      category: "Website",
      outcome: "2 proof points added",
      important: false,
      completed: false,
      note: ""
    }
  ],
  "Follow-up Day": [
    {
      title: "Check-in with recent leads",
      estimateMinutes: 90,
      category: "Outreach",
      outcome: "8 follow-ups sent",
      important: true,
      completed: false,
      note: ""
    },
    {
      title: "Re-engage older prospects",
      estimateMinutes: 60,
      category: "Outreach",
      outcome: "3 callbacks booked",
      important: false,
      completed: false,
      note: ""
    }
  ]
};

export default function Roadmap({ roadmap, onUpdate }) {
  const [expanded, setExpanded] = useState(null);
  const [weekFilter, setWeekFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const weekSummary = useMemo(() => {
    const weeks = [1, 2, 3, 4].map((week) => {
      const days = roadmap.filter((day) => day.week === week);
      const totalTasks = days.reduce((sum, day) => sum + day.tasks.length, 0);
      const completedTasks = days.reduce(
        (sum, day) => sum + day.tasks.filter((task) => task.completed).length,
        0
      );
      const percent = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
      return { week, totalTasks, completedTasks, percent };
    });
    return weeks;
  }, [roadmap]);

  const filteredRoadmap = useMemo(() => {
    return roadmap.filter((day) => {
      const weekMatch = weekFilter === "All" || day.week === Number(weekFilter);
      const categoryMatch =
        categoryFilter === "All" ||
        day.tasks.some((task) => task.category === categoryFilter);
      return weekMatch && categoryMatch;
    });
  }, [roadmap, weekFilter, categoryFilter]);

  const updateTask = (day, index, patch) => {
    const tasks = [...day.tasks];
    tasks[index] = { ...tasks[index], ...patch };
    onUpdate({ ...day, tasks });
  };

  const duplicateTask = (day, index) => {
    const tasks = [...day.tasks];
    tasks.splice(index + 1, 0, { ...tasks[index], completed: false, note: "" });
    onUpdate({ ...day, tasks });
  };

  const applyTemplate = (day, templateKey) => {
    const tasks = [...day.tasks, ...templatePacks[templateKey]];
    onUpdate({ ...day, tasks });
  };

  const handleDrop = (day, fromIndex, toIndex) => {
    const tasks = [...day.tasks];
    const [moved] = tasks.splice(fromIndex, 1);
    tasks.splice(toIndex, 0, moved);
    onUpdate({ ...day, tasks });
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/70 rounded-2xl p-4">
        <h3 className="text-sm uppercase tracking-wide text-slate-400 mb-4">Week progress</h3>
        <div className="grid grid-cols-4 gap-4">
          {weekSummary.map((week) => (
            <div key={week.week} className="bg-slate-800/60 rounded-xl p-3 text-sm">
              <div className="flex items-center justify-between text-slate-300">
                <span>Week {week.week}</span>
                <span>{week.percent}%</span>
              </div>
              <div className="w-full bg-slate-900/60 rounded-full h-2 mt-2">
                <div
                  className="bg-emerald-400 h-2 rounded-full"
                  style={{ width: `${week.percent}%` }}
                />
              </div>
              <div className="text-xs text-slate-500 mt-2">
                {week.completedTasks}/{week.totalTasks} tasks
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm text-slate-300">
        <div className="bg-slate-900/70 rounded-xl px-3 py-2">
          <label className="text-xs text-slate-400">Week</label>
          <select
            value={weekFilter}
            onChange={(event) => setWeekFilter(event.target.value)}
            className="bg-transparent ml-2"
          >
            <option value="All">All</option>
            <option value="1">Week 1</option>
            <option value="2">Week 2</option>
            <option value="3">Week 3</option>
            <option value="4">Week 4</option>
          </select>
        </div>
        <div className="bg-slate-900/70 rounded-xl px-3 py-2">
          <label className="text-xs text-slate-400">Category</label>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="bg-transparent ml-2"
          >
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredRoadmap.map((day) => (
          <div key={day.day} className="bg-slate-900/60 rounded-2xl p-4">
            <button
              type="button"
              onClick={() => setExpanded(expanded === day.day ? null : day.day)}
              className="w-full text-left flex items-center justify-between"
            >
              <div>
                <h3 className="text-lg text-amber-200">Day {day.day}</h3>
                <p className="text-sm text-slate-300">{day.title}</p>
              </div>
              <span className="text-sm text-slate-400">Week {day.week}</span>
            </button>
            {expanded === day.day && (
              <div className="mt-4 space-y-4">
                <label className="text-sm text-slate-300">
                  Day title
                  <input
                    value={day.title}
                    onChange={(event) => onUpdate({ ...day, title: event.target.value })}
                    className="mt-2 w-full bg-slate-800/70 rounded-lg px-3 py-2"
                  />
                </label>
                <div className="space-y-4">
                  {day.tasks.map((task, index) => (
                    <div
                      key={`${day.day}-${index}`}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData("text/plain", `${index}`);
                      }}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        const fromIndex = Number(event.dataTransfer.getData("text/plain"));
                        handleDrop(day, fromIndex, index);
                      }}
                      className="bg-slate-800/50 rounded-xl p-3 space-y-3"
                    >
                      <div className="grid grid-cols-5 gap-2">
                        <input
                          value={task.title}
                          onChange={(event) => updateTask(day, index, { title: event.target.value })}
                          className="col-span-2 bg-slate-900/70 rounded-lg px-3 py-2 text-sm"
                        />
                        <input
                          type="number"
                          value={task.estimateMinutes}
                          onChange={(event) => updateTask(day, index, { estimateMinutes: Number(event.target.value) })}
                          className="bg-slate-900/70 rounded-lg px-3 py-2 text-sm"
                        />
                        <input
                          value={task.category}
                          onChange={(event) => updateTask(day, index, { category: event.target.value })}
                          className="bg-slate-900/70 rounded-lg px-3 py-2 text-sm"
                        />
                        <input
                          value={task.outcome}
                          onChange={(event) => updateTask(day, index, { outcome: event.target.value })}
                          className="bg-slate-900/70 rounded-lg px-3 py-2 text-sm"
                          placeholder="Expected outcome"
                        />
                      </div>
                      <div className="text-xs text-slate-400">Expected outcome: {task.outcome || "-"}</div>
                      <label className="text-xs text-slate-400 flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={Boolean(task.completed)}
                          onChange={(event) => updateTask(day, index, { completed: event.target.checked })}
                        />
                        Mark task completed
                      </label>
                      <label className="text-xs text-slate-400 flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={task.important}
                          onChange={(event) => updateTask(day, index, { important: event.target.checked })}
                        />
                        Mark as most important task
                      </label>
                      <textarea
                        value={task.note || ""}
                        onChange={(event) => updateTask(day, index, { note: event.target.value })}
                        placeholder="Task notes"
                        className="w-full bg-slate-900/70 rounded-lg px-3 py-2 text-sm"
                        rows={2}
                      />
                      <div className="flex items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => duplicateTask(day, index)}
                          className="px-2 py-1 rounded-lg bg-slate-900/70 text-slate-300"
                        >
                          Duplicate
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const tasks = day.tasks.filter((_, i) => i !== index);
                            onUpdate({ ...day, tasks });
                          }}
                          className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-200"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {Object.keys(templatePacks).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => applyTemplate(day, key)}
                      className="px-2 py-1 rounded-lg bg-slate-800/70 text-slate-200"
                    >
                      Add {key}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const tasks = [...day.tasks, {
                      title: "New task",
                      estimateMinutes: 30,
                      category: "Outreach",
                      outcome: "",
                      important: false,
                      completed: false,
                      note: ""
                    }];
                    onUpdate({ ...day, tasks });
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-800/80 text-slate-200 text-sm"
                >
                  Add task
                </button>

                <button
                  type="button"
                  onClick={() => onUpdate({ ...day, completed: !day.completed })}
                  className={`px-3 py-2 rounded-xl text-sm ${
                    day.completed ? "bg-emerald-500/30" : "bg-slate-800/80"
                  }`}
                >
                  {day.completed ? "Mark incomplete" : "Mark complete"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
