# Bomberman Multiplayer Game

A real-time multiplayer Bomberman game built with Node.js WebSocket backend and vanilla JavaScript frontend using DOM manipulation.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Step-by-Step Implementation](#step-by-step-implementation)
4. [Game Mechanics](#game-mechanics)
5. [Setup Instructions](#setup-instructions)
6. [File Structure](#file-structure)

## Project Overview

This is a multiplayer Bomberman game where 2-4 players can join and battle until one player remains. The game features:
- Real-time multiplayer using WebSockets
- Server-authoritative game logic
- Smooth 60 FPS movement
- Bomb placement and explosion mechanics
- Power-ups and destructible blocks
- Player lives and elimination system

## Architecture

### Backend (Node.js + WebSocket)
- **Server**: Handles WebSocket connections and game state
- **Game Engine**: Manages all game logic, player movement, bombs, explosions
- **Real-time Updates**: Broadcasts game state at 60 FPS

### Frontend (Vanilla JavaScript)
- **DOM Manipulation**: Renders game using HTML elements
- **Input Handling**: Captures keyboard input and sends to server
- **Smooth Rendering**: Uses CSS transitions for fluid movement
- **Asset Management**: Loads and displays game sprites

## Step-by-Step Implementation

### Step 1: Project Setup

```bash
# Create project directory
mkdir bomberman-dom
cd bomberman-dom

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express ws
```

### Step 2: MockFramework Implementation

Before building the game, we need a temporary framework to handle DOM manipulation, state management, and game loops. Create `public/js/framework.js`:

```javascript
// Mock Mini-Framework - Vanilla JS Implementation
// This will be replaced with my team's actual framework later

class MockFramework {
    constructor() {
        this.state = {};
        this.components = new Map();
        this.eventHandlers = new Map();
        this.routes = new Map();
        this.currentRoute = '/';
        this.stateSubscribers = new Set();
        this.gameLoop = null;
        this.entities = new Map();
        this.lastFrameTime = 0;
        this.fps = 60;
        this.frameInterval = 1000 / this.fps;
    }

    // Enhanced DOM Abstraction with Virtual DOM concepts
    createElement(tag, attrs = {}, children = []) {
        const element = document.createElement(tag);
        
        // Set attributes
        Object.keys(attrs).forEach(key => {
            if (key === 'className') {
                element.className = attrs[key];
            } else if (key === 'innerHTML') {
                element.innerHTML = attrs[key];
            } else if (key.startsWith('data-')) {
                element.setAttribute(key, attrs[key]);
            } else if (key === 'style' && typeof attrs[key] === 'object') {
                // Handle style object
                Object.assign(element.style, attrs[key]);
            } else {
                element[key] = attrs[key];
            }
        });
        
        // Add children
        if (typeof children === 'string') {
            element.textContent = children;
        } else if (Array.isArray(children)) {
            children.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else if (child instanceof HTMLElement) {
                    element.appendChild(child);
                }
            });
        }
        
        return element;
    }

    // Virtual DOM-like update with diffing
    updateElement(element, newAttrs = {}) {
        Object.keys(newAttrs).forEach(key => {
            if (key === 'className') {
                element.className = newAttrs[key];
            } else if (key === 'innerHTML') {
                element.innerHTML = newAttrs[key];
            } else if (key.startsWith('data-')) {
                element.setAttribute(key, newAttrs[key]);
            } else if (key === 'style' && typeof newAttrs[key] === 'object') {
                Object.assign(element.style, newAttrs[key]);
            } else {
                element[key] = newAttrs[key];
            }
        });
    }

    // Enhanced State Management with reactive updates
    createState(initialState) {
        Object.assign(this.state, initialState);
        return {
            get: (key) => this.state[key],
            set: (key, value) => this.setState(key, value),
            getAll: () => ({ ...this.state }),
            subscribe: (callback) => this.subscribe(callback),
            update: (updates) => {
                Object.keys(updates).forEach(key => {
                    this.setState(key, updates[key]);
                });
            }
        };
    }

    setState(key, value) {
        this.state[key] = value;
        this.notifySubscribers();
    }

    subscribe(callback) {
        this.stateSubscribers.add(callback);
        return () => this.stateSubscribers.delete(callback);
    }

    notifySubscribers() {
        this.stateSubscribers.forEach(callback => callback(this.state));
    }

    // Enhanced Event Handling with custom event system
    on(element, event, handler) {
        const key = `${element.id || 'anonymous'}_${event}`;
        
        if (!this.eventHandlers.has(key)) {
            this.eventHandlers.set(key, []);
        }
        
        this.eventHandlers.get(key).push(handler);
        
        // Custom event handling wrapper
        const wrappedHandler = (e) => {
            // Add framework context to event
            e.framework = this;
            handler(e);
        };
        
        element.addEventListener(event, wrappedHandler);
        
        // Return unsubscribe function
        return () => {
            const handlers = this.eventHandlers.get(key);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
                element.removeEventListener(event, wrappedHandler);
            }
        };
    }

    // Emit custom events
    emit(element, eventName, data) {
        const customEvent = new CustomEvent(eventName, { detail: data });
        element.dispatchEvent(customEvent);
    }

    // Game-specific methods
    createGameEntity(id, x, y, width, height, type = 'entity') {
        const entity = {
            id,
            x,
            y,
            width,
            height,
            type,
            element: null,
            update: null,
            render: null,
            destroy: () => this.removeEntity(id)
        };
        
        this.entities.set(id, entity);
        return entity;
    }

    removeEntity(id) {
        const entity = this.entities.get(id);
        if (entity && entity.element && entity.element.parentNode) {
            entity.element.parentNode.removeChild(entity.element);
        }
        this.entities.delete(id);
    }

    // Game loop with 60 FPS target
    startGameLoop(container, updateCallback, renderCallback) {
        this.gameLoop = (currentTime) => {
            const deltaTime = currentTime - this.lastFrameTime;
            
            if (deltaTime >= this.frameInterval) {
                this.lastFrameTime = currentTime - (deltaTime % this.frameInterval);
                
                // Update game logic
                if (updateCallback) {
                    updateCallback(deltaTime);
                }
                
                // Update all entities
                this.entities.forEach(entity => {
                    if (entity.update) {
                        entity.update(deltaTime);
                    }
                });
                
                // Render
                if (renderCallback) {
                    renderCallback();
                }
            }
            
            requestAnimationFrame(this.gameLoop);
        };
        
        requestAnimationFrame(this.gameLoop);
    }

    stopGameLoop() {
        if (this.gameLoop) {
            this.gameLoop = null;
        }
    }

    // Performance monitoring
    measurePerformance(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`${name} took ${end - start}ms`);
        return result;
    }

    getFPS() {
        return this.fps;
    }

    setFPS(targetFPS) {
        this.fps = targetFPS;
        this.frameInterval = 1000 / this.fps;
    }

    init() {
        console.log('MockFramework initialized');
    }
}

// Create global framework instance
const Framework = new MockFramework();
Framework.init();

// Make framework available globally
window.Framework = Framework;
window.MockFramework = MockFramework;
```

This MockFramework provides:
- **DOM Abstraction**: Virtual DOM-like element creation and updates
- **State Management**: Reactive state with subscribers
- **Event Handling**: Custom event system with framework context
- **Game Loop**: 60 FPS game loop with performance monitoring
- **Entity Management**: Game entity creation and management

### Step 3: Basic Server Setup

Create `server/server.js`:

```javascript
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files
app.use(express.static('public'));

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('New client connected');
    
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        // Handle different message types
    });
    
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

### Step 4: Game Engine Implementation

Create `server/gameEngine.js`:

```javascript
class BombermanGameEngine {
    constructor() {
        this.players = new Map();
        this.bombs = new Map();
        this.powerUps = new Map();
        this.explosions = new Map();
        this.mapArray = [];
        this.tileSize = 32;
        this.gameStatus = 'waiting'; // waiting, playing, finished
        this.gameLoop = null;
        this.lastUpdate = Date.now();
        
        this.initializeMap();
    }

    initializeMap() {
        // Create 25x21 map with walls, grass, and destructible blocks
        this.mapArray = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 0],
            // ... rest of map layout
        ];
        
        // Randomize destructible blocks
        for (let y = 1; y < this.mapArray.length - 1; y++) {
            for (let x = 1; x < this.mapArray[y].length - 1; x++) {
                if (this.mapArray[y][x] === 1 && Math.random() < 0.7) {
                    this.mapArray[y][x] = 2; // 70% chance for destructible block
                }
            }
        }
    }

    getStartingPositions() {
        return [
            { mapX: 1, mapY: 1, pixelX: 32, pixelY: 32 },
            { mapX: 22, mapY: 1, pixelX: 704, pixelY: 32 },
            { mapX: 1, mapY: 19, pixelX: 32, pixelY: 608 },
            { mapX: 22, mapY: 19, pixelX: 704, pixelY: 608 }
        ];
    }

    addPlayer(playerId, nickname) {
        const startingPositions = this.getStartingPositions();
        const position = startingPositions[this.players.size];
        
        if (position) {
            const player = {
                id: playerId,
                nickname: nickname,
                gridX: position.mapX,
                gridY: position.mapY,
                pixelX: position.pixelX,
                pixelY: position.pixelY,
                nextPixelX: position.pixelX,
                nextPixelY: position.pixelY,
                isMoving: false,
                currentDirection: 'down',
                lives: 3,
                maxBombs: 1,
                bombRange: 1,
                speed: 4,
                pressedDirections: [],
                frameIndex: 2,
                stepCount: 0,
                stepsPerFrame: 5
            };
            
            this.players.set(playerId, player);
            return player;
        }
        return null;
    }
}

module.exports = BombermanGameEngine;
```

### Step 5: Player Movement System

Add movement methods to the game engine:

```javascript
handlePlayerInput(playerId, action, key) {
    const player = this.players.get(playerId);
    if (!player || this.gameStatus !== 'playing') return;

    switch (action) {
        case 'MOVE':
            this.handleMovement(player, key);
            break;
        case 'KEY_RELEASE':
            this.handleKeyRelease(player, key);
            break;
        case 'PLACE_BOMB':
            this.placeBomb(player);
            break;
    }
}

handleMovement(player, key) {
    // Add direction to pressed directions
    if (!player.pressedDirections.includes(key)) {
        player.pressedDirections.push(key);
    }

    // Set direction based on key
    switch (key) {
        case 'arrowup': player.currentDirection = 'up'; break;
        case 'arrowdown': player.currentDirection = 'down'; break;
        case 'arrowleft': player.currentDirection = 'left'; break;
        case 'arrowright': player.currentDirection = 'right'; break;
    }

    // Try to move if not already moving
    if (!player.isMoving) {
        this.tryToMove(player);
    }
}

tryToMove(player) {
    if (player.pressedDirections.length === 0) return;

    const direction = player.pressedDirections[player.pressedDirections.length - 1];
    let nextGridX = player.gridX;
    let nextGridY = player.gridY;

    switch (direction) {
        case 'arrowup': nextGridY--; break;
        case 'arrowdown': nextGridY++; break;
        case 'arrowleft': nextGridX--; break;
        case 'arrowright': nextGridX++; break;
    }

    if (this.canMove(player, nextGridX, nextGridY)) {
        player.nextPixelX = nextGridX * this.tileSize;
        player.nextPixelY = nextGridY * this.tileSize;
        player.isMoving = true;
    }
}

canMove(player, nextGridX, nextGridY) {
    console.log("!!!!!!!","neeext ")
    //   return false if map boundres 
    if (nextGridX < 0 || nextGridY < 0 || 
        nextGridY >= this.mapArray.length || 
        nextGridX >= this.mapArray[0].length) {
        return false;
    }

    // Check if tile is walkable (only grass is walkable) && 3 
    const tileType = this.mapArray[nextGridY][nextGridX];
    if ((tileType !== 1) || tileType !==3) {
        return false;
    }

    // Check if position is blocked by bomb
    if (this.isPositionBlocked(nextGridX, nextGridY)) {
        return false;
    }

    return true;
}
```

### Step 6: Bomb System

Add bomb placement and explosion logic:

```javascript
placeBomb(player) {
    // Check if there's already a bomb at this position
    const bombAtPosition = Array.from(this.bombs.values()).find(bomb => 
        bomb.gridX === player.gridX && bomb.gridY === player.gridY
    );
    
    if (bombAtPosition) {
        return; // Don't place bomb if one already exists
    }

    const bombId = `bomb_${Date.now()}_${player.id}`;
    const bomb = {
        id: bombId,
        playerId: player.id,
        gridX: player.gridX,
        gridY: player.gridY,
        range: player.bombRange,
        timer: 2000, // 2 seconds
        createdAt: Date.now()
    };

    this.bombs.set(bombId, bomb);
}

explodeBomb(bomb) {
    const directions = [
        { dx: 0, dy: -1 }, // Up
        { dx: 0, dy: 1 },  // Down
        { dx: 1, dy: 0 },  // Right
        { dx: -1, dy: 0 }  // Left
    ];

    // Create explosion at bomb position
    this.createExplosion(bomb.gridX, bomb.gridY);

    directions.forEach(dir => {
        const exploX = bomb.gridX + dir.dx;
        const exploY = bomb.gridY + dir.dy;

        if (this.mapArray[exploY] && 
            this.mapArray[exploY][exploX] && 
            this.mapArray[exploY][exploX] !== 0) {
            this.createExplosion(exploX, exploY);
        }
    });

    // Handle bomb interactions
    this.bombBricks(bomb.gridX, bomb.gridY);
    this.bombPlayers(bomb.gridX, bomb.gridY);
}

bombBricks(bombGridX, bombGridY) {
    const directions = [
        { dx: 0, dy: 1 },   // Down
        { dx: 1, dy: 0 },   // Right
        { dx: 0, dy: -1 },  // Up
        { dx: -1, dy: 0 }   // Left
    ];

    directions.forEach(dir => {
        const brickX = bombGridX + dir.dx;
        const brickY = bombGridY + dir.dy;

        if (this.mapArray[brickY] && this.mapArray[brickY][brickX] === 2) {
            // Destroy the block
            this.mapArray[brickY][brickX] = 1;
            
            // Chance to spawn power-up
            if (Math.random() < 0.3) {
                this.spawnPowerUp(brickX, brickY);
            }
        }
    });
}
```

### Step 7: Game Loop and State Management

Add the main game loop:

```javascript
updateGame(deltaTime) {
    // Update player movement
    this.players.forEach(player => {
        if (player.isMoving) {
            this.updatePlayerMovement(player, deltaTime);
        }
    });

    // Update bombs
    this.bombs.forEach((bomb, bombId) => {
        bomb.timer -= deltaTime;
        if (bomb.timer <= 0) {
            this.explodeBomb(bomb);
            this.bombs.delete(bombId);
        }
    });

    // Update explosions
    this.explosions.forEach((explosion, explosionId) => {
        explosion.timer -= deltaTime;
        if (explosion.timer <= 0) {
            this.explosions.delete(explosionId);
        }
    });
}

updatePlayerMovement(player, deltaTime) {
    const diffX = Math.abs(player.pixelX - player.nextPixelX);
    const diffY = Math.abs(player.pixelY - player.nextPixelY);

    // Move towards target position
    if (player.pixelX < player.nextPixelX) {
        player.pixelX += player.speed;
    }
    if (player.pixelX > player.nextPixelX) {
        player.pixelX -= player.speed;
    }
    if (player.pixelY < player.nextPixelY) {
        player.pixelY += player.speed;
    }
    if (player.pixelY > player.nextPixelY) {
        player.pixelY -= player.speed;
    }

    // Check if movement is complete
    if (diffX < player.speed && diffY < player.speed) {
        player.pixelX = player.nextPixelX;
        player.pixelY = player.nextPixelY;
        player.gridX = Math.floor(player.pixelX / this.tileSize);
        player.gridY = Math.floor(player.pixelY / this.tileSize);
        player.isMoving = false;
        
        // Try to continue movement
        this.tryToMove(player);
    }
}

startGame() {
    this.gameStatus = 'playing';
    this.lastUpdate = Date.now();
    
    this.gameLoop = setInterval(() => {
        const now = Date.now();
        const deltaTime = now - this.lastUpdate;
        this.lastUpdate = now;
        
        this.updateGame(deltaTime);
    }, 16); // ~60 FPS
}

getGameState() {
    return {
        players: Array.from(this.players.values()),
        bombs: Array.from(this.bombs.values()),
        powerUps: Array.from(this.powerUps.values()),
        explosions: Array.from(this.explosions.values()),
        mapArray: this.mapArray,
        gameStatus: this.gameStatus
    };
}
```

### Step 8: WebSocket Server Integration

Update `server/server.js` to integrate the game engine:

```javascript
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const BombermanGameEngine = require('./gameEngine');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files
app.use(express.static('public'));

// Game engine instance
const gameEngine = new BombermanGameEngine();

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('New client connected');
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'JOIN_GAME':
                    const player = gameEngine.addPlayer(ws.id, data.nickname);
                    if (player) {
                        ws.send(JSON.stringify({
                            type: 'PLAYER_JOINED',
                            player: player
                        }));
                        
                        // Broadcast updated player count
                        wss.clients.forEach(client => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({
                                    type: 'PLAYER_COUNT_UPDATE',
                                    count: gameEngine.players.size
                                }));
                            }
                        });
                    }
                    break;
                    
                case 'GAME_ACTION':
                    gameEngine.handlePlayerInput(ws.id, data.action, data.key);
                    break;
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });
    
    ws.on('close', () => {
        console.log('Client disconnected');
        gameEngine.removePlayer(ws.id);
    });
});

