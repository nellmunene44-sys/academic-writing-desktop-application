import React, { useEffect, useMemo, useState } from "react";
import Navigation from "./components/Navigation";
import Dashboard from "./components/Dashboard";
import Roadmap from "./components/Roadmap";
import Today from "./components/Today";
import Income from "./components/Income";
import Notes from "./components/Notes";
import Settings from "./components/Settings";
import Onboarding from "./components/Onboarding";
import { api } from "./api";
import { diffDays, formatDate } from "./utils/date";
import { getLocal, setLocal } from "./utils/storage";
import { generateTimeBlocks } from "./utils/timeblock";

export default function App() {
  const [active, setActive] = useState("Dashboard");
  const [profile, setProfile] = useState(null);
  const [roadmap, setRoadmap] = useState([]);
  const [income, setIncome] = useState([]);
  const [notes, setNotes] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [pipeline, setPipeline] = useState({
    leads: 0,
    replies: 0,
    calls: 0,
    clients: 0
  });
  const [workdayStart, setWorkdayStart] = useState(9);
  const [backupFolder, setBackupFolder] = useState("");
  const [autoBackup, setAutoBackup] = useState(false);

  useEffect(() => {
    const storedActive = getLocal("activeView", "Dashboard");
    setActive(storedActive);
  }, []);

  useEffect(() => {
    setLocal("activeView", active);
  }, [active]);

  const reloadData = async () => {
    const storedProfile = await api.getSetting("profile");
    if (storedProfile) setProfile(storedProfile);
    const roadmapData = await api.listRoadmap();
    setRoadmap(roadmapData);
    setIncome(await api.listIncome());
    setNotes(await api.listNotes());
    setMilestones(await api.listMilestones());
    const notificationSetting = await api.getSetting("notificationsEnabled");
    setNotificationsEnabled(notificationSetting !== null ? notificationSetting : true);
    const storedPipeline = await api.getSetting("pipeline");
    if (storedPipeline) setPipeline(storedPipeline);
    const storedWorkday = await api.getSetting("workdayStart");
    if (storedWorkday !== null && storedWorkday !== undefined) setWorkdayStart(storedWorkday);
    const storedBackupFolder = await api.getSetting("backupFolder");
    if (storedBackupFolder) setBackupFolder(storedBackupFolder);
    const storedAutoBackup = await api.getSetting("autoBackup");
    if (storedAutoBackup !== null && storedAutoBackup !== undefined) setAutoBackup(storedAutoBackup);
  };

  useEffect(() => {
    reloadData();
  }, []);

  const incomeTotal = income
    .filter((entry) => (entry.status || "paid") === "paid")
    .reduce((sum, entry) => sum + entry.amount, 0);

  const incomeSeries = useMemo(() => {
    const paid = income.filter((entry) => (entry.status || "paid") === "paid");
    if (paid.length === 0) return [];
    const byDate = {};
    paid.forEach((entry) => {
      byDate[entry.date] = (byDate[entry.date] || 0) + entry.amount;
    });
    const dates = Object.keys(byDate).sort();
    let running = 0;
    return dates.map((date, index) => {
      running += byDate[date];
      return { day: index + 1, total: running };
    });
  }, [income]);

  const taskSeries = useMemo(() => {
    if (!roadmap.length) return [];
    let planned = 0;
    let completed = 0;
    return roadmap.map((day) => {
      const dayPlanned = day.tasks.length;
      const dayCompleted = day.tasks.filter((task) => task.completed).length;
      planned += dayPlanned;
      completed += dayCompleted;
      return { day: day.day, planned, completed };
    });
  }, [roadmap]);

  const todayDayIndex = useMemo(() => {
    const startDate = profile?.startDate;
    if (!startDate) return 1;
    const daysDiff = diffDays(startDate, formatDate(new Date()));
    return Math.min(30, Math.max(1, daysDiff + 1));
  }, [profile]);

  const today = roadmap.find((day) => day.day === todayDayIndex);
  const importantTask = today?.tasks.find((task) => task.important) || today?.tasks[0];
  const todayStats = {
    planned: today?.tasks.length || 0,
    completed: today?.tasks.filter((task) => task.completed).length || 0
  };
  const timeBlocks = useMemo(() => {
    if (!today) return [];
    return generateTimeBlocks(today.tasks, workdayStart ?? 9, profile?.dailyHours || 6);
  }, [today, profile?.dailyHours, workdayStart]);

  const completedByDay = useMemo(() => {
    const map = {};
    roadmap.forEach((day) => {
      map[day.day] = day.tasks.length > 0 && day.tasks.every((task) => task.completed);
    });
    return map;
  }, [roadmap]);

  const streak = useMemo(() => {
    let count = 0;
    for (let day = todayDayIndex; day >= 1; day -= 1) {
      if (completedByDay[day]) {
        count += 1;
      } else {
        break;
      }
    }
    return count;
  }, [completedByDay, todayDayIndex]);

  const weeklyConsistency = useMemo(() => {
    const start = Math.max(1, todayDayIndex - 6);
    let total = 0;
    let done = 0;
    for (let day = start; day <= todayDayIndex; day += 1) {
      total += 1;
      if (completedByDay[day]) done += 1;
    }
    return total ? Math.round((done / total) * 100) : 0;
  }, [completedByDay, todayDayIndex]);

  const yesterdayNote = useMemo(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const key = formatDate(yesterday);
    return notes.find((note) => note.date === key) || null;
  }, [notes]);

  const platformTotals = useMemo(() => {
    const totals = {};
    income.filter((entry) => (entry.status || "paid") === "paid").forEach((entry) => {
      const key = entry.platform || "Other";
      totals[key] = (totals[key] || 0) + entry.amount;
    });
    return totals;
  }, [income]);

  const incomeTrajectory = useMemo(() => {
    if (!profile?.startDate) return [];
    const daily = Array.from({ length: 30 }, () => 0);
    income.filter((entry) => (entry.status || "paid") === "paid").forEach((entry) => {
      const index = diffDays(profile.startDate, entry.date);
      if (index >= 0 && index < 30) daily[index] += entry.amount;
    });
    let running = 0;
    return daily.map((amount, index) => {
      running += amount;
      return { day: index + 1, total: running };
    });
  }, [income, profile?.startDate]);

  const revenueProjection = useMemo(() => {
    if (!profile?.startDate) return { avgDaily: 0, projectedTotal: incomeTotal };
    const daysElapsed = Math.max(1, todayDayIndex);
    const avgDaily = incomeTotal / daysElapsed;
    const remaining = Math.max(0, 30 - todayDayIndex);
    return {
      avgDaily,
      projectedTotal: incomeTotal + avgDaily * remaining
    };
  }, [incomeTotal, profile?.startDate, todayDayIndex]);

  const saveProfile = async (payload) => {
    const profileData = { ...payload, startDate: formatDate(new Date()) };
    setProfile(profileData);
    await api.setSetting("profile", profileData);
    if (!profile && Array.isArray(payload.primaryPlatforms) && payload.primaryPlatforms.length > 0) {
      const updated = roadmap.map((day, index) => {
        if (!day.tasks.length) return day;
        const platform = payload.primaryPlatforms[index % payload.primaryPlatforms.length];
        const tasks = [...day.tasks];
        tasks[0] = {
          ...tasks[0],
          category: platform,
          title: `Primary outreach on ${platform}`
        };
        return { ...day, tasks };
      });
      setRoadmap(updated);
      for (const day of updated) {
        await api.updateRoadmapDay(day);
      }
    }
    setShowOnboarding(false);
    setActive("Dashboard");
  };

  const handleUpdateRoadmapDay = async (payload) => {
    await api.updateRoadmapDay(payload);
    const refreshed = await api.listRoadmap();
    setRoadmap(refreshed);
  };

  const handleAddIncome = async (payload) => {
    await api.addIncome(payload);
    setIncome(await api.listIncome());
    setMilestones(await api.listMilestones());
  };

  const handleAddNote = async (payload) => {
    await api.addNote(payload);
    setNotes(await api.listNotes());
  };

  const toggleNotifications = async (enabled) => {
    setNotificationsEnabled(enabled);
    await api.setSetting("notificationsEnabled", enabled);
  };

  const updatePipeline = async (next) => {
    setPipeline(next);
    await api.setSetting("pipeline", next);
  };

  const updateWorkdayStart = async (value) => {
    setWorkdayStart(value);
    await api.setSetting("workdayStart", value);
  };

  const chooseBackupFolder = async () => {
    const folder = await api.selectBackupFolder();
    if (!folder) return;
    setBackupFolder(folder);
    await api.setSetting("backupFolder", folder);
  };

  const toggleAutoBackup = async (enabled) => {
    setAutoBackup(enabled);
    await api.setSetting("autoBackup", enabled);
    if (enabled && backupFolder) {
      await api.runBackup(backupFolder);
    }
  };

  const exportJson = async () => {
    await api.exportJson();
  };

  const importJson = async () => {
    const ok = await api.importJson();
    if (ok) await reloadData();
  };

  const exportIncomeCsv = async () => {
    await api.exportIncomeCsv();
  };

  const exportNotesCsv = async () => {
    await api.exportNotesCsv();
  };

  const resetProfile = async () => {
    await api.setSetting("profile", null);
    setProfile(null);
    setShowOnboarding(true);
  };

  const debugBanner = import.meta.env.DEV;

  if (showOnboarding) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-8"
        style={{ background: "#0b1220", color: "#e2e8f0" }}
      >
        {debugBanner && (
          <div
            style={{
              position: "fixed",
              top: 12,
              left: 12,
              zIndex: 9999,
              background: "#f59e0b",
              color: "#0b1220",
              padding: "6px 10px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600
            }}
          >
            DEBUG: Renderer mounted
          </div>
        )}
        <Onboarding onSave={saveProfile} initialProfile={profile} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen grid grid-cols-[240px_1fr] gap-6 p-6"
      style={{ background: "#0b1220", color: "#e2e8f0" }}
    >
      {debugBanner && (
        <div
          style={{
            position: "fixed",
            top: 12,
            left: 12,
            zIndex: 9999,
            background: "#f59e0b",
            color: "#0b1220",
            padding: "6px 10px",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600
          }}
        >
          DEBUG: Renderer mounted
        </div>
      )}
      <aside className="bg-slate-900/70 rounded-2xl p-4 space-y-6">
        <div>
          <h1 className="text-xl text-amber-200">Academic Roadmap Coach</h1>
          <p className="text-xs text-slate-400">Local-first execution system</p>
        </div>
        <Navigation active={active} onChange={setActive} />
        <div className="text-xs text-slate-400">
          Day {todayDayIndex} of 30 · Priority: {importantTask?.category || "-"}
        </div>
      </aside>

      <main className="space-y-6">
        {active === "Dashboard" && (
          <Dashboard
            profile={profile}
            today={{ importantTask }}
            milestones={milestones}
            incomeTotal={incomeTotal}
            incomeSeries={incomeSeries}
            taskSeries={taskSeries}
            todayStats={todayStats}
            platformTotals={platformTotals}
            incomeTrajectory={incomeTrajectory}
            timeBlocks={timeBlocks}
            pipeline={pipeline}
            onUpdatePipeline={updatePipeline}
            streak={streak}
            weeklyConsistency={weeklyConsistency}
            revenueProjection={revenueProjection}
            yesterdayNote={yesterdayNote}
          />
        )}
        {active === "Roadmap" && (
          <Roadmap roadmap={roadmap} onUpdate={handleUpdateRoadmapDay} />
        )}
        {active === "Today" && (
          <Today
            today={today}
            profile={profile}
            notificationsEnabled={notificationsEnabled}
            onNotify={api.notify}
            onUpdateDay={handleUpdateRoadmapDay}
            workdayStart={workdayStart}
          />
        )}
        {active === "Income" && (
          <Income income={income} onAdd={handleAddIncome} />
        )}
        {active === "Notes" && (
          <Notes notes={notes} onAdd={handleAddNote} />
        )}
        {active === "Settings" && (
          <Settings
            notificationsEnabled={notificationsEnabled}
            onToggleNotifications={toggleNotifications}
            onResetProfile={resetProfile}
            workdayStart={workdayStart}
            onWorkdayStartChange={updateWorkdayStart}
            backupFolder={backupFolder}
            autoBackup={autoBackup}
            onChooseBackupFolder={chooseBackupFolder}
            onToggleAutoBackup={toggleAutoBackup}
            onExportJson={exportJson}
            onImportJson={importJson}
            onExportIncomeCsv={exportIncomeCsv}
            onExportNotesCsv={exportNotesCsv}
          />
        )}
      </main>
    </div>
  );
}
