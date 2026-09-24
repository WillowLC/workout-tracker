// End-to-end smoke test against a production build (npm run build && npm run preview).
// Runs the "definition of done" scenario plus an offline cold start.
//   BASE_URL=http://localhost:4173/ node scripts/e2e.mjs
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://localhost:4173/';
const SHOTS = process.env.SHOTS ?? 'test-results';
mkdirSync(SHOTS, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

const step = (name) => console.log('•', name);
const shot = (name) => page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true });
function assert(cond, msg) {
  if (!cond) throw new Error('ASSERTION FAILED: ' + msg);
}

async function addExercise(name) {
  await page.getByRole('searchbox', { name: 'Search exercises' }).fill(name);
  await page.getByRole('button', { name: new RegExp('^' + name.replace(/[()]/g, '\\$&')) }).first().click();
}

step('fresh load + service worker');
await page.goto(BASE);
await page.getByRole('button', { name: 'Start empty workout' }).waitFor();
await page.evaluate(() => navigator.serviceWorker.ready);
assert(await page.evaluate(() => !!navigator.serviceWorker.controller || navigator.serviceWorker.ready.then(() => true)), 'SW registered');

step('library is seeded');
await page.getByRole('link', { name: /Exercises/ }).click();
await page.getByRole('button', { name: /^Bench Press \(Barbell\)/ }).first().waitFor();

step('start empty workout, add Bench Press + Pull Up (Assisted)');
await page.getByRole('link', { name: /Workout/ }).click();
await page.getByRole('button', { name: 'Start empty workout' }).click();
await page.getByRole('button', { name: '+ Add Exercises' }).click();
await addExercise('Bench Press (Barbell)');
await addExercise('Pull Up (Assisted)');
await page.getByRole('button', { name: /^Add \(2\)/ }).click();
await page.getByRole('article', { name: 'Bench Press (Barbell)' }).waitFor();

step('superset them');
await page.getByRole('button', { name: 'Bench Press (Barbell) options' }).click();
await page.getByRole('button', { name: 'Superset with…' }).click();
await page.getByRole('dialog', { name: 'Superset with…' }).getByRole('button', { name: /Pull Up \(Assisted\)/ }).click();
await page.getByText('Superset A').first().waitFor();

const bench = page.getByRole('article', { name: 'Bench Press (Barbell)' });
const pull = page.getByRole('article', { name: 'Pull Up (Assisted)' });

step('bench: warm-up + 2 working sets + drop set');
await bench.getByRole('button', { name: '+ Add Set' }).click();
await bench.getByRole('button', { name: '+ Add Set' }).click();
await bench.getByRole('button', { name: '+ Add Set' }).click();
await bench.getByRole('button', { name: /Set 1\. Change set type/ }).first().click();
await page.getByRole('button', { name: 'W  Warm-up' }).click();
// rows now: W, 1, 2, 3 → make last one a drop set
await bench.getByRole('button', { name: /Set 3\. Change set type/ }).click();
await page.getByRole('button', { name: 'D  Drop set' }).click();
const labels = await bench.locator('[data-set-row] button[aria-label*="Change set type"]').allInnerTexts();
assert(JSON.stringify(labels) === JSON.stringify(['W', '1', '2', 'D']), 'labels W,1,2,D got ' + labels);

async function fill(card, label, kg, reps) {
  await card.getByRole('textbox', { name: new RegExp(`^Set ${label} (KG|-KG)$`) }).fill(String(kg));
  await card.getByRole('textbox', { name: new RegExp(`^Set ${label} REPS$`) }).fill(String(reps));
}
await fill(bench, 'W', 40, 10);
await fill(bench, '1', 80, 8);
await fill(bench, '2', 80, 7);
await fill(bench, 'D', 60, 10);
await pull.getByRole('button', { name: '+ Add Set' }).click();
await fill(pull, '1', 30, 8);
await fill(pull, '2', 25, 6);

