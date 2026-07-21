# Dream Drop — Project README

**A gamified, basketball-themed web application for inclusive learning**
Built for Sri Sathya Sai Vidya Vahini (SSSVV) · Internship Project

---

## 1. What Is Dream Drop?

Dream Drop is a browser-based educational game that helps children practice mouse
movement and accuracy by dragging a ball into a basket while avoiding obstacles.
It's built with plain HTML5, CSS3, and vanilla JavaScript, with `localStorage` as
the data layer — no server, no database, works fully offline on a shared classroom
device.

On top of the core game sit four systems that turn a simple drag-and-drop exercise
into a full learning platform: **player profiles**, **progress tracking**, a
**badge/reward system**, and a **teacher-facing host dashboard**. These four
systems are my contribution to the project, and this README documents them in
detail — along with the full build history, try 1 through try 22.

---

## 2. My Contribution

### 🧑‍🤝‍🧑 Player Profile System
The foundation every other system is built on. Supports multiple children sharing
one device, each with their own saved progress.
- `loadPlayers()` / `savePlayers()` — read and persist the player registry
- `selectPlayer()` / `deletePlayer()` — switch or remove a profile
- `getStorageKey()` — namespaces each player's data (`dreamdrop_progress_<id>`)
  so profiles never overwrite each other
- A photo **or emoji-avatar** picker for creating a profile without needing a camera
- A Settings panel to raise/lower the player limit safely, based on the actual
  browser's storage capacity

### 📈 Progress Tracker
The engine that records what a player has done, level by level.
- `loadProgress()` / `saveProgress()` — read/write each player's progress as JSON
- `recordLevelStart()` / `recordLevelComplete()` — attempts, best time, first-try
  detection, with a `wasFirst` guard so replays don't inflate totals
- `recordPlayTime()` — accumulates total session time

### 🏅 Badge System
Turns milestones into small celebrations.
- `BADGE_DEFS` — 13 badge definitions (speed, accuracy, streaks, endurance, etc.)
- `checkBadges()` — evaluates which badges were newly earned after each level
- `showRewardPopup()` — animated in-game badge celebration with emoji particles
- `injectLevelStats()` — post-level summary overlay

### 🧑‍🏫 Host Dashboard
Gives a teacher a live, class-wide view — with no server required.
- `loadPlayerProgress()`, `buildDashboard()`, `buildClassSummary()`,
  `renderStudentGrid()` — aggregate every enrolled student's saved progress
  into class totals and per-student cards
- Sorting and filtering students, jumping into a student's account, and
  resetting an individual student's progress
- A **Path Analysis** view per student: draws their actual mouse path next to
  the ideal path for each level, with an efficiency score and auto-generated
  coaching tips for the teacher

---

## 3. The Build Journey — Try 1 to Try 22

The project evolved through 22 saved iterations. Early tries (1–14) built the
core game and got it working reliably; the later "vacation changes" phase
(15–22) is where the profile, progress, badge, and host-dashboard systems above
were designed and hardened.

