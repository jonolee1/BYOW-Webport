# Build Your Own World - Exact 1:1 JavaScript Port

This is a JavaScript port of the CS61B "Build Your Own World" project. 

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
