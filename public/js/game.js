class BombermanGame {
    constructor(container, websocket) {
        this.container = container;
        this.websocket = websocket;
        this.framework = window.Framework;
        
        // Game state (received from server)
        this.gameState = {
            players: [],
            bombs: [],
            powerUps: [],
            explosions: [],
            mapArray: [],
            gameStatus: 'waiting'
        };
        
        // Player settings
        this.tileSize = 32;
        
        // Framework state
        this.frameworkState = this.framework.createState({
            players: [],
            bombs: [],
            powerUps: [],
            gameStatus: 'waiting'
        });
        
        this.initializeGame();
    }

    initializeGame() {
        this.bindInput();
        this.startGameLoop();
    }

    bindInput() {
        this.initializeControls();
    }

    initializeControls() {
        const pressedDirections = [];
        const keyMap = {
            'ArrowUp': 'arrowup',
            'ArrowDown': 'arrowdown',
            'ArrowLeft': 'arrowleft',
            'ArrowRight': 'arrowright',
            'Space': 'space'
        };

        // Key down event
        document.addEventListener('keydown', (event) => {
            const key = keyMap[event.code];
            if (!key) return;

            event.preventDefault();

            if (key === 'space') {
                // Send bomb placement
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

        // Key up event
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
        
        // Update map if it changed
        if (newGameState.mapArray && newGameState.mapArray.length > 0) {
            this.updateMap(newGameState.mapArray);
        }
        
        // Update framework state
        this.frameworkState.set('players', newGameState.players);
        this.frameworkState.set('bombs', newGameState.bombs);
        this.frameworkState.set('powerUps', newGameState.powerUps);
        this.frameworkState.set('gameStatus', newGameState.gameStatus);
    }

    updateMap(mapArray) {
        // Store the previous map for comparison
        if (!this.previousMapArray) {
            this.previousMapArray = [];
        }

        // Load assets like your original system
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

        // Set sprite based on direction with fallback
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

    renderPowerUps() {
        // Clear existing power-up elements
        const existingPowerUps = this.container.querySelectorAll('.powerup');
        existingPowerUps.forEach(element => element.remove());

        // Render all power-ups
        this.gameState.powerUps.forEach(powerUp => {
            const element = document.createElement('div');
            element.className = 'powerup';
            element.style.position = 'absolute';
            element.style.width = '32px';
            element.style.height = '32px';
            element.style.backgroundImage = `url(/assets/${powerUp.type}.png)`;
            element.style.backgroundSize = 'cover';
            element.style.zIndex = '7';
            element.style.transform = `translate3d(${powerUp.gridX * this.tileSize}px, ${powerUp.gridY * this.tileSize}px, 1px)`;
            
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

    startGameLoop() {
        this.framework.startGameLoop(
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
        // All game logic is now handled on the server
        // This method is mainly for any client-side animations or effects
    }

    renderGame() {
        // Render all game elements
        this.renderPlayers();
        this.renderBombs();
        this.renderPowerUps();
        this.renderExplosions();
    }

    start() {
        console.log('Game started - client-side rendering only');
        this.frameworkState.set('gameStatus', 'playing');
    }

    stop() {
        this.framework.stopGameLoop();
        this.frameworkState.set('gameStatus', 'stopped');
    }
}

// Export for use in main.js
window.BombermanGame = BombermanGame; 