export function generateTimeBlocks(tasks, startHour, dailyHours) {
  const totalMinutes = dailyHours * 60;
  const usableTasks = tasks.length ? tasks : [];
  const taskMinutes = usableTasks.reduce((sum, task) => sum + task.estimateMinutes, 0);
  const scale = taskMinutes > totalMinutes ? totalMinutes / taskMinutes : 1;

  let currentMinutes = startHour * 60;
  return usableTasks.map((task) => {
    const duration = Math.max(30, Math.round(task.estimateMinutes * scale));
    const start = minutesToTime(currentMinutes);
    currentMinutes += duration;
    const end = minutesToTime(currentMinutes);
    return { title: task.title, start, end, duration };
  });
}

function minutesToTime(minutes) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}
