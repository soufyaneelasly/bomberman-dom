const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path');
const BombermanGameEngine = require('./gameEngine');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// }); 




// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use('/core', express.static(path.join(__dirname, '../core')));

// Game state
const gameState = {
  waitingRoom: {
    players: [],
    maxPlayers: 4,
    countdown: null
  },
  gameEngine: null
};

// Add these variables to manage timers
let waitingRoom20sTimer = null;
let waitingRoom20sInterval = null;
let waitingRoom10sTimer = null;
let waitingRoom10sCountdown = null;

// WebSocket connection handling server listening for new ws connections
wss.on('connection', (ws) => {
  console.log('New client connected');
  // the message is the data sent by the client to the server
  //ws is the soket for this client
  // When a client connects, a ws object is created for that client.


 

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleMessage(ws, data);
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    handleDisconnect(ws);
  });
});

function handleMessage(ws, data) {
  switch (data.type) {
    case 'JOIN_WAITING_ROOM':
      handleJoinWaitingRoom(ws, data);
      break;
    case 'CHAT_MESSAGE':
      handleChatMessage(ws, data);
      break;
    case 'GAME_ACTION':
      handleGameAction(ws, data);
      break;
    default:
      console.log('Unknown message type:', data.type);
  }
}

function handleJoinWaitingRoom(ws, data) {
  // If a game is in progress, reject join
  if (gameState.gameEngine && gameState.gameEngine.gameStatus === 'playing') {
    ws.send(JSON.stringify({ type: 'MATCH_ALREADY_STARTED', message: 'A match is already in progress. Please wait for the next game.' }));
    return;
  }
  const { nickname } = data;
  
  // Add player to waiting room until palyers>2 ( to doo ....)and 20s pass 
  const player = {
    id: ws._id || Date.now().toString(),
    nickname,
    ws,
    ready: false
  };
  
  ws._id = player.id;
  gameState.waitingRoom.players.push(player);
  
  // Broadcast updated player list
  broadcastToWaitingRoom({
    type: 'PLAYER_JOINED',
    players: gameState.waitingRoom.players.map(p => ({ id: p.id, nickname: p.nickname }))
  });
  
  // Check if we should start countdown // will be after palyers>2
  checkStartCountdown();
}

function handleChatMessage(ws, data) {
  const { message } = data;
  const player = gameState.waitingRoom.players.find(p => p.ws === ws);
  
  if (player) {
    broadcastToAllPlayers({
      type: 'CHAT_MESSAGE',
      playerId: player.id,
      nickname: player.nickname,
      message
    });
  }
}

function handleGameAction(ws, data) {
  if (!gameState.gameEngine) return;
  //find the player by ws
  const player = gameState.waitingRoom.players.find(p => p.ws === ws);
  if (!player) return;
  
  const { action, key } = data;
  gameState.gameEngine.handlePlayerInput(player.id, action, key);
  
  // Broadcast updated game state to all players
  broadcastGameState();
}

function handleDisconnect(ws) {
  // Remove player from waiting room
  const index = gameState.waitingRoom.players.findIndex(p => p.ws === ws);
  if (index !== -1) {
    gameState.waitingRoom.players.splice(index, 1);
    
    broadcastToWaitingRoom({
      type: 'PLAYER_LEFT',
      players: gameState.waitingRoom.players.map(p => ({ id: p.id, nickname: p.nickname }))
    });
  }
}

function broadcastToWaitingRoom(message) {
  gameState.waitingRoom.players.forEach(player => {
    if (player.ws.readyState === WebSocket.OPEN) {
      console.log("amin aaamiin")
      
      player.ws.send(JSON.stringify(message));
    }
  });
}

function broadcastToAllPlayers(message) {
  gameState.waitingRoom.players.forEach(player => {
    if (player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(JSON.stringify(message));
    }
  });
}

