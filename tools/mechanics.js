// Verify bargain expiry, urgency, MEDIUM score bonus/penalty, time penalty, sound toggle.
const { chromium } = require(process.env.PW_MODULE);
const { chromePath, outDir, TARGET, LIVE_URL } = require('./paths');
const EXEC = chromePath();
(async () => {
  const browser = await chromium.launch({ executablePath: EXEC, args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1180, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto(TARGET, { waitUntil: 'load' });
  await page.waitForTimeout(400);

  // ---- HARD bargain expiry (force a bargain template) ----
  await page.click('[data-diff="HARD"]');
  await page.click('#startBtn');
  await page.waitForTimeout(4300);
  const exp = await page.evaluate(() => {
    const g = window.game;
    const T = window.TemptationItems.find(t => t.bargain);
    const item = g.itemSpawner.spawn(g.difficultyManager.getConfig(), { template: T });
    g.items.push(item);
    const isBargain = item.isBargain;
    item.ageMs = 4999;
    g.update(50);
    const removed = !g.items.includes(item);
    return { isBargain, removed };
  });
  console.log('bargain:', JSON.stringify(exp), exp.isBargain && exp.removed ? 'PASS' : 'FAIL');

  // ---- HARD time penalty ----
  const tp = await page.evaluate(() => {
    const g = window.game;
    const before = g.timer.timeLeft;
    g.timer.applyPenalty(2);
    return { before: +before.toFixed(1), after: +g.timer.timeLeft.toFixed(1),
             cfg: g.difficultyManager.getConfig().timePenalty };
  });
  console.log('time penalty:', JSON.stringify(tp), tp.cfg === 2 && tp.after < tp.before ? 'PASS' : 'FAIL');

  // ---- MEDIUM bonus / penalty ----
  await page.evaluate(() => window.game.goStart());
  await page.click('[data-diff="MEDIUM"]');
  await page.click('#startBtn');
  await page.waitForTimeout(4300);
  const bonus = await page.evaluate(() => {
    const g = window.game;
    g.scorer.score = 100;
    g.wallet.spent = 10;             // < 50% of the $150 wallet -> +15% bonus
    g.endGame('time');
    return { shown: document.getElementById('fs').textContent,
             adjust: document.getElementById('adjust').textContent };
  });
  console.log('MEDIUM bonus:', JSON.stringify(bonus));

  const penalty = await page.evaluate(() => {
    const g = window.game;
    g.goStart();
    g.start();
    g.countdown = 0;
    g.scorer.score = 100;
    g.wallet.spent = 10;
    g.wallet.categorySpending.NEEDS = 70;  // > 80% of the $80 limit -> -10%
    g.endGame('time');
    return { shown: document.getElementById('fs').textContent,
             adjust: document.getElementById('adjust').textContent };
  });
  console.log('MEDIUM penalty:', JSON.stringify(penalty));

  // ---- EASY has no category panels ----
  await page.evaluate(() => window.game.goStart());
  await page.click('[data-diff="EASY"]');
  await page.click('#startBtn');
  await page.waitForTimeout(4300);
  const easy = await page.evaluate(() => ({
    needs: getComputedStyle(document.getElementById('hudNeedsItem')).display,
    goal: getComputedStyle(document.getElementById('hudGoalItem')).display,
  }));
  console.log('EASY panels hidden:', JSON.stringify(easy),
    easy.needs === 'none' && easy.goal === 'none' ? 'PASS' : 'FAIL');

  // ---- sound toggle ----
  const snd = await page.evaluate(() => {
    const before = window.game.sound.enabled;
    window.game.toggleSound();
    const after = window.game.sound.enabled;
    window.game.toggleSound();
    return { before, after, restored: window.game.sound.enabled,
             stored: localStorage.getItem('htr_sound') };
  });
  console.log('sound toggle:', JSON.stringify(snd), snd.before !== snd.after ? 'PASS' : 'FAIL');

  console.log('errors:', errs.length ? errs.join(' | ') : '(none)');
  await browser.close();
})();
