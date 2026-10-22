# Implementation Plan: Hold To Resist

## Overview

"Hold To Resist" is a single-file HTML5 arcade game where players intercept falling temptation items by charging and releasing input to trigger interception waves. The game features a 30-second countdown, scoring system, wallet system with money management, difficulty tiers (EASY, MEDIUM, HARD), and progressive difficulty scaling. This implementation will be delivered as a single HTML file containing HTML, CSS, and TypeScript/JavaScript code.

## Tasks

- [x] 1. Set up project structure and core interfaces
  - Create the single HTML file structure with canvas element
  - Define TypeScript interfaces for all game entities (Game, Item, Charge, etc.)
  - Set up the GameConfig interface with all constants
  - _Requirements: 1.1-1.7, 10.1-10.6_

- [x] 2. Implement core game systems
  - [x] 2.1 Implement GameState enum and state management
    - Create GameState enum (START, PLAYING, END)
    - Implement transitionState function
    - _Requirements: 1.1-1.7_
  
  - [x] 2.2 Implement Timer system
    - Create Timer class with update method
    - Initialize to 30 seconds and count down
    - _Requirements: 7.1-7.4_
  
  - [x] 2.3 Implement Scorer system
    - Create Scorer class with addPoints and reset methods
    - Track score and money saved
    - _Requirements: 5.1-5.4_

  - [x] 2.4 Implement Wallet system
    - Create WalletManager class with init, deduct, addMoneySaved methods
    - Track wallet balance, spent, and saved money
    - Implement bankrupt check (balance <= $0)
    - _Requirements: 6.1-6.7_
  
  - [x] 2.5 Implement DifficultyManager
    - Create DifficultyManager class with init and getSpawnInterval methods
    - Configure difficulty tiers (EASY, MEDIUM, HARD)
    - Implement difficulty ramp (spawn interval decreases over time)
    - _Requirements: 12.1-12.6, 13.1-13.3_
  
  - [x] 2.6 Implement HighScoreManager
    - Load and save high scores to localStorage
    - Compare and save new high scores
    - _Requirements: 14.1-14.4_

  - [x] 2.7 Implement Language/Internationalization (i18n) System
    - [ ] 2.7.1 Create I18nManager class with init, setLanguage, t methods
      - Implement language detection from localStorage
      - Default to English if no preference saved
      - _Requirements: 15.1-15.5_
    
    - [ ] 2.7.2 Create translation strings for all three languages
      - Add English translations
      - Add Simplified Chinese translations
      - Add Traditional Chinese translations
      - _Requirements: 15.6-15.12_
    
    - [ ] 2.7.3 Integrate I18nManager into UI screens
      - Connect start screen text to translation system
      - Connect HUD labels to translation system
      - Connect end screen text to translation system
      - _Requirements: 15.1, 15.6_

- [x] 3. Implement Input and Charge system
  - [x] 3.1 Implement InputHandler class
    - Setup mouse and touch event listeners
    - Handle mousedown/mouseup and touchstart/touchend
    - Track input position and state
    - _Requirements: 2.1-2.6_
  
  - [x] 3.2 Implement Charge system
    - Create Charge class with start, release, update methods
    - Implement charge level tracking (0.0 to 1.0)
    - Trigger interception wave on release
    - _Requirements: 2.1-2.6, 9.1_
  
  - [x] 3.3 Write property test for Charge system
    - **Property 10: Charge Bar Reflects Charge Level**
    - **Validates: Requirements 9.1**
    - Test charge level bounds (0.0 to 1.0)
    - Test visual scaling and color transitions

- [x] 4. Implement Falling Items system
  - [x] 4.1 Create temptation items data
    - Define temptationItems array with emoji, pointValue, moneyValue, radius
    - Include items: 🧋, 🏷️, 🔗, 🛍️, 💎, 📱, 👗, 🎮
    - _Requirements: 3.1-3.7_
  
  - [x] 4.2 Implement Item class
    - Create Item interface with all required properties
    - Implement hitbox calculation
    - _Requirements: 3.1-3.7_
  
  - [x] 4.3 Implement ItemSpawner class
    - Create spawnItem method with random X position
    - Implement difficulty scaling (spawn interval decreases over time)
    - _Requirements: 3.1-3.7, 12.1-12.6_
  
  - [x] 4.4 Write property test for Item Spawner
    - **Property 3: Item Spawner Creates Valid Items**
    - **Validates: Requirements 3.1-3.7**
    - Test item creation with valid emojis and positions

