# Requirements Document

## Introduction

"Hold To Resist" (按住别买) is a web-based arcade mini-game designed for an AI programming competition. The game challenges players to intercept falling temptation items before they enter a shopping cart zone. Players hold to charge, then release to fire an interception wave that bounces items back up for points. The game features a 30-second countdown level with a scoring system tracking both items intercepted and money "saved" by resisting temptation.

The game uses a Wallet system instead of health, where money is deducted when items reach the shopping cart. The game ends when the wallet reaches $0. Multiple difficulty tiers provide different gameplay experiences, from simple money management (Easy) to category-based spending limits (Medium) to budget goals and time-based mechanics (Hard).

## Glossary

- **Hold To Resist (HTR)**: The web-based arcade mini-game
- **Player**: The user controlling the game
- **Temptation Item**: Falling objects that represent shopping temptations (e.g.,奶茶, 打折标签, 老板链接)
- **Charge**: The action of holding input to build power for interception
- **Interception Wave**: The player's defensive action triggered by releasing charge
- **Shopping Cart Zone**: Bottom area of screen where items collect if not intercepted
- **Score**: Points earned from successful interceptions
- **Wallet**: Player's money balance that decreases when items reach the shopping cart; game ends when wallet reaches $0
- **Wallet Balance**: Current amount of money in the player's wallet
- **Item Money Value**: Amount of money deducted from wallet when item reaches shopping cart
- **Timer**: 30-second countdown for each level
- **Game Difficulty**: Configuration enum with values EASY, MEDIUM, HARD
- **Interception Point**: Vertical zone where interception can occur
- **Input Handler**: Code managing mouse and touch events for hold/release mechanics
- **Needs Item**: Essential purchases with lower money value (MEDIUM/HARD difficulty)
- **Wants Item**: Luxury/impulse purchases with higher money value (MEDIUM/HARD difficulty)
- **Spending Limit**: Category-based budget constraint (MEDIUM difficulty)
- **Budget Goal**: Target savings amount (HARD difficulty)
- **Urgency Level**: Time sensitivity of item appearance (HARD difficulty)
- **Bargain Item**: High-value item that disappears quickly (HARD difficulty)
- **Language Selection**: Player-configurable setting for game display language (English, 简体中文, 繁體中文)
- **i18n**: Internationalization support for multiple languages
- **Language Resource**: JSON object containing translated strings for each UI element

## Requirements

### Requirement 1: Game State Management

**User Story:** As a developer, I want clear game states, so that the game flow is organized and predictable.

#### Acceptance Criteria

1. THE Game SHALL have three states: START, PLAYING, END
2. WHEN the game loads, THE Game SHALL start in START state
3. WHEN the player selects a difficulty tier, THE Game SHALL configure the difficulty and transition to PLAYING state
4. WHEN the player clicks "Start Game", THE Game SHALL transition to PLAYING state
5. WHEN the Wallet Balance reaches $0, THE Game SHALL transition to END state
6. WHEN the timer reaches zero, THE Game SHALL transition to END state
7. WHILE in PLAYING state, THE Game SHALL process player input and game logic
8. WHILE in END state, THE End Screen SHALL display final score and money saved

### Requirement 2: Input Handling for Hold & Release

**User Story:** As a player, I want to hold and release to charge and fire, so that I can control the interception mechanic.

#### Acceptance Criteria

1. WHEN the player presses down on the screen or mouse button, THE Input Handler SHALL start charging
2. WHILE the player holds input, THE Input Handler SHALL maintain charge state
3. WHEN the player releases input, THE Input Handler SHALL trigger interception wave
4. WHERE input source is mouse, THE Input Handler SHALL handle mouse down and mouse up events
5. WHERE input source is touch, THE Input Handler SHALL handle touch start and touch end events
6. IF multiple simultaneous inputs occur, THE Input Handler SHALL process the first valid input

### Requirement 3: Falling Temptation Items

**User Story:** As a player, I want temptation items to fall from the top, so that I can intercept them.

#### Acceptance Criteria

