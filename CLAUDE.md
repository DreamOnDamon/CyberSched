# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Gino's Matrix (CyberSchedule_Matrix v1.1)** — a client-side SPA/PWA daily schedule manager with a pixel cyberpunk / retro matrix-green theme. It implements a "digital binder" layout: left-side period axis (morning/noon/afternoon/night), center three-column table (time / mission / status), and right-side completion checkboxes with particle effects.

## Running the App

This is a static web app with **no build step** — open `Vibe/Cpp/index.html` directly in a browser, or serve locally:

```bash
cd Vibe/Cpp && npx serve .        # Node.js
cd Vibe/Cpp && python -m http.server 8080   # Python 3
```

All dependencies (Dexie.js, html2canvas, jsPDF, Google Fonts) are loaded from CDN. The app works offline after the first load via the service worker.

## Architecture

**Tech:** Vanilla HTML/CSS/JS — no framework, no transpilation, no bundler. Storage is IndexedDB via Dexie.js v3. Export uses html2canvas + jsPDF. Audio uses Web Audio API.

**JS modules loaded in strict order** (each depends on the previous):

| File | Exports | Purpose |
|------|---------|---------|
| `js/storage.js` | `Storage` object | CRUD for `ScheduleItem` records via Dexie.js. Migrated from v1 (start_time/end_time) to v2 (period/time_range/completed). |
| `js/audio.js` | `AudioEngine` (IIFE) | Web Audio API 8-bit sound effects: `success`, `laser`, `levelup`, `meow`, `check`. |
| `js/export.js` | `ExportEngine` + `fmtLocalDate()` / `getWeekRange()` | PDF export: builds 7 binder pages in a hidden DOM container, renders via html2canvas, splits into A4 portrait pages. Supports `cyber_neon` and `print_grayscale` themes. |
| `js/app.js` | `App` (IIFE) + `window.cybersched` debug API | Main app: navigation, day/week view rendering, inline editing, toggle-complete with particles, matrix rain BG, cursor trails, mascot interaction. |

**Data model** (`ScheduleItem` in IndexedDB store `schedules`):
- `id` (UUID), `date` (YYYY-MM-DD), `period` (MORNING|NOON|AFTERNOON|NIGHT)
- `time_range` (e.g. "08:00-08:30"), `title`, `completed` (boolean), `tag` (STUDY|ENTERTAINMENT|REST|EXERCISE)

**Key module pattern:** Each JS file uses an IIFE that attaches a single global object. `app.js` reads state from `Storage`, plays sounds via `AudioEngine.play()`, and delegates PDF generation to `ExportEngine.exportToPDF()`. The `window.cybersched` object exposes `add`, `rm`, `update`, `toggle`, `list`, `clone`, `export` for console debugging.

## Views

- **Day view** (`#view-day`): Three-column binder table grouped by period. Left sidebar with binder rings and period-nav buttons. Click time cell to edit, double-click mission cell to edit. Click status box to toggle completion (triggers particle burst).
- **Week view** (`#view-week`): 7 mini binder cards side by side (Mon-Sun). Click an item to navigate to that day.

## Styling

All CSS in `css/style.css` (~23KB). Design tokens from `spec.md`: deep matrix-green-black background `#121814`, sheet paper `#E2F0D9`, neon green accent `#00FF66`, cyber pink `#FF007F`. Pixel fonts: "Press Start 2P" (Google Fonts) with Zpix/Fusion Pixel fallbacks. CRT scanlines and matrix rain are rendered via `<canvas>` and CSS overlays.

## Service Worker

`sw.js` registers cache-first for local assets, network-first for CDN resources (`cdnjs`, `unpkg`, `googleapis`). Cache name: `cyberschedule-v1.0.0`.

## No Tests / No CI

This project has no test suite, no linter configuration, and no CI/CD pipeline.
