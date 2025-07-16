// // Map System - Integrated with Framework
// // Based on your vanilla JS map constructor

// class MapSystem {
//     constructor(container, framework) {
//         this.container = container;
//         this.framework = framework; // You can use this for createElement if you want
//         this.tileSize = 32;
//         this.mapArray = this.getDefaultMap();
//         this.assets = {};
//         this.tiles = new Map(); // Store tile elements by id
//         this.loadAssets();
//     }

//     getDefaultMap() {
//         return [
//             [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//             [0, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
//             [0, 3, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
//             [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
//             [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
//             [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
//             [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
//             [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
//             [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
//             [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
//             [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
//             [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
//             [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
//             [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
//             [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
//             [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
//             [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
//             [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
//             [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//         ];
//     }

//     loadAssets() {
//         const assetNames = ['tile', 'block', 'greenBlock'];
        
//         assetNames.forEach(name => {
//             this.assets[name] = new Image();
//             // Fix the path to load from the correct location
//             this.assets[name].src = `/assets/${name}.png`;
//         });
//     }

//     // Convert map coordinates to pixel coordinates
//     mapToPixel(mapX, mapY) {
//         return {
//             x: mapX * this.tileSize,
//             y: mapY * this.tileSize
//         };
//     }

//     // Convert pixel coordinates to map coordinates
//     pixelToMap(pixelX, pixelY) {
//         return {
//             x: Math.floor(pixelX / this.tileSize),
//             y: Math.floor(pixelY / this.tileSize)
//         };
//     }

//     // Get tile type at map coordinates
//     getTileAt(mapX, mapY) {
//         if (mapY >= 0 && mapY < this.mapArray.length && 
//             mapX >= 0 && mapX < this.mapArray[0].length) {
//             return this.mapArray[mapY][mapX];
//         }
//         return 0; // Default to empty
//     }

//     // Set tile type at map coordinates
//     setTileAt(mapX, mapY, tileType) {
//         if (mapY >= 0 && mapY < this.mapArray.length && 
//             mapX >= 0 && mapX < this.mapArray[0].length) {
//             this.mapArray[mapY][mapX] = tileType;
//             this.updateTileAt(mapX, mapY);
//         }
//     }

//     // Update a specific tile
//     updateTileAt(mapX, mapY) {
//         const tileId = `tile_${mapX}_${mapY}`;
//         const tile = this.tiles.get(tileId);
//         if (tile) {
//             this.setTileAppearance(tile.element, this.getTileAt(mapX, mapY), mapX, mapY);
//         }
//     }

//     // Draw the entire map
//     drawMap(randomizeBlocks = 0.3) {
//         console.log('drawMap called with mapArray:', this.mapArray);
//         if (!Array.isArray(this.mapArray) || !this.mapArray.length || !Array.isArray(this.mapArray[0])) {
//             console.warn('MapSystem: mapArray is not a valid 2D array', this.mapArray);
//             return;
//         }
//         // Remove all previous tiles
//         this.tiles.forEach(tile => {
//             if (tile.element && tile.element.parentNode) {
//                 tile.element.parentNode.removeChild(tile.element);
//             }
//         });
//         this.tiles.clear();

//         // Set container dimensions
//         this.container.style.height = this.mapArray.length * this.tileSize + "px";
//         this.container.style.width = this.mapArray[0].length * this.tileSize + "px";

//         // Create tiles
//         for (let y = 0; y < this.mapArray.length; y++) {
//             for (let x = 0; x < this.mapArray[0].length; x++) {
//                 let tileType = this.mapArray[y][x];

//                 // Randomize blocks if needed
//                 if (Math.random() < randomizeBlocks && tileType === 1) {
//                     tileType = 2;
//                     this.mapArray[y][x] = 2;
//                 }

//                 const tileId = `tile_${x}_${y}`;
//                 const pixelPos = this.mapToPixel(x, y);