| Try | Focus | What changed | Difficulty faced & how it was solved |
|----|--------|--------------|----------------------------------------|
| **1** | For levels | Built the initial level structure and scaffolded the core progress/badge engine (`BADGE_DEFS`, `checkBadges`, `loadProgress`) | Starting the game and data model from nothing — got a single-player version working end to end |
| **2** | For roadmap | Planning pass for the level-roadmap page | Design/concept stage, no separate build carried forward |
| **3** | Dev of levels | Expanded level content and logic (~330 more lines) | Growing the level set without breaking existing ones |
| **4** | — | Cleanup pass after Try 3 | Minor refactor/trim |
| **5a** | For mobile | First touch/mobile support attempt | Dragging a ball works differently with touch vs. a mouse |
| **5b** | Mouse analytics, image update | Added a mouse-movement analytics dashboard + refreshed art assets | Largest single jump in code size — new feature and new assets landed together |
| **6** | Full mobile | Finished and consolidated mobile support (simulated mouse events from touch input) | Coarse-pointer detection so touch devices reuse the existing `startDrag()` logic instead of a separate code path |
| **7** | Login (no mouse analytics) | Added `login.html` and introduced `getStorageKey()` — the first per-player namespacing | **The login rewrite silently deleted the entire mouse-analytics dashboard code.** Known regression at the time (hence the folder name) — not yet fixed here |
| **8** | Database | Added `firebase-config.js` / `firebase-sync.js` to try cloud sync | Mouse analytics still not restored; cloud sync added complexity without solving the missing feature |
| **9** | Animation + mouse analytics | Rebuilt the mouse-analytics dashboard and added animation polish | Fixed the Try 7 regression — analytics dashboard working again alongside per-player logins |
| **10** | Task bar | Added an in-game HUD taskbar (level number, pause control) | The game would **spuriously auto-pause right after loading** (a stray browser blur event). Fixed with a `_pageReady` grace-period flag that ignores blur events for the first ~2 seconds |
| **11** | Animations | Further animation refinement | UI polish pass |
| **12** | Final task bar | Finalized the taskbar feature | Stabilized after Try 10's fix |
| **13** | Timer add | Added a level timer to the taskbar | Extending the taskbar without reopening the pause bug |
| **14** | — | Stabilization checkpoint | Clean baseline going into the "vacation changes" phase |
| **15** | Baseline | Stable starting point for the profile/progress/badge/host work below | — |
| **16** | Boy/girl login | Added an emoji-avatar picker (Boy/Girl tabs, 20 avatars each) as an alternative to the camera | Not every device has a camera, and some kids didn't want their photo taken. Solved by generating an inline SVG avatar from the chosen emoji and feeding it through the same photo slot the camera flow uses |
| **17** | Max players | Early pass at a configurable player limit | This snapshot shows no net code change from Try 16 — the real feature lands fully in Try 18 |
| **18** | Host & player changes | Built the full **Settings panel**: adjustable max-player stepper, live storage/memory usage bar, Host/Teacher assignment (crown badge), a host-suggestion banner, and a "reset all data" option | Different browsers cap `localStorage` very differently (~10 MB Chrome, ~5 MB Safari, ~2 MB UC Browser) — a fixed player cap either wasted space or risked hitting quota. Solved by estimating real available storage at runtime (`navigator.storage.estimate()`, with a manual write-probe fallback) and capping the limit at 60% of that |
| **19** | Different browsers | Added a searchable browser-reference table (Chrome, Firefox, Safari desktop/iPhone/iPad, Edge, Opera, Samsung Internet, Brave, UC Browser) so a teacher can manually pick their exact browser | `navigator.storage.estimate()` isn't reliable on every platform (notably iOS Safari). Solved with a maintained reference table as a manual override alongside the automatic probe |
| **20** | Host | Built `host-dashboard.html` — per-student progress cards, class-wide summary stats, and a "Teacher Dashboard" button that only appears for the assigned Host player | Needed a class-wide view with **no backend server**. Solved by having the dashboard read every player's already-namespaced `localStorage` entry directly, since all profiles live on the same shared device |
| **21** | Sound button | Fixed background music that silently failed to autoplay | Browsers block audio autoplay until the user interacts with the page. Solved by catching the rejected `play()` promise and retrying playback on the very first click, touch, or key press |
| **22** | Path points | Added `path-analysis.js` — a full mouse-path scoring engine (Dijkstra-based ideal-path routing around obstacles, alternate-path generation, hesitation/detour/collision detection, and auto-generated coaching tips), wired into a new **Path Analysis** view inside the Host Dashboard | Nine distinct bugs were found and fixed while building this, documented inline as FIX 1–9: a shadowed loop variable during path reconstruction, an unused leftover parameter, an off-by-one in path down-sampling, a `NaN` caused by missing timestamp data, a stale call site after a function-signature change, a crash from unguarded metrics access, an escaped-apostrophe rendering glitch, unclear variable naming, and the wrong order-of-operations in win detection. Also replaced the dashboard's old "fall back to a flat legacy storage key" logic with a self-healing recount of completed levels straight from each player's saved data, fixing a drift bug where the progress counter could fall out of sync with reality |

---

## 4. Tech Stack

| Layer | Choice |
|---|---|
| Structure/Style | HTML5, CSS3 (`clamp()`, `vw`/`vh` for responsive scaling) |
| Logic | Vanilla JavaScript (no framework) |
| Data | `localStorage`, JSON-serialized, namespaced per player |
| Cloud (experimental) | Firebase (`firebase-config.js` / `firebase-sync.js`), currently a disabled stub |
| Analytics | Custom mouse-tracking + Dijkstra-based path-efficiency scoring |

---

## 5. Key Takeaways

- **Namespacing early pays off.** Introducing `getStorageKey()` back in Try 7
  made every later multi-player feature (avatars, host dashboard, path
  analytics) straightforward to bolt on.
- **Regressions happen with big rewrites.** The login rewrite in Try 7 broke
  mouse analytics without anyone intending it — a reminder to verify existing
  features still work after a structural change, not just the new one.
- **Don't assume one browser.** The player-limit work (Try 17–19) only became
  robust once real storage quotas across different browsers were accounted for
  instead of a single hard-coded number.
- **A backend isn't always necessary.** The Host Dashboard delivers a genuine
  class-wide teacher view by reading shared `localStorage`, with no server.