1. WHEN the game enters PLAYING state, THE Item Spawner SHALL begin generating temptation items
2. WHILE in PLAYING state, THE Item Spawner SHALL create items at random horizontal positions
3. WHILE in PLAYING state, THE Item Spawner SHALL create items at varying intervals
4. WHILE in PLAYING state, EACH Item SHALL fall vertically downward with constant acceleration
5. EACH Item SHALL have a visual representation using an emoji
6. EACH Item SHALL have a point value and Money Value (amount deducted from Wallet if not intercepted)
7. WHERE difficulty tier is MEDIUM or HARD, EACH Item SHALL have a category classification (Needs or Wants)
8. WHERE difficulty tier is HARD, EACH Item SHALL have an Urgency Level affecting fall speed
9. IF an item reaches the bottom of the screen, THE Shopping Cart Zone SHALL collect the item
10. IF an item reaches the Shopping Cart Zone, THE Wallet SHALL deduct the item's Money Value

### Requirement 4: Interception Mechanics

**User Story:** As a player, I want to intercept items by releasing charge, so that I can score points.

#### Acceptance Criteria

1. WHEN the player triggers interception wave, THE Interceptor SHALL create a visual wave effect
2. WHEN an item intersects with the interception wave, THE Game SHALL bounce the item upward
3. WHEN an item is successfully intercepted, THE Scorer SHALL add points based on item value
4. WHEN an item is successfully intercepted, THE Money Counter SHALL add money saved value
5. WHILE an item is bouncing upward, THE Item SHALL be removed from collision with shopping cart
6. IF no item intersects with interception wave, THE Interceptor SHALL have no effect

### Requirement 5: Scoring System

**User Story:** As a player, I want to earn points, so that I can track my performance.

#### Acceptance Criteria

1. WHEN an item is successfully intercepted, THE Scorer SHALL add base points (10 points)
2. WHERE interception timing is excellent (near center), THE Scorer SHALL add bonus points (up to 5 additional)
3. WHILE in PLAYING state, THE HUD SHALL display current score
4. WHEN the game enters END state, THE End Screen SHALL display final score
5. WHERE difficulty tier is MEDIUM, THE Scorer SHALL add category-based bonuses for maintaining budget (15% bonus if total spending < 50% of wallet)
6. WHERE difficulty tier is MEDIUM, THE Scorer SHALL apply penalties for overspending in single category (10% penalty if Needs spending > 80% of Needs limit)
7. WHERE difficulty tier is HARD, THE Scorer SHALL add bonus points for Bargain Items (2x points)
8. WHERE difficulty tier is HARD, THE Scorer SHALL display Budget Goal progress

### Requirement 6: Wallet System

**User Story:** As a player, I want to lose money when items aren't intercepted, so that there's a financial consequence for failure.

#### Acceptance Criteria

1. WHEN an item enters the Shopping Cart Zone, THE Wallet SHALL deduct the item's Money Value
2. WHILE in PLAYING state, THE HUD SHALL display current Wallet Balance
3. WHERE Wallet Balance reaches $0, THE Game SHALL end the level
4. WHEN the game enters END state, THE End Screen SHALL display total money Saved (initial wallet minus final balance)
5. WHEN the game enters END state, THE End Screen SHALL display total money Spent (initial wallet minus final balance)
6. WHERE difficulty tier is EASY, THE Wallet SHALL start with $100
7. WHERE difficulty tier is MEDIUM, THE Wallet SHALL start with $200 and enforce category spending limits
8. WHERE difficulty tier is HARD, THE Wallet SHALL start with $150 and target a Budget Goal of $150 saved

### Requirement 7: Timer System

**User Story:** As a player, I want a 30-second countdown, so that the game has a clear time limit.

#### Acceptance Criteria

