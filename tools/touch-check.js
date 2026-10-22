// Verify the touch path: drag-to-aim must work with touch events too
// (touchmove tracking was added alongside the mouse handling).
const { chromium, devices } = require(process.env.PW_MODULE);
const EXEC = 'C:/Users/elisa/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe';
const TARGET = 'file:///C:/Users/elisa/dev/hold-to-resist/index.html';

(async () => {
  const browser = await chromium.launch({ executablePath: EXEC, headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true, isMobile: true, deviceScaleFactor: 3,
  });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });

  await page.goto(TARGET, { waitUntil: 'load' });
  await page.waitForTimeout(500);
  await page.tap('#startBtn');
  await page.waitForTimeout(4500);

  const findTarget = () => page.evaluate(() => {
    const g = window.game;
    if (g.state !== 'PLAYING') return null;
    const c = g.items.filter(it => !it.isIntercepted && it.y > 20 && it.y < 500);
    if (!c.length) return null;
    const it = c.reduce((a, b) => (a.y <= b.y ? a : b));
    const r = document.getElementById('gameCanvas').getBoundingClientRect();
    return { x: r.left + (it.x / 480) * r.width, y: r.top + (it.y / 640) * r.height };
  });

  const before = await page.evaluate(() => window.game.scorer.getItemsIntercepted());

  // Drive raw touch events so we exercise touchstart / touchmove / touchend.
  let attempts = 0, hits = 0;
  for (let i = 0; i < 8; i++) {
    const t = await findTarget();
    if (!t) { await page.waitForTimeout(200); continue; }
    attempts++;
    await page.touchscreen.tap(t.x, t.y);   // ensure the element sees a touch
    await page.waitForTimeout(50);

    // Manual touch sequence with a drag in the middle.
    const client = await page.context().newCDPSession(page);
    const touch = (type, x, y) => client.send('Input.dispatchTouchEvent', {
      type,
      touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1, radiusX: 12, radiusY: 12, force: 1 }],
    });
    await touch('touchStart', t.x, t.y);
    const t0 = Date.now();
    while (Date.now() - t0 < 300) {
      const n = await findTarget();
      if (n) await touch('touchMove', n.x, n.y);
      await page.waitForTimeout(30);
    }
    await touch('touchEnd', t.x, t.y);
    await page.waitForTimeout(600);

    const after = await page.evaluate(() => window.game.scorer.getItemsIntercepted());
    if (after > before + hits) hits++;
    await page.waitForTimeout(150);
  }

  const final = await page.evaluate(() => ({
    intercepted: window.game.scorer.getItemsIntercepted(),
    score: window.game.scorer.getScore(),
    state: window.game.state,
  }));

  console.log('touch attempts      :', attempts);
  console.log('touch hits          :', hits);
  console.log('final               :', JSON.stringify(final));
  console.log('errors              :', errs.length ? errs : 'none');

  await browser.close();
  console.log(hits > 0 ? 'RESULT: TOUCH DRAG-AIM WORKS' : 'RESULT: TOUCH DRAG-AIM NOT CONFIRMED');
})();
