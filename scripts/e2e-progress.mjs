// End-to-end check of the progress & motivation features with demo data.
//   BASE_URL=http://localhost:4173/ node scripts/e2e-progress.mjs
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://localhost:4173/';
const SHOTS = process.env.SHOTS ?? 'test-results';
mkdirSync(SHOTS, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, reducedMotion: 'no-preference' });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

const step = (name) => console.log('•', name);
const shot = (name) => page.screenshot({ path: `${SHOTS}/progress-${name}.png`, fullPage: true });
function assert(cond, msg) {
  if (!cond) throw new Error('ASSERTION FAILED: ' + msg);
}
const esc = (s) => s.replace(/[()]/g, '\\$&');
async function addExercise(name) {
  await page.getByRole('searchbox', { name: 'Search exercises' }).fill(name);
  await page.getByRole('button', { name: new RegExp('^' + esc(name)) }).first().click();
}

step('fresh load → Settings → Load demo data');
await page.goto(BASE);
await page.getByRole('button', { name: 'Start empty workout' }).waitFor();
await page.getByRole('link', { name: /Settings/ }).click();
await page.getByRole('button', { name: 'Load' }).click();
await page.getByText(/Loaded \d+ demo workouts/).waitFor();

step('home: gym selector, this week, plateau alert');
await page.getByRole('link', { name: /Workout/ }).click();
await page.getByRole('button', { name: /Current gym: Demo Gym Downtown/ }).waitFor();
const weekCard = page.locator('section', { has: page.getByRole('heading', { name: 'This week' }) });
assert(await weekCard.locator('[data-status]').count() > 3, 'weekly sets rows');
await page.getByRole('heading', { name: 'Plateau alerts' }).waitFor();
assert(await page.getByRole('button', { name: /Overhead Press \(Barbell\)/ }).count() === 1, 'OHP plateau on dashboard');
await shot('1-home');

step('start a workout: progression hints + plateau tag');
await page.getByRole('button', { name: 'Start empty workout' }).click();
await page.getByRole('button', { name: '+ Add Exercises' }).click();
for (const n of ['Bench Press (Barbell)', 'Lateral Raise (Dumbbell)', 'Overhead Press (Barbell)', 'Leg Press']) await addExercise(n);
await page.getByRole('button', { name: /^Add \(4\)/ }).click();
const bench = page.getByRole('article', { name: 'Bench Press (Barbell)' });
const lateral = page.getByRole('article', { name: 'Lateral Raise (Dumbbell)' });
const ohp = page.getByRole('article', { name: 'Overhead Press (Barbell)' });
const legPress = page.getByRole('article', { name: 'Leg Press' });
await bench.getByRole('button', { name: /↑|Try 82.5 kg × 5/ }).waitFor();
assert(await bench.getByText('Try 82.5 kg × 5').count() === 1, 'bench increase hint');
assert(await lateral.getByText('Consider 10 kg').count() === 1, 'lateral raise lighter hint');
assert(await ohp.getByText(/Plateau · \d+ weeks/).count() === 1, 'OHP plateau tag');
const legPrevMain = await legPress.locator('[data-set-row]').first().innerText();
await bench.getByRole('button', { name: 'Bench Press (Barbell) options' }).click();
const menu = page.getByRole('dialog', { name: 'Bench Press (Barbell)' });
assert(await menu.getByRole('button', { name: 'Rep range: 5–8' }).count() === 1, 'rep range in ⋯ menu');
assert(await menu.getByRole('button', { name: 'Weight step: 2.5 kg' }).count() === 1, 'weight step in ⋯ menu');
await menu.getByRole('button', { name: 'Close' }).click();
await shot('2-workout-hints');

step('switching gyms changes PREVIOUS');
await page.getByRole('button', { name: /Gym for this workout: Demo Gym Downtown/ }).click();
await page.getByRole('dialog', { name: 'Gym for this workout' }).getByRole('button', { name: 'Demo Hotel Gym' }).click();
await page.getByRole('button', { name: /Gym for this workout: Demo Hotel Gym/ }).waitFor();
const legPrevHotel = await legPress.locator('[data-set-row]').first().innerText();
console.log('   Leg Press PREVIOUS:', legPrevMain.split('\n')[1], '→', legPrevHotel.split('\n')[1]);
assert(legPrevMain !== legPrevHotel, 'PREVIOUS differs by gym');
await page.getByRole('button', { name: /Gym for this workout/ }).click();
await page.getByRole('dialog', { name: 'Gym for this workout' }).getByRole('button', { name: 'Demo Gym Downtown' }).click();

