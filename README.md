# Jim — workout tracker

A minimal, local-first workout logger in the style of Strong/Hevy. It's an installable PWA that works fully offline. There's no backend and no account. All data stays on your device, in IndexedDB.

**Live app:** https://willowlc.github.io/workout-tracker/

> ⚠️ **Never change the domain or base path** (`/workout-tracker/`). Browser data is tied to the URL's origin, so the app at a new URL starts empty. If you ever have to move it: **Settings → Export JSON backup**, switch to the new URL, then **Import**.
>
> ⚠️ **On iOS, removing the home-screen app deletes its data.** Export a backup first.

## Install on your phone

- **iPhone (Safari):** open the live URL → Share button → **Add to Home Screen**. On iOS, an installed app keeps its storage more reliably than a Safari tab.
- **Android (Chrome):** open the live URL → ⋮ menu → **Install app** (or accept the install prompt).

After the first load the app works in airplane mode, including a cold start.

## Updates

1. Push to `main`, or run `npm run deploy`, which commits any pending changes and pushes.
2. GitHub Actions (`.github/workflows/deploy.yml`) runs `npm ci`, `npm test` and `npm run build`, then publishes to GitHub Pages.
3. Open copies of the app check for updates at startup, when they come back to the foreground, every 60 minutes, and when you tap **Settings → Check for updates**. When a new version has been downloaded, an **"Update available — Reload"** banner appears.
   - During a workout the app never reloads. The banner shows only on the Workout tab, and the update is applied after you finish or cancel.
4. Updates never touch your data. Schema changes go through Dexie versioned migrations (`src/db/db.ts`), and there's a test for them.

## Development

```bash
npm install
npm run dev            # dev server
npm test               # Vitest: domain rules + DB migration
npm run build          # type-check + production build (base "/")
npm run build:pages    # production build with the GitHub Pages base path
npm run preview        # serve the build (use preview:pages after build:pages)
npm run e2e            # Playwright: full "definition of done" scenario + offline cold start
npm run e2e:update     # Playwright: update banner flow (rebuilds while the app is open)
npm run deploy         # commit if needed + push → auto-deploy
npm run icons          # regenerate the app icons + favicon
npm run media          # re-download/resize exercise photos (macOS)
```

The e2e scripts run against a preview server, which must already be running: `BASE_URL=http://localhost:4173/ npm run e2e`. They need Chromium, installed with `npx playwright install chromium`. They aren't part of CI.

The component gallery for design work is at **`/dev/components`**. It shows every key component in its main states, using mock data.

## Stack

React 18 + TypeScript + Vite · Tailwind CSS (layout only) · Zustand · Dexie (IndexedDB) · React Router · Recharts · dnd-kit (drag to reorder) · vite-plugin-pwa (Workbox) · Vitest · Playwright (e2e scripts).

## Folder structure

```
src/
  domain/        Pure logic, no React or DB. Everything here is unit-tested.
    types.ts       Data model (weights are always stored in kg)
    sets.ts        Set numbering, set-type toggling, placeholder commit on check-off
    previous.ts    PREVIOUS lookup + position matching
    records.ts     Best set, e1RM (Epley), volume, records, rep maxes
    prs.ts         Live PR detection (best set / e1RM / session volume)
    superset.ts    Superset blocks, labels, next-set order
    workoutOps.ts  Immutable workout edits (add/remove/replace, link supersets, finish)
    templates.ts   Template <-> workout, structure comparison, template editing
    search.ts      Fuzzy library search + alphabetical sections
    units.ts       kg/lb conversion, clock parsing/formatting
    plates.ts csv.ts backup.ts history.ts
  db/            Dexie schema + migrations (db.ts), seed library (seed.ts), repository (repo.ts)
  store/         Zustand: appStore (data, write-through to IndexedDB), uiStore (toast, next-set highlight), pwaStore
  pwa/           Service-worker registration & update checks, persistent storage, install detection
  lib/           Formatting, file download, haptics, backup actions
  components/    Visual components. Data comes in through props only, no fetching.
                 SetRow, SetTypeBadge, PreviousCell, BestLine, PRBadge, ExerciseCard,
                 SupersetBracket, WorkoutSummary, ExercisePicker, ExerciseList,
                 HistoryCard, Heatmap, PlateCalculator, ReorderList, ExerciseForm, shell.tsx, ui.tsx
  screens/       Containers that connect the store and domain to components
  styles/        tokens.css (ALL colours/radii/fonts) + index.css
scripts/         icon generator, postbuild (404.html), deploy, e2e
```

### Restyling

Every colour, radius and font is a CSS variable in `src/styles/tokens.css`. `tailwind.config.js` maps Tailwind colour names (`bg-surface`, `text-muted`, `text-warmup`, `border-ss1`…) to those variables, so no component hard-codes a colour. A redesign only needs to change `tokens.css` and the files in `src/components/`. Screens contain almost no styling beyond layout.

## Domain rules (as implemented)