function broadcastGameState() {
  if (!gameState.gameEngine) return;
  
  const gameStateData = gameState.gameEngine.getGameState();
  
  gameState.waitingRoom.players.forEach(player => {
    if (player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(JSON.stringify({
        type: 'GAME_STATE_UPDATE',
        gameState: gameStateData
      }));
    }
  });
}

function checkStartCountdown() {
  const playerCount = gameState.waitingRoom.players.length;

  // Reset all timers if not enough players
  if (playerCount < 2) {
    if (waitingRoom20sTimer) { clearTimeout(waitingRoom20sTimer); waitingRoom20sTimer = null; }
    if (waitingRoom20sInterval) { clearInterval(waitingRoom20sInterval); waitingRoom20sInterval = null; }
    if (waitingRoom10sTimer) { clearTimeout(waitingRoom10sTimer); waitingRoom10sTimer = null; }
    if (waitingRoom10sCountdown) { clearInterval(waitingRoom10sCountdown); waitingRoom10sCountdown = null; }
    gameState.waitingRoom.countdown = null;
    return;
  }

  // If 2 or 3 players, start 20s timer if not already started
  if ((playerCount === 2 || playerCount === 3) && !waitingRoom20sTimer && !waitingRoom10sCountdown) {
    let waitingCountdown = 20;
    gameState.waitingRoom.countdown = waitingCountdown;
    waitingRoom20sInterval = setInterval(() => {
      waitingCountdown--;
      gameState.waitingRoom.countdown = waitingCountdown;
      broadcastToWaitingRoom({
        type: 'WAITING_TIMER',
        countdown: waitingCountdown
      });
      if (waitingCountdown <= 0) {
        clearInterval(waitingRoom20sInterval);
        waitingRoom20sInterval = null;
      }
    }, 1000);
    waitingRoom20sTimer = setTimeout(() => {
      waitingRoom20sTimer = null;
      if (waitingRoom20sInterval) { clearInterval(waitingRoom20sInterval); waitingRoom20sInterval = null; }
      // After 20s, start 10s countdown if still 2 or 3 players
      if (gameState.waitingRoom.players.length >= 2 && gameState.waitingRoom.players.length < 4 && !waitingRoom10sCountdown) {
        startGameCountdown();
      }
    }, 20000);
    // Optionally broadcast 20s timer started
  }

  // If 4 players join before 20s, cancel 20s timer and start 10s countdown
  if (playerCount === 4 && !waitingRoom10sCountdown) {
    if (waitingRoom20sTimer) { clearTimeout(waitingRoom20sTimer); waitingRoom20sTimer = null; }
    if (waitingRoom20sInterval) { clearInterval(waitingRoom20sInterval); waitingRoom20sInterval = null; }
    startGameCountdown();
  }
}

function startGameCountdown() {
  let countdown = 10;
  gameState.waitingRoom.countdown = countdown;
  waitingRoom10sCountdown = setInterval(() => {
    broadcastToWaitingRoom({
      type: 'GAME_STARTING',
      countdown
    });
    countdown--;
    gameState.waitingRoom.countdown = countdown;
    if (countdown < 0) {
      clearInterval(waitingRoom10sCountdown);
      waitingRoom10sCountdown = null;
      startGame();
    }
  }, 1000);
}

function startGame() {
  console.log('Starting game with players:', gameState.waitingRoom.players.length);
  
  // Initialize game engine
  gameState.gameEngine = new BombermanGameEngine();
  
  // Add all players to the game engine
  gameState.waitingRoom.players.forEach(player => {
    gameState.gameEngine.addPlayer(player.id, player.nickname);
  });
  
  // Start the game
  gameState.gameEngine.startGame();
  
  // Broadcast game started message
  broadcastToWaitingRoom({
    type: 'GAME_STARTED'
  });
  
  // Start broadcasting game state
  setInterval(() => {
    if (gameState.gameEngine && gameState.gameEngine.gameStatus === 'playing') {
      broadcastGameState();
    }
  }, 16); // 60 FPS mafoker 
}

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', players: gameState.waitingRoom.players.length });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 





