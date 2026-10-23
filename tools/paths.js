// Shared path resolution for the Playwright test harness.
//
// Every script resolves paths relative to its own location so the repo works
// on any machine, without hard-coding one developer's home directory.
// Override with the environment when needed:
//   CHROME_PATH  - the Chromium/Chrome executable to drive
//   PW_OUT_DIR   - where the screenshots are written
const path = require('path');
const fs = require('fs');

const REPO_ROOT = path.resolve(__dirname, '..');
const INDEX_HTML = path.join(REPO_ROOT, 'index.html');

// The local game, used by every offline suite.
const TARGET = 'file:///' + INDEX_HTML.replace(/\\/g, '/');

// The public deployment, used by the verify-live-* suites.
const LIVE_URL = 'https://elisabeth15501.github.io/hold-to-resist/';

const DEFAULT_CHROME = 'C:/Users/elisa/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe';

function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const candidates = [
    DEFAULT_CHROME,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  // Nothing found: let Playwright use its own bundled Chromium.
  return undefined;
}

function outDir() {
  const dir = process.env.PW_OUT_DIR || path.join(REPO_ROOT, 'shots');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

module.exports = { REPO_ROOT, INDEX_HTML, TARGET, LIVE_URL, chromePath, outDir };
