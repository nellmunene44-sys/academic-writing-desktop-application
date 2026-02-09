import React from "react";
import Charts from "./Charts";
import Milestones from "./Milestones";
import TaskProgress from "./TaskProgress";
import DailyExecutionGauge from "./DailyExecutionGauge";
import IncomeSparkline from "./IncomeSparkline";
import PlatformEffectiveness from "./PlatformEffectiveness";

export default function Dashboard({
  profile,
  today,
  milestones,
  incomeTotal,
  incomeSeries,
  taskSeries,
  todayStats,
  platformTotals,
  incomeTrajectory,
  timeBlocks,
  pipeline,
  onUpdatePipeline,
  streak,
  weeklyConsistency,
  revenueProjection,
  yesterdayNote
}) {
  const updatePipelineValue = (key, value) => {
    onUpdatePipeline({
      ...pipeline,
      [key]: Number(value)
    });
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-6">
        <DailyExecutionGauge
          completed={todayStats.completed}
          planned={todayStats.planned}
          importantTask={today?.importantTask}
        />

        <div className="bg-slate-900/70 rounded-2xl p-6 space-y-3 text-sm text-slate-300">
          <div className="flex items-center justify-between">
            <span>Daily hours</span>
            <span>{profile?.dailyHours || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Target income</span>
            <span>${profile?.targetIncome || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Subjects</span>
            <span>{profile?.subjects || "-"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Skill level</span>
            <span>{profile?.skillLevel || "-"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Primary platforms</span>
            <span>{profile?.primaryPlatforms?.join(", ") || "-"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Pricing range</span>
            <span>{profile?.pricingRange || "-"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Ideal client</span>
            <span>{profile?.idealClient || "-"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Success metric</span>
            <span>{profile?.successMetric || "-"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Focus</span>
            <span>{today?.importantTask?.category || "-"}</span>
          </div>
        </div>

        <div className="bg-slate-900/70 rounded-2xl p-6">
          <h4 className="text-sm uppercase tracking-wide text-slate-400 mb-3">Today’s time plan</h4>
          {timeBlocks.length === 0 ? (
            <div className="text-sm text-slate-500">No tasks scheduled yet.</div>
          ) : (
            <div className="space-y-2 text-sm text-slate-200">
              {timeBlocks.slice(0, 5).map((block, index) => (
                <div key={`${block.title}-${index}`} className="flex items-center justify-between">
                  <span>{block.title}</span>
                  <span>{block.start} - {block.end}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-900/70 rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm uppercase tracking-wide text-slate-400">Consistency</h4>
            <span className="text-sm text-slate-200">{weeklyConsistency}% this week</span>
          </div>
          <div className="w-full bg-slate-800/70 rounded-full h-2">
            <div
              className="bg-emerald-400 h-2 rounded-full"
              style={{ width: `${Math.min(100, weeklyConsistency)}%` }}
            />
          </div>
          <div className="text-sm text-slate-300">Current streak: {streak} day(s)</div>
        </div>

        <div className="bg-slate-900/70 rounded-2xl p-6 space-y-2">
          <h4 className="text-sm uppercase tracking-wide text-slate-400">Revenue projection</h4>
          <div className="text-sm text-slate-300">Avg per day: ${revenueProjection.avgDaily.toFixed(2)}</div>
          <div className="text-lg text-amber-200">
            Projected total: ${revenueProjection.projectedTotal.toFixed(2)}
          </div>
          <div className="text-xs text-slate-500">Goal: $1,000</div>
        </div>

        <IncomeSparkline series={incomeTrajectory} goal={1000} />
      </div>

      <div className="space-y-6">
        <PlatformEffectiveness totals={platformTotals} />

        <div className="bg-slate-900/70 rounded-2xl p-6">
          <h4 className="text-sm uppercase tracking-wide text-slate-400 mb-4">Pipeline</h4>
          <div className="grid grid-cols-2 gap-3 text-sm text-slate-200">
            <label className="space-y-1">
              <div className="text-xs text-slate-400">Leads contacted</div>
              <input
                type="number"
                value={pipeline.leads}
                onChange={(event) => updatePipelineValue("leads", event.target.value)}
                className="w-full bg-slate-800/70 rounded-lg px-3 py-2"
              />
            </label>
            <label className="space-y-1">
              <div className="text-xs text-slate-400">Replies</div>
              <input
                type="number"
                value={pipeline.replies}
                onChange={(event) => updatePipelineValue("replies", event.target.value)}
                className="w-full bg-slate-800/70 rounded-lg px-3 py-2"
              />
            </label>
            <label className="space-y-1">
              <div className="text-xs text-slate-400">Calls booked</div>
              <input
                type="number"
                value={pipeline.calls}
                onChange={(event) => updatePipelineValue("calls", event.target.value)}
                className="w-full bg-slate-800/70 rounded-lg px-3 py-2"
              />
            </label>
            <label className="space-y-1">
              <div className="text-xs text-slate-400">Clients closed</div>
              <input
                type="number"
                value={pipeline.clients}
                onChange={(event) => updatePipelineValue("clients", event.target.value)}
                className="w-full bg-slate-800/70 rounded-lg px-3 py-2"
              />
            </label>
          </div>
        </div>

        <div className="bg-slate-900/70 rounded-2xl p-6 space-y-2">
          <h4 className="text-sm uppercase tracking-wide text-slate-400">Yesterday’s outcome</h4>
          {yesterdayNote ? (
            <div className="text-sm text-slate-200 space-y-1">
              <div><span className="text-slate-500">Worked:</span> {yesterdayNote.worked || "-"}</div>
              <div><span className="text-slate-500">Didn’t:</span> {yesterdayNote.didnt || "-"}</div>
              <div><span className="text-slate-500">Next:</span> {yesterdayNote.next || "-"}</div>
            </div>
          ) : (
            <div className="text-sm text-slate-500">No reflection logged for yesterday.</div>
          )}
        </div>

        <Charts incomeSeries={incomeSeries} />
        <TaskProgress series={taskSeries} />
        <Milestones milestones={milestones} totalIncome={incomeTotal} />
      </div>
    </div>
  );
}
