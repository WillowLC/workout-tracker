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
npm run e2e:progress   # Playwright: progress features with demo data (hints, gyms, plateau, PRs, recaps)
npm run deploy         # commit if needed + push → auto-deploy
npm run icons          # regenerate the app icons + favicon
npm run media          # re-download/resize exercise photos (macOS)
```

The e2e scripts run against a preview server, which must already be running: `BASE_URL=http://localhost:4173/ npm run e2e`. They need Chromium, installed with `npx playwright install chromium`. They aren't part of CI.

The component gallery for design work is at **`/dev/components`**. It shows every key component in its main states, using mock data.

## Stack

React 18 + TypeScript + Vite · Tailwind CSS (layout only) · Zustand · Dexie (IndexedDB) · React Router · Recharts · dnd-kit (drag to reorder) · canvas-confetti · html-to-image · vite-plugin-pwa (Workbox) · Vitest · Playwright (e2e scripts). Confetti and html-to-image are bundled and precached, so they work offline.

## Folder structure

```
src/
  domain/        Pure logic, no React or DB. Everything here is unit-tested.
    types.ts       Data model (weights are always stored in kg)
    sets.ts        Set numbering, set-type toggling, placeholder commit on check-off
    previous.ts    PREVIOUS lookup + position matching
    records.ts     Best set, e1RM (Epley), volume, records, rep maxes
    prs.ts         Live PR detection (best set / e1RM / session volume) + the PR history table
    progression.ts Rep ranges + double-progression suggestions
    weightSteps.ts Weight steps per equipment, settings migration
    muscles.ts     Sets per muscle, weekly targets, muscle-map levels
    plateau.ts     Plateau detection
    volumeComparison.ts  Silly volume comparison picker
    recap.ts       Monthly / yearly recap aggregation
    demo.ts        Demo data generator
    superset.ts    Superset blocks, labels, next-set order
    workoutOps.ts  Immutable workout edits (add/remove/replace, link supersets, finish)
    templates.ts   Template <-> workout, structure comparison, template editing
    search.ts      Fuzzy library search + alphabetical sections
    units.ts       kg/lb conversion, clock parsing/formatting
    plates.ts csv.ts backup.ts history.ts
  data/          volumeComparisons.ts (the "that's about 7 grand pianos" library)
  db/            Dexie schema + migrations (db.ts), seed library (seed.ts), muscle tags (seedMuscles.ts), repository (repo.ts)
  store/         Zustand: appStore (data, write-through to IndexedDB), uiStore (toast, next-set highlight), pwaStore
  pwa/           Service-worker registration & update checks, persistent storage, install detection
  lib/           Formatting, file download, haptics, backup actions, confetti, PNG share, recap display
  components/    Visual components. Data comes in through props only, no fetching.
                 SetRow, SetTypeBadge, PreviousCell, BestLine, PRBadge, ExerciseCard,
                 SupersetBracket, WorkoutSummary, ExercisePicker, ExerciseList,
                 HistoryCard, Calendar, PlateCalculator, ReorderList, ExerciseForm, shell.tsx, ui.tsx,
                 ProgressionHint, Plateau, GymSelector, WeeklySets, MuscleMap, MuscleSelect, PRToast,
                 TrophyWall, VolumeComparisonLine, RecapCards
  screens/       Containers that connect the store and domain to components
  styles/        tokens.css (ALL colours/radii/fonts) + index.css
scripts/         icon generator, postbuild (404.html), deploy, e2e
```

### Restyling

Every colour, radius and font is a CSS variable in `src/styles/tokens.css` (muscle-map shading is `--heat-0` … `--heat-4`, hint chips `--color-hint-*`). `tailwind.config.js` maps Tailwind colour names (`bg-surface`, `text-muted`, `text-warmup`, `border-ss1`…) to those variables, so no component hard-codes a colour. A redesign only needs to change `tokens.css` and the files in `src/components/`. Screens contain almost no styling beyond layout.

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
- **Folders & weekly split:** folders still come from each template's `folder` name. Folder order and each folder's weekly plan (Monday to Sunday, one template or a rest day per day) are saved in the `folders` meta row and included in JSON backups. Tapping a folder opens its planner. On the Workout screen, the week strip and a "Today" badge show that day's template. Templates are reordered within their folder via `Template.order`; templates with no order sort last, by name.
- **"Last done"** counts calendar days ("Today", "Yesterday", "12 days ago") from the most recent finished workout started from that template.

## Progress & motivation (as implemented)

