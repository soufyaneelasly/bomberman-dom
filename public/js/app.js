import MiniFramework from '../mini-framework/index.js';

// Animation state for all players
const playerAnimationFrames = {}; // { [playerId]: { frame: 0, lastX, lastY, moving } }
const ANIMATION_FRAME_COUNT = 3;
const ANIMATION_FRAME_DURATION = 100; // ms per frame
let lastAnimationUpdate = 0;

// WebSocket setup
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsUrl = `${protocol}//${window.location.host}`;
const ws = new WebSocket(wsUrl);

// Initial state
const store = MiniFramework.createReactiveStore({
  screen: 'nickname',
  nickname: '',
  playerCount: 0,
  players: [],
  countdown: null,
  chatMessages: [],
  chatInput: '',
  mapArray: [],
  bombs: [],
  powerUps: [],
  animationTick: 0,
  gameStatus: 'waiting',
});

// WebSocket event handlers
ws.onopen = () => {
};

// Listen for WAITING_TIMER messages and update state
ws.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);
    if (data.type === 'WAITING_TIMER') {
      store.setState({ waitingTimer: data.countdown });
    } else if (data.type === 'GAME_STARTING') {
      store.setState({ countdown: data.countdown, waitingTimer: null });
    } else if (data.type === 'GAME_STARTED') {
      store.setState({ screen: 'game', countdown: null, waitingTimer: null });
    } else if (data.type === 'MATCH_ALREADY_STARTED') {
      alert(data.message || 'A match is already in progress. Please wait for the next game.');
    } else {
      handleServerMessage(data);
    }
  } catch (error) {
    console.error('Error parsing server message:', error);
  }
};

ws.onclose = () => {
};


let latestGameState = null;

function handleServerMessage(data) {
  switch (data.type) {
    case 'PLAYER_JOINED':
    case 'PLAYER_LEFT':
      store.setState({
        playerCount: data.players.length,
        players: data.players
      });
      break;
    case 'CHAT_MESSAGE':
      store.setState({
        chatMessages: [...(store.getState().chatMessages || []), {
          nickname: data.nickname,
          text: data.message
        }]
      });
      break;
    case 'GAME_STARTING':
      store.setState({ countdown: data.countdown });
      break;
    case 'GAME_STARTED':
      store.setState({ screen: 'game', countdown: null });
      break;
    case 'GAME_STATE_UPDATE':
      latestGameState = data.gameState;
      store.setState({
        players: data.gameState.players || [],
        bombs: data.gameState.bombs || [],
        powerUps: data.gameState.powerUps || [],
        mapArray: data.gameState.mapArray || [],
        explosions: data.gameState.explosions || [],   // <--- THIS LINE

        gameStatus: data.gameState.gameStatus || 'playing'
      });
      if (data.gameState && data.gameState.explosions) {
        console.log('Received explosions:', data.gameState.explosions);
      }
      break;
    default:
    // console.log('Unknown message type:', data.type);
  }
}

function NicknameScreen(store) {
  const state = store.getState();
  console.log('Rendering NicknameScreen with state:', state);
  
  return {
    tag: 'div',
    attrs: { class: 'screen nickname-screen active' },
    children: [
      {
        tag: 'div',
        attrs: { class: 'nickname-container' },
        children: [
          { tag: 'h1', children: ['Bomberman DOM'] },
          {
            tag: 'div',
            attrs: { class: 'nickname-header' },
            children: [
              { tag: 'img', attrs: { src: '/assets/gameconsole.png', alt: 'Game Console', class: 'nickname-logo' } },
              { tag: 'div', attrs: { class: 'nickname-welcome' }, children: ['Welcome to our game!'] }
            ]
          },
          {
            tag: 'input',
            attrs: {
              type: 'text',
              placeholder: 'Enter your nickname',
              value: state.nickname,
              id: 'nickname-input',
              class: 'nickname-input',
              oninput: (e) => store.setState({ nickname: e.target.value })
            }
          },
          {
            tag: 'button',
            attrs: {
              id: 'join-btn',
              class: 'join-btn',
              onclick: () => {
                if (store.getState().nickname) {
                  ws.send(JSON.stringify({
                    type: 'JOIN_WAITING_ROOM',
                    nickname: store.getState().nickname
                  }));
                  store.setState({ screen: 'waiting' });

                }
              }
            },
            children: ['Join Game']
          }
        ]
      }
    ]
  };
}

