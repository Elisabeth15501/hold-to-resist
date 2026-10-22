// Verify MEDIUM/HARD category spending limits and HARD budget goal mechanics.
const { chromium } = require(process.env.PW_MODULE);
const EXEC = 'C:/Users/elisa/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe';
(async () => {
  const browser = await chromium.launch({ executablePath: EXEC, args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1180, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto('file:///C:/Users/elisa/dev/hold-to-resist/index.html', { waitUntil: 'load' });
  await page.waitForTimeout(400);

  await page.click('[data-diff="MEDIUM"]');
  await page.click('#startBtn');
  await page.waitForTimeout(4300);

  // Drive NEEDS spending past the $80 limit directly through the wallet API.
  const r1 = await page.evaluate(() => {
    const w = window.game.wallet;
    w.deduct(80, 'NEEDS');
    return {
      needs: w.getCategorySpending('NEEDS'),
      limit: w.getCategoryLimit('NEEDS'),
      locked: w.isCategoryLocked('NEEDS'),
      balance: w.getBalance(),
    };
  });
  console.log('after $80 NEEDS:', JSON.stringify(r1));

  // A further NEEDS item must NOT be charged (Requirement 12.10).
  const r2 = await page.evaluate(() => {
    const before = window.game.wallet.getBalance();
    const applied = window.game.wallet.deduct(15, 'NEEDS');
    return { before, applied, after: window.game.wallet.getBalance(),
             needs: window.game.wallet.getCategorySpending('NEEDS') };
  });
  console.log('extra NEEDS deduct:', JSON.stringify(r2));
  console.log(r2.applied === 0 && r2.after === r2.before ? 'PASS limit blocks further charging'
                                                     : 'FAIL limit did not block');

  // WANTS is unaffected.
  const r3 = await page.evaluate(() => {
    const before = window.game.wallet.getBalance();
    const applied = window.game.wallet.deduct(20, 'WANTS');
    return { applied, wantsLocked: window.game.wallet.isCategoryLocked('WANTS') };
  });
  console.log('WANTS still chargeable:', JSON.stringify(r3));

  // HARD: bargain items expire after 5s.
  await page.evaluate(() => window.game.goStart());
  await page.click('[data-diff="HARD"]');
  await page.click('#startBtn');
  await page.waitForTimeout(4300);
  const bargain = await page.evaluate(() => {
    const items = window.game.items;
    return { count: items.length, bargainFlags: items.map(i => i.isBargain) };
  });
  console.log('HARD spawns:', JSON.stringify(bargain));

  // Confirm HARD items carry urgency and that bargain expiry removes an item.
  const expiry = await page.evaluate(async () => {
    const g = window.game;
    const item = g.items.find(i => i.isBargain);
    if (!item) return { skipped: true };
    item.ageMs = 4999;
    g.update(50);
    return { removed: !g.items.includes(item) };
  });
  console.log('bargain expiry:', JSON.stringify(expiry));

  // Budget goal progress.
  const goal = await page.evaluate(() => {
    const g = window.game;
    g.scorer.addMoneySaved(75);
    g.updateHUD();
    return { saved: g.scorer.getMoneySaved(), goal: g.difficultyManager.getConfig().budgetGoal,
             hudText: document.getElementById('hudGoal').textContent };
  });
  console.log('budget goal:', JSON.stringify(goal));

  console.log('errors:', errs.length ? errs.join(' | ') : '(none)');
  await browser.close();
})();