**Shared definitions**
- **Working sets** are completed normal, failure and drop sets. Warm-ups count only when *Count warm-ups in stats* is on.
- **Muscles:** chest, front/side/rear delts, lats, upper back, traps, lower back, biceps, triceps, forearms, abs, obliques, quads, hamstrings, glutes, adductors, abductors, calves. Every built-in exercise has primary and secondary tags (`src/db/seedMuscles.ts`). Custom exercises need a primary muscle when created or edited. Custom exercises made before this update have no tags; the Workout tab offers a one-time **Tag your custom exercises** card until they're tagged or you dismiss it. Exercises created from the picker's "Create …" shortcut are untagged too and show up in that card.
- **Rep ranges:** big barbell compounds (squat, bench, deadlift and RDL variations, overhead/push press, barbell rows, hip thrust, good morning) 5–8; isolation and cable exercises (curls, raises, flyes, extensions, pushdowns, face pulls, shrugs…) 10–15; other weighted exercises 8–12; reps-only, duration, distance, Olympic lifts and cardio have none. The default is a rule, not stored, so an exercise stores a range only when you change it (`null` = "No rep range"). Templates can override it per exercise (Template editor → *Rep range*).

**1. Progression hints** (`domain/progression.ts`)
- Range = template override → exercise → none. The workout's ⋯ menu shows **Rep range: 8–12**; saving updates the exercise default, and also the template's override if the template has one (so what you set is what you get).
- Decided from the sessions PREVIOUS draws from (same gym preference), using completed **normal and failure** sets. Drop sets and warm-ups are ignored here, because a drop set is lighter by design and would block "same weight".
  - **Increase:** every set reached the top of the range at one weight → `↑ Try last + step × min`.
  - **Consider lighter:** the last two sessions both had every set below the minimum, at the same weight → `↓ Consider last − step`, rounded to the step.
  - **Hold:** otherwise, if at least one set was in range → `→ Stay at W, aim for N+ reps`, where W is the heaviest in-range weight and N is the weakest set at that weight + 1 (capped at the top of the range): double progression needs every set to reach the top.
  - Nothing without a range, history, or a weight-based tracking type. For assisted exercises "increase" means less assistance (never below 0).
- Tapping the chip writes the weight into the exercise's not-yet-completed normal/failure sets (real values, not placeholders). Nothing changes automatically. Hints show only during a live workout, and can be turned off in Settings.

**2. Weekly sets per muscle** (`domain/muscles.ts`)
- +1 per working set for each primary muscle, +0.5 for each secondary. Weeks run Monday 00:00 to Monday 00:00 local time. Cardio exercises are tagged (for the recency map) but don't add weekly sets.
- Status against the target: under (< min), in range, over (> max). Target is global in Settings (default 10–20) with optional per-muscle overrides.
- Workout tab → **This week** (top 6, "Show all", untrained muscles collapsed). History → **Muscles** has the full list with ◀ ▶ week navigation; tapping a muscle shows its 12-week trend.

**3. Weight steps** (`domain/weightSteps.ts`)
- kg: Dumbbell 2 · Barbell / Smith 2.5 · Machine / Cable 5 · Kettlebell 4 · others 2.5. lb: Dumbbell 5 · Barbell / Smith 5 · Machine / Cable 10 · Kettlebell 9 · others 5. All editable in Settings → *Weight steps*.
- Per exercise: ⋯ menu → **Weight step** (e.g. a plate-loaded leg press at 2.5 kg). Effective step = `exercise.weightStepKg ?? settings.weightStepsKg[equipment]`, used by the ± stepper, hints and rounding.
- Migration: the old single *Weight increment* becomes the Barbell and Smith Machine step if it had been changed from its default (2.5 kg / 5 lb); otherwise every step gets its default.

**4. Gyms**
- The pin control at the top of the Workout tab picks the current gym (or **Add your gym**; everything works without one). New workouts are tagged with it; the active workout header shows the gym and tapping it changes it for that workout only (including "No gym").
- **PREVIOUS** (and progression hints) use the most recent session at the workout's gym. If there is none, they fall back to the most recent session anywhere, and the PREVIOUS header says **other gym** when that session was at a different gym. Gym-less workouts count as "anywhere" and aren't flagged, because it's unknown where they happened.
- BEST, PRs, plateaus and recaps stay global. The exercise **Records** tab has an optional gym filter. History cards and workout details show the gym. Deleting a gym keeps its workouts (they become gym-less). Gyms are included in JSON backups.

