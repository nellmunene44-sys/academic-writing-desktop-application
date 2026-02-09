# academic-writing-desktop-application
This is a local-first Electron + React desktop application for academic writers to execute a 30-day client acquisition roadmap and track income toward $1,000.

Quick Start
Install dependencies
npm install
Run the app
npm run dev
Complete onboarding (targets, platforms, pricing, success metric).
Go to Dashboard to see today’s priority and income trajectory.
Use Today to start timers and complete tasks.
Log income and reflections daily.
Features
Onboarding and goal setup stored locally (primary platforms, pricing range, ideal client, success metric)
Always-start onboarding flow; continue to dashboard after save
Auto-generated 30-day roadmap (editable) with week summary, filters, templates, and drag-and-drop
Daily execution view with time blocking, timers, priority focus, and next-task countdown
Rule-based recommendations by platform
Income tracker with paid/pending status, client profiles, avg order value, repeat client rate
Reflection log with tags, search, weekly summary, and roadmap day linking
Dashboard with execution gauge, income trajectory, platform effectiveness, pipeline, consistency, projection
Native desktop notifications
Export/Import backups (JSON) and CSV exports (income, notes)
Auto-backup to local folder + workday start setting
Tech decisions
Electron + React: fast iteration with a desktop wrapper.
SQLite (via sql.js): local persistence without native build tooling.
LocalStorage: lightweight UI preferences.
uPlot: lightweight charting for income visualization.
Install dependencies
npm install
Run locally
npm run dev
Build for production
npm run build
npm run dist
Extend roadmap & recommendations
Roadmap seed: src/renderer/data/roadmapSeed.js
Recommendations: src/renderer/data/recommendations.js
Database schema and seeding: electron/db.js, electron/seed.js
Backups & export
Export full backup JSON and import it in Settings.
Export income and notes CSV in Settings.
Configure auto-backup folder in Settings.
Notes
Notifications are scheduled when you click "Start day + schedule notifications" in the Today view.
The roadmap is editable directly in the Roadmap view. Updates are stored in SQLite.
If you need to edit onboarding data, use Settings → Reset onboarding.
