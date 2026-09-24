# Jim: design brief

Jim is a workout tracker, and this brief is for redesigning its interface. The app is built and working; this pass changes only how it looks and feels, not what it does. The logic, data and flows below are fixed. Everything visual can change: colour, type, spacing, shape, icons, motion, layout within a screen, and how controls are presented.

- **Live app:** https://willowlc.github.io/workout-tracker/
- **Component gallery** (every component in its main states, with sample data): https://willowlc.github.io/workout-tracker/dev/components

---

## 1. What Jim is

Jim is for logging strength training while you're actually at the gym. It follows the model of the apps Strong and Hevy: pick exercises, log sets of weight × reps, check each set off, repeat. Its main value is **memory**. For every set, it shows what you lifted last time and pre-fills those numbers, so logging a set usually takes a single tap.

**Name and personality:** "Jim", a play on "gym". Friendly and plain, without being loud. The current app icon is a placeholder, a white "L" on dark slate. Replace it.

**Who uses it and where:**
- One person, mostly on a phone in a gym. They're sweaty and between sets, glancing at the screen for a few seconds, often using one hand, often in poor or bright lighting.
- It's installed to the phone's home screen and used offline. It runs full screen, with no browser bar.
- It's used on a desktop occasionally, for reviewing history and editing templates.

**What the design needs to do, in priority order:**
1. **Logging a set is fast and hard to get wrong.** The active-workout screen is ~90% of usage. Numbers must be large and readable at arm's length, tap targets big (minimum 44 px, ideally more), and a completed set must look clearly different from a pending one.
2. **Last time and your best are easy to see.** PREVIOUS and BEST are the app's main value, so make them clear without letting them crowd the numbers you're entering now.
3. **Personal records feel rewarding.** A small celebratory moment is fine, as long as it's quick and doesn't block the next set.
4. **Everything else stays calm.** History, library and settings should be clean, quiet and easy to scan.

---

## 2. Platform constraints (do not break)

- **Mobile first.** Design at 390 × 844 (iPhone 14/15). The layout must also work from 360 px up to desktop; on desktop the content sits in a centred column up to about 672 px wide.
- **Installed app, full screen.** Respect the iPhone notch and home-indicator areas (safe areas) at the top and bottom.
- **Light and dark mode.** Both follow the system setting. Design both.
- **Number entry uses the phone's own numeric keypad.** Don't design a custom keypad; do design the input fields.
- **Nothing can depend on hover.** Everything must work with touch alone, so hover can't be the only way to reveal anything.
- **Accessibility:**
  - Visible focus states.
  - Text contrast of at least 4.5:1, and 3:1 for large numbers and icons.
  - Set types and supersets can't be told apart by colour alone. The letter labels (W, D, F, and the superset letter A, B…) must stay.
- **Fonts must work offline.** A custom font is fine, but it will be bundled with the app, so keep it to one or two weights. Numbers need fixed-width (tabular) figures so columns line up.
- **Motion:** subtle only, and it must respect the phone's reduce-motion setting.
- **Build constraint:** styling is Tailwind CSS plus CSS variables. The deliverable should be expressible as design tokens plus per-component styling (see §7).

---

## 3. Navigation map

A bottom tab bar has four tabs, and it shows on every screen that isn't full screen.

| Tab | Route | Purpose |
|---|---|---|
| **Workout** (home) | `/` | Start an empty workout, or start from a template |
| **History** | `/history` | Past workouts, plus a heatmap of training days |
| **Exercises** | `/exercises` | Searchable exercise library |
| **Settings** | `/settings` | Units, timers, backup, app info |

These screens are full screen, with no tab bar:
- **Active workout** (`/workout`)
- **Workout summary** (`/workout/summary`)
- **Template editor** (`/templates/:id`)
- **Edit past workout** (`/history/:id/edit`)
- **Exercise picker**: an overlay that can open from several places

