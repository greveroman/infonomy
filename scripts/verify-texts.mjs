// Проверяет, что каждая строка из src/content/*.json дословно есть в исходном тексте (content-source.md).
import fs from 'node:fs';
const norm = (s) => s.replace(/\s+/g, ' ').trim();
const src = norm(fs.readFileSync('content-source.md', 'utf8'));
const skipKeys = new Set(['_comment', 'url', 'href', 'name', 'type', 'autocomplete', 'id', 'lang', 'locale', 'num', 'linkPlaceholder', 'errorMessage']);
let bad = 0, total = 0;
function walk(v, path, file) {
  if (typeof v === 'string') {
    const key = path[path.length - 1];
    if (skipKeys.has(key) || v.startsWith('/') || v === 'text' || v === 'p' || v === 'quote') return;
    total++;
    if (!src.includes(norm(v))) { bad++; console.log(`✗ ${file} ${path.join('.')}: ${v.slice(0, 90)}`); }
  } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, [...path, i], file));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, [...path, k], file);
}
for (const f of fs.readdirSync('src/content').filter((f) => f.endsWith('.json')))
  walk(JSON.parse(fs.readFileSync(`src/content/${f}`, 'utf8')), [], f);
console.log(`Проверено строк: ${total}, не найдено дословно: ${bad}`);