function WaitingRoomScreen(store) {
  const state = store.getState();
  // Use state.waitingTimer for the 20s timer if present
  console.log('**********************************************:', state);

  return {
    tag: 'div',
    attrs: { class: 'screen waiting-room active' },
    children: [
      {
        tag: 'div',
        attrs: { class: 'waitingroom-container' },
        children: [
          { tag: 'h2', attrs: { class: 'waitingroom-title' }, children: ['Waiting Room'] },
          state.waitingTimer !== undefined && state.waitingTimer !== null && state.waitingTimer > 0 ?
            { tag: 'div', attrs: { class: 'waitingroom-waitingtimer' }, children: [`Waiting for more players... ${state.waitingTimer}s`] } : null,
          { tag: 'div', attrs: { class: 'waitingroom-players' }, children: [`Players: ${state.playerCount} / 4`] },
          {
            tag: 'ul',
            attrs: { class: 'waitingroom-list' },
            children: (state.players || []).map(player => ({
              tag: 'li',
              attrs: { class: 'waitingroom-player' },
              children: [player.nickname]
            }))
          },
          state.countdown
            ? { tag: 'div', attrs: { class: 'waitingroom-countdown' }, children: [`Game starting in ${state.countdown} seconds`] }
            : null,
          ChatComponent(store)
        ].filter(Boolean)
      }
    ]
  };
}

// Main App function: renders the correct screen based on state
function App(store) {
  const { screen } = store.getState();

  console.log('screen', screen);
  if (screen === 'nickname') return NicknameScreen(store);
  if (screen === 'waiting') return WaitingRoomScreen(store);
  if (screen === 'game') return GameScreen(store);
  return null;
}

// GameScreen: only this screen shows the PlayerHeaderComponent
function GameScreen(store) {
  const state = store.getState();
  const localNickname = state.nickname;
  const localPlayer = (state.players || []).find(p => p.nickname === localNickname);

  // Add keyboard controls when game screen is active
  if (!window.gameControlsInitialized) {
    window.gameControlsInitialized = true;
    setTimeout(() => {
      const canvas = document.getElementById('game-canvas');
      if (canvas) canvas.focus();
    }, 0);
  }

  // Key event handlers for the game canvas
  const keyMap = {
    'ArrowUp': 'arrowup',
    'ArrowDown': 'arrowdown',
    'ArrowLeft': 'arrowleft',
    'ArrowRight': 'arrowright',
    'Space': 'space'
  };

  function handleKeyDown(event) {
    const key = keyMap[event.code];
    if (!key) return;
    event.preventDefault();
    if (key === 'space') {
      ws.send(JSON.stringify({
        type: 'GAME_ACTION',
        action: 'PLACE_BOMB'
      }));
    } else {
      ws.send(JSON.stringify({
        type: 'GAME_ACTION',
        action: 'MOVE',
        key: key
      }));
    }
  }

  function handleKeyUp(event) {
    const key = keyMap[event.code];
    if (!key || key === 'space') return;
    event.preventDefault();
    ws.send(JSON.stringify({
      type: 'GAME_ACTION',
      action: 'KEY_RELEASE',
      key: key
    }));
  }

  // Compose all game entities as children of game-canvas
  const mapTiles = MapComponent(state.mapArray);
  const bombs = (state.bombs || []).map(BombComponent);
  const explosions = (state.explosions || []).map(ExplosionComponent);
  const powerUps = (state.powerUps || []).map(PowerUpComponent);
  const players = (state.players || []).map(PlayerComponent);

  return {
    tag: 'div',
    attrs: { class: 'game-layout-container' },
    children: [
      // Only show the header in the game screen
      localPlayer ? PlayerHeaderComponent(localPlayer) : null,
      {
        tag: 'div',
        attrs: { class: 'game-main-row' },
        children: [
          {
            tag: 'div',
            attrs: {
              id: 'game-canvas',
              style: 'position: relative; width: 100%; max-width: 900px; aspect-ratio: 3/2; min-width: 320px; min-height: 200px;',
              tabindex: 0,
              onkeydown: handleKeyDown,
              onkeyup: handleKeyUp
            },
            children: [
              FpsCounterComponent(fps),
              ...mapTiles,
              ...bombs,
              ...explosions,
              ...powerUps,
              ...players
            ]
          },
          {
            tag: 'div',
            attrs: { class: 'game-chat-wrapper' },
            children: [ChatComponent(store)]
          }
        ]
      }
    ]
  };
}

