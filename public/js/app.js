import { createVNode, render } from '../framework/core.js';
import { store } from '../framework/state.js';

// Animation state for all players
const playerAnimationFrames = {}; // { [playerId]: { frame: 0, lastUpdate: 0 } }
const ANIMATION_FRAME_COUNT = 3;
const ANIMATION_FRAME_DURATION = 100; // ms per frame
let lastAnimationUpdate = 0;

// WebSocket setup
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsUrl = `${protocol}//${window.location.host}`;
const ws = new WebSocket(wsUrl);

// Initial state
store.setState({
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
  winner: null,
});

// WebSocket event handlers
ws.onopen = () => {};
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
ws.onclose = () => {};

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
      const alivePlayers = (data.gameState.players || []).filter(p => p.lives > 0);
      const localNickname = store.getState().nickname;
      const localPlayer = (data.gameState.players || []).find(p => p.nickname === localNickname);
      if (localPlayer && localPlayer.lives === 0 && store.getState().screen !== 'winner') {
        store.setState({
          screen: 'winner',
          winner: { type: 'lose', winner: localPlayer }
        });
      } else if (alivePlayers.length === 1 && store.getState().screen !== 'winner') {
        store.setState({
          screen: 'winner',
          winner: { type: 'win', winner: alivePlayers[0] }
        });
      } else {
        store.setState({
          players: data.gameState.players || [],
          bombs: data.gameState.bombs || [],
          powerUps: data.gameState.powerUps || [],
          mapArray: data.gameState.mapArray || [],
          explosions: data.gameState.explosions || [],
          gameStatus: data.gameState.gameStatus || 'playing'
        });
      }
      break;
    default:
  }
}

function NicknameScreen(store) {
  const state = store.getState();
  return createVNode('div', { class: 'screen nickname-screen active' }, [
    createVNode('div', { class: 'nickname-container' }, [
      createVNode('h1', {}, ['Bomberman DOM']),
      createVNode('div', { class: 'nickname-header' }, [
        createVNode('img', { src: '/assets/gameconsole.png', alt: 'Game Console', class: 'nickname-logo' }),
        createVNode('div', { class: 'nickname-welcome' }, ['Welcome to our game!'])
      ]),
      createVNode('input', {
        type: 'text',
        placeholder: 'Enter your nickname',
        value: state.nickname,
        id: 'nickname-input',
        class: 'nickname-input',
        oninput: (e) => store.setState({ nickname: e.target.value })
      }),
      createVNode('button', {
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
      }, ['Join Game']),
      ChatComponent(store)
    ])
  ]);
}

function WaitingRoomScreen(store) {
  const state = store.getState();
  return createVNode('div', { class: 'screen waiting-room active' }, [
    createVNode('div', { class: 'waitingroom-container' }, [
      createVNode('h2', { class: 'waitingroom-title' }, ['Waiting Room']),
      (state.waitingTimer !== undefined && state.waitingTimer !== null && state.waitingTimer > 0)
        ? createVNode('div', { class: 'waitingroom-waitingtimer' }, [`Waiting for more players... ${state.waitingTimer}s`])
        : null,
      createVNode('div', { class: 'waitingroom-players' }, [`Players: ${state.playerCount} / 4`]),
      createVNode('ul', { class: 'waitingroom-list' },
        (state.players || []).map(player =>
          createVNode('li', { class: 'waitingroom-player' }, [player.nickname])
        )
      ),
      state.countdown
        ? createVNode('div', { class: 'waitingroom-countdown' }, [`Game starting in ${state.countdown} seconds`])
        : null,
      ChatComponent(store)
    ].filter(Boolean))
  ]);
}

// Main App function: renders the correct screen based on state
function App(store) {
  const state = store.getState();
  const { screen } = state;

  console.log('screen', screen);
  if (screen === 'nickname') return NicknameScreen(store);
  if (screen === 'waiting') return WaitingRoomScreen(store);
  if (screen === 'game') return GameScreen(store);
  if (screen === 'winner') return WinnerBanner(state.winner);
  return null;
}

// --- FPS Calculation ---
let lastFrameTime = performance.now();
let frameCount = 0;
let fps = 0;

function updateFps() {
  const now = performance.now();
  frameCount++;
  if (now - lastFrameTime >= 1000) {
    fps = frameCount;
    frameCount = 0;
    lastFrameTime = now;
  }
}

