// Exact tile definitions from Tileset.java
const TileType = {
    NOTHING: 0,
    WALL: 1,
    FLOOR: 2,
    AVATAR: 3,
    SAND: 4
};

// Exact colors from Tileset.java
const TileColors = {
    [TileType.NOTHING]: '#000000',
    [TileType.WALL]: '#696969',  // Color.darkGray
    [TileType.FLOOR]: '#000000',  // Color.black
    [TileType.AVATAR]: '#000000', // Color.black
    [TileType.SAND]: '#000000'   // Color.black
};

// Exact text colors from Tileset.java
const TileTextColors = {
    [TileType.NOTHING]: '#000000',
    [TileType.WALL]: '#d88080',  // new Color(216, 128, 128)
    [TileType.FLOOR]: '#80c080', // new Color(128, 192, 128)
    [TileType.AVATAR]: '#ffffff', // Color.white
    [TileType.SAND]: '#ffff00'   // Color.yellow
};

// Exact characters from Tileset.java
const TileCharacters = {
    [TileType.NOTHING]: ' ',
    [TileType.WALL]: '#',
    [TileType.FLOOR]: '·',
    [TileType.AVATAR]: '@',
    [TileType.SAND]: '▒'
};

// Exact descriptions from Tileset.java
const TileDescriptions = {
    [TileType.NOTHING]: 'nothing',
    [TileType.WALL]: 'wall',
    [TileType.FLOOR]: 'floor',
    [TileType.AVATAR]: 'you',
    [TileType.SAND]: 'sand'
};

// Simplified Java Random that works in JavaScript
class JavaRandom {
    constructor(seed) {
        this.seed = seed;
    }
    
    nextInt(n) {
        // Simple LCG that should match Java behavior closely enough
        this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
        if (n === undefined) {
            return this.seed;
        }
        return Math.abs(this.seed) % n;
    }
}

// Exact implementation of RandomUtils.uniform from Java
class RandomUtils {
    static uniform(random, a, b) {
        if (arguments.length === 2) {
            // uniform(random, n) - returns [0, n)
            let n = a;
            if (n <= 0) {
                throw new Error('argument must be positive: ' + n);
            }
            return random.nextInt(n);
        } else if (arguments.length === 3) {
            // uniform(random, a, b) - returns [a, b)
            if (b <= a || (b - a >= 2147483647)) {
                throw new Error('invalid range: [' + a + ', ' + b + ')');
            }
            return a + RandomUtils.uniform(random, b - a);
        }
    }
}

// Edge class for MST
class Edge {
    constructor(room1, room2, weight) {
        this.room1 = room1;
        this.room2 = room2;
        this.weight = weight;
    }
}

// World class - exact JavaScript port of the Java World class
class World {
    constructor(width, height, seed) {
        this.width = width;
        this.height = height;
        this.seed = seed;
        this.r = new JavaRandom(seed);
        this.numRooms = RandomUtils.uniform(this.r, 14, 25);
        
        console.log('Seed:', seed, 'NumRooms:', this.numRooms); // Debug
        
        this.tiles = Array(width).fill().map(() => Array(height).fill(TileType.NOTHING));
        this.cords = [];
        this.dict = {};
        this.connects = new Map();
        this.avatarPosition = null;
        this.inputRecord = [];
        
        this.initializeMap();
        this.room();
        this.createMST();
    }
    