step('tap the hint → weight applied to working sets');
await bench.getByRole('button', { name: /Try 82.5 kg × 5/ }).click();
assert((await bench.getByRole('textbox', { name: 'Set 1 KG' }).inputValue()) === '82.5', 'hint applied');

step('complete a heavier set → confetti + PR toast');
await bench.getByRole('textbox', { name: 'Set 1 REPS' }).fill('5');
await bench.getByRole('button', { name: /Complete set 1/ }).click();
await page.getByText(/New PR/).waitFor();
assert(await page.getByText(/82.5 kg × 5 \(was 80 kg × 8\)/).count() === 1, 'toast shows old → new');
await page.waitForTimeout(200);
assert(await page.locator('canvas').count() > 0, 'confetti canvas');
await shot('3-pr-toast');

step('finish → summary: PRs with old → new and a volume comparison');
await page.getByRole('button', { name: 'Finish' }).click();
const dlg = page.getByRole('dialog', { name: 'Unfinished sets' });
if (await dlg.isVisible().catch(() => false)) await dlg.getByRole('button', { name: 'Discard them' }).click();
await page.getByText('Congratulations!').waitFor();
assert(await page.getByText(/that’s/).count() >= 1, 'volume comparison line');
assert(await page.getByText(/80 kg × 8 →/).count() === 1, 'PR old → new on summary');
await shot('4-summary');
await page.getByRole('button', { name: 'Done' }).click();

step('History → Trophies has the new PR');
await page.getByRole('link', { name: /History/ }).click();
await page.getByText(/Lifetime:/).waitFor();
await page.getByRole('button', { name: /Trophies/ }).click();
await page.getByText(/PRs this year/).waitFor();
const firstTrophy = page.locator('li button').first();
assert((await firstTrophy.innerText()).includes('Bench Press (Barbell)'), 'newest trophy is the bench PR');
await shot('5-trophies');
await firstTrophy.click();
await page.getByText(/Muscles worked|Demo Gym Downtown/).first().waitFor();
await shot('6-workout-detail');

step('History → Muscles: map + weekly sets');
await page.goto(BASE + 'history?view=muscles');
await page.locator('[data-muscle="chest"]').first().waitFor();
assert(await page.locator('svg [data-muscle]').count() > 30, 'muscle paths');
assert(await page.locator('[data-muscle="chest"][data-level]:not([data-level="0"])').count() > 0, 'chest shaded this week');
await page.locator('[data-muscle="chest"]').first().click();
await page.getByRole('dialog', { name: 'Chest' }).getByText('Exercises that hit it').waitFor();
await shot('7-muscles');
await page.keyboard.press('Escape');
await page.getByRole('tab', { name: 'Recency' }).click();
await shot('7b-muscles-recency');

step('History → Recaps: a month and a year open');
await page.goto(BASE + 'history/recaps');
await page.getByRole('button', { name: /in lifting|so far/ }).first().click();
await page.locator('[data-recap-card]').first().waitFor();
assert(await page.locator('[data-recap-card]').count() >= 7, 'year recap has all cards');
await shot('8-year-recap');
await page.goto(BASE + 'history/recaps');
await page.getByRole('button', { name: /August 2026|[A-Z][a-z]+ \d{4}/ }).first().click();
await page.locator('[data-recap-card]').first().waitFor();
await shot('9-month-recap');

step('clear demo data keeps real workouts');
await page.goto(BASE + 'settings');
await page.getByRole('button', { name: 'Clear' }).click();
await page.getByText(/Removed \d+ demo workouts/).waitFor();
await page.getByRole('link', { name: /History/ }).click();
assert(await page.getByRole('button', { name: /Workout/ }).filter({ hasText: /DEMO/ }).count() === 0, 'no demo cards');
assert(await page.getByText('Bench Press (Barbell)').count() >= 1, 'real workout kept');
await shot('10-after-clear');

step('dev components page renders the new components');
await page.goto(BASE + 'dev/components');
await page.getByRole('heading', { name: 'Yearly recap cards' }).waitFor();

assert(errors.length === 0, 'console errors:\n' + errors.join('\n'));
console.log('E2E PROGRESS OK');
await browser.close();