// Broadcast game state at 60 FPS
setInterval(() => {
    if (gameEngine.gameStatus === 'playing') {
        const gameState = gameEngine.getGameState();
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'GAME_STATE_UPDATE',
                    gameState: gameState
                }));
            }
        });
    }
}, 16); // ~60 FPS

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

### Step 9: Frontend Implementation

Create `public/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bomberman Multiplayer</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
        }
        
        #gameContainer {
            width: 800px;
            height: 672px;
            margin: 0 auto;
            position: relative;
            background-color: #fff;
            border: 2px solid #333;
            overflow: hidden;
        }
        
        .player {
            position: absolute;
            width: 32px;
            height: 32px;
            background-size: cover;
            z-index: 10;
            transition: transform 0.1s ease-out;
        }
        
        .bomb {
            position: absolute;
            width: 32px;
            height: 32px;
            background-image: url('/assets/bomb.png');
            background-size: cover;
            z-index: 5;
        }
        
        .explosion {
            position: absolute;
            width: 32px;
            height: 32px;
            background-image: url('/assets/2.png');
            background-size: cover;
            z-index: 6;
        }
    </style>
</head>
<body>
    <div id="gameContainer"></div>
    <script src="/js/framework.js"></script>
    <script src="/js/game.js"></script>
</body>
</html>
```

