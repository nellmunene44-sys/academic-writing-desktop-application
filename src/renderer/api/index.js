export const api = {
  getSetting: (key) => window.api.getSetting(key),
  setSetting: (key, value) => window.api.setSetting(key, value),
  listRoadmap: () => window.api.listRoadmap(),
  updateRoadmapDay: (payload) => window.api.updateRoadmapDay(payload),
  addIncome: (payload) => window.api.addIncome(payload),
  listIncome: () => window.api.listIncome(),
  addNote: (payload) => window.api.addNote(payload),
  listNotes: () => window.api.listNotes(),
  listMilestones: () => window.api.listMilestones(),
  exportJson: () => window.api.exportJson(),
  importJson: () => window.api.importJson(),
  exportIncomeCsv: () => window.api.exportIncomeCsv(),
  exportNotesCsv: () => window.api.exportNotesCsv(),
  selectBackupFolder: () => window.api.selectBackupFolder(),
  runBackup: (folder) => window.api.runBackup(folder),
  notify: (payload) => window.api.notify(payload)
};
