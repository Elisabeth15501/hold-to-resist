# Hold To Resist (按住别买)

A retro 8-bit arcade web game about resisting shopping temptation. Falling
"temptation items" (🧋 🏷️ 💎 📱 🎮 …) drop toward a shopping cart. Hold to
charge, release to fire an interception wave that bounces them back up. Items
that reach the cart cost you money — the game ends when your wallet hits $0.

Single file, zero build step, zero runtime dependencies.

## Play

Open `index.html` in a browser. That's it.

## Difficulty tiers

| Tier | Wallet | Time | Mechanics |
|------|--------|------|-----------|
| **EASY** | $100 | 30s | Pure interception, no spending limits |
| **MEDIUM** | $150 | 30s | NEEDS / WANTS categories, per-category spending limits, end-of-round budget bonus & overspend penalty |
| **HARD** | $200 | 45s | Budget goal ($150 kept), bargain items that expire, urgency levels, time penalties for missed items |

## Controls

- **Mouse / touch**: press and hold to charge, release to fire the wave
- Longer hold = wider wave (3 tiers)
- Click the **EN / 简 / 繁** buttons to switch language
- Click **♪** to toggle sound

## Features

- 3 languages (English, 简体中文, 繁體中文) with `localStorage` persistence
- Per-difficulty high scores with saved-money / efficiency / goal-rate records
- 8-bit chiptune sound effects built on the Web Audio API (no audio assets)
- CRT scanline overlay, neon glow, pixel-art rendering
- Responsive: fixed 480×640 logical resolution, scaled to fit any screen with
  the aspect ratio preserved; full touch support on mobile
- Keyboard-accessible buttons, `prefers-reduced-motion` friendly

## Tech

Pure HTML5 + CSS3 + vanilla JavaScript. No frameworks, no bundler, no
dependencies. All game logic, rendering, i18n, audio and persistence live in
`index.html`.

## Project layout

```
hold-to-resist/
├── index.html                  # the entire game
├── tools/                      # Playwright test harness (dev only)
│   ├── e2e.js                  # 56-assertion end-to-end suite
│   ├── soak.js                 # full-round playthroughs
│   ├── limits.js               # category spending-limit checks
│   └── mechanics.js            # bargain/urgency/scoring/sound checks
└── .kiro/specs/hold-to-resist/
    ├── requirements.md         # 15 requirements
    ├── design.md               # technical design
    └── tasks.md                # task list + bug fix log
```

## Tests

The suite drives a real Chromium via Playwright. Point `PW_MODULE` at a
Playwright install and run:

```bash
PW_MODULE=/path/to/node_modules/playwright node tools/e2e.js
```

It covers boot, the START → PLAYING → END → replay state machine, item
spawning, interception scoring, wallet depletion, bankruptcy, all three
difficulty tiers, all three languages, `localStorage` persistence, and the
mobile viewport with touch input.

## Spec reconciliation

`requirements.md` 6.7/6.8 list MEDIUM at $200 and HARD at $150, which makes
HARD's "save $150" goal unreachable on a $150 wallet. `design.md` and the
project handoff both specify MEDIUM $150 / HARD $200, which is internally
consistent — the implementation follows **design.md**. See the bug fix log at
the bottom of `.kiro/specs/hold-to-resist/tasks.md` for the full history of
the fixes that made the game playable.

## License

MIT