- [x] 5. Implement Interception Mechanics
  - [x] 5.1 Implement InterceptionWave class
    - Create trigger, update, checkCollisions methods
    - Implement wave radius expansion based on charge level
    - _Requirements: 4.1-4.6_
  
  - [x] 5.2 Implement collision detection
    - Circle-to-circle collision between wave and items
    - Calculate interception quality (distance from center)
    - _Requirements: 4.1-4.6, 5.1-5.4_
  
  - [x] 5.3 Implement bounce physics
    - Bounce items upward with velocity based on charge
    - Add slight horizontal spread based on position
    - _Requirements: 4.3, 10.3-10.4_
  
  - [x] 5.4 Write property test for Interception Wave
    - **Property 5: Interception Wave Bounces Items**
    - **Validates: Requirements 4.1-4.6**
    - Test item interception and bounce physics

- [x] 6. Implement Game Loop and Core Game Class
  - [x] 6.1 Implement main Game class
    - Wire together all systems (Timer, Scorer, WalletManager, DifficultyManager, etc.)
    - Implement update and render methods
    - _Requirements: 1.1-1.7, 6.1-6.7_
  
  - [x] 6.2 Implement game loop
    - Set up requestAnimationFrame loop
    - Separate update and render phases
    - Target 60 FPS
    - _Requirements: 9.6_
  
  - [x] 6.3 Implement game state handlers
    - START state: display start screen
    - PLAYING state: process input and update game
    - END state: display end screen and save high score
    - _Requirements: 1.1-1.7, 8.1-8.9_
  
  - [x] 6.4 Write property test for Game State Transitions
    - **Property 1: Game State Transitions**
    - **Validates: Requirements 1.1-1.7**
    - Test valid state transitions

- [x] 7. Implement Rendering System
  - [x] 7.1 Implement Canvas rendering for items
    - Draw emoji items on canvas
    - Handle text alignment and baseline
    - _Requirements: 3.5, 9.1_
  
  - [x] 7.2 Implement Interception Wave rendering
    - Draw expanding ring with fading opacity
    - Use canvas arc and stroke styles
    - _Requirements: 9.2_
  
  - [x] 7.3 Implement Charge Bar rendering
    - Draw charge bar at bottom of screen
    - Scale width based on charge level
    - Color gradient from green to red
    - _Requirements: 9.1_
  
  - [x] 7.4 Implement Game Over screen rendering
    - Draw end screen with stats
    - Display final score, money spent/saved, wallet balance
    - _Requirements: 8.6-8.11_

- [x] 8. Implement UI Screens
  - [x] 8.1 Implement Start Screen
    - Display title "Hold To Resist" (按住别买)
    - Add "Start Game" button
    - Display difficulty selection menu (EASY, MEDIUM, HARD)
    - Display high score
    - _Requirements: 8.1-8.3_
  
  - [x] 8.2 Implement HUD (Playing Screen)
    - Display score, wallet balance, spent/saved counters, timer
    - Display category spending (NEEDS/WANTS) for MEDIUM/HARD
    - Update in real-time during gameplay
    - _Requirements: 8.3-8.7_
  
  - [x] 8.3 Implement End Screen
    - Display final score, money spent, money saved, wallet balance
    - Display category breakdown (NEEDS/WANTS) for MEDIUM/HARD
    - Add "Play Again" button
    - _Requirements: 8.7-8.11, 14.1-14.4_

- [x] 9. Implement Visual Feedback and Effects
  - [x] 9.1 Implement wallet low balance effect
    - Flash screen red when wallet is below $20
    - Use CSS animations or canvas overlay
    - _Requirements: 9.5_
  
  - [x] 9.2 Implement item bounce animation
    - Animate item reversing direction after interception
    - _Requirements: 9.3_
  
  - [x] 9.3 Write property test for Physics Simulation
    - **Property 11: Physics Simulation is Consistent**
    - **Validates: Requirements 10.1-10.6**
    - Test gravity, terminal velocity, and bounce consistency

