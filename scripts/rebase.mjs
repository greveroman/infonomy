// Переносит собранный сайт в подпапку (например /vector для GitHub Pages):
// дописывает префикс ко всем ссылкам от корня в HTML и CSS папки dist.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const base = (process.env.BASE_PATH || '').replace(/\/$/, '');
if (!base) process.exit(0);

const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

for (const file of walk('dist').filter((f) => /\.(html|css)$/.test(f))) {
  const src = readFileSync(file, 'utf8');
  const out = src
    .replace(/(href|src|action)="\/(?!\/)/g, `$1="${base}/`)
    .replace(/url\(\/(?!\/)/g, `url(${base}/`);
  if (out !== src) writeFileSync(file, out);
}
console.log(`dist → ${base}/`);
