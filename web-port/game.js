// Game state variables
let world = null;
let canvas = null;
let ctx = null;
let gameRunning = false;
let tileSize = 16;
let previousKey = '@';
let menuState = 'main';
let seedInput = '';

// Initialize the game
document.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size to match Java (80x40 tiles at 16px each)
    canvas.width = 80 * 16;
    canvas.height = 40 * 16;
    
    // Make canvas focusable and ensure it gets focus
    canvas.tabIndex = 0;
    canvas.style.outline = 'none'; // Remove focus outline
    
    // Hide the HTML menu and use canvas-based menu
    document.getElementById('menu').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    
    // Focus on canvas immediately
    canvas.focus();
    
    // Keyboard event listeners (only one to prevent double input)
    document.addEventListener('keydown', handleKeyPress);
    
    // Mouse handling is done in the canvas mousemove event listener below
    
    // Click to focus
    canvas.addEventListener('click', function() {
        canvas.focus();
    });
    
    // Setup mouse tracking
    setupMouseTracking();
    
    // Start with menu
    showMenu();
    
    // Start the game loop
    requestAnimationFrame(gameLoop);
    
    // Update date/time
    setInterval(updateDateTime, 1000);
    updateDateTime();
});

function showMenu() {
    menuState = 'main';
    renderMenu();
}

function renderMenu() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set font to match Java (large, bold)
    ctx.font = 'bold 40px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    if (menuState === 'main') {
        // Main menu with N for random world, S for seed input  
        ctx.fillText('N: New World (Random)', centerX, centerY - 100);
        ctx.fillText('S: New World (Seed)', centerX, centerY - 40);
        ctx.fillText('L: Load', centerX, centerY + 20);
        ctx.fillText('R: Replay', centerX, centerY + 80);
        ctx.fillText('Q: Quit', centerX, centerY + 140);
        
    } else if (menuState === 'seed') {
        // "Enter Seed: " at center height (like Java HEIGHT / 2.0)
        ctx.font = 'bold 40px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Enter Seed: ', centerX, centerY);
        
        // White rectangle BELOW the text (like Java HEIGHT / 2.0 - 40)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(centerX - 150, centerY + 20, 300, 40);
        
        // Seed numbers INSIDE the white box with smaller font
        ctx.fillStyle = '#000000';
        ctx.font = '20px monospace';  // Smaller font to fit in box
        ctx.fillText(seedInput, centerX, centerY + 45);  // Centered in the white box
    }
}

function startNewGame(seed) {
    console.log('Starting new game with seed:', seed);
    world = new World(80, 40, seed);
    console.log('World created, initializing avatar');
    world.initializeAvatar();
    console.log('Avatar initialized');
    gameRunning = true;
    menuState = 'game';
    console.log('Game state set to game');
}

function loadGame() {
    try {
        const savedData = localStorage.getItem('byow-save');
        if (!savedData) {
            throw new Error('No save file found');
        }
        
        const lines = savedData.split('\n');
        const seed = parseInt(lines[0]);
        const moves = lines[1] || '';
        
        world = new World(80, 40, seed);
        world.initializeAvatar();
        
        // Replay the saved moves (not replay mode, just load)
        for (let i = 0; i < moves.length; i++) {
            const move = moves[i];
            world.recordInput(move);
            world.moveAvatar(move);
        }
        
        gameRunning = true;
        menuState = 'game';
    } catch (e) {
        // If load fails, create random world like Java
        console.log('Load failed, creating random world:', e.message);
        const randomSeed = Math.floor(Math.random() * 2147483647) + Math.floor(Math.random() * 1000);
        console.log('Generated fallback random seed:', randomSeed);
        world = new World(80, 40, randomSeed);
        world.initializeAvatar();
        gameRunning = true;
        menuState = 'game';
    }
}

function replayGame() {
    const savedData = localStorage.getItem('byow-save');
    if (savedData) {
        const lines = savedData.split('\n');
        const seed = parseInt(lines[0]);
        const moves = lines[1] || '';
        
        world = new World(80, 40, seed);
        world.initializeAvatar();
        
        gameRunning = true;
        menuState = 'replay';
        
        // Replay moves with delay
        let moveIndex = 0;
        const replayInterval = setInterval(() => {
            if (moveIndex < moves.length) {
                const move = moves[moveIndex];
                world.recordInput(move);
                world.moveAvatar(move);
                renderWorld();
                moveIndex++;
            } else {
                clearInterval(replayInterval);
                menuState = 'game';
            }
        }, 50); // 50ms delay like Java
    }
}

function saveAndQuit() {
    if (world) {
        // Save in exact Java format: seed on first line, moves on second line
        const saveData = world.getSeed() + '\n' + world.getInputRecord().join('');
        localStorage.setItem('byow-save', saveData);
    }
    gameRunning = false;
    showMenu();
}

