// Final verification against the deployed GitHub Pages build:
//   - page loads, favicon and apple-touch-icon are inlined (no /favicon.ico 404)
//   - the game boots and plays
//   - drag-to-aim interception works against the live build
//   - zero console errors, zero page errors, zero failed requests
const { chromium } = require(process.env.PW_MODULE);
const EXEC = 'C:/Users/elisa/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe';
const TARGET = process.argv[2] || 'https://elisabeth15501.github.io/hold-to-resist/';

(async () => {
  const browser = await chromium.launch({ executablePath: EXEC, headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });

  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const http4xx = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => pageErrors.push(e.message));
  page.on('requestfailed', r => failedRequests.push(`${r.url()} :: ${r.failure()?.errorText}`));
  page.on('response', r => { if (r.status() >= 400) http4xx.push(`${r.status()} ${r.url()}`); });

  await page.goto(TARGET, { waitUntil: 'load' });
  await page.waitForTimeout(1500);

  const meta = await page.evaluate(() => ({
    title: document.title,
    iconHref: (document.querySelector('link[rel~="icon"]') || {}).href?.slice(0, 30) || null,
    appleIcon: !!document.querySelector('link[rel="apple-touch-icon"]'),
    themeColor: !!document.querySelector('meta[name="theme-color"]'),
    gameLoaded: typeof window.game !== 'undefined',
  }));

  // Play: press, drag to track an item, release.
  await page.click('#startBtn');
  await page.waitForTimeout(4500);

  const findTarget = () => page.evaluate(() => {
    const g = window.game;
    if (g.state !== 'PLAYING') return null;
    const c = g.items.filter(it => !it.isIntercepted && it.y > 20 && it.y < 520);
    if (!c.length) return null;
    const it = c.reduce((a, b) => (a.y <= b.y ? a : b));
    const r = document.getElementById('gameCanvas').getBoundingClientRect();
    return { x: r.left + (it.x / 480) * r.width, y: r.top + (it.y / 640) * r.height };
  });

  const before = await page.evaluate(() => window.game.scorer.getItemsIntercepted());
  for (let i = 0; i < 8; i++) {
    const t = await findTarget();
    if (!t) { await page.waitForTimeout(200); continue; }
    await page.mouse.move(t.x, t.y);
    await page.mouse.down();
    const t0 = Date.now();
    while (Date.now() - t0 < 320) {
      const n = await findTarget();
      if (n) await page.mouse.move(n.x, n.y);
      await page.waitForTimeout(30);
    }
    await page.mouse.up();
    await page.waitForTimeout(500);
  }
  const after = await page.evaluate(() => ({
    intercepted: window.game.scorer.getItemsIntercepted(),
    score: window.game.scorer.getScore(),
    state: window.game.state,
    items: window.game.items.length,
  }));

  console.log('=== ' + TARGET + ' ===');
  console.log('meta            :', JSON.stringify(meta));
  console.log('after play      :', JSON.stringify({ before, ...after }));
  console.log('console errors  :', consoleErrors.length ? consoleErrors : 'none');
  console.log('page errors     :', pageErrors.length ? pageErrors : 'none');
  console.log('failed requests :', failedRequests.length ? failedRequests : 'none');
  console.log('HTTP >= 400     :', http4xx.length ? http4xx : 'none');

  await browser.close();

  const clean = consoleErrors.length === 0 && pageErrors.length === 0
    && failedRequests.length === 0 && http4xx.length === 0;
  console.log(clean ? 'RESULT: CLEAN' : 'RESULT: NOISE DETECTED');
  process.exit(clean ? 0 : 1);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