**Note**: The framework.js script is loaded before game.js to ensure the MockFramework is available.
```

### Step 10: Client-Side Game Logic with Framework Integration

Create `public/js/game.js`:

```javascript
class BombermanGame {
    constructor(container, websocket) {
        this.container = container;
        this.websocket = websocket;
        this.gameState = {};
        this.tileSize = 32;
        this.previousMapArray = [];
        
        // Initialize framework state
        this.frameworkState = Framework.createState({
            players: [],
            bombs: [],
            powerUps: [],
            explosions: [],
            mapArray: [],
            gameStatus: 'waiting'
        });
        
        this.initializeGame();
        this.bindInput();
        this.startGameLoop();
    }

    initializeGame() {
        // Initialize game state
        this.gameState = {
            players: [],
            bombs: [],
            powerUps: [],
            explosions: [],
            mapArray: [],
            gameStatus: 'waiting'
        };
    }

    startGameLoop() {
        // Use framework's game loop for 60 FPS rendering
        Framework.startGameLoop(
            this.container,
            (deltaTime) => {
                this.updateGame(deltaTime);
            },
            () => {
                this.renderGame();
            }
        );
    }

    updateGame(deltaTime) {
        // Update game logic here if needed
        // Most updates come from server via WebSocket
    }

    bindInput() {
        const pressedDirections = [];
        const keyMap = {
            'ArrowUp': 'arrowup',
            'ArrowDown': 'arrowdown',
            'ArrowLeft': 'arrowleft',
            'ArrowRight': 'arrowright',
            'Space': 'space'
        };

        document.addEventListener('keydown', (event) => {
            const key = keyMap[event.code];
            if (!key) return;

            event.preventDefault();

            if (key === 'space') {
                // Place bomb
                this.websocket.send(JSON.stringify({
                    type: 'GAME_ACTION',
                    action: 'PLACE_BOMB'
                }));
            } else {
                // Add to pressed directions
                if (!pressedDirections.includes(key)) {
                    pressedDirections.push(key);
                }

                // Send movement action
                this.websocket.send(JSON.stringify({
                    type: 'GAME_ACTION',
                    action: 'MOVE',
                    key: key
                }));
            }
        });

        document.addEventListener('keyup', (event) => {
            const key = keyMap[event.code];
            if (!key || key === 'space') return;

            event.preventDefault();

            // Remove from pressed directions
            const index = pressedDirections.indexOf(key);
            if (index > -1) {
                pressedDirections.splice(index, 1);
            }

            // Send key release to server
            this.websocket.send(JSON.stringify({
                type: 'GAME_ACTION',
                action: 'KEY_RELEASE',
                key: key
            }));
        });
    }