- **Exercise memory is global.** History belongs to the exercise, not to a workout or template.
- **PREVIOUS** comes from the most recent *finished* workout that contains the exercise, whichever workout or template that was. The in-progress workout is ignored. Rows are matched by position: warm-ups match warm-ups, and every other set type matches by position among the non-warm-up sets. Extra rows reuse the last set of the same kind. If there's no history, the cell shows `—`.
- **Placeholders:** PREVIOUS values appear as grey ghost text in the inputs. Checking a set off without typing saves those values. Tapping the PREVIOUS cell copies its values into the inputs. If there's no history, a template's target reps are used as the reps placeholder.
- **Ad-hoc exercises** start with as many sets as last time's working sets (normal + failure), with a minimum of 1.
- **BEST:** heaviest weight wins, and reps break ties. So 100×5 beats 97.5×10, and 100×6 beats 100×5. Warm-ups are excluded unless *Count warm-ups in stats* is on. Normal, drop and failure sets all count. Per tracking type:
  - weighted bodyweight: most added weight, then reps
  - assisted: **least** assistance, then reps
  - reps-only: most reps
  - duration: longest
  - distance: longest distance, then fastest time
- **e1RM** uses Epley: `w × (1 + reps/30)`. For 1 rep it's the weight itself. It isn't estimated above 12 reps.
- **PRs:** best set, best e1RM and best single-session volume for the exercise. Sets are replayed in the order they were completed, so a later set in the same workout has to beat the earlier ones too. The volume PR goes to the set that pushes the session past the old record.
- **Set types:** tap the set number to choose one.
  - Normal and failure (F) sets are numbered.
  - Warm-up (W) and drop (D) sets aren't numbered. Drop sets are indented under the set before them.
  - Choosing the current type again switches the set back to Normal.
- **Supersets:** use "Superset with…" from the set menu or the exercise's ⋯ menu. Groups of three or more exercises work too.
  - Completing a set moves the highlight to the same round of the next exercise in the group (A1 → B1 → A2).
  - Warm-ups aren't part of the rounds: an exercise's warm-ups come before its first working set, so A's first working set still pairs with B's.
  - A set with a drop set after it goes to that drop set first.
  - Groups are saved in history and in templates, and drag-reordering moves a whole group together.
- **No rest timer.** It was removed on request.
- **Haptics:** completing a set gives a short tick. Android uses the Vibration API. iPhones don't support it, so on iOS 18+ the app toggles a hidden native switch, which plays the system haptic; older iOS gets nothing.
- **Templates** store structure only: exercises, set types, supersets and optional target reps. Weights always come from PREVIOUS.

## Decisions & assumptions

Where the brief didn't specify something, I followed Strong/Hevy:

- **Repo & hosting:** this folder had no remote, and the GitHub account had no `workout-tracker` repo. On request, a new **public** repo `WillowLC/workout-tracker` was created, so hosting is **GitHub Pages**.
- **No PR on a first-ever session.** The first time you log an exercise sets the baseline, so the summary isn't filled with "PRs".
- **Rep maxes** (Records tab) are the heaviest weight lifted for *at least* N reps. For example, 100×5 counts as a 3-rep max of 100.
- **Volume** in workout totals is weight×reps, counting only weight and weighted-bodyweight exercises. For an exercise's own "session volume" record:
  - assisted and reps-only exercises use total reps
  - duration exercises use total seconds
  - distance exercises use total distance
- **Assisted weight** is stored as a positive number of kg of assistance and shown with a minus sign (`-20 kg × 8`).
- **Time input** fills from the right like a stopwatch: typing `130` gives 1:30 and `3000` gives 30:00. Typing `m:ss` also works. **Distance** is entered in km and stored in metres.
- **The pound setting** uses a 45 lb bar and 5 lb steps. Switching units resets the bar weight and step size to that unit's defaults. Weights are always stored in kg and converted only when displayed or typed in.
- **Finishing a workout:**
  - Unchecked sets that have values trigger a prompt: *Complete them* or *Discard them*.
  - Empty unchecked sets are always dropped, and so are exercises with no completed sets.
  - A workout with no completed sets can't be saved.
- **Replace exercise** keeps the number and types of sets but clears their values, because the old values belonged to the other exercise.
- **Undo** (after deleting a set, exercise, workout or template) restores the state from just before the delete. The toast stays for 5 seconds.
- **Moving to the next set** highlights the row and scrolls it into view. It doesn't open the keyboard.
- **Editing a past workout:** only checked-off sets are kept. The duration can be edited. Records and PRs are recalculated automatically, because they're always derived from history rather than stored.
- **Built-in exercises** can't be renamed, deleted or archived, but you can give them a note. Custom exercises can be edited and archived; archiving keeps their history. Creating an exercise from the picker's "Create …" shortcut uses Other / Other / weight & reps, which you can change later in Exercises.
- **The library** is seeded with about 180 exercises. Seeded exercises have stable IDs (`seed-bench-press-barbell`), so re-seeding after an update only adds new ones and never overwrites your notes.
- **Backups:** the JSON backup includes the in-progress workout and your settings. *Merge* only adds items whose IDs aren't already present. *Replace* wipes the current data first. The CSV has one row per set, with weight in your chosen unit.
- **Exercise guides and photos:** every built-in exercise has original how-to steps, form cues and common mistakes, written for Jim (`src/db/guides/`). Strong's own photos, videos and text are copyrighted, so they aren't used. Photos and muscle data for 159 of the 182 exercises come from [free-exercise-db](https://github.com/yuhonas/free-exercise-db), which is public domain. Exercises without a genuinely matching photo keep a placeholder. Thumbnails are bundled for offline use; full photos are cached the first time you open an exercise. To change a mapping, edit `scripts/exercise-media-map.json` and run `npm run media` (macOS, uses `sips` to resize).
- **Storage:** at startup the app calls `navigator.storage.persist()`, and Settings shows whether it was granted.
- **Icons** use the Jim wordmark (dumbbell as the "i"). `npm run icons` regenerates them from `scripts/jim-logo.json`.
