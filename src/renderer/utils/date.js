export function formatDate(date) {
  return new Date(date).toISOString().slice(0, 10);
}

export function diffDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