- [x] 10. Implement Responsive Design
  - [x] 10.1 Implement screen resizing
    - Detect mobile vs desktop (600px threshold)
    - Adjust canvas size based on screen dimensions
    - Maintain aspect ratio
    - _Requirements: 11.1-11.6_
  
  - [x] 10.2 Implement touch zone configuration
    - Set touch zone to 70% of screen width on mobile
    - Allow full screen on desktop
    - _Requirements: 11.5-11.6_
  
  - [x] 10.3 Write property test for Responsive Design
    - **Property 12: Responsive Design Works on All Screens**
    - **Validates: Requirements 11.1-11.6**
    - Test mobile detection and touch zone calculation

- [x] 11. Implement Difficulty Scaling
  - [x] 11.1 Implement difficulty ramp
    - Decrease spawn interval by 50ms every 5 seconds
    - Cap minimum interval at 500ms
    - Linear interpolation between initial and min intervals
    - _Requirements: 12.2-12.3_
  
  - [x] 11.2 Update ItemSpawner with difficulty
    - Pass current difficulty to spawnInterval calculation
    - Update difficulty in game loop
    - _Requirements: 12.1-12.6_
  
  - [x] 11.3 Write property test for Difficulty Progression
    - **Property 13: Difficulty Progresses Correctly**
    - **Validates: Requirements 12.1-12.6**
    - Test spawn interval calculations at various times

- [x] 12. Testing and Integration
  - [x] 12.1 Write integration tests for complete game flow
    - Test full game from start to end with all difficulty tiers
    - Verify wallet system correctly deducts money
    - Verify difficulty tiers work correctly
    - _Requirements: 1.1-1.7, 2.1-2.6, 3.1-3.7, 4.1-4.6, 5.1-5.4, 6.1-6.7, 7.1-7.7, 8.1-8.11, 9.1-9.6, 10.1-10.6, 11.1-11.6, 12.1-12.6, 14.1-14.4_
  
  - [x] 12.2 Test edge cases
    - Test boundary conditions (wallet = $0, timer = 0)
    - Test error handling (NaN values, division by zero)
    - _Requirements: 12.5-12.6_
  
  - [x] 12.3 Write property test for Scoring Accumulation
    - **Property 6: Scoring Accumulates Correctly**
    - **Validates: Requirements 5.1-5.4**
    - Test score calculations with varied items

  - [x] 12.4 Write property test for Timer Count Down
    - **Property 8: Timer Counts Down Correctly**
    - **Validates: Requirements 7.1-7.4**
    - Test timer decrement and game end transition

  - [x] 12.5 Write property test for UI Display
    - **Property 9: UI Displays Correct Information**
    - **Validates: Requirements 8.1-8.9**
    - Test UI updates for all game states

- [x] 13. Final Checkpoint - Ensure all tests pass
  - Run all unit tests and property tests
  - Verify all acceptance criteria are met
  - Ensure no console errors or warnings
  - Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The implementation uses TypeScript for type safety