**Floating layers** sit above the tab bar, stacked from the bottom up:
1. **ResumeBar**: shows on every tab while a workout is in progress. It gives the workout name and elapsed time. Tapping it opens the workout.
2. **Toast**: a short message, often with an "Undo" action. It lasts 5 seconds.

**Banners** appear at the top of a screen's content:
- **Update available — Reload**
- **Back up your data** (History tab)
- **Install to home screen** hint (Workout tab)

**Bottom sheets** are used for all menus and confirmations. On phones they slide up from the bottom; on desktop they appear as a centred dialog.

---

## 4. Screens

### 4.1 Workout (home)
- A large primary button, **"Start empty workout"**. It becomes **"Resume '<name>'"** when a workout is already in progress.
- A **Templates** section with a "+ Template" button. Template cards sit in a grid and are grouped under folder headings. Each card shows the template name, a truncated list of its exercise names, and when it was last done ("Last: 3 days ago").
- **Tapping a template opens a preview sheet** containing:
  - the template name and folder
  - when it was last done
  - its exercises, each as "3 × Bench Press (Barbell)", marked "superset" where they're grouped
  - a big **Start Workout** button
  - small Edit, Duplicate and Delete buttons
- **Empty state** (no templates): explain what templates are and how to make one.

### 4.2 Active workout (the most important screen)
- **Sticky header:** a minimise button (▼), the elapsed time in the centre (for example 42:13), and a **Finish** button.
- **Below the header:** an editable workout name, which defaults to something like "Evening Workout", and an optional note field.
- **A list of ExerciseCards (§5).** Exercises in a superset sit next to each other inside a coloured **SupersetBracket** labelled "Superset A", "Superset B" and so on.
- **"+ Add Exercises"** opens the library picker, where you can select several exercises at once.
- **"Cancel Workout"** is a quiet, danger-coloured text button at the very bottom.
- **Menus (bottom sheets):**
  - **Set menu** (tap a set number): Warm-up / Drop set / Failure / Normal, then "Superset with…", then "Delete set".
  - **Exercise ⋯ menu:**
    - Session note
    - Exercise note (every time)
    - Superset with…
    - Remove from superset (only when the exercise is in one)
    - Replace exercise
    - Reorder exercises
    - Remove exercise (danger)
  - **Reorder sheet:** a drag list with ↑/↓ buttons. Exercises in a superset move together as one row.
  - **Rest-time sheet:** Use default, Off, 0:30, 1:00, 1:30, 2:00, 2:30, 3:00, 4:00, 5:00.
  - **Plate calculator sheet:** shows which plates go on each side of the bar (see §5).
- **Finish flow:**
  - If some sets have numbers entered but aren't checked off, a sheet asks what to do: "Complete them" or "Discard them".
  - Then the Summary screen opens.

### 4.3 Workout summary
- "Workout complete", the workout name and the date.
- Three stat tiles: **Duration**, **Volume** (for example "8,450 kg") and **Sets**.
- A **Personal records** list, one row per record, like "Bench Press (Barbell) — 102.5 kg × 5 · Best set, Est. 1RM". When there are none it reads "No new records this time". This is the celebration moment.
- Buttons:
  - "Update template '<name>'": only when the workout was started from a template and its structure changed.
  - "Save as new template"
  - **Done** (primary)

### 4.4 History
- A **heatmap** of the last 16 weeks. Each column is a week and each row a day (Mon–Sun); days with a workout are filled in.
- Workouts are grouped under month headings ("SEPTEMBER 2026").
- **HistoryCard:**
  - the workout name and date and time
  - a line with duration, volume, and a PR count if there were any
  - a two-column mini table: "3 × Bench Press (Barbell)" on the left, that exercise's best set ("100 kg × 5") on the right
- **Workout detail** (tap a card):
  - a stats line and the workout note
  - each exercise with all its sets, using the set-type labels (W/1/2/D/F), PR badges on the sets that set records, and superset brackets
  - actions: **Repeat workout** (primary), Save as template, Delete workout, and Edit in the header
