// eimport MiniFramework from '../mini-framework/index.js';

// class BombermanApp {
//     constructor() {
//         this.ws = null;
//         this.nickname = '';
//         this.playerId = null;
//         this.game = null;
        
//         this.initializeElements();
//         this.bindEvents();
//         this.connectWebSocket();
//     }

//     initializeElements() {
//         // Screens
//         this.nicknameScreen = document.getElementById('nickname-screen');
//         this.waitingRoom = document.getElementById('waiting-room');
//         this.gameScreen = document.getElementById('game-screen');
        
//         // Nickname screen elements
//         this.nicknameInput = document.getElementById('nickname-input');
//         this.joinBtn = document.getElementById('join-btn');
        
//         // Waiting room elements
//         this.playerCount = document.getElementById('player-count');
//         this.playersList = document.getElementById('players-list');
//         this.countdown = document.getElementById('countdown');
//         this.countdownTimer = document.getElementById('countdown-timer');
//         this.chatMessages = document.getElementById('chat-messages');
//         this.chatInput = document.getElementById('chat-input');
//         this.sendChatBtn = document.getElementById('send-chat-btn');
        
//         // Game screen elements
//         this.gameCanvas = document.getElementById('game-canvas');
//         this.aliveCount = document.getElementById('alive-count');
//         this.fpsDisplay = document.getElementById('fps-display');
//         this.gameChatMessages = document.getElementById('game-chat-messages');
//         this.gameChatInput = document.getElementById('game-chat-input');
//         this.gameSendBtn = document.getElementById('game-send-btn');
//     }

//     bindEvents() {
//         // Nickname screen events
//         this.joinBtn.addEventListener('click', () => this.joinGame());
//         this.nicknameInput.addEventListener('keypress', (e) => {
//             if (e.key === 'Enter') this.joinGame();
//         });

//         // Chat events
//         this.sendChatBtn.addEventListener('click', () => this.sendChatMessage());
//         this.chatInput.addEventListener('keypress', (e) => {
//             if (e.key === 'Enter') this.sendChatMessage();
//         });

//         // Game chat events
//         this.gameSendBtn.addEventListener('click', () => this.sendGameChatMessage());
//         this.gameChatInput.addEventListener('keypress', (e) => {
//             if (e.key === 'Enter') this.sendGameChatMessage();
//         });
//     }

//     connectWebSocket() {
//         const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
//         const wsUrl = `${protocol}//${window.location.host}`;
        
//         this.ws = new WebSocket(wsUrl);
        
//         this.ws.onopen = () => {
//             console.log('WebSocket connected');
//         };
        
//         this.ws.onmessage = (event) => {
//             try {
//                 const data = JSON.parse(event.data);
//                 this.handleServerMessage(data);
//             } catch (error) {
//                 console.error('Error parsing server message:', error);
//             }
//         };
        
//         this.ws.onclose = () => {
//             console.log('WebSocket disconnected');
//             setTimeout(() => this.connectWebSocket(), 3000);
//         };
        
//         this.ws.onerror = (error) => {
//             console.error('WebSocket error:', error);
//         };
//     }

//     handleServerMessage(data) {
//         switch (data.type) {
//             case 'PLAYER_JOINED':
//                 this.updatePlayerList(data.players);
//                 break;
//             case 'PLAYER_LEFT':
//                 this.updatePlayerList(data.players);
//                 break;
//             case 'CHAT_MESSAGE':
//                 this.addChatMessage(data.nickname, data.message);
//                 break;
            
//             case 'GAME_STARTING':
//                 this.showCountdown(data.countdown);
//                 break;
//             case 'GAME_STARTED':
//                 this.startGame();
                
//                 break;
//             case 'GAME_STATE_UPDATE':
//                 this.updateGameState(data.gameState);
//                 break;
//             default:
//                 console.log('Unknown message type:', data.type);
//         }
//     }

//     joinGame() {
//         const nickname = this.nicknameInput.value.trim();
//         if (!nickname) {
//             alert('Please enter a nickname');
//             return;
//         }
        
