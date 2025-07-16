// import MiniFramework from '../mini-framework/index.js';

// class BombermanGame {
//     constructor(container, websocket) {
//         this.container = container;
//         this.websocket = websocket;
        
//         // Game state (received from server)
//         this.gameState = {
//             players: [],
//             bombs: [],
//             powerUps: [],
//             explosions: [],
//             mapArray: [],
//             gameStatus: 'waiting'
//         };
        
//         // Player settings
//         this.tileSize = 32;
        
//         // Framework state
//         this.frameworkState = MiniFramework.createReactiveStore({
//             players: [],
//             bombs: [],
//             powerUps: [],
//             gameStatus: 'waiting'
//         });
        
//         this.initializeGame();
//         this.localPlayerFrames = {}; // traaacking  animation fram and timer for eache player  
//     }

//     initializeGame() {
//         this.bindInput();
//         this.startGameLoop();
//     }

//     bindInput() {
//         this.initializeControls();
//     }

//     initializeControls() {
//         const pressedDirections = [];
//         const keyMap = {
//             'ArrowUp': 'arrowup',
//             'ArrowDown': 'arrowdown',
//             'ArrowLeft': 'arrowleft',
//             'ArrowRight': 'arrowright',
//             'Space': 'space'
//         };

//         // Key down event
//         document.addEventListener('keydown', (event) => {
//             const key = keyMap[event.code];
//             if (!key) return;

//             event.preventDefault();

//             if (key === 'space') {
//                 // Send bomb placement
//                 this.websocket.send(JSON.stringify({
//                     type: 'GAME_ACTION',
//                     action: 'PLACE_BOMB'
//                 }));
//             } else {
//                 // Add to pressed directions
//                 if (!pressedDirections.includes(key)) {
//                     pressedDirections.push(key);
//                 }

//                 // Send movement action
//                 this.websocket.send(JSON.stringify({
//                     type: 'GAME_ACTION',
//                     action: 'MOVE',
//                     key: key
//                 }));
//             }
//         });

//         // Key up event
//         document.addEventListener('keyup', (event) => {
//             const key = keyMap[event.code];
//             if (!key || key === 'space') return;

//             event.preventDefault();

//             // Remove from pressed directions
//             const index = pressedDirections.indexOf(key);
//             if (index > -1) {
//                 pressedDirections.splice(index, 1);
//             }

//             // Send key release to server
//             this.websocket.send(JSON.stringify({
//                 type: 'GAME_ACTION',
//                 action: 'KEY_RELEASE',
//                 key: key
//             }));
//         });
//     }

//     updateGameState(newGameState) {
//         this.gameState = newGameState;
        
//         // Update map if it changed
//         if (newGameState.mapArray && newGameState.mapArray.length > 0) {
//             this.updateMap(newGameState.mapArray);
//         }
        
//         // Update framework state
//         this.frameworkState.setState('players', newGameState.players);
//         this.frameworkState.setState('bombs', newGameState.bombs);
//         this.frameworkState.setState('powerUps', newGameState.powerUps);
//         this.frameworkState.setState('gameStatus', newGameState.gameStatus);
//     }

//     updateMap(mapArray) {
//         // Store the previous map for comparison
//         if (!this.previousMapArray) {
//             this.previousMapArray = [];
//         }

//         // Load assets like your original system
//         const tileImage = new Image();
//         const blockImage = new Image();
//         const greenBlockImage = new Image();
        
//         tileImage.src = '/assets/tile.png';
//         blockImage.src = '/assets/block.png';
//         greenBlockImage.src = '/assets/greenBlock.png';

//         // If this is the first time>:::: create the entire map
//         if (this.previousMapArray.length === 0) {
//             // Clear existen map element 
            
//             const existingBlocks = this.container.querySelectorAll('[data-map-element]');
//             existingBlocks.forEach(element => element.remove());

//             let mapX = 0;
//             let mapY = 0;
            
//             for (let y = 0; y < mapArray.length; y++) {
//                 mapX = 0;
//                 for (let x = 0; x < mapArray[y].length; x++) {
//                     const tileType = mapArray[y][x];
                    
//                     const element = document.createElement('div');
//                     element.style.position = 'absolute';
//                     element.style.width = `${this.tileSize}px`;
//                     element.style.height = `${this.tileSize}px`;
//                     element.style.transform = `translate3d(${mapX}px, ${mapY}px, 0px)`;
//                     element.setAttribute('data-map-element', 'true');
//                     element.setAttribute('data-grid-x', x);
//                     element.setAttribute('data-grid-y', y);

