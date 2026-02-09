const { app, BrowserWindow, ipcMain, Notification, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const db = require("./db");

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: "#0f172a",
    webPreferences: {
      // Preload bridge keeps renderer isolated while enabling IPC.
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js")
    }
  });

  if (isDev) {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools({ mode: "detach" });
    // Log renderer errors to terminal for quick debugging.
    win.webContents.on("console-message", (_event, level, message, line, sourceId) => {
      console.log(`[renderer:${level}] ${message} (${sourceId}:${line})`);
    });
    win.webContents.on("did-fail-load", (_event, code, desc) => {
      console.error(`Renderer failed to load: ${code} ${desc}`);
    });
  } else {
    win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

app.whenReady().then(async () => {
  app.setAppUserModelId("com.academic.application");
  await db.initialize();
  createWindow();
  runAutoBackup();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("settings:get", (_event, key) => db.getSetting(key));
ipcMain.handle("settings:set", (_event, key, value) => db.setSetting(key, value));
ipcMain.handle("roadmap:list", () => db.getRoadmap());
ipcMain.handle("roadmap:update", (_event, payload) => db.updateRoadmapDay(payload));
ipcMain.handle("income:add", (_event, payload) => db.addIncome(payload));
ipcMain.handle("income:list", () => db.listIncome());
ipcMain.handle("notes:add", (_event, payload) => db.addNote(payload));
ipcMain.handle("notes:list", () => db.listNotes());
ipcMain.handle("milestones:list", () => db.getMilestones());

ipcMain.handle("export:json", async () => {
  const result = await dialog.showSaveDialog({
    title: "Export backup (JSON)",
    defaultPath: "academic-roadmap-backup.json",
    filters: [{ name: "JSON", extensions: ["json"] }]
  });
  if (result.canceled || !result.filePath) return false;
  const payload = db.exportAll();
  fs.writeFileSync(result.filePath, JSON.stringify(payload, null, 2));
  return true;
});

ipcMain.handle("import:json", async () => {
  const result = await dialog.showOpenDialog({
    title: "Import backup (JSON)",
    properties: ["openFile"],
    filters: [{ name: "JSON", extensions: ["json"] }]
  });
  if (result.canceled || !result.filePaths?.length) return false;
  const raw = fs.readFileSync(result.filePaths[0], "utf8");
  const data = JSON.parse(raw);
  db.importAll(data);
  return true;
});

ipcMain.handle("export:incomeCsv", async () => {
  const result = await dialog.showSaveDialog({
    title: "Export income (CSV)",
    defaultPath: "income.csv",
    filters: [{ name: "CSV", extensions: ["csv"] }]
  });
  if (result.canceled || !result.filePath) return false;
  fs.writeFileSync(result.filePath, db.exportCsvIncome());
  return true;
});

ipcMain.handle("export:notesCsv", async () => {
  const result = await dialog.showSaveDialog({
    title: "Export notes (CSV)",
    defaultPath: "notes.csv",
    filters: [{ name: "CSV", extensions: ["csv"] }]
  });
  if (result.canceled || !result.filePath) return false;
  fs.writeFileSync(result.filePath, db.exportCsvNotes());
  return true;
});

ipcMain.handle("backup:selectFolder", async () => {
  const result = await dialog.showOpenDialog({
    title: "Select backup folder",
    properties: ["openDirectory"]
  });
  if (result.canceled || !result.filePaths?.length) return null;
  return result.filePaths[0];
});

ipcMain.handle("backup:run", async (_event, folder) => {
  if (!folder) return false;
  const fileName = `backup-${new Date().toISOString().slice(0, 10)}.json`;
  const payload = db.exportAll();
  fs.writeFileSync(path.join(folder, fileName), JSON.stringify(payload, null, 2));
  return true;
});

ipcMain.handle("notify", (_event, payload) => {
  const notification = new Notification({
    title: payload.title,
    body: payload.body
  });
  notification.show();
  return true;
});

function runAutoBackup() {
  const autoBackup = db.getSetting("autoBackup");
  const backupFolder = db.getSetting("backupFolder");
  const lastBackup = db.getSetting("lastBackupDate");
  if (!autoBackup || !backupFolder) return;
  const today = new Date().toISOString().slice(0, 10);
  if (lastBackup === today) return;
  const fileName = `backup-${today}.json`;
  const payload = db.exportAll();
  fs.writeFileSync(path.join(backupFolder, fileName), JSON.stringify(payload, null, 2));
  db.setSetting("lastBackupDate", today);
}
