// Play full rounds to completion; report balance and check for leaks/errors.
const { chromium } = require(process.env.PW_MODULE);
const EXEC = 'C:/Users/elisa/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe';
(async () => {
  const browser = await chromium.launch({ executablePath: EXEC, args: ['--allow-file-access-from-files'] });
  for (const diff of ['EASY', 'MEDIUM', 'HARD']) {
    const page = await browser.newPage({ viewport: { width: 1180, height: 900 } });
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
    await page.goto('file:///C:/Users/elisa/dev/hold-to-resist/index.html', { waitUntil: 'load' });
    await page.waitForTimeout(300);
    await page.click(`[data-diff="${diff}"]`);
    await page.click('#startBtn');
    await page.waitForTimeout(3400);

    const box = await page.locator('#gameCanvas').boundingBox();
    // Play "well": fire a wave every 400ms across the field.
    const t0 = Date.now();
    while (Date.now() - t0 < 50000) {
      const st = await page.evaluate(() => window.game.state);
      if (st !== 'PLAYING') break;
      const x = box.x + box.width * (0.2 + 0.6 * Math.random());
      const y = box.y + box.height * (0.35 + 0.3 * Math.random());
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.waitForTimeout(260);
      await page.mouse.up();
      await page.waitForTimeout(140);
    }
    const res = await page.evaluate(() => ({
      state: window.game.state,
      score: document.getElementById('fs').textContent,
      saved: document.getElementById('sv').textContent,
      spent: document.getElementById('sp').textContent,
      remaining: document.getElementById('rm').textContent,
      intercepted: document.getElementById('ic').textContent,
      title: document.getElementById('endTitle').textContent,
      record: !document.getElementById('newRecord').hidden,
      itemsLeft: window.game.items.length,
    }));
    console.log(`${diff}: ${JSON.stringify(res)}`);
    console.log(`   errors: ${errs.length ? errs.join(' | ') : '(none)'}`);
    await page.close();
  }
  await browser.close();
})();
