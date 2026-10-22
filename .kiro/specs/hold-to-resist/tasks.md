# Implementation Plan: Hold To Resist

## Overview

"Hold To Resist" is a single-file HTML5 arcade game where players intercept falling temptation items by charging and releasing input to trigger interception waves. The game features a 30-second countdown, scoring system, wallet system with money management, difficulty tiers (EASY, MEDIUM, HARD), and progressive difficulty scaling. This implementation will be delivered as a single HTML file containing HTML, CSS, and TypeScript/JavaScript code.

## Tasks

- [ ] 1. Set up project structure and core interfaces
  - Create the single HTML file structure with canvas element
  - Define TypeScript interfaces for all game entities (Game, Item, Charge, etc.)
  - Set up the GameConfig interface with all constants
  - _Requirements: 1.1-1.7, 10.1-10.6_

- [ ] 2. Implement core game systems
  - [ ] 2.1 Implement GameState enum and state management
    - Create GameState enum (START, PLAYING, END)
    - Implement transitionState function
    - _Requirements: 1.1-1.7_
  
  - [ ] 2.2 Implement Timer system
    - Create Timer class with update method
    - Initialize to 30 seconds and count down
    - _Requirements: 7.1-7.4_
  
  - [ ] 2.3 Implement Scorer system
    - Create Scorer class with addPoints and reset methods
    - Track score and money saved
    - _Requirements: 5.1-5.4_

  - [ ] 2.4 Implement Wallet system
    - Create WalletManager class with init, deduct, addMoneySaved methods
    - Track wallet balance, spent, and saved money
    - Implement bankrupt check (balance <= $0)
    - _Requirements: 6.1-6.7_
  
  - [ ] 2.5 Implement DifficultyManager
    - Create DifficultyManager class with init and getSpawnInterval methods
    - Configure difficulty tiers (EASY, MEDIUM, HARD)
    - Implement difficulty ramp (spawn interval decreases over time)
    - _Requirements: 12.1-12.6, 13.1-13.3_
  
  - [ ] 2.6 Implement HighScoreManager
    - Load and save high scores to localStorage
    - Compare and save new high scores
    - _Requirements: 14.1-14.4_

  - [ ] 2.7 Implement Language/Internationalization (i18n) System
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

- [ ] 3. Implement Input and Charge system
  - [ ] 3.1 Implement InputHandler class
    - Setup mouse and touch event listeners
    - Handle mousedown/mouseup and touchstart/touchend
    - Track input position and state
    - _Requirements: 2.1-2.6_
  
  - [ ] 3.2 Implement Charge system
    - Create Charge class with start, release, update methods
    - Implement charge level tracking (0.0 to 1.0)
    - Trigger interception wave on release
    - _Requirements: 2.1-2.6, 9.1_
  
  - [ ] 3.3 Write property test for Charge system
    - **Property 10: Charge Bar Reflects Charge Level**
    - **Validates: Requirements 9.1**
    - Test charge level bounds (0.0 to 1.0)
    - Test visual scaling and color transitions

- [ ] 4. Implement Falling Items system
  - [ ] 4.1 Create temptation items data
    - Define temptationItems array with emoji, pointValue, moneyValue, radius
    - Include items: 🧋, 🏷️, 🔗, 🛍️, 💎, 📱, 👗, 🎮
    - _Requirements: 3.1-3.7_
  
  - [ ] 4.2 Implement Item class
    - Create Item interface with all required properties
    - Implement hitbox calculation
    - _Requirements: 3.1-3.7_
  
  - [ ] 4.3 Implement ItemSpawner class
    - Create spawnItem method with random X position
    - Implement difficulty scaling (spawn interval decreases over time)
    - _Requirements: 3.1-3.7, 12.1-12.6_
  
  - [ ] 4.4 Write property test for Item Spawner
    - **Property 3: Item Spawner Creates Valid Items**
    - **Validates: Requirements 3.1-3.7**
    - Test item creation with valid emojis and positions

- [ ] 5. Implement Interception Mechanics
  - [ ] 5.1 Implement InterceptionWave class
    - Create trigger, update, checkCollisions methods
    - Implement wave radius expansion based on charge level
    - _Requirements: 4.1-4.6_
  
  - [ ] 5.2 Implement collision detection
    - Circle-to-circle collision between wave and items
    - Calculate interception quality (distance from center)
    - _Requirements: 4.1-4.6, 5.1-5.4_
  
  - [ ] 5.3 Implement bounce physics
    - Bounce items upward with velocity based on charge
    - Add slight horizontal spread based on position
    - _Requirements: 4.3, 10.3-10.4_
  
  - [ ] 5.4 Write property test for Interception Wave
    - **Property 5: Interception Wave Bounces Items**
    - **Validates: Requirements 4.1-4.6**
    - Test item interception and bounce physics

- [ ] 6. Implement Game Loop and Core Game Class
  - [ ] 6.1 Implement main Game class
    - Wire together all systems (Timer, Scorer, WalletManager, DifficultyManager, etc.)
    - Implement update and render methods
    - _Requirements: 1.1-1.7, 6.1-6.7_
  
  - [ ] 6.2 Implement game loop
    - Set up requestAnimationFrame loop
    - Separate update and render phases
    - Target 60 FPS
    - _Requirements: 9.6_
  
  - [ ] 6.3 Implement game state handlers
    - START state: display start screen
    - PLAYING state: process input and update game
    - END state: display end screen and save high score
    - _Requirements: 1.1-1.7, 8.1-8.9_
  
  - [ ] 6.4 Write property test for Game State Transitions
    - **Property 1: Game State Transitions**
    - **Validates: Requirements 1.1-1.7**
    - Test valid state transitions

