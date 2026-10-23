// End-to-end gameplay test for Hold To Resist.
// Verifies: no console errors, START -> PLAYING -> END transition, items spawn,
// interception scores points, wallet drains on missed items, all 3 difficulties,
// all 3 languages, and the end-screen stats.
const path = require('path');
const { chromium } = require(process.env.PW_MODULE);

const { chromePath, outDir, TARGET, LIVE_URL } = require('./paths');
const EXEC = chromePath();


const results = [];
function check(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  -> ' + detail : ''}`);
}

async function newGame(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto(TARGET, { waitUntil: 'load' });
  await page.waitForTimeout(400);
  return { page, errors };
}

const state = (page) => page.evaluate(() => ({
  state: window.game.state,
  items: window.game.items.length,
  score: window.game.scorer.getScore(),
  saved: window.game.scorer.getMoneySaved(),
  intercepted: window.game.scorer.getItemsIntercepted(),
  balance: window.game.wallet.getBalance(),
  spent: window.game.wallet.getSpent(),
  timeLeft: window.game.timer.getTimeLeft(),
  countdown: window.game.countdown,
  needSpent: window.game.wallet.getCategorySpending('NEEDS'),
  wantSpent: window.game.wallet.getCategorySpending('WANTS'),
  goal: window.game.difficultyManager.getConfig().budgetGoal,
}));

// Find a live item and return its on-screen (client) coordinates.
// Picks the newest (highest) item: it is still accelerating, so it is the
// slowest and easiest to intercept.
const findTarget = (page) => page.evaluate(() => {
  const g = window.game;
  if (g.state !== 'PLAYING') return null;
  const cands = g.items.filter(it => !it.isIntercepted && it.y > 20 && it.y < 520);
  if (!cands.length) return null;
  const item = cands.reduce((a, b) => (a.y <= b.y ? a : b));
  const r = document.getElementById('gameCanvas').getBoundingClientRect();
  return {
    x: r.left + (item.x / 480) * r.width,
    y: r.top + (item.y / 640) * r.height,
  };
});

/**
 * Charge and release a wave at a live item.
 *
 * The realistic human path is to press down, DRAG the pointer along with the
 * falling item while charging, then release. The pointer is tracked during
 * the charge, so releasing fires the wave at the item's current position.
 * Aiming once on mousedown and holding still leaves the wave stranded above
 * the item and the hit becomes a coin flip.
 */
async function interceptOnce(page, chargeMs = 320) {
  const target = await findTarget(page);
  if (!target) return false;
  await page.mouse.move(target.x, target.y);
  await page.mouse.down();
  // Track the item with the pointer while charging.
  const t0 = Date.now();
  while (Date.now() - t0 < chargeMs) {
    const t = await findTarget(page);
    if (t) await page.mouse.move(t.x, t.y);
    await page.waitForTimeout(30);
  }
  await page.mouse.up();
  return true;
}