//                     switch (tileType) {
//                         case 0: // Wall
//                             element.style.backgroundImage = `url(${tileImage.src})`;
//                             element.style.zIndex = '0';
//                             break;
//                         case 1: // Grass
//                         case 3: // Starting position
//                             element.style.backgroundImage = `url(${greenBlockImage.src})`;
//                             element.style.zIndex = '1';
//                             break;
//                         case 2: // Destructible block
//                             element.style.backgroundImage = `url(${blockImage.src})`;
//                             element.style.zIndex = '2';
//                             element.classList.add(`canBomb_${mapX}_${mapY}`);
//                             break;
//                     }

//                     this.container.appendChild(element);
//                     mapX += this.tileSize;
//                 }
//                 mapY += this.tileSize;
//             }
//         } else {
//             // Update only changed tiles
//             for (let y = 0; y < mapArray.length; y++) {
//                 for (let x = 0; x < mapArray[y].length; x++) {
//                     const currentTile = mapArray[y][x];
//                     const previousTile = this.previousMapArray[y] ? this.previousMapArray[y][x] : null;
                    
//                     if (currentTile !== previousTile) {
//                         // Find the existing element for this position
//                         const existingElement = this.container.querySelector(`[data-grid-x="${x}"][data-grid-y="${y}"]`);
                        
//                         if (existingElement) {
//                             const mapX = x * this.tileSize;
//                             const mapY = y * this.tileSize;
                            
//                             switch (currentTile) {
//                                 case 0: // Wall
//                                     existingElement.style.backgroundImage = `url(${tileImage.src})`;
//                                     existingElement.style.zIndex = '0';
//                                     break;
//                                 case 1: // Grass
//                                 case 3: // Starting position
//                                     existingElement.style.backgroundImage = `url(${greenBlockImage.src})`;
//                                     existingElement.style.zIndex = '1';
//                                     break;
//                                 case 2: // Destructible block
//                                     existingElement.style.backgroundImage = `url(${blockImage.src})`;
//                                     existingElement.style.zIndex = '2';
//                                     existingElement.classList.add(`canBomb_${mapX}_${mapY}`);
//                                     break;
//                             }
//                         }
//                     }
//                 }
//             }
//         }

//         // Store the current map for next comparison
//         this.previousMapArray = JSON.parse(JSON.stringify(mapArray));
//     }

//     renderPlayers() {
//         // Clear existing player elements
//         const existingPlayers = this.container.querySelectorAll('.player');
//         existingPlayers.forEach(element => element.remove());

//         // Render all players
//         this.gameState.players.forEach(player => {
//             this.renderPlayer(player);
//         });
//     }

//     renderPlayer(player) {
//         const element = document.createElement('div');
//         element.className = 'player';
//         element.style.position = 'absolute';
//         element.style.width = '32px';
//         element.style.height = '32px';
//         element.style.overflow = 'hidden';
//         element.style.zIndex = '10';
        
//         // somth animation whit css
        
//         element.style.transition = 'transform 0.1s ease-out';
//         element.style.transform = `translate3d(${player.pixelX}px, ${player.pixelY}px, 2px)`;

//         // Set sprite based on direction with fallback
//         const spritePath = `/assets/move_${player.currentDirection}.png`;
//         element.style.backgroundImage = `url(${spritePath})`;
//         element.style.backgroundSize = 'cover';

//         // Animation: set backgroundPosition based on frame
//         const key = player.id || player.nickname;
//         let frameIndex = 0;
//         if (this.localPlayerFrames && this.localPlayerFrames[key]) {
//             frameIndex = this.localPlayerFrames[key].frame;
//         }
//         element.style.backgroundPosition = `-${frameIndex * 32}px 0px`;

//         // Add nickname
//         const nicknameElement = document.createElement('div');
//         nicknameElement.style.position = 'absolute';
//         nicknameElement.style.top = '-20px';
//         nicknameElement.style.left = '50%';
//         nicknameElement.style.transform = 'translateX(-50%)';
//         nicknameElement.style.fontSize = '10px';
//         nicknameElement.style.color = '#000';
//         nicknameElement.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
//         nicknameElement.style.padding = '2px 4px';
//         nicknameElement.style.borderRadius = '3px';
//         nicknameElement.style.whiteSpace = 'nowrap';
//         nicknameElement.textContent = player.nickname;
        
//         element.appendChild(nicknameElement);
//         this.container.appendChild(element);
//     }

//     renderBombs() {
//         // Clear existing bomb elements
//         const existingBombs = this.container.querySelectorAll('.bomb');
//         existingBombs.forEach(element => element.remove());

//         // Render all bombs
//         this.gameState.bombs.forEach(bomb => {
//             const element = document.createElement('div');
//             element.className = 'bomb';
//             element.style.position = 'absolute';
//             element.style.width = '32px';
//             element.style.height = '32px';
//             element.style.backgroundImage = 'url(/assets/bomb.png)';
//             element.style.backgroundSize = 'cover';
//             element.style.zIndex = '5';
//             element.style.transform = `translate3d(${bomb.gridX * this.tileSize}px, ${bomb.gridY * this.tileSize}px, 1px)`;
            