**5. Plateaus** (`domain/plateau.ts`)
- Plateaued = at least 4 sessions in the last 6 weeks, no new best set (weight-priority rule) and no new best e1RM within those 6 weeks, and the latest session within 14 days. With no history before the window, its first session is the baseline.
- Shown as **Plateau · N weeks** on the exercise card (N = weeks since the last record, at least 6) and in a Workout-tab card. Tapping opens ideas; **Dismiss for 4 weeks** snoozes it. A record set in the current workout hides the tag immediately; the alert clears for good once a new best or e1RM is in history.

**6. PR moments**
- Completing a set that sets any PR (existing detection) fires a short confetti burst and one toast listing every record that set broke, e.g. *New PR · Bench Press (Barbell) · 100 kg × 5 (was 97.5 kg × 5)*. With *prefers-reduced-motion* only the toast shows; with *Celebrations* off, neither. No vibration for PRs (the existing set-completion tick is unchanged).
- **PR history table** (`personalRecords` store): one row per exercise and kind (best set / e1RM / volume) per workout, holding the best value reached in that workout and the record that stood before it (no previous = first ever). So three best-set PRs in one session become one row: first record → final value. Rows are added on finish, and the whole table is rebuilt by replaying history when a past workout is edited or deleted, on import, when demo data is loaded or cleared, when *Count warm-ups in stats* changes, and during the v3 migration.
- The finish summary lists each PR as old → new. **History → Trophies** shows the table newest first by month, filterable by exercise and body part, with "N PRs this year"; tapping one opens its workout.

**7. Volume comparisons** (`domain/volumeComparison.ts`, `data/volumeComparisons.ts`)
- Volume = weight × reps over working sets of weight and weighted-bodyweight exercises (added weight only), the same number as the summary's Volume.
- Picker: items the volume fits 1–20 times; ranked by how nicely the count rounds (halves below 10, whole numbers from 10); random among the top 5; never one of the last 5 used. Nothing fits → the closest item with a decimal ("0.4 blue whales"). The pick is stored on the workout (`volumeComparisonId`), so re-opening shows the same item; the count follows the workout's volume if you edit it.
- 103 items from bowling balls to the Great Pyramid, spread evenly across ≤100 kg, 100 kg–1 t, 1–10 t, 10–100 t and 100 t+. Weights are approximate, shown as "approx.". Recaps and the lifetime line use a deterministic pick, so they don't change between visits.