1. WHEN the game enters PLAYING state, THE Timer SHALL initialize to 30 seconds
2. WHILE in PLAYING state, THE Timer SHALL decrement by 1 second each second
3. WHEN the timer reaches 0, THE Game SHALL transition to END state
4. WHILE in PLAYING state, THE HUD SHALL display remaining time
5. WHERE difficulty tier is EASY, THE Game Duration SHALL be exactly 30 seconds
6. WHERE difficulty tier is MEDIUM, THE Game Duration SHALL be 30 seconds with category limits
7. WHERE difficulty tier is HARD, THE Game Duration SHALL be 45 seconds with time penalties for failed intercepts

### Requirement 8: UI Screens

**User Story:** As a player, I want distinct screens, so that I understand the game flow.

#### Acceptance Criteria

1. WHILE in START state, THE Start Screen SHALL display "Hold To Resist" title
2. WHILE in START state, THE Start Screen SHALL display "Start Game" button
3. WHILE in START state, THE Start Screen SHALL display Difficulty Selection menu with EASY, MEDIUM, HARD options
4. WHILE in PLAYING state, THE HUD SHALL display current Wallet Balance
5. WHILE in PLAYING state, THE HUD SHALL display timer
6. WHILE in PLAYING state, WHERE difficulty tier is MEDIUM or HARD, THE HUD SHALL display current category spending (Needs/Wants)
7. WHILE in END state, THE End Screen SHALL display final score
8. WHILE in END state, THE End Screen SHALL display total money Saved
9. WHILE in END state, THE End Screen SHALL display total money Spent
10. WHILE in END state, WHERE difficulty tier is MEDIUM or HARD, THE End Screen SHALL display category breakdown (Needs spent vs Wants spent)
11. WHILE in END state, THE End Screen SHALL display "Play Again" button

### Requirement 9: Visual Feedback and Animations

**User Story:** As a player, I want visual feedback, so that I understand what's happening in the game.

#### Acceptance Criteria

1. WHILE charging, THE Charge Bar SHALL grow in size
2. WHEN interception wave is triggered, THE Visual Effect SHALL show expanding ring
3. WHEN an item is intercepted, THE Bounce Animation SHALL show item reversing direction
4. WHEN an item enters Shopping Cart Zone, THE Visual Feedback SHALL show item disappearing and money deduction
5. WHEN Wallet Balance is low (less than $20), THE Visual Feedback SHALL flash screen red briefly
6. WHILE in PLAYING state, THE Game SHALL render at 60 frames per second

### Requirement 10: Physics and Movement

**User Story:** As a player, I want consistent physics, so that the game feels responsive and fair.

#### Acceptance Criteria

1. EACH falling item SHALL accelerate downward due to gravity
2. EACH item's horizontal position SHALL remain constant unless redirected
3. WHEN intercepted, EACH item SHALL bounce upward with initial velocity
4. WHEN an item bounces upward, THE Gravity SHALL continue to affect it
5. EACH item SHALL have a maximum fall speed (terminal velocity)
6. EACH item SHALL have a defined hitbox for collision detection
7. WHERE difficulty tier is HARD, Bargain Items SHALL have accelerated fall speed that increases over time
8. WHERE difficulty tier is HARD, failed intercepts SHALL apply time penalties to the remaining Timer

### Requirement 11: Responsive Design

**User Story:** As a player, I want the game to work on mobile and desktop, so that I can play anywhere.

#### Acceptance Criteria

1. WHERE screen width is less than 600 pixels, THE Game SHALL be considered mobile
2. WHERE screen width is 600 pixels or more, THE Game SHALL be considered desktop
3. WHILE in PLAYING state, THE Game Area SHALL resize to fit available screen width
4. WHILE in PLAYING state, THE Game Area SHALL maintain consistent aspect ratio
5. WHERE input source is touch, THE Touch Zone SHALL cover at least 70% of screen width
6. WHERE input source is mouse, THE Click Zone SHALL cover entire game area

### Requirement 12: Game Balance and Difficulty

**User Story:** As a developer, I want balanced difficulty tiers, so that the game provides appropriate challenges for different player skill levels.

#### Acceptance Criteria

