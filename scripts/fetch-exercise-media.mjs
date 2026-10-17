// Downloads public-domain exercise photos from free-exercise-db
// (https://github.com/yuhonas/free-exercise-db, Unlicense) for the exercises
// mapped in scripts/exercise-media-map.json, shrinks them for mobile and writes:
//   public/exercise-media/<seedId>/0.jpg, 1.jpg   (start / end position, ≤480px)
//   public/exercise-media/<seedId>/thumb.jpg      (112px list thumbnail)
//   src/db/exerciseMedia.generated.json           (image count + muscles per exercise)
// scripts/exercise-media-extra.json adds openly licensed photos (with credits)
// and close stand-ins for exercises free-exercise-db doesn't cover.
// Requires macOS `sips` for resizing. Run: npm run media
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';

const RAW = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main';
const map = JSON.parse(readFileSync('scripts/exercise-media-map.json', 'utf8'));
delete map._comment;
const db = new Map((await (await fetch(`${RAW}/dist/exercises.json`)).json()).map((e) => [e.id, e]));

const sips = (args) => execFileSync('sips', args, { stdio: 'ignore' });
const out = {};
for (const [slug, srcId] of Object.entries(map)) {
  const src = db.get(srcId);
  if (!src) throw new Error(`free-exercise-db has no "${srcId}" (for ${slug})`);
  const seedId = `seed-${slug}`;
  const dir = `public/exercise-media/${seedId}`;
  mkdirSync(dir, { recursive: true });
  let n = 0;
  for (const [i, rel] of src.images.slice(0, 2).entries()) {
    const file = `${dir}/${i}.jpg`;
    if (!existsSync(file)) {
      const res = await fetch(`${RAW}/exercises/${rel}`);
      if (!res.ok) throw new Error(`${res.status} for ${rel}`);
      writeFileSync(file, Buffer.from(await res.arrayBuffer()));
      sips(['-Z', '480', '-s', 'format', 'jpeg', '-s', 'formatOptions', '70', file]);
    }
    n++;
  }
  const thumb = `${dir}/thumb.jpg`;
  if (!existsSync(thumb)) {
    execFileSync('cp', [`${dir}/0.jpg`, thumb]);
    sips(['-Z', '112', '-s', 'formatOptions', '65', thumb]);
  }
  out[seedId] = {
    images: n,
    primaryMuscles: src.primaryMuscles ?? [],
    secondaryMuscles: src.secondaryMuscles ?? [],
    source: srcId,
  };
  process.stdout.write('.');
}
// Extra photos: explicit URLs (credited) or free-exercise-db stand-ins.
const extra = JSON.parse(readFileSync('scripts/exercise-media-extra.json', 'utf8'));
delete extra._comment;
const UA = { 'User-Agent': 'Jim personal workout tracker (media script)' };
for (const [slug, x] of Object.entries(extra)) {
  const seedId = `seed-${slug}`;
  if (out[seedId]) throw new Error(`${slug} is in both media maps`);
  const dir = `public/exercise-media/${seedId}`;
  mkdirSync(dir, { recursive: true });
  let urls;
  if (x.fedb) {
    const src = db.get(x.fedb);
    if (!src) throw new Error(`free-exercise-db has no "${x.fedb}" (for ${slug})`);
    urls = src.images.slice(0, 2).map((rel) => `${RAW}/exercises/${rel}`);
  } else urls = x.images.map((i) => i.url);
  if (x.reverse) urls.reverse();
  for (const [i, url] of urls.entries()) {
    const file = `${dir}/${i}.jpg`;
    if (existsSync(file)) continue;
    let res;
    for (let a = 0; a < 5; a++) {
      res = await fetch(url, { headers: UA });
      if (res.status !== 429) break;
      await new Promise((r) => setTimeout(r, 8000 * (a + 1)));
    }
    if (!res.ok) throw new Error(`${res.status} for ${url}`);
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    sips(['-Z', '480', '-s', 'format', 'jpeg', '-s', 'formatOptions', '70', file]);
    await new Promise((r) => setTimeout(r, 1000));
  }
  const thumb = `${dir}/thumb.jpg`;
  if (!existsSync(thumb)) {
    execFileSync('cp', [`${dir}/0.jpg`, thumb]);
    sips(['-Z', '112', '-s', 'formatOptions', '65', thumb]);
  }
  out[seedId] = {
    images: urls.length,
    primaryMuscles: [],
    secondaryMuscles: [],
    source: x.fedb ?? 'extra',
    ...(x.images ? { credits: [...new Map(x.images.map((i) => [`${i.credit.author}|${i.credit.license}`, i.credit])).values()] } : {}),
    ...(x.note ? { note: x.note } : {}),
  };
  process.stdout.write('+');
}
writeFileSync('src/db/exerciseMedia.generated.json', JSON.stringify(out, null, 1) + '\n');
console.log(`\n${Object.keys(out).length} exercises with media`);