**8. Recaps** (`domain/recap.ts`)
- Month or year: workouts, time, sets, reps, volume + comparison, ▲/▼ % vs the previous period (same length; "so far" compares with the same dates last year), new PRs and the biggest e1RM jump (%), heaviest single set (weight & reps exercises), most-trained exercise (working sets) and muscle (weekly-set counting), favourite weekday and time of day (morning < 12:00 ≤ afternoon < 17:00 ≤ evening), longest run of consecutive Monday–Sunday weeks with a workout, top gym (only if more than one was used), and the muscle map. Years add month-by-month volume, top 5 exercises, total PRs, "you vs a year ago" (best e1RM up to the period's end vs 12 months earlier) for the top 3 weighted lifts, and the lifetime line.
- Workout tab: the previous month's card all month (if it had workouts) until dismissed; from 1 December "Your YEAR so far"; in January the previous year's full recap. History → **Recaps** lists every month and year with data. **Share this card** exports the visible card as a PNG (native share sheet where supported, otherwise a download), offline.

**9. Muscle map** (`components/MuscleMap.tsx`)
- Inline SVG, front and back, one `<path>` per muscle side with `id` (e.g. `front-chest-l`) and `data-muscle`; shading from `--heat-0…4`. Placeholder artwork — replace the shapes freely.
- **Volume:** level 0 none, 1 under half the minimum, 2 under the minimum, 3 in range, 4 over the maximum, using average sets per week for longer periods (weeks elapsed so far for the current week/month). **Recency:** 0–2 days, 3–5, 6–9, 10+, never.
- History → Muscles: period chips (this week, last week, last 4 weeks, this month, pick a month) and a Volume/Recency toggle; tap a muscle for sets (primary vs secondary), days since last trained and the exercises that hit it. Workout details show a small map for that workout, where one session counts as half a week against the weekly target.

**Demo data** (Settings → Developer): ~14 months of push/pull/legs at two demo gyms, tagged `demo: true` (workouts and gyms). It's built so the bench press has an "↑ Try" hint, lateral raises a "↓ Consider" hint, the overhead press is plateaued, and the leg press is much lighter at the hotel gym. Demo workouts count in stats until cleared. **Clear demo data** deletes only tagged rows; real workouts that were tagged with a demo gym just lose the gym.

**Database v3 migration** (`src/db/db.ts`): adds the `gyms` and `personalRecords` stores, tags built-in exercises (custom ones stay untagged), migrates settings, and rebuilds the PR history from existing finished workouts. Existing workouts, templates, folders and meta rows are kept unchanged and get no gym. Tested in `db.migration.test.ts` (v1 → v3 and v2 → v3 with sample data).

## Decisions & assumptions

Where the brief didn't specify something, I followed Strong/Hevy:

- **Repo & hosting:** this folder had no remote, and the GitHub account had no `workout-tracker` repo. On request, a new **public** repo `WillowLC/workout-tracker` was created, so hosting is **GitHub Pages**.
- **First-ever sets are PRs.** The first time you log an exercise, your first set is a best-set PR, and so is any later set that beats it. Est. 1RM and volume PRs start from the next session, once there's a baseline.
- **Post-workout quotes and facts** come from a list of 100+ entries in `src/domain/inspiration.ts`. They are drawn from a shuffle bag saved on the device, so none repeats until you've seen them all.
- **Rep maxes** (Records tab) are the heaviest weight lifted for *at least* N reps. For example, 100×5 counts as a 3-rep max of 100.
- **Volume** in workout totals is weight×reps, counting only weight and weighted-bodyweight exercises. For an exercise's own "session volume" record:
  - assisted and reps-only exercises use total reps
  - duration exercises use total seconds
  - distance exercises use total distance
- **Assisted weight** is stored as a positive number of kg of assistance and shown with a minus sign (`-20 kg × 8`).
- **Time input** fills from the right like a stopwatch: typing `130` gives 1:30 and `3000` gives 30:00. Typing `m:ss` also works. **Distance** is entered in km and stored in metres.
- **The pound setting** uses a 45 lb bar and the lb weight steps (below). Switching units resets the bar weight and all weight steps to that unit's defaults. Weights are always stored in kg and converted only when displayed or typed in.
- **Finishing a workout:**
  - Unchecked sets that have values trigger a prompt: *Complete them* or *Discard them*.
  - Empty unchecked sets are always dropped, and so are exercises with no completed sets.
  - A workout with no completed sets can't be saved.
- **Replace exercise** keeps the number and types of sets but clears their values, because the old values belonged to the other exercise.
- **Undo** (after deleting a set, exercise, workout or template) restores the state from just before the delete. The toast stays for 5 seconds.
- **Moving to the next set** highlights the row and scrolls it into view. It doesn't open the keyboard.
- **Editing a past workout:** only checked-off sets are kept. The duration can be edited. Records and PRs are recalculated automatically: BEST and live PR badges are derived from history, and the stored PR history table is rebuilt whenever a past workout is edited or deleted.
- **Built-in exercises** can't be renamed, deleted or archived, but you can give them a note. Custom exercises can be edited and archived; archiving keeps their history. Creating an exercise from the picker's "Create …" shortcut uses Other / Other / weight & reps, which you can change later in Exercises.
- **The library** is seeded with about 180 exercises. Seeded exercises have stable IDs (`seed-bench-press-barbell`), so re-seeding after an update only adds new ones and never overwrites your notes.
- **Backups:** the JSON backup includes the in-progress workout and your settings. *Merge* only adds items whose IDs aren't already present. *Replace* wipes the current data first. The CSV has one row per set, with weight in your chosen unit.
- **Exercise guides and photos:** every built-in exercise has original how-to steps, form cues and common mistakes, written for Jim (`src/db/guides/`). Strong's own photos, videos and text are copyrighted, so they aren't used. Photos and muscle data for 159 of the 183 exercises come from [free-exercise-db](https://github.com/yuhonas/free-exercise-db), which is public domain. Exercises without a genuinely matching photo keep a placeholder. Thumbnails are bundled for offline use; full photos are cached the first time you open an exercise. To change a mapping, edit `scripts/exercise-media-map.json` and run `npm run media` (macOS, uses `sips` to resize).
- **Storage:** at startup the app calls `navigator.storage.persist()`, and Settings shows whether it was granted.
- **Icons** use the Jim wordmark (dumbbell as the "i"). `npm run icons` regenerates them from `scripts/jim-logo.json`.