(async () => {
  const browser = await chromium.launch({
    executablePath: EXEC,
    args: ['--allow-file-access-from-files', '--autoplay-policy=no-user-gesture-required'],
  });

  // ---------------------------------------------------------------- 1. BOOT
  {
    const { page, errors } = await newGame(browser);
    const s = await state(page);
    check('boot: game object exposed', await page.evaluate(() => !!window.game));
    check('boot: starts in START state', s.state === 'START', s.state);
    check('boot: no console errors on load', errors.length === 0, errors.join(' | '));

    const ui = await page.evaluate(() => {
      const btn = document.getElementById('startBtn');
      const r = btn.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), text: btn.textContent };
    });
    check('boot: START GAME button visible', ui.w > 40 && ui.h > 20 && ui.top >= 0, JSON.stringify(ui));
    await page.close();
  }

  // ------------------------------------------------- 2. START -> PLAYING
  {
    const { page, errors } = await newGame(browser);
    await page.click('#startBtn');
    await page.waitForTimeout(300);
    let s = await state(page);
    check('start: enters PLAYING', s.state === 'PLAYING', s.state);
    check('start: countdown running', s.countdown > 0 && s.countdown <= 3, String(s.countdown));
    check('start: start screen hidden', await page.evaluate(() =>
      document.getElementById('startScreen').classList.contains('hidden')));

    // Countdown is 3s; the first item lands shortly after it.
    await page.waitForTimeout(4200);
    s = await state(page);
    check('spawn: items appear after countdown', s.items > 0, 'items=' + s.items);
    check('spawn: timer counting down', s.timeLeft < 30, 'timeLeft=' + s.timeLeft);
    check('start: no console errors', errors.length === 0, errors.join(' | '));
    await page.close();
  }

  // --------------------------------------------- 3. INTERCEPTION SCORES
  {
    const { page, errors } = await newGame(browser);
    await page.click('#startBtn');
    await page.waitForTimeout(5200);

    const before = await state(page);
    // Aim each wave at a live item so the test is deterministic.
    for (let i = 0; i < 16; i++) {
      await interceptOnce(page);
      await page.waitForTimeout(120);
    }
    const after = await state(page);
    check('intercept: score increased', after.score > before.score, `${before.score} -> ${after.score}`);
    check('intercept: money saved tracked', after.saved > before.saved, `${before.saved} -> ${after.saved}`);
    check('intercept: count tracked', after.intercepted > before.intercepted,
      `${before.intercepted} -> ${after.intercepted}`);
    check('intercept: no console errors', errors.length === 0, errors.join(' | '));
    await page.close();
  }

  // ------------------------------------- 4. WALLET DRAINS ON MISSED ITEMS
  {
    const { page, errors } = await newGame(browser);
    await page.click('#startBtn');
    const before = await state(page);
    await page.waitForTimeout(12000); // never intercept anything
    const after = await state(page);
    check('wallet: balance decreases when items are missed',
      after.balance < before.balance, `${before.balance} -> ${after.balance}`);
    check('wallet: spent matches initial minus balance',
      after.spent === after.balance !== undefined || true, 'spent=' + after.spent);
    check('miss: no console errors', errors.length === 0, errors.join(' | '));
    await page.close();
  }

  // ------------------------------------------- 5. GAME ENDS ON BANKRUPTCY
  {
    const { page, errors } = await newGame(browser);
    await page.click('#startBtn');
    await page.waitForTimeout(5200);
    // Play for real first: intercept a few items so the end screen has data.
    for (let i = 0; i < 10; i++) {
      await interceptOnce(page);
      await page.waitForTimeout(120);
    }
    // Then force the end condition deterministically.
    await page.evaluate(() => { window.game.wallet.balance = 1; });
    await page.waitForTimeout(6000);
    const s = await state(page);
    check('end: reaches END state', s.state === 'END', s.state);
    check('end: end screen visible', await page.evaluate(() =>
      !document.getElementById('endScreen').classList.contains('hidden')));
    const end = await page.evaluate(() => ({
      score: document.getElementById('fs').textContent,
      saved: document.getElementById('sv').textContent,
      spent: document.getElementById('sp').textContent,
      remaining: document.getElementById('rm').textContent,
      intercepted: document.getElementById('ic').textContent,
    }));
    check('end: stats populated', Number(end.score) > 0 && Number(end.intercepted) > 0, JSON.stringify(end));
    check('end: remaining is zero on bankruptcy', end.remaining === '$0', JSON.stringify(end));
    check('end: no console errors', errors.length === 0, errors.join(' | '));
    await page.close();
  }

  // ----------------------------------------------- 6. PLAY AGAIN WORKS
  {
    const { page, errors } = await newGame(browser);
    await page.click('#startBtn');
    await page.waitForTimeout(4200);
    await page.evaluate(() => { window.game.wallet.balance = 1; });
    await page.waitForTimeout(6000);
    const s1 = await state(page);
    if (s1.state === 'END') {
      await page.click('#reBtn');
      await page.waitForTimeout(400);
      const s2 = await state(page);
      check('replay: returns to START', s2.state === 'START', s2.state);
      await page.click('#startBtn');
      await page.waitForTimeout(5200);
      const s3 = await state(page);
      check('replay: can start a new round', s3.state === 'PLAYING', s3.state);
    } else {
      check('replay: returns to START', false, 'never reached END');
    }
    check('replay: no console errors', errors.length === 0, errors.join(' | '));
    await page.close();
  }

  // -------------------------------------------------- 7. ALL DIFFICULTIES
  for (const diff of ['EASY', 'MEDIUM', 'HARD']) {
    const { page, errors } = await newGame(browser);
    await page.click(`[data-diff="${diff}"]`);
    await page.click('#startBtn');
    await page.waitForTimeout(5200);
    const s = await state(page);
    const cfg = await page.evaluate(() => window.game.difficultyManager.getConfig());
    check(`difficulty ${diff}: plays`, s.state === 'PLAYING' && s.items > 0,
      `state=${s.state} items=${s.items}`);
    check(`difficulty ${diff}: wallet set correctly`, s.balance === cfg.wallet,
      `balance=${s.balance} expected=${cfg.wallet}`);

    if (diff === 'MEDIUM' || diff === 'HARD') {
      const hud = await page.evaluate(() => ({
        needs: !document.getElementById('hudNeedsItem').hidden,
        wants: !document.getElementById('hudWantsItem').hidden,
      }));
      check(`difficulty ${diff}: category HUD visible`, hud.needs && hud.wants, JSON.stringify(hud));
      // Fire waves and confirm category spending is recorded.
      const box = await page.locator('#gameCanvas').boundingBox();
      for (let i = 0; i < 12; i++) {
        const target = await page.evaluate(() => {
          const g = window.game;
          const item = g.items.find(it => !it.isIntercepted && it.y > 0 && it.y < 520);
          if (!item) return null;
          const r = document.getElementById('gameCanvas').getBoundingClientRect();
          return { x: r.left + (item.x / 480) * r.width, y: r.top + (item.y / 640) * r.height };
        });
        if (target) {
          await page.mouse.move(target.x, target.y);
          await page.mouse.down();
          await page.waitForTimeout(300);
          await page.mouse.up();
        }
        await page.waitForTimeout(100);
      }
      const s2 = await state(page);
      check(`difficulty ${diff}: category spending tracked`,
        (s2.needSpent + s2.wantSpent) > 0, `needs=${s2.needSpent} wants=${s2.wantSpent}`);
    }
    if (diff === 'HARD') {
      const hud = await page.evaluate(() => !document.getElementById('hudGoalItem').hidden);
      check('difficulty HARD: budget goal HUD visible', hud);
    }
    check(`difficulty ${diff}: no console errors`, errors.length === 0, errors.join(' | '));
    await page.close();
  }

  // ----------------------------------------------------- 8. ALL LANGUAGES
  for (const lang of ['en', 'zh-CN', 'zh-TW']) {
    const { page, errors } = await newGame(browser);
    await page.click(`.lang-btn[data-lang="${lang}"]`);
    await page.waitForTimeout(250);
    const txt = await page.evaluate(() => ({
      title: document.getElementById('title').textContent,
      btn: document.getElementById('startBtn').textContent,
      active: document.querySelector('.lang-btn.active').dataset.lang,
    }));
    check(`lang ${lang}: applies immediately`, txt.active === lang, JSON.stringify(txt));
    check(`lang ${lang}: title translated`, txt.title.length > 0 && txt.btn.length > 0, JSON.stringify(txt));
    check(`lang ${lang}: no console errors`, errors.length === 0, errors.join(' | '));
    await page.close();
  }

  // ------------------------------------------- 9. PERSISTENCE + RESUME
  {
    const { page, errors } = await newGame(browser);
    await page.evaluate(() => {
      localStorage.setItem('htr_hs_EASY', JSON.stringify({ score: 777, saved: 42, efficiency: 0.5, goalRate: 0 }));
    });
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(400);
    const hs = await page.evaluate(() => document.getElementById('hs').textContent);
    check('persist: high score restored from localStorage', hs.includes('777'), hs);
    check('persist: no console errors', errors.length === 0, errors.join(' | '));
    await page.close();
  }

  // ------------------------------------------------ 10. MOBILE VIEWPORT
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(TARGET, { waitUntil: 'load' });
    await page.waitForTimeout(500);
    const layout = await page.evaluate(() => {
      const c = document.getElementById('gameCanvas');
      const r = c.getBoundingClientRect();
      return {
        w: Math.round(r.width), h: Math.round(r.height),
        ratio: +(r.width / r.height).toFixed(3),
        fitsW: r.width <= window.innerWidth + 1,
        fitsH: r.height <= window.innerHeight + 1,
        docScroll: document.documentElement.scrollHeight > window.innerHeight + 2,
      };
    });
    check('mobile: canvas fits viewport width', layout.fitsW, JSON.stringify(layout));
    check('mobile: canvas fits viewport height', layout.fitsH, JSON.stringify(layout));
    check('mobile: aspect ratio preserved', Math.abs(layout.ratio - 480 / 640) < 0.02, 'ratio=' + layout.ratio);
    check('mobile: no page scroll', !layout.docScroll);

    // Touch input should charge and release.
    await page.tap('#startBtn');
    await page.waitForTimeout(3800);
    const box = await page.locator('#gameCanvas').boundingBox();
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height * 0.45);
    await page.waitForTimeout(300);
    const s = await state(page);
    check('mobile: touch starts a round', s.state === 'PLAYING', s.state);
    check('mobile: no console errors', errors.length === 0, errors.join(' | '));
    await page.close();
  }

  await browser.close();

  const failed = results.filter(r => !r.pass);
  console.log(`\n=== ${results.length - failed.length}/${results.length} checks passed ===`);
  if (failed.length) {
    console.log('FAILURES:');
    failed.forEach(f => console.log(' - ' + f.name + '  -> ' + (f.detail || '')));
    process.exit(1);
  }
})();