- [ ] 7. Implement Rendering System
  - [ ] 7.1 Implement Canvas rendering for items
    - Draw emoji items on canvas
    - Handle text alignment and baseline
    - _Requirements: 3.5, 9.1_
  
  - [ ] 7.2 Implement Interception Wave rendering
    - Draw expanding ring with fading opacity
    - Use canvas arc and stroke styles
    - _Requirements: 9.2_
  
  - [ ] 7.3 Implement Charge Bar rendering
    - Draw charge bar at bottom of screen
    - Scale width based on charge level
    - Color gradient from green to red
    - _Requirements: 9.1_
  
  - [ ] 7.4 Implement Game Over screen rendering
    - Draw end screen with stats
    - Display final score, money spent/saved, wallet balance
    - _Requirements: 8.6-8.11_

- [ ] 8. Implement UI Screens
  - [ ] 8.1 Implement Start Screen
    - Display title "Hold To Resist" (按住别买)
    - Add "Start Game" button
    - Display difficulty selection menu (EASY, MEDIUM, HARD)
    - Display high score
    - _Requirements: 8.1-8.3_
  
  - [ ] 8.2 Implement HUD (Playing Screen)
    - Display score, wallet balance, spent/saved counters, timer
    - Display category spending (NEEDS/WANTS) for MEDIUM/HARD
    - Update in real-time during gameplay
    - _Requirements: 8.3-8.7_
  
  - [ ] 8.3 Implement End Screen
    - Display final score, money spent, money saved, wallet balance
    - Display category breakdown (NEEDS/WANTS) for MEDIUM/HARD
    - Add "Play Again" button
    - _Requirements: 8.7-8.11, 14.1-14.4_

- [ ] 9. Implement Visual Feedback and Effects
  - [ ] 9.1 Implement wallet low balance effect
    - Flash screen red when wallet is below $20
    - Use CSS animations or canvas overlay
    - _Requirements: 9.5_
  
  - [ ] 9.2 Implement item bounce animation
    - Animate item reversing direction after interception
    - _Requirements: 9.3_
  
  - [ ] 9.3 Write property test for Physics Simulation
    - **Property 11: Physics Simulation is Consistent**
    - **Validates: Requirements 10.1-10.6**
    - Test gravity, terminal velocity, and bounce consistency

- [ ] 10. Implement Responsive Design
  - [ ] 10.1 Implement screen resizing
    - Detect mobile vs desktop (600px threshold)
    - Adjust canvas size based on screen dimensions
    - Maintain aspect ratio
    - _Requirements: 11.1-11.6_
  
  - [ ] 10.2 Implement touch zone configuration
    - Set touch zone to 70% of screen width on mobile
    - Allow full screen on desktop
    - _Requirements: 11.5-11.6_
  
  - [ ] 10.3 Write property test for Responsive Design
    - **Property 12: Responsive Design Works on All Screens**
    - **Validates: Requirements 11.1-11.6**
    - Test mobile detection and touch zone calculation

- [ ] 11. Implement Difficulty Scaling
  - [ ] 11.1 Implement difficulty ramp
    - Decrease spawn interval by 50ms every 5 seconds
    - Cap minimum interval at 500ms
    - Linear interpolation between initial and min intervals
    - _Requirements: 12.2-12.3_
  
  - [ ] 11.2 Update ItemSpawner with difficulty
    - Pass current difficulty to spawnInterval calculation
    - Update difficulty in game loop
    - _Requirements: 12.1-12.6_
  
  - [ ] 11.3 Write property test for Difficulty Progression
    - **Property 13: Difficulty Progresses Correctly**
    - **Validates: Requirements 12.1-12.6**
    - Test spawn interval calculations at various times

- [ ] 12. Testing and Integration
  - [ ] 12.1 Write integration tests for complete game flow
    - Test full game from start to end with all difficulty tiers
    - Verify wallet system correctly deducts money
    - Verify difficulty tiers work correctly
    - _Requirements: 1.1-1.7, 2.1-2.6, 3.1-3.7, 4.1-4.6, 5.1-5.4, 6.1-6.7, 7.1-7.7, 8.1-8.11, 9.1-9.6, 10.1-10.6, 11.1-11.6, 12.1-12.6, 14.1-14.4_
  
  - [ ] 12.2 Test edge cases
    - Test boundary conditions (wallet = $0, timer = 0)
    - Test error handling (NaN values, division by zero)
    - _Requirements: 12.5-12.6_
  
  - [ ] 12.3 Write property test for Scoring Accumulation
    - **Property 6: Scoring Accumulates Correctly**
    - **Validates: Requirements 5.1-5.4**
    - Test score calculations with varied items

  - [ ] 12.4 Write property test for Timer Count Down
    - **Property 8: Timer Counts Down Correctly**
    - **Validates: Requirements 7.1-7.4**
    - Test timer decrement and game end transition

  - [ ] 12.5 Write property test for UI Display
    - **Property 9: UI Displays Correct Information**
    - **Validates: Requirements 8.1-8.9**
    - Test UI updates for all game states

- [ ] 13. Final Checkpoint - Ensure all tests pass
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