    updateGameState(newGameState) {
        this.gameState = newGameState;
        
        // Update framework state
        this.frameworkState.update({
            players: newGameState.players,
            bombs: newGameState.bombs,
            powerUps: newGameState.powerUps,
            explosions: newGameState.explosions,
            gameStatus: newGameState.gameStatus
        });
        
        // Update map if it changed
        if (newGameState.mapArray && newGameState.mapArray.length > 0) {
            this.updateMap(newGameState.mapArray);
        }
    }

    updateMap(mapArray) {
        // Store the previous map for comparison
        if (!this.previousMapArray) {
            this.previousMapArray = [];
        }

        // Load assets
        const tileImage = new Image();
        const blockImage = new Image();
        const greenBlockImage = new Image();
        
        tileImage.src = '/assets/tile.png';
        blockImage.src = '/assets/block.png';
        greenBlockImage.src = '/assets/greenBlock.png';

        // If this is the first time, create the entire map
        if (this.previousMapArray.length === 0) {
            // Clear existing map elements
            const existingBlocks = this.container.querySelectorAll('[data-map-element]');
            existingBlocks.forEach(element => element.remove());

            let mapX = 0;
            let mapY = 0;
            
            for (let y = 0; y < mapArray.length; y++) {
                mapX = 0;
                for (let x = 0; x < mapArray[y].length; x++) {
                    const tileType = mapArray[y][x];
                    
                    const element = document.createElement('div');
                    element.style.position = 'absolute';
                    element.style.width = `${this.tileSize}px`;
                    element.style.height = `${this.tileSize}px`;
                    element.style.transform = `translate3d(${mapX}px, ${mapY}px, 0px)`;
                    element.setAttribute('data-map-element', 'true');
                    element.setAttribute('data-grid-x', x);
                    element.setAttribute('data-grid-y', y);

                    switch (tileType) {
                        case 0: // Wall
                            element.style.backgroundImage = `url(${tileImage.src})`;
                            element.style.zIndex = '0';
                            break;
                        case 1: // Grass
                        case 3: // Starting position
                            element.style.backgroundImage = `url(${greenBlockImage.src})`;
                            element.style.zIndex = '1';
                            break;
                        case 2: // Destructible block
                            element.style.backgroundImage = `url(${blockImage.src})`;
                            element.style.zIndex = '2';
                            element.classList.add(`canBomb_${mapX}_${mapY}`);
                            break;
                    }

                    this.container.appendChild(element);
                    mapX += this.tileSize;
                }
                mapY += this.tileSize;
            }
        } else {
            // Update only changed tiles
            for (let y = 0; y < mapArray.length; y++) {
                for (let x = 0; x < mapArray[y].length; x++) {
                    const currentTile = mapArray[y][x];
                    const previousTile = this.previousMapArray[y] ? this.previousMapArray[y][x] : null;
                    
                    if (currentTile !== previousTile) {
                        // Find the existing element for this position
                        const existingElement = this.container.querySelector(`[data-grid-x="${x}"][data-grid-y="${y}"]`);
                        
                        if (existingElement) {
                            const mapX = x * this.tileSize;
                            const mapY = y * this.tileSize;
                            
                            switch (currentTile) {
                                case 0: // Wall
                                    existingElement.style.backgroundImage = `url(${tileImage.src})`;
                                    existingElement.style.zIndex = '0';
                                    break;
                                case 1: // Grass
                                case 3: // Starting position
                                    existingElement.style.backgroundImage = `url(${greenBlockImage.src})`;
                                    existingElement.style.zIndex = '1';
                                    break;
                                case 2: // Destructible block
                                    existingElement.style.backgroundImage = `url(${blockImage.src})`;
                                    existingElement.style.zIndex = '2';
                                    existingElement.classList.add(`canBomb_${mapX}_${mapY}`);
                                    break;
                            }
                        }
                    }
                }
            }
        }

        // Store the current map for next comparison
        this.previousMapArray = JSON.parse(JSON.stringify(mapArray));
    }

