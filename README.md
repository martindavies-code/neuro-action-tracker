# RhythmQuest 1.1

A local-first daily action tracker with a single-task focus view and optional game elements.

[Open RhythmQuest](https://martindavies-code.github.io/neuro-action-tracker/)

## What is included

- A temporary tutorial with a one-time 20 XP welcome reward. Choose an empty list, mornings or all seven starter routines. Replaying does not change existing routines or award the bonus again.
- Daily, one-off and selected-weekday tasks, editable effort rewards and per-day steps. Task creation starts with a title; other fields are optional.
- An on-device step helper using keyword templates, not a remote AI model or clinical assessment. Suggestions can be edited or removed before use. Non-English output uses safe, general starting steps. Health administration is separate from reminders to follow an existing prescribed plan. Never use this app to decide medication doses.
- A deadline-based focus timer with pause, two-minute starts and local session recovery. Low and moderate energy filters also apply to Focus and task roulette.
- Recorded shield-protected dates and creation-aware history. Editing or archiving a task keeps historical schedule/reward snapshots from before that change. Previously deleted tasks or already-overwritten schedules cannot be reconstructed.
- Quiet, Playful and custom preferences. XP, streaks, celebrations, quotes and companions are independently optional; hiding them does not erase achievements.
- Four illustrated companions: Pip the Sproutling, Mochi the Fox, Nova the Cosmic Cat and Bubbles the Calm Turtle. Each has three stages.
- Reduced motion, browser zoom, keyboard-contained dialogs, compact cards, a movable reading guide, optional Lexend and bold word starts. These are personal reading choices, not guaranteed treatments.
- Chime feedback and synthesized ambient sounds. There are no separate retro/water/bamboo audio packs.
- English, Spanish, French, German, Japanese, Portuguese, Italian, Chinese and Korean interface dictionaries. Navigation, tutorial, settings, task editing, focus, step previews, analytics, badges, recovery prompts and accessibility labels use the selected language. All eight non-English synthetic journeys and dictionary parity are tested. Companion names, XP and user-authored task content stay unchanged. Translations have not had native-speaker editorial review.

## Data, backup and privacy

Tasks, settings, progress and focus sessions stay in this browser's local storage. There is no account or cloud sync. Clearing site data, private browsing, browser eviction or switching devices can lose this data. Export backups regularly.

Import validates and previews task count before replacement and saves a recovery copy first. A pre-1.1 raw snapshot is also kept locally once. Exported JSON contains task titles, descriptions, steps and progress; keep it private if those are sensitive. Save failures are surfaced instead of silently ignored. Recovery copies use the same browser storage and are not a substitute for an exported backup.

Fonts, including a Korean glyph fallback, are bundled locally under their SIL Open Font Licenses. The initial app visit and updates need GitHub Pages. After a complete online load and service-worker installation, the built app shell and lazy chunks are precached for offline use. Read-aloud depends on voices installed on the device. Offline support is tested in Chromium, not guaranteed for every browser/device. An update prompt activates a waiting version only when chosen and leaves local data keys intact.

## Development and verification

```sh
npm ci
npm test
npm run lint
npm run build
```

Optional synthetic browser journeys:

```sh
pip install playwright
# Install Chromium or adjust executable_path in test/journeys.py.
npm run build
npm run test:journeys
python3 test/languages.py
```

The existing 51 service tests remain, with fixed historical fixtures, plus targeted regressions for shields, historical schedules, zero XP, imports/rollback, settings and translated step output. Browser journeys use isolated synthetic data, not a user's saved tasks. They cover tutorial replay, create/complete/undo, timer recovery, keyboard containment, comfort controls and offline reload at 320/390/1280 widths. This is not a full screen-reader or physical-device audit.

The existing main-to-GitHub-Pages deployment and repository synchronization rules are unchanged. See AGENTS.md and DEPLOYMENT.md. MIT license for application code; font licenses are in src/assets.