function initializeGameControls() {
  // No-op: all event logic is now handled in GameScreen
}


function PlayerStatsComponent(state) {
  return {
    tag: 'div',
    attrs: { class: 'player-stats', style: 'margin-bottom: 8px; color: #fff;' },
    children: [
      { tag: 'span', children: [`Players Alive: ${(state.players || []).length}`] },
      // Add more stats as needed
    ]
  };
}

function ChatComponent(store) {
  const state = store.getState();
  // Assign color based on join order
  function getColorClass(nickname) {
    const colors = ['chat-color-1', 'chat-color-2', 'chat-color-3', 'chat-color-4', 'chat-color-5', 'chat-color-6', 'chat-color-7', 'chat-color-8'];
    const players = state.players || [];
    const idx = players.findIndex(p => p.nickname === nickname);
    if (idx !== -1) {
      return colors[idx % colors.length];
    }
    // fallback for spectators or system messages
    return 'chat-color-1';
  }
  return {
    tag: 'div',
    attrs: { class: 'chat' },
    children: [
      {
        tag: 'div',
        attrs: { class: 'chat-messages' },
        children: (state.chatMessages || []).map(msg => ({
          tag: 'div',
          children: [
            { tag: 'span', attrs: { class: `chat-nickname ${getColorClass(msg.nickname)}` }, children: [msg.nickname + ': '] },
            msg.text
          ]
        }))
      },
      {
        tag: 'input',
        attrs: {
          type: 'text',
          value: state.chatInput,
          oninput: (e) => store.setState({ chatInput: e.target.value })
        }
      },
      {
        tag: 'button',
        attrs: {
          onclick: () => {
            if (state.chatInput.trim()) {
              ws.send(JSON.stringify({
                type: 'CHAT_MESSAGE',
                message: state.chatInput
              }));
              store.setState({ chatInput: '' });
            }
          }
        },
        children: ['Send']
      }
    ]
  };
}

MiniFramework.render(App(store), document.getElementById('app'));
store.subscribe(() => MiniFramework.render(App(store), document.getElementById('app')));

// The game loop
let lastFpsUpdate = 0;
let frames = 0;
let fps = 0;

function FpsCounterComponent(fps) {
  return {
    tag: 'div',
    attrs: {
      class: 'fps-counter',
      style: 'position: absolute; top: 8px; right: 16px; color: #fff; background: rgba(0,0,0,0.6); padding: 4px 12px; border-radius: 6px; font-size: 16px; font-family: monospace; z-index: 1000; pointer-events: none;'
    },
    children: [`FPS: ${fps}`]
  };
}

function gameLoop(timestamp) {
  if (latestGameState) {
    if (!lastAnimationUpdate) lastAnimationUpdate = timestamp;
    if (timestamp - lastAnimationUpdate > ANIMATION_FRAME_DURATION) {
      latestGameState.players.forEach(player => {
        const key = player.id || player.nickname;
        if (!playerAnimationFrames[key]) {
          playerAnimationFrames[key] = { frame: 0, lastX: player.pixelX, lastY: player.pixelY, moving: false };
        }
        const frameData = playerAnimationFrames[key];
        const isMoving = (player.pixelX !== frameData.lastX || player.pixelY !== frameData.lastY);
        frameData.frame = isMoving ? (frameData.frame + 1) % ANIMATION_FRAME_COUNT : 0;
        frameData.lastX = player.pixelX;
        frameData.lastY = player.pixelY;
        frameData.moving = isMoving;
      });
      lastAnimationUpdate = timestamp;
      store.setState({ animationTick: Date.now() }); // Force re-render
    }
  }
  // FPS counter logic
  frames++;
  if (!lastFpsUpdate) lastFpsUpdate = timestamp;
  if (timestamp - lastFpsUpdate > 1000) {
    fps = frames;
    frames = 0;
    lastFpsUpdate = timestamp;
  }
  requestAnimationFrame(gameLoop);
}