    renderPlayers() {
        // Clear existing player elements
        const existingPlayers = this.container.querySelectorAll('.player');
        existingPlayers.forEach(element => element.remove());

        // Render all players
        this.gameState.players.forEach(player => {
            this.renderPlayer(player);
        });
    }

    renderPlayer(player) {
        const element = document.createElement('div');
        element.className = 'player';
        element.style.position = 'absolute';
        element.style.width = '32px';
        element.style.height = '32px';
        element.style.overflow = 'hidden';
        element.style.zIndex = '10';
        
        // Smooth movement with CSS transitions
        element.style.transition = 'transform 0.1s ease-out';
        element.style.transform = `translate3d(${player.pixelX}px, ${player.pixelY}px, 2px)`;

        // Set sprite based on direction
        const spritePath = `/assets/move_${player.currentDirection}.png`;
        element.style.backgroundImage = `url(${spritePath})`;
        element.style.backgroundSize = 'cover';

        // Add nickname
        const nicknameElement = document.createElement('div');
        nicknameElement.style.position = 'absolute';
        nicknameElement.style.top = '-20px';
        nicknameElement.style.left = '50%';
        nicknameElement.style.transform = 'translateX(-50%)';
        nicknameElement.style.fontSize = '10px';
        nicknameElement.style.color = '#000';
        nicknameElement.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        nicknameElement.style.padding = '2px 4px';
        nicknameElement.style.borderRadius = '3px';
        nicknameElement.style.whiteSpace = 'nowrap';
        nicknameElement.textContent = player.nickname;
        
        element.appendChild(nicknameElement);
        this.container.appendChild(element);
    }