// GameScreen: only this screen shows the PlayerHeaderComponent
function GameScreen(store) {
  updateFps();
  const state = store.getState();
  const localNickname = state.nickname;
  const localPlayer = (state.players || []).find(p => p.nickname === localNickname);

  // --- Animate player frames ---
  const now = performance.now();
  (state.players || []).forEach(player => {
    const key = player.id || player.nickname;
    if (!playerAnimationFrames[key]) {
      playerAnimationFrames[key] = { frame: 0, lastUpdate: now };
    }
    if (player.isMoving) {
      if (now - playerAnimationFrames[key].lastUpdate > ANIMATION_FRAME_DURATION) {
        playerAnimationFrames[key].frame = (playerAnimationFrames[key].frame + 1) % ANIMATION_FRAME_COUNT;
        playerAnimationFrames[key].lastUpdate = now;
      }
    } else {
      playerAnimationFrames[key].frame = 0; // reset to standing frame
    }
  });

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
      ws.send(JSON.stringify({ type: 'GAME_ACTION', action: 'PLACE_BOMB' }));
    } else {
      ws.send(JSON.stringify({ type: 'GAME_ACTION', action: 'MOVE', key: key }));
    }
  }

  function handleKeyUp(event) {
    const key = keyMap[event.code];
    if (!key || key === 'space') return;
    event.preventDefault();
    ws.send(JSON.stringify({ type: 'GAME_ACTION', action: 'KEY_RELEASE', key: key }));
  }

  // Compose all game entities as children of game-canvas
  const mapTiles = MapComponent(state.mapArray);
  const bombs = (state.bombs || []).map(BombComponent);
  const explosions = (state.explosions || []).map(ExplosionComponent);
  const powerUps = (state.powerUps || []).map(PowerUpComponent);
  const players = (state.players || []).map(PlayerComponent);

  return createVNode('div', { class: 'game-layout-container' }, [
    // Only show the header in the game screen
    localPlayer ? PlayerHeaderComponent(localPlayer) : null,
    createVNode('div', { class: 'game-main-row' }, [
      createVNode('div', {
        id: 'game-canvas',
        style: 'position: relative; width: 100%; max-width: 900px; aspect-ratio: 3/2; min-width: 320px; min-height: 200px;',
        tabindex: 0,
        onkeydown: handleKeyDown,
        onkeyup: handleKeyUp
      }, [
        // FpsCounterComponent(fps),
        ...mapTiles,
        ...bombs,
        ...explosions,
        ...powerUps,
        ...players
      ]),
      createVNode('div', { class: 'game-chat-wrapper' }, [ChatComponent(store)])
    ])
  ]);
}

function initializeGameControls() {
  // No-op: all event logic is now handled in GameScreen
}


function PlayerStatsComponent(state) {
  return createVNode('div', { class: 'player-stats', style: 'margin-bottom: 8px; color: #fff;' }, [
    createVNode('span', {}, [`Players Alive: ${(state.players || []).length}`])
  ]);
}

function ChatComponent(store) {
  const state = store.getState();
  function getColorClass(nickname) {
    const colors = ['chat-color-1', 'chat-color-2', 'chat-color-3', 'chat-color-4', 'chat-color-5', 'chat-color-6', 'chat-color-7', 'chat-color-8'];
    const players = state.players || [];
    const idx = players.findIndex(p => p.nickname === nickname);
    if (idx !== -1) {
      return colors[idx % colors.length];
    }
    return 'chat-color-1';
  }
  return createVNode('div', { class: 'chat' }, [
    createVNode('div', { class: 'chat-messages' },
      (state.chatMessages || []).map(msg =>
        createVNode('div', {}, [
          createVNode('span', { class: `chat-nickname ${getColorClass(msg.nickname)}` }, [msg.nickname + ': ']),
          msg.text
        ])
      )
    ),
    createVNode('input', {
      type: 'text',
      value: state.chatInput,
      oninput: (e) => store.setState({ chatInput: e.target.value })
    }),
    createVNode('button', {
      onclick: () => {
        if (state.chatInput.trim()) {
          ws.send(JSON.stringify({ type: 'CHAT_MESSAGE', message: state.chatInput }));
          store.setState({ chatInput: '' });
        }
      }
    }, ['Send'])
  ]);
}

function FpsCounterComponent(fps) {
  return createVNode('div', {
    class: 'fps-counter',
    style: 'position: absolute; top: 8px; right: 16px; color: #fff; background: rgba(0,0,0,0.6); padding: 4px 12px; border-radius: 6px; font-size: 16px; font-family: monospace; z-index: 1000; pointer-events: none;'
  }, [`FPS: ${fps}`]);
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
  return createVNode('div', {
    class: extraClass,
    style: `position: absolute; width: ${tileSize}px; height: ${tileSize}px; left: ${x * tileSize}px; top: ${y * tileSize}px; background-image: url(${backgroundImage}); background-size: cover; background-repeat: no-repeat; z-index: ${zIndex};`,
    'data-grid-x': x,
    'data-grid-y': y
  }, []);
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
  const vdom = createVNode('div', {
    key,
    class: 'player',
    style: `position: absolute; width: ${tileSize}px; height: ${tileSize}px; overflow: hidden; z-index: 10; transition: transform 0.1s ease-out; transform: translate3d(${player.pixelX / 32 * tileSize}px, ${player.pixelY / 32 * tileSize}px, 2px); background-image: url(${spritePath}); background-size: cover; background-position: -${frameIndex * tileSize}px 0px;`
  }, [
    createVNode('div', {
      style: `position: absolute; top: -${Math.floor(tileSize * 0.6)}px; left: 50%; transform: translateX(-50%); font-size: ${Math.max(10, Math.floor(tileSize * 0.3))}px; color: #000; background-color: rgba(255,255,255,0.8); padding: 2px 4px; border-radius: 3px; white-space: nowrap;`
    }, [player.nickname])
  ]);
  playerVDOMCache.set(key, { player: { ...player }, vdom });
  return vdom;
}