- **Empty state:** "No workouts yet" with a "Start a workout" button.
- **Backup reminder banner:** "Back up your data" with Export and dismiss buttons.

### 4.5 Exercises (library)
- A search field. Search is fuzzy, so "bnch" finds Bench.
- Filter chips for **Body part ▾** and **Equipment ▾**. Each expands a wrap of selectable chips. There's also a "Clear" chip, and an "Archived" toggle for exercises you've hidden.
- A **"Recently used"** section at the top, then an A–Z list with sticky letter headers.
- Each row shows the exercise name on one line and "Chest · Barbell" below it, plus "· Custom" for exercises the user created. In multi-select mode (when adding exercises to a workout), each row has a round checkmark on the right.
- **"+ New"** opens a form for a custom exercise: name, body part, equipment, what to track, and a note.
- **The library is large:** about 180 exercises. Names follow Strong's pattern, "Movement (Equipment)", so they can be long: "Triceps Pushdown (Cable - Straight Bar)", "Knee Raise (Captain's Chair)".

### 4.6 Exercise detail
- The header shows the exercise name and an Edit button. Below it: "Chest · Barbell", then the exercise's note, marked with a 📌.
- There are three tabs: **History | Records | Charts**.
  - **History:** one card per session: workout name, date, and the sets.
  - **Records:**
    - a card with Best set, Best estimated 1RM, Best session volume and number of sessions
    - a **Rep maxes** table: the heaviest weight lifted for at least 1, 2, 3, 5, 8, 10 and 12 reps
  - **Charts:** three line charts over time: best-set weight, estimated 1RM, and volume.

### 4.7 Template editor
- Name and folder fields. The folder field suggests existing folders as you type.
- Exercise cards, simpler than in a workout. Each set row has a set-type badge, an optional "target reps" number and a ✕ to remove it. There's "+ Add Set", and a ⋯ menu with Superset with… / Remove from superset / Reorder / Remove.
- "+ Add Exercises", plus Cancel and Save in the header.

### 4.8 Settings
Settings is a grouped list: a label on the left (with an optional hint beneath it) and a control on the right.
- **Workout:**
  - Units: a kg/lb segmented control
  - Weight increment: a number
  - Barbell weight: a number
  - Count warm-ups in stats: a switch
  - Show RPE column: a switch
- **Data:**
  - Export JSON backup, with "Last backup: …" beneath it
  - Import JSON backup, which opens a confirmation sheet with Merge and Replace
  - Export CSV
  - Persistent storage status, shown as ✅ or ⚠️ with an explanation
- **App:** the version and build date, and a "Check for updates" button that becomes "Reload" when an update is ready.
- **Reset all data:** a danger button that asks for confirmation twice.

---

## 5. Component inventory