//                 // Create the tile element
//                 const tileElement = document.createElement('div');
//                 tileElement.className = 'map-tile';
//                 tileElement.style.position = 'absolute';
//                 tileElement.style.width = this.tileSize + 'px';
//                 tileElement.style.height = this.tileSize + 'px';
//                 tileElement.style.left = pixelPos.x + 'px';
//                 tileElement.style.top = pixelPos.y + 'px';
//                 tileElement.style.backgroundSize = 'cover';
//                 tileElement.style.backgroundRepeat = 'no-repeat';

//                 this.setTileAppearance(tileElement, tileType, x, y);

//                 this.container.appendChild(tileElement);

//                 // Store reference
//                 this.tiles.set(tileId, {
//                     id: tileId,
//                     x, y,
//                     element: tileElement
//                 });
//             }
//         }
//     }

//     setTileAppearance(tileElement, tileType, x, y) {
//         switch (tileType) {
//             case 0: // Wall
//                 tileElement.style.backgroundImage = `url(${this.assets.tile.src})`;
//                 tileElement.style.zIndex = '0';
//                 break;
//             case 1: // Grass
//             case 3: // Starting position
//                 tileElement.style.backgroundImage = `url(${this.assets.greenBlock.src})`;
//                 tileElement.style.zIndex = '1';
//                 break;
//             case 2: // Destructible block
//                 tileElement.style.backgroundImage = `url(${this.assets.block.src})`;
//                 tileElement.style.zIndex = '2';
//                 tileElement.className = `map-tile canBomb_${x}_${y}`;
//                 tileElement.setAttribute('data-grid-x', x);
//                 tileElement.setAttribute('data-grid-y', y);
//                 break;
//         }
//     }

//     renderTile(tile, container) {
//         // No longer needed, handled in drawMap/setTileAppearance
//     }

//     // Check if a position is walkable
//     isWalkable(pixelX, pixelY) {
//         const mapPos = this.pixelToMap(pixelX, pixelY);
//         const tileType = this.getTileAt(mapPos.x, mapPos.y);
//         return tileType === 1 || tileType === 3; // Grass or starting position
//     }

//     // Check if a position is destructible
//     isDestructible(pixelX, pixelY) {
//         const mapPos = this.pixelToMap(pixelX, pixelY);
//         const tileType = this.getTileAt(mapPos.x, mapPos.y);
//         return tileType === 2; // Destructible block
//     }

//     // Destroy a block at position
//     destroyBlock(pixelX, pixelY) {
//         const mapPos = this.pixelToMap(pixelX, pixelY);
//         if (this.isDestructible(pixelX, pixelY)) {
//             this.setTileAt(mapPos.x, mapPos.y, 1); // Convert to grass
//             return true;
//         }
//         return false;
//     }

//     // Get map dimensions
//     getMapDimensions() {
//         return {
//             width: this.mapArray[0].length,
//             height: this.mapArray.length,
//             pixelWidth: this.mapArray[0].length * this.tileSize,
//             pixelHeight: this.mapArray.length * this.tileSize
//         };
//     }

//     // Get starting positions (corners)
//     getStartingPositions() {
//         const positions = [];
//         const corners = [
//             { x: 1, y: 1 }, // Top-left
//             { x: this.mapArray[0].length - 2, y: 1 }, // Top-right
//             { x: 1, y: this.mapArray.length - 2 }, // Bottom-left
//             { x: this.mapArray[0].length - 2, y: this.mapArray.length - 2 } // Bottom-right
//         ];

//         corners.forEach(corner => {
//             if (this.getTileAt(corner.x, corner.y) === 3) {
//                 const pixelPos = this.mapToPixel(corner.x, corner.y);
//                 positions.push({
//                     mapX: corner.x,
//                     mapY: corner.y,
//                     pixelX: pixelPos.x,
//                     pixelY: pixelPos.y
//                 });
//             }
//         });

//         return positions;
//     }
// }

// export default MapSystem; 