//         this.nickname = nickname;
        
//         // Send join message to server
//         this.ws.send(JSON.stringify({
//             type: 'JOIN_WAITING_ROOM',
//             nickname: nickname
//         }));
        
//         // Switch to waiting room
//         this.showScreen('waiting-room');
//     }

//     updatePlayerList(players) {
//         this.playerCount.textContent = players.length;
        
//         this.playersList.innerHTML = '';
//         players.forEach(player => {
//             const playerElement = document.createElement('div');
//             playerElement.className = 'player-item';
//             playerElement.textContent = player.nickname;
//             this.playersList.appendChild(playerElement);
//         });
//     }

//     addChatMessage(nickname, message) {
//         const messageElement = document.createElement('div');
//         messageElement.className = 'chat-message';
//         messageElement.innerHTML = `<span class="nickname">${nickname}:</span> ${message}`;

//         // Show in correct chat area depending on screen
//         if (this.gameScreen.classList.contains('active')) {
//             this.gameChatMessages.appendChild(messageElement);
//             this.gameChatMessages.scrollTop = this.gameChatMessages.scrollHeight;
//         } else {
//             this.chatMessages.appendChild(messageElement);
//             this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
//         }
//     }

//     sendChatMessage() {
//         const message = this.chatInput.value.trim();
//         if (!message) return;
        
//         this.ws.send(JSON.stringify({
//             type: 'CHAT_MESSAGE',
//             message: message
//         }));
        
//         this.chatInput.value = '';
//     }

//     sendGameChatMessage() {
//         const message = this.gameChatInput.value.trim();
//         if (!message) return;
        
//         this.ws.send(JSON.stringify({
//             type: 'CHAT_MESSAGE',
//             message: message
//         }));
        
//         this.gameChatInput.value = '';
//     }

//     showCountdown(countdown) {
//         this.countdown.style.display = 'block';
//         this.countdownTimer.textContent = countdown;
        
//         // Update countdown every second
//         const countdownInterval = setInterval(() => {
//             const currentCountdown = parseInt(this.countdownTimer.textContent);
//             if (currentCountdown > 1) {
//                 this.countdownTimer.textContent = currentCountdown - 1;
//             } else {
//                 clearInterval(countdownInterval);
//                 this.countdown.style.display = 'none';
//             }
//         }, 1000);
//     }

//     startGame() {
//         this.showScreen('game-screen');
//         this.initializeGame();
//     }

//     initializeGame() {
//         // Initialize the game with your framework
//         if (!this.game) {
//             this.game = new MiniFramework(this.gameCanvas, this.ws);
//         }
//         this.game.start();
//     }

//     updateGameState(gameState) {
//         if (this.game) {
//             this.game.updateGameState(gameState);
//         }
//     }

//     showScreen(screenId) {
//         // Hide all screens
//         document.querySelectorAll('.screen').forEach(screen => {
//             screen.classList.remove('active');
//         });
        
//         // Show the target screen
//         document.getElementById(screenId).classList.add('active');
//     }
// }

// // Performance monitoring
// class PerformanceMonitor {
//     constructor() {
//         this.fps = 0;
//         this.frameCount = 0;
//         this.lastTime = performance.now();
//         this.fpsDisplay = document.getElementById('fps-display');
        
//         this.startMonitoring();
//     }

//     startMonitoring() {
//         const updateFPS = () => {
//             const currentTime = performance.now();
//             this.frameCount++;
            
//             if (currentTime - this.lastTime >= 1000) {
//                 this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
//                 this.fpsDisplay.textContent = this.fps;
//                 this.frameCount = 0;
//                 this.lastTime = currentTime;
//             }
            
//             requestAnimationFrame(updateFPS);
//         };
        
//         requestAnimationFrame(updateFPS);
//     }
// }

// // Initialize the app when DOM is loaded
// document.addEventListener('DOMContentLoaded', () => {
//     window.app = new BombermanApp();
//     window.performanceMonitor = new PerformanceMonitor();
// }); 