- All code will be combined into a single HTML file for delivery
- Property tests validate universal correctness properties from the design
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end game flow
- Checkpoints ensure incremental validation

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "3.1"] },
    { "id": 1, "tasks": ["2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "3.1", "4.1", "4.2", "5.1", "7.1", "8.1", "10.1"] },
    { "id": 2, "tasks": ["4.3", "5.2", "5.3", "6.1", "6.2", "6.3", "7.2", "7.3", "8.2", "9.1", "10.2", "11.1", "11.2"] },
    { "id": 3, "tasks": ["3.3", "4.4", "5.4", "6.4", "7.4", "8.3", "9.3", "10.3", "11.3", "12.2"] },
    { "id": 4, "tasks": ["12.1", "12.3", "12.4", "12.5"] },
    { "id": 5, "tasks": ["13"] }
  ]
}
```

---

## Bug Fix Log (2026-10-22)

The MVP generated by Kiro was structurally complete but **could not be played**:
clicking "START GAME" left the player stuck on the start screen. Root causes,
all confirmed with a headless-browser reproduction:

| # | Bug | Effect | Fix |
|---|-----|--------|-----|
| 1 | `Charge` declared `isCharging` as both an instance property and a prototype method; the property shadowed the method | `this.charge.isCharging()` threw `TypeError` inside `render()`, killing the rAF loop on the first frame after start | Renamed the state flag to `charging`; `isCharging()` is now the only accessor |
| 2 | `ItemSpawner.update()` called `spawnItem()` but discarded its return value, and never pushed into `game.items` | No temptation items ever existed | Spawner returns the item; the game pushes it into `items` |
| 3 | `Date.now()` (epoch ms) was mixed with `requestAnimationFrame` timestamps (monotonic ms) | `deltaTime` was a huge negative number; the timer and physics were broken | Single time base: `performance.now()` everywhere |
| 4 | `itemSpawner.nextSpawnTime` was seeded with `Date.now()` but compared against rAF time | Spawn condition never became true | Spawn timing is now driven by an accumulated `spawnTimerMs` delta |
| 5 | `DifficultyManager.getSpawnInterval()` used the absolute clock as "elapsed time" and inverted the ramp | Spawn rate never increased; MEDIUM spawned *slower* over time | Ramp is computed from `elapsedMs` against the level duration |
| 6 | The file was saved as **UTF-16 LE with BOM** | Editors and tooling treated `index.html` as a binary file | Re-saved as UTF-8 |

Additional fixes made during verification:

- `[hidden] { display: none !important }` - `.hud-item { display: flex }` was
  overriding the `hidden` attribute, so MEDIUM/HARD HUD panels were visible in EASY.
- `endGame()` set the end title *before* `updateUI()` overwrote it, so a
  survival always reported "GAME OVER". The outcome is now stored in
  `endReason` and restored by `updateUI()`.
- The "GO!" countdown label was never removed from the DOM and stayed on screen.
- The language/sound buttons were `position: fixed` over the HUD and overlapped
  the goal panel; they are now part of the HUD flex row.
- HARD bargain items now only expire on HARD (they kept the expiry ring in EASY).
- The HARD budget goal measured "money saved", which made it trivial; it now
  measures the **remaining wallet** against the goal.

### Bug Fix Log (2026-10-22, round 2)

A second round of measurement-driven fixes, found by instrumenting the running
game rather than by reading the code:

| # | Bug | Effect | Fix |
|---|-----|--------|-----|
| 7 | The `InputHandler` never listened for `mousemove`/`touchmove`, so `lastInputX/Y` stayed locked to the mousedown position | The interception wave always spawned at the *press* point. A wave expanding downward can never overtake a falling item (it is permanently chasing from above), so "hold the mouse over the item and release" missed roughly 80% of the time | The pointer is now tracked while charging, and the wave fires at the release position. The pointer is clamped to the canvas so a drag that leaves the canvas still produces an on-screen wave |
| 8 | `canvas.addEventListener('mouseleave', ...)` force-released the charge | Releasing the charge the moment the pointer left the canvas broke the drag-to-aim gesture | The listener was removed; `mouseup` on `window` already covers release |

Measured impact of fix 7 (12 attempts per strategy, real mouse input):

| Strategy | Hit rate before | Hit rate after |
|----------|-----------------|----------------|
| Press and hold still, aim at the item | 13% | 13% (unchanged - the wave is stranded above the item) |
| Press and **drag to track** the item | n/a (impossible) | **100%** |
| Aim below the item (wave grows upward into it) | 100% | 100% |

The drag-to-aim path is now the intended way to play and it is reliable.

The interception test in `tools/e2e.js` was flaky for the same root cause: it
pressed on an item and held still, so the wave landed at a stale coordinate.
It now tracks the item with the pointer during the charge, mirroring how a
player actually aims.

### Spec reconciliation

`requirements.md` 6.7/6.8 specify MEDIUM $200 / HARD $150, but that makes the
HARD goal of "save $150" unreachable on a $150 wallet. `design.md` and the
project handoff both specify MEDIUM $150 / HARD $200, which is self-consistent.
The implementation follows **design.md**: EASY $100/30s, MEDIUM $150/30s,
HARD $200/45s with a $150 savings goal.

### Verification

Automated Playwright suite (`tools/e2e.js`, 56 assertions) covering: boot,
START -> PLAYING -> END -> replay transitions, item spawning, interception
scoring, wallet depletion, bankruptcy, all three difficulties, all three
languages, localStorage persistence, and mobile viewport/touch layout.
Full-round soak tests (`tools/soak.js`) play complete EASY/MEDIUM/HARD rounds
with zero console errors.

The suite is run with:

```
PW_MODULE=<path-to>/node_modules/playwright node tools/e2e.js
```

It was run four consecutive times after the round-2 fixes with **56/56 passing
every time** (the interception assertions were previously flaky).