    renderBombs() {
        // Clear existing bomb elements
        const existingBombs = this.container.querySelectorAll('.bomb');
        existingBombs.forEach(element => element.remove());

        // Render all bombs
        this.gameState.bombs.forEach(bomb => {
            const element = document.createElement('div');
            element.className = 'bomb';
            element.style.position = 'absolute';
            element.style.width = '32px';
            element.style.height = '32px';
            element.style.backgroundImage = 'url(/assets/bomb.png)';
            element.style.backgroundSize = 'cover';
            element.style.zIndex = '5';
            element.style.transform = `translate3d(${bomb.gridX * this.tileSize}px, ${bomb.gridY * this.tileSize}px, 1px)`;
            
            this.container.appendChild(element);
        });
    }

    renderExplosions() {
        // Clear existing explosion elements
        const existingExplosions = this.container.querySelectorAll('.explosion');
        existingExplosions.forEach(element => element.remove());

        // Render all explosions
        this.gameState.explosions.forEach(explosion => {
            const element = document.createElement('div');
            element.className = 'explosion';
            element.style.position = 'absolute';
            element.style.width = '32px';
            element.style.height = '32px';
            element.style.backgroundImage = 'url(/assets/2.png)';
            element.style.backgroundSize = 'cover';
            element.style.zIndex = '6';
            element.style.transform = `translate3d(${explosion.gridX * this.tileSize}px, ${explosion.gridY * this.tileSize}px, 1px)`;
            
            this.container.appendChild(element);
        });
    }