// Start the loop when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(gameLoop);
});

// --- Mini-framework Components for Game Entities ---

// Add a function to get tile size based on canvas size and map dimensions
function getTileSize() {
  const mapArray = store.getState().mapArray;
  if (!Array.isArray(mapArray) || mapArray.length === 0) return 32;
  const rows = mapArray.length;
  const cols = mapArray[0].length;
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return 32;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  return Math.min(Math.floor(w / cols), Math.floor(h / rows));
}

function TileComponent({ tileType, x, y, tileSize = 32 }) {
  let backgroundImage = '';
  let zIndex = '1';
  let extraClass = 'map-tile';
  switch (tileType) {
    case 0:
      backgroundImage = '/assets/tile.png';
      zIndex = '0';
      break;
    case 1:
    case 3:
      backgroundImage = '/assets/greenBlock.png';
      zIndex = '1';
      break;
    case 2:
      backgroundImage = '/assets/block.png';
      zIndex = '2';
      extraClass += ` canBomb_${x}_${y}`;
      break;
  }
  return {
    tag: 'div',
    attrs: {
      class: extraClass,
      style: `position: absolute; width: ${tileSize}px; height: ${tileSize}px; left: ${x * tileSize}px; top: ${y * tileSize}px; background-image: url(${backgroundImage}); background-size: cover; background-repeat: no-repeat; z-index: ${zIndex};`,
      'data-grid-x': x,
      'data-grid-y': y
    },
    children: []
  };
}

function MapComponent(mapArray) {
  if (!Array.isArray(mapArray)) return [];
  const tileSize = getTileSize();
  const tiles = [];
  for (let y = 0; y < mapArray.length; y++) {
    for (let x = 0; x < mapArray[0].length; x++) {
      tiles.push(TileComponent({ tileType: mapArray[y][x], x, y, tileSize }));
    }
  }
  return tiles;
}

// --- Memoization for PlayerComponent ---
const playerVDOMCache = new Map();
function shallowEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (let k of aKeys) {
    if (a[k] !== b[k]) return false;
  }
  return true;
}

function PlayerComponent(player) {
  const key = player.id || player.nickname;
  const prev = playerVDOMCache.get(key);
  if (prev && shallowEqual(prev.player, player)) {
    return prev.vdom;
  }
  // Animation: set backgroundPosition based on frame
  const frameData = playerAnimationFrames[key] || { frame: 0 };
  const frameIndex = frameData.frame || 0;
  const spritePath = `/assets/move_${player.currentDirection || 'up'}.png`;
  const tileSize = getTileSize();
  const vdom = {
    tag: 'div',
    attrs: {
      key, // stable key for diffing
      class: 'player',
      style: `position: absolute; width: ${tileSize}px; height: ${tileSize}px; overflow: hidden; z-index: 10; transition: transform 0.1s ease-out; transform: translate3d(${player.pixelX / 32 * tileSize}px, ${player.pixelY / 32 * tileSize}px, 2px); background-image: url(${spritePath}); background-size: cover; background-position: -${frameIndex * tileSize}px 0px;`
    },
    children: [
      {
        tag: 'div',
        attrs: {
          style: `position: absolute; top: -${Math.floor(tileSize * 0.6)}px; left: 50%; transform: translateX(-50%); font-size: ${Math.max(10, Math.floor(tileSize * 0.3))}px; color: #000; background-color: rgba(255,255,255,0.8); padding: 2px 4px; border-radius: 3px; white-space: nowrap;`
        },
        children: [player.nickname]
      }
    ]
  };
  playerVDOMCache.set(key, { player: { ...player }, vdom });
  return vdom;
}

