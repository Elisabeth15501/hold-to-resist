// Verify the live GitHub Pages deployment serves the round-3 rules layer.
const { chromium } = require(process.env.PW_MODULE);
const { chromePath, outDir, LIVE_URL } = require('./paths');
const EXEC = chromePath();
const LIVE = LIVE_URL;

let failures = 0;
function check(name, ok, extra) {
  if (!ok) { failures++; console.log('FAIL  ' + name + (extra ? '  ' + extra : '')); }
  else console.log('ok    ' + name);
}

(async () => {
  const browser = await chromium.launch(EXEC ? { executablePath: EXEC, headless: true } : { headless: true });
  // Pin the locale: the live site follows the browser language on a first
  // visit, so an unpinned context would render Chinese rules.
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'en-US' });
  page.on('pageerror', (e) => { failures++; console.log('FAIL  pageerror: ' + e.message); });
  await page.goto(LIVE, { waitUntil: 'load' });
  await page.waitForTimeout(2500);

  const read = () => page.evaluate(() => ({
    rules: Array.from(document.querySelectorAll('#rulesList li')).map((li) => li.textContent),
    ends: Array.from(document.querySelectorAll('#rulesEndList li')).map((li) => li.textContent),
    goal: document.getElementById('modeGoal').textContent,
    end: document.getElementById('modeEnd').textContent,
    hudWallet: document.getElementById('hudWallet').textContent,
    hudTime: document.getElementById('hudTime').textContent,
  }));

  let s = await read();
  check('live serves the rules list', s.rules.length >= 3, JSON.stringify(s.rules));
  check('live serves the end conditions', s.ends.length === 2, JSON.stringify(s.ends));
  check('live serves the goal strip', s.goal.length > 5, s.goal);

  await page.click('[data-diff="HARD"]');
  await page.waitForTimeout(300);
  s = await read();
  const hardBlob = s.rules.join(' | ');
  check('live HARD rules mention $150', /150/.test(hardBlob), hardBlob);
  // The live site follows the browser locale, so accept either language.
  check('live HARD mentions the 5 second expiry', /5 second|5 秒/i.test(hardBlob), hardBlob);
  check('live HUD mirrors HARD ($200 / 45)', s.hudWallet === '$200' && s.hudTime === '45',
    s.hudWallet + ' / ' + s.hudTime);

  await page.click('.lang-btn[data-lang="zh-CN"]');
  await page.waitForTimeout(300);
  s = await read();
  check('live zh-CN rules are Chinese', /钱包/.test(s.rules.join(' | ')), s.rules.join(' | '));
  check('live zh-CN HUD labels', await page.evaluate(() =>
    document.getElementById('hudWalletLabel').textContent === '钱包'), 'wallet label');

  // The whole round must still be playable end to end on the live build.
  await page.click('[data-diff="MEDIUM"]');
  await page.click('#startBtn');
  await page.waitForTimeout(4500);
  const st = await page.evaluate(() => window.game.getCurrentState());
  check('live round starts', st === 'PLAYING', st);

  await page.evaluate(() => { window.game.timer.timeLeft = 0.05; });
  await page.waitForTimeout(1200);
  const end = await page.evaluate(() => ({
    state: window.game.getCurrentState(),
    reason: document.getElementById('endReasonText').textContent,
  }));
  check('live round ends', end.state === 'END', end.state);
  check('live end screen states the reason', end.reason.length > 5, end.reason);

  console.log(failures === 0 ? '\nLIVE VERIFICATION PASSED' : '\n' + failures + ' FAILURES');
  await browser.close();
  process.exit(failures === 0 ? 0 : 1);
})();