    renderGame() {
        this.renderPlayers();
        this.renderBombs();
        this.renderExplosions();
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('gameContainer');
    const websocket = new WebSocket(`ws://${window.location.host}`);
    
    const game = new BombermanGame(container, websocket);
    
    websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
            case 'GAME_STATE_UPDATE':
                game.updateGameState(data.gameState);
                break;
        }
    };
    
    // Join game with a nickname
    const nickname = prompt('Enter your nickname:') || 'Player';
    websocket.send(JSON.stringify({
        type: 'JOIN_GAME',
        nickname: nickname
    }));
});
```

## Framework Features

The MockFramework provides essential features for building the game:

### DOM Abstraction
- **createElement()**: Create DOM elements with attributes and children
- **updateElement()**: Update existing elements with new attributes
- **Virtual DOM-like**: Efficient updates with diffing

### State Management
- **createState()**: Initialize reactive state
- **setState()**: Update state and notify subscribers
- **subscribe()**: React to state changes
- **update()**: Batch multiple state updates

### Event Handling
- **on()**: Add event listeners with framework context
- **emit()**: Emit custom events
- **Unsubscribe**: Automatic cleanup of event handlers

### Game Loop
- **startGameLoop()**: 60 FPS game loop with performance monitoring
- **stopGameLoop()**: Clean game loop shutdown
- **measurePerformance()**: Performance measurement utilities

### Entity Management
- **createGameEntity()**: Create game entities with update/render methods
- **removeEntity()**: Clean entity removal
- **Entity lifecycle**: Automatic cleanup and management

## Game Mechanics

### Map System
- **0**: Wall (impassable)
- **1**: Grass (walkable)
- **2**: Destructible block (can be destroyed by bombs)
- **3**: Starting position (walkable)

### Player Movement
- Grid-based movement with pixel interpolation
- Continuous movement using pressed directions array
- Collision detection with walls, blocks, and bombs
- Smooth CSS transitions for visual movement

### Bomb System
- 2-second timer before explosion
- Four-direction explosion pattern
- Destroys blocks and damages players
- Blocks player movement until explosion

### Player System
- 3 lives per player
- Elimination when lives reach 0
- Game ends when only 1 player remains

## Setup Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Add game assets** to `public/assets/`:
   - `tile.png` - Wall texture
   - `block.png` - Destructible block texture
   - `greenBlock.png` - Grass texture
   - `bomb.png` - Bomb sprite
   - `2.png` - Explosion sprite
   - `move_up.png`, `move_down.png`, `move_left.png`, `move_right.png` - Player sprites

3. **Start the server**:
   ```bash
   node server/server.js
   ```

4. **Open browser** to `http://localhost:3000`

## File Structure

```
bomberman-dom/
├── server/
│   ├── server.js          # WebSocket server
│   └── gameEngine.js      # Game logic engine
├── public/
│   ├── index.html         # Main HTML file
│   ├── js/
│   │   └── game.js        # Client-side game logic
│   └── assets/            # Game sprites and textures
├── package.json
└── README.md
```

## Key Features

- **Real-time multiplayer**: WebSocket-based communication
- **Server-authoritative**: All game logic runs on server
- **Smooth movement**: 60 FPS updates with CSS transitions
- **Bomb mechanics**: Placement, timing, and explosion system
- **Map destruction**: Dynamic block removal and power-up spawning
- **Player elimination**: Lives system with last-player-standing victory
- **Framework integration**: Uses MockFramework for DOM abstraction and state management

## Framework Replacement

The MockFramework is a temporary implementation that can be replaced with your team's actual mini-framework. The framework interface is designed to be easily swappable:

1. **Replace framework.js**: Implement your framework with the same interface
2. **Update method calls**: Ensure your framework provides the same methods
3. **Test integration**: Verify all framework features work correctly

This implementation provides a solid foundation for a multiplayer Bomberman game that can be extended with additional features like power-ups, different maps, and team modes. 