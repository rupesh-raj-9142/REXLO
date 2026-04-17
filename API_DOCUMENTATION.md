# Rexlo Gaming Platform API Documentation

## Overview
Comprehensive RESTful API for multiplayer gaming platform with real-time game logic, player management, and matchmaking.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Game API Endpoints

### 🎮 Game Management

#### Initialize Game
```http
POST /api/game/initialize
```

**Request Body:**
```json
{
  "gameId": "uuid-string",
  "gameType": "ludo" | "carrom",
  "players": [
    {
      "userId": "mongo-object-id",
      "username": "player123",
      "index": 0
    }
  ],
  "settings": {
    "entryFee": 25,
    "maxPlayers": 4,
    "autoStart": true,
    "allowSpectators": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "gameState": {
      "gameId": "uuid",
      "gameType": "ludo",
      "status": "waiting",
      "players": [...],
      "board": [...],
      "currentPlayer": 0
    },
    "message": "Game initialized successfully"
  }
}
```

#### Get Game State
```http
GET /api/game/state/:gameId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "gameId": "uuid",
    "gameType": "ludo",
    "status": "playing",
    "players": [...],
    "currentPlayer": 2,
    "moves": [...],
    "winner": null
  }
}
```

### 🎲 Ludo Game Actions

#### Roll Dice
```http
POST /api/game/ludo/roll-dice
```

**Request Body:**
```json
{
  "gameId": "uuid",
  "playerId": "mongo-object-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "dice": 4,
    "canMove": true,
    "moves": [
      {
        "pieceId": 0,
        "from": -1,
        "to": 0,
        "type": "exit_base"
      }
    ],
    "player": 0
  }
}
```

#### Move Piece
```http
POST /api/game/ludo/move-piece
```

**Request Body:**
```json
{
  "gameId": "uuid",
  "playerId": "mongo-object-id",
  "pieceId": 0,
  "newPosition": 13
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "gameState": {...},
    "move": {
      "playerId": "mongo-id",
      "pieceId": 0,
      "from": -1,
      "to": 13
    }
  }
}
```

### 🎯 Carrom Game Actions

#### Strike
```http
POST /api/game/carrom/strike
```

**Request Body:**
```json
{
  "gameId": "uuid",
  "playerId": "mongo-object-id",
  "strikerPosition": {
    "x": 50,
    "y": 80
  },
  "force": 75.5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "gameState": {...},
    "hits": [
      {
        "coinId": "black_3",
        "color": "black",
        "position": { "x": 80, "y": 40 }
      }
    ],
    "playerScore": 10
  }
}
```

### 👥 Player Actions

#### Set Ready Status
```http
POST /api/game/player/ready
```

**Request Body:**
```json
{
  "gameId": "uuid",
  "playerId": "mongo-object-id",
  "isReady": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "gameState": {...},
    "allReady": true,
    "gameStarted": false
  }
}
```

### 📊 Game Analytics

#### Get Game Statistics
```http
GET /api/game/stats/:gameId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "gameId": "uuid",
    "gameType": "ludo",
    "status": "completed",
    "players": 4,
    "duration": 847,
    "moves": 156,
    "winner": "mongo-object-id",
    "startTime": "2024-01-15T14:30:00Z",
    "endTime": "2024-01-15T14:44:07Z"
  }
}
```

#### Get Platform Analytics
```http
GET /api/game/analytics?timeframe=24h|7d|30d
```

**Response:**
```json
{
  "success": true,
  "data": {
    "activeGames": 23,
    "totalPlayers": 156,
    "averageGameDuration": 8.5,
    "popularGames": [
      { "name": "Ludo", "players": 145, "games": 89 },
      { "name": "Carrom", "players": 98, "games": 67 }
    ],
    "revenue": {
      "total": 15420,
      "today": 1250,
      "growth": 15.2
    },
    "performance": {
      "serverUptime": "99.9%",
      "averageResponseTime": 45,
      "errorRate": "0.02%"
    }
  }
}
```

### 🎯 Matchmaking

#### Find Match
```http
POST /api/game/matchmaking
```

**Request Body:**
```json
{
  "gameType": "ludo",
  "skillLevel": 5,
  "entryFee": 25
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "gameId": "new-uuid",
    "gameState": {...},
    "players": 4,
    "message": "Match found and game created"
  }
}
```

**Or if queued:**
```json
{
  "success": true,
  "data": {
    "queued": true,
    "queuePosition": 3,
    "estimatedWaitTime": 120,
    "message": "Added to matchmaking queue"
  }
}
```

### 🧹 Game Cleanup

#### Cleanup Game State
```http
DELETE /api/game/cleanup/:gameId
```

**Response:**
```json
{
  "success": true,
  "message": "Game state cleaned up successfully"
}
```

## 🎮 Game Logic Features

### Ludo Game
- **Board**: 52 positions (13 per player)
- **Pieces**: 4 pieces per player
- **Dice**: 1-6 random roll
- **Movement**: Based on dice value
- **Win Condition**: All 4 pieces reach home
- **Special Rules**: 6 required to exit base

### Carrom Game
- **Board**: 39 coins (9 black, 9 white, 1 red queen)
- **Striker**: Player-controlled piece
- **Physics**: Basic collision detection
- **Scoring**: Black/white = 10 points, Red = 50 points
- **Win Condition**: Pocket all opponent coins or queen

## 🔧 Real-time Features

### Socket.io Events
```javascript
// Client to Server
socket.emit('joinGame', { gameId, playerId });
socket.emit('gameMove', { gameId, moveData });
socket.emit('playerReady', { gameId, isReady });

// Server to Client
socket.emit('gameUpdate', { gameState });
socket.emit('playerJoined', { player });
socket.emit('gameStarted', { gameState });
socket.emit('gameEnded', { winner, gameState });
```

## 📈 Performance Metrics

### Response Times
- **Game Actions**: <50ms
- **State Updates**: <100ms
- **Matchmaking**: <200ms

### Scalability
- **Concurrent Games**: 1000+
- **Players per Game**: 2-4
- **Database**: MongoDB sharding support

## 🛡️ Security Features

### Rate Limiting
- **Game Actions**: 10/second per player
- **API Calls**: 100/minute per user
- **Matchmaking**: 5/minute per user

### Validation
- **Input Sanitization**: All user inputs
- **Move Validation**: Server-side verification
- **Anti-Cheat**: Move pattern detection

## 📱 Client Integration

### JavaScript SDK Usage
```javascript
// Initialize game
const gameApi = new RexloGameAPI(token);

// Roll dice
const result = await gameApi.rollDice(gameId, playerId);

// Move piece
const moveResult = await gameApi.movePiece(gameId, playerId, pieceId, newPosition);

// Listen for updates
gameApi.onGameUpdate((gameState) => {
  updateUI(gameState);
});
```

## 🚀 Deployment

### Environment Variables
```env
NODE_ENV=production
MONGODB_URI=mongodb://cluster.mongodb.net/rexlo
JWT_SECRET=your-production-secret
REDIS_URL=redis://cluster.redis.com
```

### Scaling
- **Load Balancer**: Nginx/HAProxy
- **Game Servers**: Node.js cluster
- **Database**: MongoDB replica set
- **Cache**: Redis for game states
