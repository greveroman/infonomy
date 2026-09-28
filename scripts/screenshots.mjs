// Скриншоты всех страниц на 375 и 1440 px + проверки: чистые URL, меню, горизонтальный скролл, форма.
// Запуск: npm run preview (в другом окне), затем npm run screenshots
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL ?? 'http://localhost:4321';
const pages = { home: '/', about: '/about', reviews: '/reviews', join: '/join' };
const widths = [375, 1440];

const browser = await chromium.launch();
let failed = 0;
const fail = (msg) => { failed++; console.log('✗', msg); };

for (const width of widths) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await ctx.newPage();
  page.on('console', (m) => m.type() === 'error' && fail(`console ${width}: ${m.text()}`));
  for (const [name, path] of Object.entries(pages)) {
    const res = await page.goto(BASE + path, { waitUntil: 'networkidle' });
    if (res.status() !== 200) fail(`${path} → HTTP ${res.status()}`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 0) fail(`${path} @${width}: горизонтальный скролл ${overflow}px`);
    await page.screenshot({ path: `screenshots/${name}-${width}.png`, fullPage: true });
    console.log(`✓ ${name}-${width}.png (overflow ${overflow}px)`);
  }

  // Меню: каждый пункт открывает нужную страницу
  await page.goto(BASE + '/');
  const hrefs = await page.$$eval('header a[href]:not([href="/"]), header nav a', (as) =>
    [...new Set(as.filter((a) => a.offsetParent !== null).map((a) => a.getAttribute('href')))]);
  for (const href of hrefs) {
    await page.click(`header nav a[href="${href}"], header > div > a[href="${href}"]:last-child`);
    await page.waitForLoadState('networkidle');
    const p = new URL(page.url()).pathname;
    if (p !== href) fail(`меню @${width}: ${href} → ${p}`); else console.log(`✓ меню @${width}: ${href}`);
  }

  // Форма: пустая отправка не проходит; заполненная показывает сообщение (ответ send.php подменён — PHP в preview нет)
  await page.route('**/send.php', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));
  await page.goto(BASE + '/join');
  await page.click('#join-form button[type=submit]');
  const invalid = await page.$$eval('[aria-invalid=true]', (els) => els.map((e) => e.name));
  console.log(`✓ пустая форма @${width}: невалидные поля — ${invalid.join(', ')}`);
  if (width === 1440) await page.screenshot({ path: `screenshots/join-validation-${width}.png`, fullPage: true });
  await page.fill('#f-name', 'Тест Тестов');
  await page.fill('#f-city', 'Тест');
  await page.selectOption('#f-area', 'Экономика');
  await page.fill('#f-email', 'test@example.com');
  await page.fill('#f-experience', 'Тест');
  await page.click('#join-form button[type=submit]');
  await page.waitForSelector('#join-success:not([hidden])');
  console.log(`✓ отправка @${width}: ${(await page.textContent('#join-success')).trim()}`);
  await page.screenshot({ path: `screenshots/join-success-${width}.png`, fullPage: true });
  await ctx.close();
}
await browser.close();
console.log(failed ? `Ошибок: ${failed}` : 'Все проверки пройдены');
process.exit(failed ? 1 : 0);