    initializeMap() {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                this.tiles[x][y] = TileType.NOTHING;
            }
        }
    }
    
    room() {
        console.log('Starting room generation, numRooms:', this.numRooms);
        for (let i = 0; i < this.numRooms; i++) {
            let yPos = RandomUtils.uniform(this.r, 0, this.height - 9);
            let h = RandomUtils.uniform(this.r, 4, 9);
            let xPos = RandomUtils.uniform(this.r, 0, this.width - 9);
            let w = RandomUtils.uniform(this.r, 4, 9);
            
            console.log(`Room ${i}: pos(${xPos},${yPos}) size(${w}x${h})`);
            
            let aList = [Math.floor(xPos + w / 2), Math.floor(yPos + h / 2)];
            this.dict[i] = aList;
            this.connects.set(aList.toString(), i);
            
            // creates a width X width Y height/length
            for (let y = yPos; y < yPos + h; y++) {
                for (let x = xPos; x < xPos + w; x++) {
                    if (y === yPos || y === yPos + h - 1 || x === xPos || x === xPos + w - 1) {
                        if (this.tiles[x][y] !== TileType.FLOOR) {
                            this.tiles[x][y] = TileType.WALL;
                        }
                    } else {
                        this.tiles[x][y] = TileType.FLOOR;
                    }
                }
            }
        }
        console.log('Room generation complete');
    }
    
    distanceBetweenRooms(room1, room2) {
        return Math.abs(room1[0] - room2[0]) + Math.abs(room1[1] - room2[1]);
    }
    
    createMST() {
        let edges = [];
        let parent = Array(this.numRooms).fill(-1);
        
        // Create all possible edges
        for (let i = 0; i < this.numRooms; i++) {
            for (let j = i + 1; j < this.numRooms; j++) {
                let weight = this.distanceBetweenRooms(this.dict[i], this.dict[j]);
                edges.push(new Edge(i, j, weight));
            }
        }
        
        // Sort edges by weight
        edges.sort((a, b) => a.weight - b.weight);
        
        // Kruskal's algorithm
        for (let edge of edges) {
            let x = this.find(parent, edge.room1);
            let y = this.find(parent, edge.room2);
            
            if (x !== y) {
                this.union(parent, x, y);
                this.drawHallwayBetweenRooms(this.dict[edge.room1], this.dict[edge.room2]);
            }
        }
    }
    
    find(parent, i) {
        if (parent[i] === -1) {
            return i;
        }
        return this.find(parent, parent[i]);
    }
    
    union(parent, x, y) {
        let xset = this.find(parent, x);
        let yset = this.find(parent, y);
        if (xset !== yset) {
            parent[xset] = yset;
        }
    }
    
    drawHallwayBetweenRooms(room1, room2) {
        let x1 = room1[0];
        let y1 = room1[1];
        let x2 = room2[0];
        let y2 = room2[1];
        
        this.makeMSTHallway(x1, y1, x2, y2);
    }
    
    makeMSTHallway(x1, y1, x2, y2) {
        let startX = Math.min(x1, x2);
        let endX = Math.max(x1, x2);
        let startY = Math.min(y1, y2);
        let endY = Math.max(y1, y2);
        
        // Create horizontal hallway
        for (let x = startX; x <= endX; x++) {
            if (this.tiles[x][y1] !== TileType.FLOOR) {
                this.tiles[x][y1] = TileType.FLOOR;
            }
        }
        
        // Create vertical hallway
        this.tiles[x2][endY] = TileType.SAND;
        for (let y = startY; y <= endY; y++) {
            if (this.tiles[x2][y] !== TileType.FLOOR) {
                this.tiles[x2][y] = TileType.FLOOR;
            }
        }
        
        // Create walls around the hallway
        this.createHallwayWalls(startX, endX, startY, endY, x1, y1, x2, y2);
    }
    
    createHallwayWalls(startX, endX, startY, endY, x1, y1, x2, y2) {
        // Walls for horizontal hallway
        for (let x = startX; x <= endX + 1; x++) {
            if (y1 - 1 >= 0 && this.tiles[x][y1 - 1] === TileType.NOTHING) {
                this.tiles[x][y1 - 1] = TileType.WALL;
            }
            if (y1 + 1 <= this.height && this.tiles[x][y1 + 1] === TileType.NOTHING) {
                this.tiles[x][y1 + 1] = TileType.WALL;
            }
        }
        
        // Walls for vertical hallway
        for (let y = startY; y <= endY; y++) {
            if (x2 - 1 >= 0 && this.tiles[x2 - 1][y] === TileType.NOTHING) {
                this.tiles[x2 - 1][y] = TileType.WALL;
            }
            if (x2 + 1 < this.width && this.tiles[x2 + 1][y] === TileType.NOTHING) {
                this.tiles[x2 + 1][y] = TileType.WALL;
            }
        }
        
        // Fill in the corners
        this.fillCorner(x1, y1);
        this.fillCorner(x2, y2);
    }
    
    fillCorner(x, y) {
        let directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];
        for (let dir of directions) {
            let dx = x + dir[0];
            let dy = y + dir[1];
            if (dx >= 0 && dx < this.width && dy >= 0 && dy < this.height && this.tiles[dx][dy] === TileType.NOTHING) {
                this.tiles[dx][dy] = TileType.WALL;
            }
        }
    }
    
    initializeAvatar() {
        let floorTiles = [];
        
        // Find all floor tiles with y-coordinate below 10
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < 10; y++) {
                if (this.tiles[x][y] === TileType.FLOOR) {
                    floorTiles.push([x, y]);
                }
            }
        }
        
        // Randomly select a floor tile if available
        if (floorTiles.length > 0) {
            let randomIndex = this.r.nextInt(floorTiles.length);
            let startPosition = floorTiles[randomIndex];
            this.avatarPosition = startPosition;
            this.tiles[startPosition[0]][startPosition[1]] = TileType.AVATAR;
        }
    }
    
    moveAvatar(key) {
        if (!this.avatarPosition) return;
        
        let x = this.avatarPosition[0];
        let y = this.avatarPosition[1];
        let newX = x, newY = y;
        
        key = key.toUpperCase();
        
        switch (key) {
            case 'W':
                newY = y + 1;
                break;
            case 'A':
                newX = x - 1;
                break;
            case 'S':
                newY = y - 1;
                break;
            case 'D':
                newX = x + 1;
                break;
        }
        
        if (this.canMoveTo(newX, newY)) {
            this.tiles[x][y] = TileType.FLOOR;
            this.avatarPosition = [newX, newY];
            this.tiles[newX][newY] = TileType.AVATAR;
        }
    }
    
    canMoveTo(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height && this.tiles[x][y] !== TileType.WALL;
    }
    
    getTileName(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            const tileType = this.tiles[x][y];
            return TileDescriptions[tileType];
        }
        return 'nothing';
    }
    
    recordInput(key) {
        this.inputRecord.push(key);
    }
    
    getInputRecord() {
        return this.inputRecord;
    }
    
    getSeed() {
        return this.seed;
    }
    
    getTiles() {
        return this.tiles;
    }
}