function BombComponent(bomb) {
  const tileSize = getTileSize();
  return {
    tag: 'div',
    attrs: {
      class: 'bomb',
      style: `position: absolute; width: ${tileSize}px; height: ${tileSize}px; background-image: url(/assets/bomb.png); background-size: cover; z-index: 5; transform: translate3d(${((bomb.pixelX ?? (bomb.gridX !== undefined ? bomb.gridX * 32 : 0)) / 32 * tileSize)}px, ${((bomb.pixelY ?? (bomb.gridY !== undefined ? bomb.gridY * 32 : 0)) / 32 * tileSize)}px, 1px);`
    },
    children: []
  };
}

function PowerUpComponent(powerUp) {
  const tileSize = getTileSize();
  return {
    tag: 'div',
    attrs: {
      class: 'powerup',
      style: `position: absolute; width: ${tileSize}px; height: ${tileSize}px; background-image: url(/assets/${powerUp.type}.png); background-size: cover; z-index: 7; transform: translate3d(${(powerUp.pixelX !== undefined ? powerUp.pixelX / 32 * tileSize : powerUp.gridX * tileSize)}px, ${(powerUp.pixelY !== undefined ? powerUp.pixelY / 32 * tileSize : powerUp.gridY * tileSize)}px, 1px);`
    },
    children: []
  };
}

function ExplosionComponent(explosion) {
  const tileSize = getTileSize();
  return {
    tag: 'div',
    attrs: {
      class: 'explosion',
      style: `position: absolute; width: ${tileSize}px; height: ${tileSize}px; background-image: url(/assets/2.png); background-size: cover; z-index: 6; transform: translate3d(${((explosion.pixelX ?? (explosion.gridX !== undefined ? explosion.gridX * 32 : 0)) / 32 * tileSize)}px, ${((explosion.pixelY ?? (explosion.gridY !== undefined ? explosion.gridY * 32 : 0)) / 32 * tileSize)}px, 1px);`
    },
    children: []
  };
}

function PlayerHeaderComponent(player) {
  return {
    tag: 'div',
    attrs: {
      class: 'player-header',
      style: 'display: flex; align-items: center; gap: 24px; justify-content: center; margin-bottom: 12px; background: rgba(34,34,34,0.85); border-radius: 8px; padding: 8px 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);'
    },
    children: [
      // Bombs
      {
        tag: 'div',
        attrs: { style: 'display: flex; align-items: center; gap: 6px;' },
        children: [
          { tag: 'img', attrs: { src: '/assets/bombheader.png', style: 'width: 28px; height: 28px;' } },
          { tag: 'span', attrs: { class: 'player-header-value' }, children: [String(player.maxBombs)] }
        ]
      },
      // Lives
      {
        tag: 'div',
        attrs: { style: 'display: flex; align-items: center; gap: 6px;' },
        children: [
          { tag: 'img', attrs: { src: '/assets/heartheader.png', style: 'width: 28px; height: 28px;' } },
          { tag: 'span', attrs: { class: 'player-header-value' }, children: [String(player.lives)] }
        ]
      },
      // Speed
      {
        tag: 'div',
        attrs: { style: 'display: flex; align-items: center; gap: 6px;' },
        children: [
          { tag: 'img', attrs: { src: '/assets/speedheader.png', style: 'width: 28px; height: 28px;' } },
          { tag: 'span', attrs: { class: 'player-header-value' }, children: [String(player.speed)] }
        ]
      },
      // Flame (bomb range)
      {
        tag: 'div',
        attrs: { style: 'display: flex; align-items: center; gap: 6px;' },
        children: [
          { tag: 'img', attrs: { src: '/assets/flameheader.png', style: 'width: 28px; height: 28px;' } },
          { tag: 'span', attrs: { class: 'player-header-value' }, children: [String(player.bombRange)] }
        ]
      }
    ]
  };
} 