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

// Game state
const gameState = {
  waitingRoom: {
    players: [],
    maxPlayers: 4,
    countdown: null
  },
  gameEngine: null
};

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
  
  if (playerCount == 4 && !gameState.waitingRoom.countdown) {
    // Start 20 second wait timer
    gameState.waitingRoom.countdown = setTimeout(() => {
      if (gameState.waitingRoom.players.length >= 2) {
        startGameCountdown();
      }
    }, 20000);
  }
  
  if (playerCount === 4 || playerCount==1) {
    // Start 10 second countdown immediately
    if (gameState.waitingRoom.countdown) {
      clearTimeout(gameState.waitingRoom.countdown);
    }
    startGameCountdown();
  }
}

function startGameCountdown() {
  let countdown = 10;
  
  const countdownInterval = setInterval(() => {
    broadcastToWaitingRoom({
      type: 'GAME_STARTING',
      countdown
    });
    
    countdown--;
    
    if (countdown < 0) {
      clearInterval(countdownInterval);
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