step('complete sets; superset rest rule');
await bench.getByRole('button', { name: 'Complete set w' }).click();
await bench.getByRole('button', { name: 'Complete set 1' }).click();
assert(!(await page.getByRole('timer').count()), 'no rest timer after bench set 1 (superset continues)');
await pull.getByRole('button', { name: 'Complete set 1' }).click();
await page.getByRole('timer').waitFor();
step('  rest timer started after last exercise in round');
await page.getByRole('button', { name: 'Skip' }).click();
await bench.getByRole('button', { name: 'Complete set 2' }).click();
await pull.getByRole('button', { name: 'Complete set 2' }).click();
await page.getByRole('button', { name: 'Skip' }).click();
await bench.getByRole('button', { name: 'Complete set d' }).click();
await shot('01-active-workout');

step('reload mid-workout keeps state');
await page.reload();
await page.getByRole('article', { name: 'Bench Press (Barbell)' }).waitFor();
assert((await page.getByRole('button', { name: /completed\. Tap to undo/ }).count()) === 6, 'six completed sets after reload');

step('finish → summary → save as template');
await page.getByRole('button', { name: 'Finish' }).click();
await page.getByText('Workout complete').waitFor();
await shot('02-summary');
await page.getByRole('button', { name: 'Save as new template' }).click();
await page.getByRole('button', { name: 'Done' }).click();

step('history shows it');
await page.getByRole('link', { name: /History/ }).click();
await page.getByText('× Bench Press (Barbell)').first().waitFor();
await shot('03-history');

step('create a DIFFERENT template containing Bench Press and start it');
await page.getByRole('link', { name: /Workout/ }).click();
await page.getByRole('button', { name: '+ Template' }).click();
await page.getByRole('textbox', { name: 'Name' }).fill('Full Body A');
await page.getByRole('button', { name: '+ Add Exercises' }).click();
await addExercise('Squat (Barbell)');
await addExercise('Bench Press (Barbell)');
await page.getByRole('button', { name: /^Add \(2\)/ }).click();
await page.getByRole('button', { name: 'Save' }).click();
await page.getByRole('button', { name: /^Full Body A/ }).click();
await page.getByRole('button', { name: 'Start Workout' }).click();
const bench2 = page.getByRole('article', { name: 'Bench Press (Barbell)' });
await bench2.waitFor();
const best = await bench2.locator('p', { hasText: 'BEST' }).innerText();
step('  BEST line: ' + best);
assert(best.includes('80 kg × 8'), 'BEST uses weight priority then reps (80×8 beats 80×7, warm-up/drop excluded)');
const prev = await bench2.getByRole('button', { name: /^Previous:/ }).allInnerTexts();
step('  PREVIOUS: ' + prev.join(' | '));
assert(prev[0] === '80 kg × 8' && prev[1] === '80 kg × 7', 'PREVIOUS matches by position among non-warm-ups');
const ph = await bench2.getByRole('textbox', { name: 'Set 1 KG' }).getAttribute('placeholder');
assert(ph === '80', 'placeholder prefilled from previous, got ' + ph);
await shot('04-template-previous');

step('check-off without typing commits placeholder');
await bench2.getByRole('button', { name: 'Complete set 1' }).click();
const committed = await bench2.getByRole('textbox', { name: 'Set 1 KG' }).inputValue();
assert(committed === '80', 'placeholder committed, got ' + JSON.stringify(committed));

step('offline cold start');
await ctx.setOffline(true);
const page2 = await ctx.newPage();
await page2.goto(BASE + 'history');
await page2.getByRole('heading', { name: 'History' }).waitFor();
await page2.getByText('Workout in progress').first().waitFor();
await page2.screenshot({ path: `${SHOTS}/05-offline.png`, fullPage: true });
await ctx.setOffline(false);

step('dev components page renders');
await page.goto(BASE + 'dev/components');
await page.getByRole('heading', { name: 'Component gallery' }).waitFor();
await shot('06-dev-components');

await browser.close();
const relevant = errors.filter((e) => !/Failed to load resource/.test(e));
if (relevant.length) {
  console.error('Console errors:\n' + relevant.join('\n'));
  process.exit(1);
}
console.log('E2E OK');
