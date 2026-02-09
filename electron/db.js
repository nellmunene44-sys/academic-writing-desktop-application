const initSqlJs = require("sql.js");
const fs = require("fs");
const { app } = require("electron");
const path = require("path");
const { roadmapSeed, milestonesSeed } = require("./seed");

let db;
let dbPath;

async function initialize() {
  // SQLite via sql.js keeps data local without native builds.
  dbPath = path.join(app.getPath("userData"), "app.sqlite");
  const SQL = await initSqlJs({
    locateFile: (file) => path.join(__dirname, "..", "node_modules", "sql.js", "dist", file)
  });

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  createSchema();
  ensureColumns();
  seedIfNeeded();
  persist();
}

function createSchema() {
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
    CREATE TABLE IF NOT EXISTS roadmap_days (
      id INTEGER PRIMARY KEY,
      day_index INTEGER UNIQUE,
      week INTEGER,
      title TEXT,
      tasks_json TEXT,
      notes TEXT,
      completed INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS income (
      id INTEGER PRIMARY KEY,
      client_name TEXT,
      platform TEXT,
      work_type TEXT,
      amount REAL,
      date TEXT,
      status TEXT DEFAULT 'paid'
    );
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY,
      date TEXT,
      worked TEXT,
      didnt TEXT,
      next TEXT,
      tags TEXT,
      day_index INTEGER
    );
    CREATE TABLE IF NOT EXISTS milestones (
      id INTEGER PRIMARY KEY,
      title TEXT,
      amount REAL,
      achieved_date TEXT
    );
  `);
}

function ensureColumns() {
  addColumnIfMissing("income", "status", "TEXT DEFAULT 'paid'");
  addColumnIfMissing("notes", "tags", "TEXT");
  addColumnIfMissing("notes", "day_index", "INTEGER");
}

function addColumnIfMissing(table, column, definition) {
  const columns = queryAll(`PRAGMA table_info(${table})`).map((row) => row.name);
  if (!columns.includes(column)) {
    db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function persist() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows[0] || null;
}

function run(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.run(params);
  stmt.free();
}

function seedIfNeeded() {
  const countRow = queryOne("SELECT COUNT(*) as count FROM roadmap_days");
  if (!countRow || countRow.count === 0) {
    roadmapSeed.forEach((row) => {
      run(
        "INSERT INTO roadmap_days (day_index, week, title, tasks_json, notes, completed) VALUES (?, ?, ?, ?, '', 0)",
        [row.day, row.week, row.title, JSON.stringify(row.tasks)]
      );
    });
  }

  const milestonesCount = queryOne("SELECT COUNT(*) as count FROM milestones");
  if (!milestonesCount || milestonesCount.count === 0) {
    milestonesSeed.forEach((row) => {
      run(
        "INSERT INTO milestones (title, amount, achieved_date) VALUES (?, ?, NULL)",
        [row.title, row.amount]
      );
    });
  }
}

function getSetting(key) {
  const row = queryOne("SELECT value FROM settings WHERE key = ?", [key]);
  if (!row) return null;
  try {
    return JSON.parse(row.value);
  } catch (err) {
    return row.value;
  }
}

function setSetting(key, value) {
  run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [key, JSON.stringify(value)]);
  persist();
  return true;
}

function getRoadmap() {
  const rows = queryAll("SELECT * FROM roadmap_days ORDER BY day_index ASC");
  return rows.map((row) => ({
    id: row.id,
    day: row.day_index,
    week: row.week,
    title: row.title,
    tasks: JSON.parse(row.tasks_json),
    notes: row.notes,
    completed: Boolean(row.completed)
  }));
}

function updateRoadmapDay(payload) {
  run(
    "UPDATE roadmap_days SET title = ?, tasks_json = ?, notes = ?, completed = ? WHERE day_index = ?",
    [payload.title, JSON.stringify(payload.tasks), payload.notes || "", payload.completed ? 1 : 0, payload.day]
  );
  persist();
  return true;
}

function addIncome(payload) {
  run(
    "INSERT INTO income (client_name, platform, work_type, amount, date, status) VALUES (?, ?, ?, ?, ?, ?)",
    [payload.clientName, payload.platform, payload.workType, payload.amount, payload.date, payload.status || "paid"]
  );

  updateMilestones();
  persist();
  return true;
}

function listIncome() {
  return queryAll("SELECT * FROM income ORDER BY date ASC");
}

function addNote(payload) {
  run(
    "INSERT INTO notes (date, worked, didnt, next, tags, day_index) VALUES (?, ?, ?, ?, ?, ?)",
    [payload.date, payload.worked, payload.didnt, payload.next, payload.tags || "", payload.dayIndex || null]
  );
  persist();
  return true;
}

function listNotes() {
  return queryAll("SELECT * FROM notes ORDER BY date DESC");
}

function updateMilestones() {
  const totalRow = queryOne("SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE status = 'paid'");
  const total = totalRow ? totalRow.total : 0;
  const milestones = queryAll("SELECT * FROM milestones");
  milestones.forEach((milestone) => {
    if (!milestone.achieved_date && total >= milestone.amount) {
      run("UPDATE milestones SET achieved_date = ? WHERE id = ?", [new Date().toISOString(), milestone.id]);
    }
  });
}

function getMilestones() {
  return queryAll("SELECT * FROM milestones ORDER BY amount ASC");
}

function exportAll() {
  return {
    settings: queryAll("SELECT * FROM settings"),
    roadmap_days: queryAll("SELECT * FROM roadmap_days"),
    income: queryAll("SELECT * FROM income"),
    notes: queryAll("SELECT * FROM notes"),
    milestones: queryAll("SELECT * FROM milestones")
  };
}

function importAll(data) {
  if (!data) return false;
  run("DELETE FROM settings");
  run("DELETE FROM roadmap_days");
  run("DELETE FROM income");
  run("DELETE FROM notes");
  run("DELETE FROM milestones");

  if (Array.isArray(data.settings)) {
    data.settings.forEach((row) => run("INSERT INTO settings (key, value) VALUES (?, ?)", [row.key, row.value]));
  }
  if (Array.isArray(data.roadmap_days)) {
    data.roadmap_days.forEach((row) => run(
      "INSERT INTO roadmap_days (id, day_index, week, title, tasks_json, notes, completed) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [row.id, row.day_index, row.week, row.title, row.tasks_json, row.notes, row.completed]
    ));
  }
  if (Array.isArray(data.income)) {
    data.income.forEach((row) => run(
      "INSERT INTO income (id, client_name, platform, work_type, amount, date, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [row.id, row.client_name, row.platform, row.work_type, row.amount, row.date, row.status || "paid"]
    ));
  }
  if (Array.isArray(data.notes)) {
    data.notes.forEach((row) => run(
      "INSERT INTO notes (id, date, worked, didnt, next, tags, day_index) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [row.id, row.date, row.worked, row.didnt, row.next, row.tags || "", row.day_index || null]
    ));
  }
  if (Array.isArray(data.milestones)) {
    data.milestones.forEach((row) => run(
      "INSERT INTO milestones (id, title, amount, achieved_date) VALUES (?, ?, ?, ?)",
      [row.id, row.title, row.amount, row.achieved_date || null]
    ));
  }
  persist();
  return true;
}

function exportCsvIncome() {
  const rows = queryAll("SELECT * FROM income ORDER BY date ASC");
  const header = "id,client_name,platform,work_type,amount,date,status";
  const body = rows.map((row) => [
    row.id,
    escapeCsv(row.client_name),
    escapeCsv(row.platform),
    escapeCsv(row.work_type),
    row.amount,
    row.date,
    row.status || "paid"
  ].join(","));
  return [header, ...body].join("\n");
}

function exportCsvNotes() {
  const rows = queryAll("SELECT * FROM notes ORDER BY date DESC");
  const header = "id,date,worked,didnt,next,tags,day_index";
  const body = rows.map((row) => [
    row.id,
    row.date,
    escapeCsv(row.worked),
    escapeCsv(row.didnt),
    escapeCsv(row.next),
    escapeCsv(row.tags),
    row.day_index ?? ""
  ].join(","));
  return [header, ...body].join("\n");
}

function escapeCsv(value) {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  if (stringValue.includes(",") || stringValue.includes("\"") || stringValue.includes("\n")) {
    return `"${stringValue.replace(/\"/g, "\"\"")}"`;
  }
  return stringValue;
}

module.exports = {
  initialize,
  getSetting,
  setSetting,
  getRoadmap,
  updateRoadmapDay,
  addIncome,
  listIncome,
  addNote,
  listNotes,
  getMilestones,
  exportAll,
  importAll,
  exportCsvIncome,
  exportCsvNotes
};
