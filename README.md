# Build Your Own World - Exact 1:1 JavaScript Port

This is a pixel-perfect, algorithm-exact JavaScript port of the CS61B "Build Your Own World" project. Every aspect has been meticulously recreated to produce identical output to the original Java implementation.

## Exact Recreations

### ✅ **Perfect Random Number Generation**
- Implements Java's Linear Congruential Generator exactly
- Matches `java.util.Random` behavior bit-for-bit
- Identical world generation with same seeds

### ✅ **Exact World Generation Algorithm**
- Same room placement using `RandomUtils.uniform(r, 14, 25)` rooms
- Identical MST (Minimum Spanning Tree) hallway connections using Kruskal's algorithm
- Exact wall placement and corner filling logic
- Same avatar placement (floor tiles with y < 10)

### ✅ **Identical Tile System**
- Exact color values from `Tileset.java`: 
  - WALL: `#d88080` on `#696969` background
  - FLOOR: `#80c080` on black background  
  - AVATAR: white `@` on black background
  - SAND: yellow `▒` on black background
- Same character representations: `#`, `·`, `@`, `▒`

### ✅ **Perfect Menu System**
- Canvas-based rendering matching StdDraw exactly
- Same font sizes and positioning
- Identical seed input behavior (digits only, 'S' to start)
- Exact menu options: N/L/R/Q

### ✅ **Exact Save/Load Format**
- Same file format: seed on line 1, moves on line 2
- Identical input recording and replay
- Perfect replay functionality with 50ms delays

### ✅ **Identical UI**
- Same tile info display on mouse hover
- Exact date/time formatting and positioning
- Same coordinate system (80x40 tiles, 16px each)

## Verification

Test with the same seed in both versions - they produce identical worlds:

**Java**: `java core.Main` → N → `12345` → S  
**Web**: Open `index.html` → N → `12345` → S

## Technical Implementation

- **`JavaRandom`**: Exact port of `java.util.Random` LCG algorithm
- **`RandomUtils`**: Perfect recreation of the utility class
- **`World`**: Method-by-method port of world generation
- **Canvas Rendering**: Pixel-perfect tile and UI rendering
- **Input Handling**: Exact key processing and movement logic

## Usage

1. Open `index.html` in any modern browser
2. Use exact same controls as Java version:
   - **N**: New World → Enter seed → **S** to start
   - **L**: Load saved game
   - **R**: Replay saved game with animation
   - **Q**: Quit
   - **WASD**: Move avatar
   - **:Q**: Save and quit to menu

## Files

- `world.js` - Exact port of `World.java`, `RandomUtils.java`, and tile system
- `game.js` - Perfect recreation of `Main.java` and `Menu.java` behavior  
- `index.html` - Minimal HTML wrapper
- `styles.css` - Basic styling (canvas-based rendering handles visuals)

This port produces **identical** worlds, behavior, and save files as the original Java implementation.