// Verifies the update flow against `vite preview`: an open app sees a new build,
// shows "Update available", defers it during a workout, and keeps all data.
//   node scripts/e2e-update.mjs   (preview server must be running on BASE_URL)
import { chromium } from 'playwright';
import { execSync } from 'node:child_process';

const BASE = process.env.BASE_URL ?? 'http://localhost:4173/';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
const step = (s) => console.log('•', s);
const assert = (c, m) => { if (!c) throw new Error('ASSERTION FAILED: ' + m); };

step('open app, SW active, create data');
await page.goto(BASE);
await page.evaluate(() => navigator.serviceWorker.ready);
await page.reload(); // now controlled by the SW
await page.getByRole('button', { name: 'Start empty workout' }).click();
await page.getByRole('button', { name: '+ Add Exercises' }).click();
await page.getByRole('searchbox').fill('Squat (Barbell)');
await page.getByRole('button', { name: /^Squat \(Barbell\)/ }).first().click();
await page.getByRole('button', { name: /^Add/ }).click();
await page.getByRole('textbox', { name: 'Set 1 KG' }).fill('100');
await page.getByRole('textbox', { name: 'Set 1 REPS' }).fill('5');
await page.getByRole('button', { name: 'Complete set 1' }).click();
await page.getByRole('button', { name: 'Minimise workout' }).click();
const v1 = await page.evaluate(() => [...document.scripts].map((s) => s.src).join());

step('deploy a new build while the app is open');
execSync('npm run build', { stdio: 'ignore' });

step('app checks for updates (as on foreground / hourly)');
await page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).update());
await page.getByText(/Update available/).waitFor({ timeout: 30000 });
const text = await page.getByText(/Update available/).innerText();
assert(/finish or cancel/.test(text), 'during a workout the banner defers the update: ' + text);
assert(!(await page.getByRole('button', { name: 'Reload' }).count()), 'no reload button during workout');
await page.getByRole('link', { name: /History/ }).click();
assert(!(await page.getByText(/Update available/).count()), 'banner hidden on other tabs during workout');

step('finish workout → update applied after Done');
await page.getByRole('button', { name: /Workout in progress/ }).click();
await page.getByRole('button', { name: 'Finish' }).click();
await page.getByRole('button', { name: 'Done' }).click();
await page.waitForLoadState('load');
await page.waitForTimeout(1500);
await page.getByRole('button', { name: 'Start empty workout' }).waitFor();
const v2 = await page.evaluate(() => [...document.scripts].map((s) => s.src).join());
step(`  scripts before: ${v1.split('/').pop()}  after: ${v2.split('/').pop()}`);
assert(!(await page.getByText(/Update available/).count()), 'no banner after update applied');

step('data survived');
await page.getByRole('link', { name: /History/ }).click();
await page.getByText('× Squat (Barbell)').first().waitFor();

step('no workout: banner has Reload button');
execSync('npm run build', { stdio: 'ignore' });
await page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).update());
await page.getByRole('button', { name: 'Reload' }).waitFor({ timeout: 30000 });
await page.getByRole('button', { name: 'Reload' }).click();
await page.waitForTimeout(1500);
await page.getByRole('link', { name: /History/ }).click();
await page.getByText('× Squat (Barbell)').first().waitFor();

await browser.close();
console.log('UPDATE E2E OK');