These are the building blocks, named as they are in the code. Each one gets its data from the screen that uses it (it doesn't load anything itself), so its states can be designed on their own. The gallery at `/dev/components` renders all of them.

### SetRow (the most important component)
One row in an exercise's table of sets. Its columns, left to right:

| SET | PREVIOUS | KG | REPS | (RPE) | ✓ |
|---|---|---|---|---|---|
| SetTypeBadge | PreviousCell | number input | number input | optional input | check button |

**The input columns depend on what the exercise tracks:**

| What the exercise tracks | Input columns |
|---|---|
| weight & reps | `KG` `REPS` (or `LB`) |
| added weight (e.g. weighted pull-ups) | `+KG` `REPS` |
| assistance (e.g. assisted pull-ups) | `-KG` `REPS` (less assistance is better) |
| reps only | `REPS` |
| duration | `TIME` (m:ss) |
| distance & duration | `KM` `TIME` |

The optional **RPE** column is a 6–10 effort rating, shown only when the setting is on.

**States to design:**
- **Pending, with ghost values:** the inputs are empty but show last time's numbers as greyed placeholders. Tapping ✓ saves those numbers. This has to look clearly like "a suggestion, not entered yet".
- **Pending, typed:** the inputs hold real values.
- **Completed:** the whole row is tinted (currently soft green) and the ✓ is filled.
- **Completed with a PR:** a small **PR** badge sits in the PREVIOUS cell.
- **Highlighted next set:** after a set is completed, the next set is highlighted (currently a ring around the row) and scrolled into view.
- **Set types** (shown in the SetTypeBadge):

  | Type | Label | Notes |
  |---|---|---|
  | Normal | 1, 2, 3… | |
  | Warm-up | **W** | currently amber |
  | Drop set | **D** | currently purple; indented under the set before it, with a coloured left rule |
  | Failure | **F** | currently red |

  Warm-up and drop sets aren't numbered, so a sequence reads: W, W, 1, D, 2, F.
- **Swipe left** reveals a red **Delete** action behind the row.
- **Weight input focused:** a small strip appears below the row with **−2.5**, **Plates** (barbell exercises only) and **+2.5**, using the user's step size.

### ExerciseCard
- **Header:**
  - a superset letter tag (only if the exercise is in a superset)
  - the exercise name, which is tappable and opens its detail page
  - a ⋯ button on the right
- **Under the name:**
  - the **BestLine**: "**BEST** 100 kg × 5 · e1RM 116.7 kg", or "No records yet"
  - the exercise's permanent note, marked 📌, if any
  - a note for this session, if any
- **Body:** column headings (SET / PREVIOUS / KG / REPS / ✓), then the SetRows.
- **Footer:** a full-width "+ Add Set" button.

### Others
| Component | What it is | States |
|---|---|---|
| **SetTypeBadge** | Tappable set label (1 / W / D / F) | four types |
| **PreviousCell** | Text such as "80 kg × 8", "-20 kg × 8" (assisted), "12 reps", "1:30", "5 km · 25:00". Tap copies it into the inputs | has a value; "—" when empty |
| **BestLine** | BEST label plus the best set and e1RM | has records; none |
| **PRBadge** | "PR" chip, optionally "PR ×3". Kinds: Best set, Est. 1RM, Volume | single; multiple |
| **SupersetBracket** | Coloured left bracket plus a "SUPERSET A" label around 2+ cards. Four rotating colours | A–D colours |
| **SupersetTag** | Small letter chip next to the exercise name | four colours |
| **ResumeBar** | Floating bar: "Workout in progress", the workout name, elapsed time, ▲ | |
| **Toast** | Message plus optional Undo and ✕ | with and without undo |
| **Banner** | Inline notice: text, an optional action button, dismiss ✕ | neutral; warning |
| **WorkoutSummary** | Title block, 3 stat tiles, PR list, action buttons | with PRs; without |
| **HistoryCard** | See §4.4 | with and without PRs |
| **Heatmap** | 16 × 7 grid of rounded squares | trained; rest day; future |
| **PlateCalculator** | "102.5 kg total · bar 20 kg", then the plates per side as chips (25, 15, 1.25), with a warning if the weight can't be made exactly | normal; bar only; can't make |
| **ExerciseList / ExercisePicker** | Search, filter chips, sections, rows; the picker is a full-screen overlay with Cancel / title / "Add (2)" | single select; multi select; no results with a "Create 'xyz'" link |
| **ReorderList** | Drag handle ☰, title and subtitle, ↑ ↓ buttons | idle; dragging |
| **Sheet / ConfirmDialog / MenuList** | Bottom sheet with a title and ✕; a list of big tappable rows (a ✓ marks the current choice, destructive rows are red) | |
| **Button** | primary / secondary / ghost / danger, in sizes sm / md / lg | normal; disabled |
| **Chip, Tabs (segmented), Toggle (switch), Card, EmptyState, PageHeader, Field** | Basic building blocks | |
| **TabBar** | 4 tabs with icon and label (the icons are currently emoji placeholders: ＋ 🕘 🏋 ⚙). Replace them with a proper icon set | active; inactive |

---

## 6. Content and data realities (design for these)

- **Long names:** "Lat Pulldown - Close Grip (Cable)", "Triceps Pushdown (Cable - Straight Bar)". They must truncate or wrap gracefully in cards, rows and the ResumeBar.
- **Number widths:**
  - weights like 2.5, 102.5, 317.5
  - reps from 1 to 50+
  - times like 1:02:05
  - volume like 12,480 kg
  - the unit can be kg or lb
- **Negative assistance:** "-20 kg × 8" is a normal case for assisted exercises.
- **Busy workouts:** a heavy session can have 8–10 exercises with 3–6 sets each, so scanning and scrolling long lists must stay comfortable.
- **Empty states** exist for:
  - no templates
  - no workouts
  - no exercises in a workout
  - no exercise history
  - nothing to chart yet
  - no search results

  Each should say what to do next.

---

## 7. The deliverable (what engineering can drop in)

The code keeps every colour, font and corner radius in one place, as CSS variables in `src/styles/tokens.css`. Tailwind class names map to those variables. **A good hand-off is:**

1. **A full set of tokens for light and dark mode**, using the names below. You can add new tokens (spacing scale, shadows, font sizes, motion durations); just list them.
2. **Specs for each component in §5**, covering every state listed.
3. **Mock-ups of every screen in §4**, at 390 px, in light and dark.
4. **An app icon** (192 px, 512 px, a 512 px maskable version, and a 180 px Apple touch icon), plus a theme colour and background colour.
5. **A tab-bar icon set** (4 icons) and any other icons you use (check, more ⋯, drag, close, chevrons, timer, trophy for PRs, note pin).

**The current tokens** (placeholder values):

```css
:root {
  --font-sans: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;

  --color-bg: #f3f4f6;            /* page background */
  --color-surface: #ffffff;       /* cards, sheets, tab bar */
  --color-surface-2: #f9fafb;     /* inputs, secondary buttons, section headers */
  --color-border: #e5e7eb;
  --color-text: #111827;
  --color-text-muted: #6b7280;
  --color-accent: #1f2937;        /* primary buttons, rest/resume bars, active tab */
  --color-accent-contrast: #ffffff;
  --color-success: #16a34a;       /* completed ✓, heatmap filled, switches on */
  --color-success-soft: #dcfce7;  /* completed row tint */
  --color-danger: #dc2626;
  --color-warning: #d97706;
  --color-pr: #ca8a04;            /* BEST label, PR badge */

  --color-warmup: #d97706;        /* W */
  --color-drop: #7c3aed;          /* D */
  --color-failure: #dc2626;       /* F */

  --color-superset-1: #2563eb;    /* Superset A */
  --color-superset-2: #db2777;    /* B */
  --color-superset-3: #059669;    /* C */
  --color-superset-4: #ea580c;    /* D (then repeats) */

  --radius: 8px;                  /* inputs, buttons, rows */
  --radius-lg: 14px;              /* cards, sheets, floating bars */
  --space-page: 16px;
  --tabbar-height: 56px;
}
/* Dark mode currently overrides bg, surface, surface-2, border, text, text-muted,
   accent, accent-contrast and success-soft. */
```

---

## 8. Out of scope (don't change)

- **Behaviour and rules:**
  - how PREVIOUS is matched to each set
  - the BEST rule: heaviest weight wins, reps break ties
  - PR detection
  - the order sets are highlighted in supersets
  - set-type numbering
- **Screens, routes and flows:** you can merge or rearrange elements *within* a screen, but keep every function reachable.
- **Data:** no accounts, sync, social features or new data fields. The app is private, stores data only on the phone, and works offline.
- **Terms users rely on:** "PREVIOUS", "BEST", "Superset", "Warm-up / Drop / Failure", "e1RM". Their visual treatment is up to you.