1. WHEN the game starts, THE Initial Item Spawn Rate SHALL be 1 item per 2 seconds (EASY)
2. AS time decreases in level, THE Item Spawn Rate SHALL increase (difficulty ramp)
3. WHEN difficulty increases, THE Item Spawn Rate SHALL not exceed 1 item per 0.5 seconds
4. EACH temptation item SHALL have varied point values based on visual difficulty
5. WHEN Wallet Balance reaches $0, THE Game SHALL end regardless of remaining time
6. WHEN timer reaches 0, THE Game SHALL end regardless of remaining Wallet Balance
7. WHERE difficulty tier is EASY, ALL items SHALL have no category classification and only money value
8. WHERE difficulty tier is MEDIUM, items SHALL be classified as Needs or Wants with corresponding Money Values (Needs: $5-$15, Wants: $20-$50)
9. WHERE difficulty tier is MEDIUM, THE Game SHALL enforce Spending Limits per category (Needs limit: $80, Wants limit: $120)
10. WHERE difficulty tier is MEDIUM, IF category Spending Limit is exceeded, THE Player SHALL not be able to collect items from that category
11. WHERE difficulty tier is HARD, THE Game SHALL present Bargain Items that expire quickly (disappear after 5 seconds if not intercepted)
12. WHERE difficulty tier is HARD, THE Game SHALL track Budget Goal (e.g., save $150) and display progress
13. WHERE difficulty tier is HARD, THE Game SHALL apply urgency levels to items (high urgency items fall faster)

### Requirement 13: Audio Feedback (Optional)

**User Story:** As a player, I want audio feedback, so that the game feels more engaging.

#### Acceptance Criteria

1. WHEN an item is intercepted, THE Sound Manager SHALL play short success sound
2. WHEN an item enters Shopping Cart Zone, THE Sound Manager SHALL play short failure sound
3. WHEN the game ends, THE Sound Manager SHALL play ending sound
4. WHERE audio is not supported, THE Game SHALL continue without audio

### Requirement 14: Game Persistence

**User Story:** As a player, I want high scores and savings records, so that I can track improvement over time.

#### Acceptance Criteria

1. WHEN the game enters END state, THE High Score Manager SHALL compare current score to stored high score
2. WHERE current score exceeds high score, THE High Score Manager SHALL update stored high score
3. WHILE in START state, THE Start Screen SHALL display current high score
4. THE High Score Manager SHALL persist across page reloads using localStorage
5. WHERE difficulty tier is EASY, THE High Score Manager SHALL track total money Saved
6. WHERE difficulty tier is MEDIUM, THE High Score Manager SHALL track combined score and category efficiency
7. WHERE difficulty tier is HARD, THE High Score Manager SHALL track Budget Goal completion rate

### Requirement 15: Language Selection (Internationalization)

**User Story:** As a player, I want to select my preferred language, so that I can understand and enjoy the game in Chinese (Simplified/Traditional) or English.

#### Acceptance Criteria

1. WHILE in START state, THE Game SHALL display a language selection menu with three options: English, 简体中文, 繁體中文
2. WHEN the player selects a language, THE Game SHALL update all displayed text to the selected language immediately
3. THE Game SHALL save the language preference to localStorage
4. WHEN the game loads, THE Game SHALL restore the last selected language preference
5. WHERE no language preference is saved, THE Game SHALL default to English
6. ALL UI text elements SHALL support multiple languages including:
   - Game title
   - Button labels (Start Game, Play Again)
   - Difficulty selection labels (EASY, MEDIUM, HARD)
   - HUD labels (Score, Wallet, Time, Money Saved)
   - End screen statistics
7. THE Game Title SHALL display as "按住别买" in Simplified Chinese
8. THE Game Title SHALL display as "按住別買" in Traditional Chinese
9. THE Game Title SHALL display as "Hold To Resist" in English
10. WHERE language is English, ALL UI text SHALL be in English
11. WHERE language is Simplified Chinese, ALL UI text SHALL be in Simplified Chinese (简体中文)
12. WHERE language is Traditional Chinese, ALL UI text SHALL be in Traditional Chinese (繁體中文)