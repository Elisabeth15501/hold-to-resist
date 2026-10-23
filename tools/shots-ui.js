// Capture the UI at desktop and mobile widths for every difficulty and
// language, so the typography and the HUD labels can be eyeballed.
const { chromium } = require(process.env.PW_MODULE);
const { chromePath, outDir, TARGET, LIVE_URL } = require('./paths');
const EXEC = chromePath();

const OUT = outDir();

(async () => {
  const browser = await chromium.launch(EXEC ? { executablePath: EXEC, headless: true } : { headless: true });

  // Desktop start screen.
  const d = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await d.goto(TARGET, { waitUntil: 'load' });
  await d.waitForTimeout(1200);
  await d.screenshot({ path: OUT + '/ui-desktop-start.png' });

  // Desktop HUD in HARD mode with Chinese selected.
  await d.click('.lang-btn[data-lang="zh-CN"]');
  await d.click('[data-diff="HARD"]');
  await d.waitForTimeout(300);
  await d.screenshot({ path: OUT + '/ui-desktop-hard-zh.png' });

  await d.click('#startBtn');
  await d.waitForTimeout(5000);
  await d.screenshot({ path: OUT + '/ui-desktop-hud-hard-zh.png' });

  // Mobile.
  const m = await browser.newPage({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true,
  });
  await m.goto(TARGET, { waitUntil: 'load' });
  await m.waitForTimeout(1200);
  await m.screenshot({ path: OUT + '/ui-mobile-start.png' });
  await m.click('.lang-btn[data-lang="zh-CN"]');
  await m.click('[data-diff="MEDIUM"]');
  await m.waitForTimeout(300);
  await m.tap('#startBtn');
  await m.waitForTimeout(5000);
  await m.screenshot({ path: OUT + '/ui-mobile-hud-medium-zh.png' });

  // Report the computed HUD label text so translation can be asserted.
  const labels = await d.evaluate(() => ({
    score: document.getElementById('hudScoreLabel').textContent,
    wallet: document.getElementById('hudWalletLabel').textContent,
    time: document.getElementById('hudTimeLabel').textContent,
    needs: document.getElementById('hudNeedsLabel').textContent,
    wants: document.getElementById('hudWantsLabel').textContent,
    goal: document.getElementById('hudGoalLabel').textContent,
  }));
  console.log('HUD labels (zh-CN):', JSON.stringify(labels));

  const sizes = await d.evaluate(() => {
    const px = (sel) => {
      const el = document.querySelector(sel);
      return el ? getComputedStyle(el).fontSize : null;
    };
    return {
      h1: px('h1'), hudLabel: px('.hud-label'), hudValue: px('.hud-value'),
      btn: px('#startBtn'), diffBtn: px('.diff-btn'), muted: px('.muted'),
    };
  });
  console.log('desktop sizes:', JSON.stringify(sizes));

  const mSizes = await m.evaluate(() => {
    const px = (sel) => {
      const el = document.querySelector(sel);
      return el ? getComputedStyle(el).fontSize : null;
    };
    return { h1: px('h1'), hudLabel: px('.hud-label'), hudValue: px('.hud-value') };
  });
  console.log('mobile sizes :', JSON.stringify(mSizes));

  await browser.close();
})();
