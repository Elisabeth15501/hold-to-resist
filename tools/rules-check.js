// Verify the difficulty-rules layer: the start screen must state the mode
// rules AND both end conditions, and the same text must survive a language
// switch. Also checks the in-game objective strip and the end-screen reason.
const { chromium } = require(process.env.PW_MODULE);
const { chromePath, outDir, TARGET, LIVE_URL } = require('./paths');
const EXEC = chromePath();

const OUT = outDir();

let failures = 0;
function check(name, ok, extra) {
  if (!ok) { failures++; console.log('FAIL  ' + name + (extra ? '  ' + extra : '')); }
  else console.log('ok    ' + name);
}

(async () => {
  const browser = await chromium.launch(EXEC ? { executablePath: EXEC, headless: true } : { headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  page.on('pageerror', (e) => { failures++; console.log('FAIL  pageerror: ' + e.message); });
  await page.goto(TARGET, { waitUntil: 'load' });
  await page.waitForTimeout(800);

  const read = () => page.evaluate(() => ({
    rulesHead: document.getElementById('rulesHead').textContent,
    rules: Array.from(document.querySelectorAll('#rulesList li')).map((li) => li.textContent),
    endHead: document.getElementById('rulesEndHead').textContent,
    ends: Array.from(document.querySelectorAll('#rulesEndList li')).map((li) => li.textContent),
    goal: document.getElementById('modeGoal').textContent,
    end: document.getElementById('modeEnd').textContent,
    goalKey: document.getElementById('goalKey').textContent,
    endKey: document.getElementById('endKey').textContent,
  }));

  for (const diff of ['EASY', 'MEDIUM', 'HARD']) {
    await page.click('[data-diff="' + diff + '"]');
    await page.waitForTimeout(150);
    const s = await read();
    check(diff + ' has >=3 rule lines', s.rules.length >= 3, JSON.stringify(s.rules.length));
    check(diff + ' states 2 end conditions', s.ends.length === 2, JSON.stringify(s.ends));
    const blob = s.rules.concat(s.ends).join(' | ');
    check(diff + ' mentions wallet $0 end', /\$0|zero|破产|破產|歸零|归零/i.test(blob), blob.slice(0, 90));
    check(diff + ' mentions timer end', /timer|clock|倒计时|倒計時/i.test(blob), blob.slice(0, 90));
    check(diff + ' goal strip not empty', s.goal.length > 5, s.goal);
    check(diff + ' end strip not empty', s.end.length > 5, s.end);
  }

  // MEDIUM/HARD specific mechanics must be named.
  await page.click('[data-diff="MEDIUM"]');
  await page.waitForTimeout(120);
  let s = await read();
  let blob = s.rules.join(' | ');
  check('MEDIUM names the NEEDS cap ($80)', /80/.test(blob), blob);
  check('MEDIUM names the WANTS cap ($120)', /120/.test(blob), blob);
  check('MEDIUM names the +15% bonus', /15%/.test(blob), blob);
  check('MEDIUM names the -10% penalty', /10%/.test(blob), blob);

  await page.click('[data-diff="HARD"]');
  await page.waitForTimeout(120);
  s = await read();
  blob = s.rules.join(' | ');
  check('HARD names the $150 goal', /150/.test(blob), blob);
  check('HARD names the 5s bargain expiry', /5 second|5 秒|5 秒/i.test(blob), blob);
  check('HARD names the 2s time penalty', /2 second|2 秒|2 秒/i.test(blob), blob);
  check('HARD names the 45s duration', /45 second|45 秒|45 秒/i.test(blob), blob);

  // Language switch must re-render the whole rules layer.
  await page.click('.lang-btn[data-lang="zh-CN"]');
  await page.waitForTimeout(200);
  s = await read();
  const zhBlob = s.rules.concat(s.ends).join(' | ');
  check('zh-CN rules are Chinese', /钱包|錢包/.test(zhBlob), zhBlob.slice(0, 90));
  check('zh-CN rules mention bankruptcy', /破产|破產/.test(zhBlob), zhBlob.slice(0, 90));
  check('zh-CN rules mention timer end', /倒计时|倒計時/.test(zhBlob), zhBlob.slice(0, 90));
  check('zh-CN rules line count preserved', s.rules.length === 6 && s.ends.length === 2,
    JSON.stringify([s.rules.length, s.ends.length]));

  await page.click('.lang-btn[data-lang="zh-TW"]');
  await page.waitForTimeout(200);
  s = await read();
  check('zh-TW rules are Traditional', /錢包/.test(s.rules.join(' | ')), s.rules.join(' | ').slice(0, 90));

  await page.click('.lang-btn[data-lang="en"]');
  await page.waitForTimeout(200);
  s = await read();
  check('back to English', /Wallet/.test(s.rules.join(' | ')), s.rules.join(' | ').slice(0, 60));

  // A judge whose browser is Chinese should land on Chinese rules on the
  // first visit, with no stored preference.
  const zhFirst = await browser.newContext({ locale: 'zh-CN' });
  const zhPage = await zhFirst.newPage();
  await zhPage.goto(TARGET, { waitUntil: 'load' });
  await zhPage.waitForTimeout(600);
  const zhTitle = await zhPage.evaluate(() => document.getElementById('title').textContent);
  check('a zh-CN browser starts in Chinese', /按住别买/.test(zhTitle), zhTitle);
  await zhFirst.close();

  const zhTwFirst = await browser.newContext({ locale: 'zh-TW' });
  const zhTwPage = await zhTwFirst.newPage();
  await zhTwPage.goto(TARGET, { waitUntil: 'load' });
  await zhTwPage.waitForTimeout(600);
  const zhTwTitle = await zhTwPage.evaluate(() => document.getElementById('title').textContent);
  check('a zh-TW browser starts in Traditional Chinese', /按住別買/.test(zhTwTitle), zhTwTitle);
  await zhTwFirst.close();

  const enFirst = await browser.newContext({ locale: 'en-US' });
  const enPage = await enFirst.newPage();
  await enPage.goto(TARGET, { waitUntil: 'load' });
  await enPage.waitForTimeout(600);
  const enTitle = await enPage.evaluate(() => document.getElementById('title').textContent);
  check('an English browser still starts in English', /HOLD TO RESIST/.test(enTitle), enTitle);
  await enFirst.close();

  // On the entry screen the objective strip is hidden - the rules card right
  // there already spells the goal and the end conditions out.
  const barHiddenOnEntry = await page.evaluate(() => {
    const el = document.getElementById('modeBar');
    return getComputedStyle(el).display === 'none' || el.getClientRects().length === 0;
  });
  check('objective strip is hidden on the entry screen', barHiddenOnEntry);

  await page.click('[data-diff="HARD"]');
  await page.click('#startBtn');
  await page.waitForTimeout(4200);
  const playing = await page.evaluate(() => ({
    state: window.game.getCurrentState(),
    goal: document.getElementById('modeGoal').textContent,
    end: document.getElementById('modeEnd').textContent,
  }));
  check('game is playing', playing.state === 'PLAYING', playing.state);
  // The mode bar must be visible while playing.
  const barVisible = await page.evaluate(() => {
    const el = document.getElementById('modeBar');
    const r = el.getBoundingClientRect();
    return r.height > 0 && r.width > 0 && getComputedStyle(el).visibility !== 'hidden';
  });
  check('mode bar is laid out', barVisible);
  check('mode bar shows the HARD goal', /150/.test(playing.goal), playing.goal);
  check('mode bar shows the HARD end rule', /-2s|\-2 秒/.test(playing.end), playing.end);
  await page.screenshot({ path: OUT + '/rules-desktop-hud-hard.png' });

  // The HARD goal bar starts met, so it must read as a success, not a warning.
  const goalBar = await page.evaluate(() => {
    const el = document.getElementById('hudGoalBar');
    return { cls: el.className, bg: getComputedStyle(el).backgroundColor };
  });
  check('goal bar uses the success style, not the red warning',
    goalBar.cls.includes('goalMet') && !goalBar.cls.includes(' full'), goalBar.cls);

  // End screen must explain why the round ended.
  await page.evaluate(() => { window.game.timer.timeLeft = 0.05; });
  await page.waitForTimeout(1200);
  const endState = await page.evaluate(() => ({
    state: window.game.getCurrentState(),
    title: document.getElementById('endTitle').textContent,
    reason: document.getElementById('endReasonText').textContent,
  }));
  check('timeout ends the round', endState.state === 'END', endState.state);
  check('end screen states the timeout reason', endState.reason.length > 5, endState.reason);
  await page.screenshot({ path: OUT + '/rules-desktop-end.png' });

  console.log(failures === 0 ? '\nALL RULES CHECKS PASSED' : '\n' + failures + ' FAILURES');
  await browser.close();
  process.exit(failures === 0 ? 0 : 1);
})();