//             this.container.appendChild(element);
//         });
//     }

//     renderPowerUps() {
//         // Clear existing power-up elements
//         const existingPowerUps = this.container.querySelectorAll('.powerup');
//         existingPowerUps.forEach(element => element.remove());

//         // Render all power-ups
//         this.gameState.powerUps.forEach(powerUp => {
//             const element = document.createElement('div');
//             element.className = 'powerup';
//             element.style.position = 'absolute';
//             element.style.width = '32px';
//             element.style.height = '32px';
//             element.style.backgroundImage = `url(/assets/${powerUp.type}.png)`;
//             element.style.backgroundSize = 'cover';
//             element.style.zIndex = '7';
//             element.style.transform = `translate3d(${powerUp.gridX * this.tileSize}px, ${powerUp.gridY * this.tileSize}px, 1px)`;
            
//             this.container.appendChild(element);
//         });
//     }

//     renderExplosions() {
//         // Clear older expolostion
//         const existingExplosions = this.container.querySelectorAll('.explosion');
//         existingExplosions.forEach(element => element.remove());

//         // Render all explosions
//         this.gameState.explosions.forEach(explosion => {
//             const element = document.createElement('div');
//             element.className = 'explosion';
//             element.style.position = 'absolute';
//             element.style.width = '32px';
//             element.style.height = '32px';
//             element.style.backgroundImage = 'url(/assets/2.png)';
//             element.style.backgroundSize = 'cover';
//             element.style.zIndex = '6';
//             element.style.transform = `translate3d(${explosion.gridX * this.tileSize}px, ${explosion.gridY * this.tileSize}px, 1px)`;
            
//             this.container.appendChild(element);
//         });
//     }

//     startGameLoop() {
//         MiniFramework.startGameLoop(
//             this.container,
//             (deltaTime) => {
//                 this.updateGame(deltaTime);
//             },
//             () => {
//                 this.renderGame();
//             }
//         );
//     }

//     updateGame(deltaTime) {
//         // All game logic is now handled on the server
//         // this is just for any extra animation on the client side 
//         // We'll use this for local animation frame updates
//         const ANIMATION_FRAME_COUNT = 3;
//         const ANIMATION_FRAME_DURATION = 100; // ms per frame
//         if (!this.lastAnimationUpdate) this.lastAnimationUpdate = 0;
//         this.lastAnimationUpdate += deltaTime;
//         if (this.lastAnimationUpdate >= ANIMATION_FRAME_DURATION) {
//             this.lastAnimationUpdate = 0;
//             this.gameState.players.forEach(player => {
//                 // Use player.id or player.nickname as unique key
//                 const key = player.id || player.nickname;
//                 if (!this.localPlayerFrames[key]) {
//                     this.localPlayerFrames[key] = { frame: 0, lastX: player.pixelX, lastY: player.pixelY, moving: false };
//                 }
//                 const frameData = this.localPlayerFrames[key];
//                 // Detect movement
//                 const isMoving = (player.pixelX !== frameData.lastX || player.pixelY !== frameData.lastY);
//                 if (isMoving) {
//                     frameData.frame = (frameData.frame + 1) % ANIMATION_FRAME_COUNT;
//                 } else {
//                     frameData.frame = 0; // Reset to first frame if idle
//                 }
//                 frameData.lastX = player.pixelX;
//                 frameData.lastY = player.pixelY;
//                 frameData.moving = isMoving;
//             });
//         }
//     }

//     renderGame() {
//         // Render all game elements
//         this.renderPlayers();
//         this.renderBombs();
//         this.renderPowerUps();
//         this.renderExplosions();

//         // Update player stats header for the local player
//         const localNickname = window.app && window.app.nickname;
//         if (localNickname) {
//             const localPlayer = this.gameState.players.find(p => p.nickname === localNickname);
//             if (localPlayer) {
//                 const livesElem = document.getElementById('stat-lives');
//                 const speedElem = document.getElementById('stat-speed');
//                 const bombsElem = document.getElementById('stat-bombs');
//                 if (livesElem) livesElem.textContent = localPlayer.lives;
//                 if (speedElem) speedElem.textContent = localPlayer.speed;
//                 if (bombsElem) bombsElem.textContent = localPlayer.maxBombs;
//             }
//         }
//     }

//     start() {
//         console.log('Game started - client-side rendering only');
//         this.frameworkState.setState('gameStatus', 'playing');
//     }

//     stop() {
//         MiniFramework.stopGameLoop();
//         this.frameworkState.setState('gameStatus', 'stopped');
//     }
// }

// // Export for use >>> main.js

// window.BombermanGame = BombermanGame; 