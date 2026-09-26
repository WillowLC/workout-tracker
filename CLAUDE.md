# Jim (workout tracker)

- **Never use emoji anywhere in Jim**: UI text, data, comments, docs or commit-facing files. Use SVG icons from `src/components/icons.tsx`. `src/noEmoji.test.ts` enforces this in CI, and `src/lib/noEmoji.ts` strips any emoji at runtime. Never weaken or skip either guard.
- Never change the deploy base path `/workout-tracker/`: user data is tied to the origin and path.
- Run `npm test` and `npx tsc --noEmit` before committing. The e2e scripts (`npm run e2e`, `e2e:progress`, `e2e:update`) run against `vite preview` on port 4173.
