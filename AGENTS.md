# AGENTS.md

## Project root

The app source lives at `Vibe/Cpp/` relative to repo root (`D:\Vibe\Cpp`).

## Setup & serve

No build step. Serve from `Vibe/Cpp/`:

```bash
npx serve Vibe/Cpp           # Node
python -m http.server 8080 -d Vibe/Cpp  # Python
```

## Critical load order

Scripts in `index.html` must stay in this exact order (each depends on the prior):
`storage.js` → `audio.js` → `export.js` → `app.js`

CDN libs loaded before them: `html2canvas` → `jsPDF` → `Dexie.js v3`.

## No tests, no linter, no CI

No test suite, no lint config, no typechecker. Verify changes by opening `index.html` in a browser.

## Debug API

Open browser console and use `window.cybersched`:
`add(period, time, title)`, `rm(id)`, `update(id, fields)`, `toggle(id)`, `list(date)`, `clone(date)`, `export()`.

## Key conventions

- Each JS file is an IIFE assigning one global (`Storage`, `AudioEngine`, `ExportEngine`, `App`).
- `app.js` calls `Storage`, `AudioEngine.play()`, `ExportEngine.exportToPDF()`.
- Schema (`ScheduleItem`): `id` (UUID), `date` (YYYY-MM-DD), `period` (MORNING|NOON|AFTERNOON|NIGHT), `time_range`, `title`, `completed` (bool), `tag` (STUDY|ENTERTAINMENT|REST|EXERCISE).
- Two views: day (`#view-day`) and week (`#view-week`).
- Service worker `sw.js` caches local assets cache-first, CDN resources network-first.
- All CSS in `css/style.css` (~23KB). Design tokens: `#121814` bg, `#E2F0D9` paper, `#00FF66` accent, `#FF007F` pink.
