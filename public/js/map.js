// Map System - Integrated with Framework
// Based on your vanilla JS map constructor

class MapSystem {
    constructor(container, framework) {
        this.container = container;
        this.framework = framework;
        this.tileSize = 32;
        this.mapArray = this.getDefaultMap();
        this.assets = {};
        this.loadAssets();
    }

    getDefaultMap() {
        return [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 3, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
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
            [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ];
    }

    loadAssets() {
        const assetNames = ['tile', 'block', 'greenBlock'];
        
        assetNames.forEach(name => {
            this.assets[name] = new Image();
            // Fix the path to load from the correct location
            this.assets[name].src = `/assets/${name}.png`;
        });
    }

    // Convert map coordinates to pixel coordinates
    mapToPixel(mapX, mapY) {
        return {
            x: mapX * this.tileSize,
            y: mapY * this.tileSize
        };
    }

    // Convert pixel coordinates to map coordinates
    pixelToMap(pixelX, pixelY) {
        return {
            x: Math.floor(pixelX / this.tileSize),
            y: Math.floor(pixelY / this.tileSize)
        };
    }

    // Get tile type at map coordinates
    getTileAt(mapX, mapY) {
        if (mapY >= 0 && mapY < this.mapArray.length && 
            mapX >= 0 && mapX < this.mapArray[0].length) {
            return this.mapArray[mapY][mapX];
        }
        return 0; // Default to empty
    }

    // Set tile type at map coordinates
    setTileAt(mapX, mapY, tileType) {
        if (mapY >= 0 && mapY < this.mapArray.length && 
            mapX >= 0 && mapX < this.mapArray[0].length) {
            this.mapArray[mapY][mapX] = tileType;
            this.updateTileAt(mapX, mapY);
        }
    }

    // Update a specific tile
    updateTileAt(mapX, mapY) {
        const tileId = `tile_${mapX}_${mapY}`;
        const existingTile = this.framework.entities.get(tileId);
        
        if (existingTile) {
            existingTile.type = this.getTileAt(mapX, mapY);
            // Force re-render
            if (existingTile.element && existingTile.element.parentNode) {
                existingTile.element.parentNode.removeChild(existingTile.element);
                existingTile.element = null;
            }
        }
    }

    // Draw the entire map using framework
    drawMap(randomizeBlocks = 0.3) {
        // Clear existing tiles
        this.framework.entities.forEach((entity, id) => {
            if (id.startsWith('tile_')) {
                this.framework.removeEntity(id);
            }
        });

        // Set container dimensions
        this.container.style.height = this.mapArray.length * this.tileSize + "px";
        this.container.style.width = this.mapArray[0].length * this.tileSize + "px";

        // Create tiles using framework
        for (let y = 0; y < this.mapArray.length; y++) {
            for (let x = 0; x < this.mapArray[0].length; x++) {
                let tileType = this.mapArray[y][x];

                // Randomize blocks if needed
                if (Math.random() < randomizeBlocks && tileType === 1) {
                    tileType = 2;
                    this.mapArray[y][x] = 2;
                }

                const tileId = `tile_${x}_${y}`;
                const pixelPos = this.mapToPixel(x, y);
                
                const tile = this.framework.createGameEntity(
                    tileId,
                    pixelPos.x,
                    pixelPos.y,
                    this.tileSize,
                    this.tileSize,
                    'tile'
                );
                
                tile.type = tileType;
                tile.mapX = x;
                tile.mapY = y;
                tile.render = (container) => this.renderTile(tile, container);
            }
        }
    }

    renderTile(tile, container) {
        if (!tile.element) {
            tile.element = this.framework.createElement('div', {
                className: 'map-tile',
                style: {
                    position: 'absolute',
                    width: tile.width + 'px',
                    height: tile.height + 'px',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat'
                }
            });
        }

        // Set tile appearance based on type
        switch (tile.type) {
            case 0: // Empty/Wall
                tile.element.style.backgroundImage = `url(${this.assets.tile.src})`;
                tile.element.style.zIndex = '0';
                break;
            case 1: // Grass
            case 3: // Starting position
                tile.element.style.backgroundImage = `url(${this.assets.greenBlock.src})`;
                tile.element.style.zIndex = '1';
                break;
            case 2: // Destructible block
                tile.element.style.backgroundImage = `url(${this.assets.block.src})`;
                tile.element.style.zIndex = '2';
                tile.element.className = `map-tile canBomb_${tile.mapX}_${tile.mapY}`;
                tile.element.setAttribute('data-grid-x', tile.mapX);
                tile.element.setAttribute('data-grid-y', tile.mapY);
                break;
        }

        tile.element.style.left = tile.x + 'px';
        tile.element.style.top = tile.y + 'px';

        if (!tile.element.parentNode) {
            container.appendChild(tile.element);
        }
    }

    // Check if a position is walkable
    isWalkable(pixelX, pixelY) {
        const mapPos = this.pixelToMap(pixelX, pixelY);
        const tileType = this.getTileAt(mapPos.x, mapPos.y);
        return tileType === 1 || tileType === 3; // Grass or starting position
    }

    // Check if a position is destructible
    isDestructible(pixelX, pixelY) {
        const mapPos = this.pixelToMap(pixelX, pixelY);
        const tileType = this.getTileAt(mapPos.x, mapPos.y);
        return tileType === 2; // Destructible block
    }

    // Destroy a block at position
    destroyBlock(pixelX, pixelY) {
        const mapPos = this.pixelToMap(pixelX, pixelY);
        if (this.isDestructible(pixelX, pixelY)) {
            this.setTileAt(mapPos.x, mapPos.y, 1); // Convert to grass
            return true;
        }
        return false;
    }

    // Get map dimensions
    getMapDimensions() {
        return {
            width: this.mapArray[0].length,
            height: this.mapArray.length,
            pixelWidth: this.mapArray[0].length * this.tileSize,
            pixelHeight: this.mapArray.length * this.tileSize
        };
    }

    // Get starting positions (corners)
    getStartingPositions() {
        const positions = [];
        const corners = [
            { x: 1, y: 1 }, // Top-left
            { x: this.mapArray[0].length - 2, y: 1 }, // Top-right
            { x: 1, y: this.mapArray.length - 2 }, // Bottom-left
            { x: this.mapArray[0].length - 2, y: this.mapArray.length - 2 } // Bottom-right
        ];

        corners.forEach(corner => {
            if (this.getTileAt(corner.x, corner.y) === 3) {
                const pixelPos = this.mapToPixel(corner.x, corner.y);
                positions.push({
                    mapX: corner.x,
                    mapY: corner.y,
                    pixelX: pixelPos.x,
                    pixelY: pixelPos.y
                });
            }
        });

        return positions;
    }
}

// Export for use in game.js
window.MapSystem = MapSystem; 