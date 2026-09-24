// `npm run deploy`: commit any pending changes, then push. The push triggers
// .github/workflows/deploy.yml, which tests, builds and publishes to GitHub Pages.
import { execSync } from 'node:child_process';

const sh = (cmd) => execSync(cmd, { stdio: 'inherit' });
const out = (cmd) => execSync(cmd, { encoding: 'utf8' }).trim();

if (out('git status --porcelain')) {
  sh('git add -A');
  const msg = process.argv[2] ?? `Deploy ${new Date().toISOString()}`;
  sh(`git commit -m ${JSON.stringify(msg)}`);
}
sh('git push');
console.log('\nPushed. Watch the deploy with:  gh run watch');