function BombComponent(bomb) {
  const tileSize = getTileSize();
  return createVNode('div', {
    class: 'bomb',
    style: `position: absolute; width: ${tileSize}px; height: ${tileSize}px; background-image: url(/assets/bomb.png); background-size: cover; z-index: 5; transform: translate3d(${((bomb.pixelX ?? (bomb.gridX !== undefined ? bomb.gridX * 32 : 0)) / 32 * tileSize)}px, ${((bomb.pixelY ?? (bomb.gridY !== undefined ? bomb.gridY * 32 : 0)) / 32 * tileSize)}px, 1px);`
  }, []);
}

function PowerUpComponent(powerUp) {
  const tileSize = getTileSize();
  return createVNode('div', {
    class: 'powerup',
    style: `position: absolute; width: ${tileSize}px; height: ${tileSize}px; background-image: url(/assets/${powerUp.type}.png); background-size: cover; z-index: 7; transform: translate3d(${(powerUp.pixelX !== undefined ? powerUp.pixelX / 32 * tileSize : powerUp.gridX * tileSize)}px, ${(powerUp.pixelY !== undefined ? powerUp.pixelY / 32 * tileSize : powerUp.gridY * tileSize)}px, 1px);`
  }, []);
}

function ExplosionComponent(explosion) {
  const tileSize = getTileSize();
  return createVNode('div', {
    class: 'explosion',
    style: `position: absolute; width: ${tileSize}px; height: ${tileSize}px; background-image: url(/assets/2.png); background-size: cover; z-index: 6; transform: translate3d(${((explosion.pixelX ?? (explosion.gridX !== undefined ? explosion.gridX * 32 : 0)) / 32 * tileSize)}px, ${((explosion.pixelY ?? (explosion.gridY !== undefined ? explosion.gridY * 32 : 0)) / 32 * tileSize)}px, 1px);`
  }, []);
}

function PlayerHeaderComponent(player) {
  return createVNode('div', {
    class: 'player-header',
    style: 'display: flex; align-items: center; gap: 24px; justify-content: center; margin-bottom: 12px; background: rgba(34,34,34,0.85); border-radius: 8px; padding: 8px 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);'
  }, [
    createVNode('div', { style: 'display: flex; align-items: center; gap: 6px;' }, [
      createVNode('img', { src: '/assets/bombheader.png', style: 'width: 28px; height: 28px;' }),
      createVNode('span', { class: 'player-header-value' }, [String(player.maxBombs)])
    ]),
    createVNode('div', { style: 'display: flex; align-items: center; gap: 6px;' }, [
      createVNode('img', { src: '/assets/heartheader.png', style: 'width: 28px; height: 28px;' }),
      createVNode('span', { class: 'player-header-value' }, [String(player.lives)])
    ]),
    createVNode('div', { style: 'display: flex; align-items: center; gap: 6px;' }, [
      createVNode('img', { src: '/assets/speedheader.png', style: 'width: 28px; height: 28px;' }),
      createVNode('span', { class: 'player-header-value' }, [String(player.speed)])
    ]),
    createVNode('div', { style: 'display: flex; align-items: center; gap: 6px;' }, [
      createVNode('img', { src: '/assets/flameheader.png', style: 'width: 28px; height: 28px;' }),
      createVNode('span', { class: 'player-header-value' }, [String(player.bombRange)])
    ])
  ]);
}

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

// Render and subscribe using new framework
const appContainer = document.getElementById('app');
render(App(store), appContainer);
store.subscribe(() => render(App(store), appContainer));


function WinnerBanner(data) {
  const message = data.type === 'win' ?
    ` 🎉 Congratulations, ${data.winner.nickname}! You are the winner of the game! 🏆` :
    data.type === 'lose' ? `💀 Sorry, ${data.winner.nickname}! you have lost the game. Better luck next game! 😞` :
      `☠️ All players have died. Game Over.`;
  return createVNode('div', { class: 'winner-overlay' }, [
    createVNode('div', { class: 'winner-banner' }, message),
    createVNode('button', {
      id: 'restart-btn',
      class: 'btn restart-btn',
      onclick: () => {
        window.location.reload();
      }
    }, 'Restart Game')
  ]);
}