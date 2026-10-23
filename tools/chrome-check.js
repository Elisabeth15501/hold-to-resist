// Round 4: the entry screen must show ONLY the language/sound cluster.
// The stat HUD and the objective strip appear once the round starts, and the
// title must never be covered by the top bar (desktop + mobile).
const { chromium } = require(process.env.PW_MODULE);
const { chromePath, outDir, TARGET, LIVE_URL } = require('./paths');
const EXEC = chromePath();

const OUT = outDir();

let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  PASS  ' + msg); }
  else { fail++; console.log('  FAIL  ' + msg); }
}

(async () => {
  const browser = await chromium.launch(EXEC ? { executablePath: EXEC, headless: true } : { headless: true });

  // ---------------- desktop ----------------
  const d = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await d.goto(TARGET, { waitUntil: 'load' });
  await d.waitForTimeout(1200);

  console.log('\n== desktop entry screen ==');
  const entry = await d.evaluate(() => {
    const vis = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { w: r.width, h: r.height, top: r.top, bottom: r.bottom, left: r.left, right: r.right };
    };
    return {
      bodyClass: document.body.className,
      hudItems: [...document.querySelectorAll('#hud .hud-item')]
        .filter(el => el.offsetParent !== null || getComputedStyle(el).display !== 'none').length,
      scoreVisible: document.getElementById('hudScoreLabel').getClientRects().length > 0,
      langVisible: getComputedStyle(document.querySelector('.lang-select')).display !== 'none',
      modeBarVisible: getComputedStyle(document.getElementById('modeBar')).display !== 'none',
      title: vis('#title'),
      overlay: vis('#startScreen'),
      chromeH: getComputedStyle(document.documentElement).getPropertyValue('--chrome-h'),
      topbar: vis('.topbar'),
    };
  });
  console.log(JSON.stringify(entry, null, 1));

  ok(entry.bodyClass.includes('menu'), 'body has the "menu" class on the entry screen');
  ok(entry.hudItems === 0, 'no stat tile is visible on the entry screen');
  ok(!entry.scoreVisible, 'the SCORE label is hidden on the entry screen');
  ok(entry.langVisible, 'the language switcher stays visible on the entry screen');
  ok(!entry.modeBarVisible, 'the objective strip is hidden on the entry screen');
  ok(entry.overlay.top >= entry.topbar.bottom - 1,
    'the overlay starts below the top bar (no overlap with the language row)');
  ok(entry.title.top >= entry.overlay.top - 1, 'the title starts inside the visible overlay');
  ok(entry.title.top >= entry.topbar.bottom - 1, 'the title is not covered by the top bar');

  await d.screenshot({ path: OUT + '/chrome-desktop-entry.png' });

  // ---------------- desktop in-game ----------------
  console.log('\n== desktop in-game ==');
  await d.click('[data-diff="HARD"]');
  await d.waitForTimeout(200);
  await d.click('#startBtn');
  await d.waitForTimeout(4200);
  const inGame = await d.evaluate(() => ({
    bodyClass: document.body.className,
    hudItems: [...document.querySelectorAll('#hud .hud-item')]
      .filter(el => getComputedStyle(el).display !== 'none').length,
    modeBarVisible: getComputedStyle(document.getElementById('modeBar')).display !== 'none',
    scoreText: document.getElementById('hudScore').textContent,
  }));
  console.log(JSON.stringify(inGame));
  ok(!inGame.bodyClass.includes('menu'), 'body loses the "menu" class once the round starts');
  ok(inGame.hudItems >= 3, 'the stat tiles come back when the round starts');
  ok(inGame.modeBarVisible, 'the objective strip comes back when the round starts');
  await d.screenshot({ path: OUT + '/chrome-desktop-ingame.png' });

  // ---------------- mobile ----------------
  console.log('\n== mobile entry screen ==');
  const m = await browser.newPage({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true,
  });
  await m.goto(TARGET, { waitUntil: 'load' });
  await m.waitForTimeout(1200);
  const mEntry = await m.evaluate(() => {
    const r = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { top: b.top, bottom: b.bottom, left: b.left, right: b.right };
    };
    return {
      bodyClass: document.body.className,
      scoreVisible: document.getElementById('hudScoreLabel').getClientRects().length > 0,
      langVisible: getComputedStyle(document.querySelector('.lang-select')).display !== 'none',
      title: r('#title'), overlay: r('#startScreen'), topbar: r('.topbar'),
    };
  });
  console.log(JSON.stringify(mEntry, null, 1));
  ok(mEntry.bodyClass.includes('menu'), 'mobile entry screen is in menu mode');
  ok(!mEntry.scoreVisible, 'mobile entry screen hides the SCORE label');
  ok(mEntry.langVisible, 'mobile entry screen keeps the language switcher');
  ok(mEntry.title.top >= mEntry.topbar.bottom - 1, 'mobile title is not covered by the top bar');
  ok(mEntry.overlay.top >= mEntry.topbar.bottom - 1, 'mobile overlay starts below the top bar');
  await m.screenshot({ path: OUT + '/chrome-mobile-entry.png' });

  // ---------------- end screen ----------------
  console.log('\n== end screen ==');
  await m.click('[data-diff="EASY"]');
  await m.waitForTimeout(200);
  await m.tap('#startBtn');
  await m.waitForTimeout(1000);
  // force the round to end
  await m.evaluate(() => game.endGame('bankrupt'));
  await m.waitForTimeout(500);
  const endState = await m.evaluate(() => ({
    bodyClass: document.body.className,
    scoreVisible: document.getElementById('hudScoreLabel').getClientRects().length > 0,
    endVisible: getComputedStyle(document.getElementById('endScreen')).display !== 'none',
  }));
  console.log(JSON.stringify(endState));
  ok(endState.bodyClass.includes('menu'), 'the result screen falls back to menu chrome');
  ok(!endState.scoreVisible, 'the result screen hides the in-game stat tiles');
  ok(endState.endVisible, 'the result screen itself is visible');
  await m.screenshot({ path: OUT + '/chrome-mobile-end.png' });

  await browser.close();
  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})();
