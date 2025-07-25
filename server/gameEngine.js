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
        this.stepsPerFrame=5
        this.frameIndex=0
        this.stepCount=0
        this.stepCount=0
        this.stepCount=0
        this.lastUpdate = Date.now();
        
        // Initialize map
        this.initializeMap();
    }


    initializeMap() {
        // Use your original map structure (25x21)
        this.mapArray = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 3,3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 0],
            [0, 3, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 3, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 3, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 3, 0],
            [0, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ];
        
        // Randomize some blocks (like original system)
        for (let y = 1; y < this.mapArray.length - 1; y++) {
            for (let x = 1; x < this.mapArray[y].length - 1; x++) {
                // Only place blocks if it's grass and not a wall
                if (this.mapArray[y][x] === 1 && Math.random() < 0.6) {
                    this.mapArray[y][x] = 2; // 60% chance for destructible block 
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
                currentDirection: 'up',
                lives: 3,
                maxBombs: 1,
                bombRange: 1,
                speed: 2,
                pressedDirections: [],
                frameIndex: 0,
                stepCount: 0,
                stepsPerFrame: 3
            };
            
            this.players.set(playerId, player);
            return player;
        }
        return null;
    }

    removePlayer(playerId) {
        this.players.delete(playerId);
    }

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
            case 'arrowup':
                player.currentDirection = 'up';
                break;
            case 'arrowdown':
                player.currentDirection = 'down';
                break;
            case 'arrowleft':
                player.currentDirection = 'left';
                break;
            case 'arrowright':
                player.currentDirection = 'right';
            // case 'destroy':
               // player.currentDirection='destroy'
                break;
        }

        // Try to move if not already moving
        if (!player.isMoving) {
            this.tryToMove(player);
        }
    }

    handleKeyRelease(player, key) {
        // Remove direction from pressed directions
        const index = player.pressedDirections.indexOf(key);
        if (index > -1) {
            player.pressedDirections.splice(index, 1);
        }
    }

    tryToMove(player) {
        
        if (player.pressedDirections.length === 0) return;
  
        const direction = player.pressedDirections[player.pressedDirections.length - 1];
        let nextGridX = player.gridX;
        let nextGridY = player.gridY;
  
        switch (direction) {
            case 'arrowup':
                nextGridY--;
                break;
            case 'arrowdown':
                nextGridY++;
                break;
            case 'arrowleft':
                nextGridX--;
                break;
            case 'arrowright':
                nextGridX++;
                break;
        }

        if (this.canMove(player, nextGridX, nextGridY)) {
             player.nextPixelX = nextGridX * this.tileSize;
            player.nextPixelY = nextGridY * this.tileSize;
            player.isMoving = true;
        }
    }

    canMove(player, nextGridX, nextGridY) {
         // Check map boundaries
 
        if (nextGridX < 0 || nextGridY < 0 || 
            nextGridY >= this.mapArray.length || 
            nextGridX >= this.mapArray[0].length) {
            return false;
        }

        // Check if tile is walkable (only grass is walkable) and the 3 the 3 is the triangle of initial position of the player 

        const tileType = this.mapArray[nextGridY][nextGridX];
        if ((tileType !== 1) && (tileType!==3)) {
            return false;
        }

        // Check if position is blocked by bomb 
        // you cant move up of the boobms 
        // we always tcheck rthe next move

    
        if (this.isPositionBlocked(nextGridX, nextGridY)) {
            return false;
        }

        return true;
    }

    isPositionBlocked(gridX, gridY) {
        // Check if there's a bomb at this position
        // not valid if coord[boomb]==next coord[hero]

        for (const bomb of this.bombs.values()) {
            if (bomb.gridX === gridX && bomb.gridY === gridY) {
                return true;
            }
        }
        return false;
    }

    placeBomb(player) {
        const activeBombs = Array.from(this.bombs.values()).filter(bomb => bomb.playerId === player.id).length;
        if (activeBombs >= player.maxBombs) {
            return
            //dont place any boomb if max acheved 
        }
        // Check if there's already a bomb at this position
        const bombAtPosition = Array.from(this.bombs.values()).find(bomb => 
            bomb.gridX === player.gridX && bomb.gridY === player.gridY
        );
         
             
        // we dont place boomb if already exite   
        
         

         if (bombAtPosition) {
            return; 
        }

        ///the player can put twpo boombs so the defrence will be the timming of it ahahahahah
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

        // Update animation
    
        this.stepCount++;
        if (this.stepCount > this.stepsPerFrame) {
            this.stepCount = 0;
            this.frameIndex = (this.frameIndex + 1) % 3;
        }

        // Check if movement is complete
        if (diffX < player.speed && diffY < player.speed) {
            player.pixelX = player.nextPixelX;
            player.pixelY = player.nextPixelY;
            player.gridX = Math.floor(player.pixelX / this.tileSize);
            player.gridY = Math.floor(player.pixelY / this.tileSize);
            player.isMoving = false;
            
                 //powerup collection logic  
            //
            let collectedPowerUpId = null;
            for (const [powerUpId, powerUp] of this.powerUps.entries()) {
                if (powerUp.gridX === player.gridX && powerUp.gridY === player.gridY) {
                    console.log("powerup collected",powerUp)
                     // power effet based on type of the power up
                    if (powerUp.type === 'bombx') {
                        player.maxBombs += 1;
                    } else if (powerUp.type === 'flame') {
                        player.bombRange += 1;
                    } else if (powerUp.type === 'speed') {
                        player.speed += 1;
                    }
                    collectedPowerUpId = powerUpId;
                    break;
                }
            }
            if (collectedPowerUpId) {
                this.powerUps.delete(collectedPowerUpId);
            }


            // Try to continue movement
            this.tryToMove(player);
        }
    }

    explodeBomb(bomb) {
        const directions = [
            { dx: 0, dy: -1 }, // Up
            { dx: 0, dy: 1 },  // Down
            { dx: 1, dy: 0 },  // Right
            { dx: -1, dy: 0 }  // Left
        ];


        ///all sens  up and dowm and left and right 
             

        // Create explosion at bomb position
        this.createExplosion(bomb.gridX, bomb.gridY);

        for (let dir of directions) {
            for (let r = 1; r <= bomb.range; r++) {
                const exploX = bomb.gridX + dir.dx * r;
                const exploY = bomb.gridY + dir.dy * r;

                if (this.mapArray[exploY] && 
                    this.mapArray[exploY][exploX] && 
                    this.mapArray[exploY][exploX] !== 0) {
                    this.createExplosion(exploX, exploY);
                } else {
                    break; // Stop if wall or out of bounds
                }
            }
        }

        // Handle bomb interactions
        this.bombBricks(bomb);
        this.bombPlayers(bomb);
    }

    createExplosion(gridX, gridY) {
        const explosionId = `explosion_${Date.now()}_${gridX}_${gridY}`;
        const explosion = {
            id: explosionId,
            gridX: gridX,
            gridY: gridY,
            timer: 1000 // 2 seconds
        };
        
        this.explosions.set(explosionId, explosion);
    }

    bombBricks(bomb) {
        const directions = [
            { dx: 0, dy: 1 },   // Down
            { dx: 1, dy: 0 },   // Right
            { dx: 0, dy: -1 },  // Up
            { dx: -1, dy: 0 }   // Left
        ];

        directions.forEach(dir => {
            for (let r = 1; r <= bomb.range; r++) {
                const brickX = bomb.gridX + dir.dx * r;
                const brickY = bomb.gridY + dir.dy * r;

                // out if bound ?? stop
                if (!this.mapArray[brickY] || !this.mapArray[brickY][brickX]) break;

                // Stop if wall (0)
                if (this.mapArray[brickY][brickX] === 0) break;

                // If destructible block (2), destroy and maybe spawn power-up, then stop
                if (this.mapArray[brickY][brickX] === 2) {
                    this.mapArray[brickY][brickX] = 1;
                    if (Math.random() < 0.3) {
                        this.spawnPowerUp(brickX, brickY);
                    }
                    break;
                }
                // if green or starting position continu untiol some condetions up 
            }
        });
    }

    bombPlayers(bomb) {
        // Check if bomb hits the player at bomb position
        this.checkPlayerHit(bomb.gridX, bomb.gridY);

        // Check explosion in four directions up to bomb.range
        const directions = [
            { dx: 0, dy: 1 },   // Down
            { dx: 1, dy: 0 },   // Right
            { dx: 0, dy: -1 },  // Up
            { dx: -1, dy: 0 }   // Left
        ];

        directions.forEach(dir => {
            for (let r = 1; r <= bomb.range; r++) {
                const exploX = bomb.gridX + dir.dx * r;
                const exploY = bomb.gridY + dir.dy * r;

                // Stop if out of bounds
                if (!this.mapArray[exploY] || !this.mapArray[exploY][exploX]) break;

                // Stop if wall (0)
                if (this.mapArray[exploY][exploX] === 0) break;

                this.checkPlayerHit(exploX, exploY);

                // Stop after hitting a destructible block
                if (this.mapArray[exploY][exploX] === 2) break;
            }
        });
    }

    checkPlayerHit(gridX, gridY) {
        /// for all players chek of enyone is in the range of any boomb 
        this.players.forEach((player, playerId) => {
            if (player.gridX === gridX && player.gridY === gridY) {
                this.damagePlayer(player);
            }
        });
    }

    damagePlayer(player) {
        player.lives--;
         if (player.lives <= 0) {
            // Player is dead
            player.currentDirection = 'destroy-hero';
            // Remove player after animation
            setTimeout(() => {
                this.players.delete(player.id);
                
                // Check if game is over
                if (this.players.size <= 1) {
                    this.endGame();
                }
            }, 200);
        }
    }

    spawnPowerUp(gridX, gridY) {
        const powerUpTypes = ['bombx', 'flame', 'speed'];
        // const powerUpTypes=['flame']
        const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        
        const powerUpId = `powerup_${Date.now()}_${gridX}_${gridY}`;
        const powerUp = {
            id: powerUpId,
            type: randomType,
            gridX: gridX,
            gridY: gridY
        };
        
        this.powerUps.set(powerUpId, powerUp);
    }

    endGame() {
        this.gameStatus = 'finished';
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
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
        }, 16); // >>60 FPS
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
}

module.exports = BombermanGameEngine; 