function handleKeyPress(event) {
    event.preventDefault(); // Prevent default browser behavior
    
    let key = event.key;
    
    // Handle Enter key specifically
    if (key === 'Enter') {
        key = 'ENTER';
    } else {
        // Convert to uppercase for consistency
        key = key.toUpperCase();
    }
    
    if (menuState === 'main') {
        switch (key) {
            case 'N':
                // Create random world directly with truly random seed each time
                const randomSeed = Math.floor(Math.random() * 2147483647) + Math.floor(Math.random() * 1000);
                console.log('Generated random seed:', randomSeed);
                startNewGame(randomSeed);
                break;
            case 'S':
                // Go to seed input screen
                menuState = 'seed';
                seedInput = '';
                renderMenu();
                break;
            case 'L':
                loadGame();
                break;
            case 'R':
                replayGame();
                break;
            case 'Q':
                System.exit(0);
                break;
        }
    } else if (menuState === 'seed') {
        if (key === 'S' || key === 'ENTER') {
            // Start game with seed (S like Java, or Enter for convenience)
            const seed = seedInput.length > 0 ? parseInt(seedInput) : 0;
            startNewGame(seed);
        } else if (key.match(/^[0-9]$/)) {
            // Add digit to seed - exactly like Java
            seedInput += key;
            renderMenu();
        }
    } else if (menuState === 'game' && gameRunning && world) {
        // Handle quit sequence (:Q) - exactly like Java
        if (previousKey === ':' && (key === 'Q' || key === 'q')) {
            saveAndQuit();
            return;
        }
        
        // Handle movement keys - exactly like Java
        if (['W', 'A', 'S', 'D'].includes(key)) {
            world.recordInput(key);
            world.moveAvatar(key);
            renderWorld();
        }
        
        // Record other keys (like :) - exactly like Java
        if (key === ':') {
            world.recordInput(key);
        }
        
        previousKey = key;
    }
}

// Simulate Java's System.exit(0)
function System() {}
System.exit = function(code) {
    // In browser, we can't actually exit, so just close the tab/window
    try {
        window.close();
    } catch (e) {
        // If we can't close the window, just show a message
        alert('Please close this tab/window to quit.');
    }
};

// Mouse handling is now done in the canvas mousemove event listener

function renderWorld() {
    if (!world || !ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const tiles = world.getTiles();
    
    for (let x = 0; x < world.width; x++) {
        for (let y = 0; y < world.height; y++) {
            const tileType = tiles[x][y];
            
            // Draw background color
            ctx.fillStyle = TileColors[tileType];
            ctx.fillRect(x * tileSize, (world.height - y - 1) * tileSize, tileSize, tileSize);
            
            // Draw character
            ctx.fillStyle = TileTextColors[tileType];
            ctx.font = '14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(
                TileCharacters[tileType],
                x * tileSize + tileSize/2,
                (world.height - y - 1) * tileSize + tileSize/2 + 5
            );
        }
    }
    
    // Render UI exactly like Java
    renderUI();
}

function renderUI() {
    if (!world) return;
    
    // Get mouse position for tile info - fix coordinate system
    const mouseX = Math.floor(lastMouseX / tileSize);
    const mouseY = world.height - 1 - Math.floor(lastMouseY / tileSize);
    
    // Only log occasionally to avoid spam
    if (Math.random() < 0.1) {
        console.log('renderUI: mouse coords:', lastMouseX, lastMouseY, '-> tile:', mouseX, mouseY);
    }
    
    // Calendar/time info exactly like Java
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const year = now.getFullYear();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const second = now.getSeconds();
    
    const date = `${month}/${day}/${year}`;
    const time = `${hour}:${minute}:${second}`;
    
    // Set UI text style
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    
    // Left side: tile info (like Java's "Tile: " + getTile(mouseX, mouseY))
    // Debug bounds checking
    if (mouseX >= 0 && mouseX < world.width && mouseY >= 0 && mouseY < world.height) {
        const tileType = world.tiles[mouseX][mouseY];
        const tileName = TileDescriptions[tileType] || 'unknown';
        ctx.fillText(`Tile: ${tileName} (${mouseX},${mouseY}) type:${tileType}`, 5 * tileSize, (world.height - 2) * tileSize);
    } else {
        ctx.fillText(`Tile: out-of-bounds (${mouseX},${mouseY})`, 5 * tileSize, (world.height - 2) * tileSize);
    }
    
    // Right side: date and time (like Java)
    ctx.textAlign = 'right';
    ctx.fillText(`Date: ${date}  Time: ${time}`, (world.width - 2) * tileSize, (world.height - 2) * tileSize);
}

let lastMouseX = 0;
let lastMouseY = 0;

// Setup mouse tracking
function setupMouseTracking() {
    console.log('Setting up mouse tracking...');
    
    // Simple direct approach
    window.addEventListener('mousemove', function(event) {
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        lastMouseX = event.clientX - rect.left;
        lastMouseY = event.clientY - rect.top;
        
        // Always log to verify it's working
        console.log('Mouse updated:', lastMouseX, lastMouseY);
    });
    
    console.log('Mouse tracking setup complete');
}

function updateDateTime() {
    // This is handled in renderUI now
}

function gameLoop() {
    if (menuState === 'main' || menuState === 'seed') {
        renderMenu();
    } else if (menuState === 'game' && gameRunning && world) {
        renderWorld();
    } else if (menuState === 'replay') {
        // Replay mode - renderWorld is called in replay function
    }
    requestAnimationFrame(gameLoop);
}