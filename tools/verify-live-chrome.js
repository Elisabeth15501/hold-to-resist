// Live check for the round-4 chrome: the deployed entry screen must show only
// the language/sound cluster, the stat tiles must appear once the round
// starts, and the title must clear the top bar.
const { chromium } = require(process.env.PW_MODULE);
const EXEC = 'C:/Users/elisa/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe';
const URL = 'https://elisabeth15501.github.io/hold-to-resist/';
const OUT = 'C:/Users/elisa/WorkBuddy/hold-to-resist/shots';

let fail = 0;
function ok(c, m) { console.log((c ? 'ok    ' : 'FAIL  ') + m); if (!c) fail++; }

(async () => {
  const browser = await chromium.launch({ executablePath: EXEC, headless: true });

  const d = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await d.goto(URL, { waitUntil: 'load' });
  await d.waitForTimeout(1500);
  const entry = await d.evaluate(() => {
    const vis = (el) => el && el.getClientRects().length > 0;
    const title = document.getElementById('title').getBoundingClientRect();
    const bar = document.querySelector('.topbar').getBoundingClientRect();
    return {
      menu: document.body.classList.contains('menu'),
      score: vis(document.getElementById('hudScoreLabel')),
      lang: vis(document.querySelector('.lang-select')),
      strip: vis(document.getElementById('modeBar')),
      titleTop: title.top, barBottom: bar.bottom,
    };
  });
  console.log(JSON.stringify(entry));
  ok(entry.menu, 'live entry screen is in menu mode');
  ok(!entry.score, 'live entry screen hides the stat tiles');
  ok(entry.lang, 'live entry screen keeps the language switcher');
  ok(!entry.strip, 'live entry screen hides the objective strip');
  ok(entry.titleTop >= entry.barBottom - 1, 'live title is not covered by the top bar');
  await d.screenshot({ path: OUT + '/live-chrome-entry.png' });

  await d.click('#startBtn');
  await d.waitForTimeout(4200);
  const inGame = await d.evaluate(() => ({
    menu: document.body.classList.contains('menu'),
    score: document.getElementById('hudScoreLabel').getClientRects().length > 0,
    strip: document.getElementById('modeBar').getClientRects().length > 0,
  }));
  console.log(JSON.stringify(inGame));
  ok(!inGame.menu, 'live round drops the menu chrome');
  ok(inGame.score, 'live round shows the stat tiles');
  ok(inGame.strip, 'live round shows the objective strip');
  await d.screenshot({ path: OUT + '/live-chrome-ingame.png' });

  const m = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
  await m.goto(URL, { waitUntil: 'load' });
  await m.waitForTimeout(1500);
  const mob = await m.evaluate(() => {
    const t = document.getElementById('title').getBoundingClientRect();
    const b = document.querySelector('.topbar').getBoundingClientRect();
    return { titleTop: t.top, barBottom: b.bottom, menu: document.body.classList.contains('menu') };
  });
  console.log(JSON.stringify(mob));
  ok(mob.menu, 'live mobile entry screen is in menu mode');
  ok(mob.titleTop >= mob.barBottom - 1, 'live mobile title is not covered by the top bar');
  await m.screenshot({ path: OUT + '/live-chrome-mobile.png' });

  await browser.close();
  console.log(fail ? '\n' + fail + ' FAILURES' : '\nLIVE CHROME CHECK PASSED');
  process.exit(fail ? 1 : 0);
})();
