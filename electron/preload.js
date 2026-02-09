const { contextBridge, ipcRenderer } = require("electron");

// Preload bridge: local-only API surface for the renderer.
contextBridge.exposeInMainWorld("api", {
  getSetting: (key) => ipcRenderer.invoke("settings:get", key),
  setSetting: (key, value) => ipcRenderer.invoke("settings:set", key, value),
  listRoadmap: () => ipcRenderer.invoke("roadmap:list"),
  updateRoadmapDay: (payload) => ipcRenderer.invoke("roadmap:update", payload),
  addIncome: (payload) => ipcRenderer.invoke("income:add", payload),
  listIncome: () => ipcRenderer.invoke("income:list"),
  addNote: (payload) => ipcRenderer.invoke("notes:add", payload),
  listNotes: () => ipcRenderer.invoke("notes:list"),
  listMilestones: () => ipcRenderer.invoke("milestones:list"),
  exportJson: () => ipcRenderer.invoke("export:json"),
  importJson: () => ipcRenderer.invoke("import:json"),
  exportIncomeCsv: () => ipcRenderer.invoke("export:incomeCsv"),
  exportNotesCsv: () => ipcRenderer.invoke("export:notesCsv"),
  selectBackupFolder: () => ipcRenderer.invoke("backup:selectFolder"),
  runBackup: (folder) => ipcRenderer.invoke("backup:run", folder),
  notify: (payload) => ipcRenderer.invoke("notify", payload)
});
