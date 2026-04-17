class LudoGame {
  constructor() {
    this.boardSize = 52; // Total positions on the board
    this.piecesPerPlayer = 4;
    this.safePositions = [0, 8, 13, 21, 26, 34, 39, 47]; // Safe spots
    this.homeStretchLength = 6; // Number of positions in home stretch
    
    this.resetGame();
  }

  resetGame() {
    this.gameState = {
      type: 'ludo',
      currentPlayer: 0,
      dice: 0,
      diceRolled: false,
      players: [],
      board: Array(this.boardSize).fill(null),
      gameStarted: false,
      turnCount: 0,
      lastMove: null,
      canRollAgain: false,
      capturedPieces: [],
      homePieces: []
    };
    
    this.initializePlayers();
  }

  initializePlayers() {
    this.gameState.players = Array.from({ length: 4 }, (_, i) => ({
      id: i,
      userId: null,
      username: `Player ${i + 1}`,
      color: this.getPlayerColor(i),
      pieces: Array.from({ length: this.piecesPerPlayer }, (_, j) => ({
        id: j,
        position: -1, // -1 means in base
        isHome: false,
        isInHomeStretch: false,
        homeStretchPosition: -1,
        captured: false
      })),
      startPosition: i * 13, // Each player starts 13 positions apart
      finished: false
    }));
  }

  getPlayerColor(playerIndex) {
    const colors = ['red', 'blue', 'yellow', 'green'];
    return colors[playerIndex];
  }

  processMove(moveData, userId) {
    const { action, pieceId, diceValue } = moveData;
    
    // Find player index
    const playerIndex = this.getPlayerIndex(userId);
    if (playerIndex !== this.gameState.currentPlayer) {
      return { success: false, error: 'Not your turn' };
    }

    const player = this.gameState.players[playerIndex];

    let result;
    switch (action) {
      case 'rollDice':
        result = this.rollDice(playerIndex);
        break;
      case 'movePiece':
        if (!this.gameState.diceRolled) {
          return { success: false, error: 'Roll dice first' };
        }
        result = this.movePiece(playerIndex, pieceId, this.gameState.dice);
        break;
      default:
        return { success: false, error: 'Invalid action' };
    }

    // Check for winner
    const winner = this.checkWinner();
    
    if (winner) {
      this.gameState.gameStarted = false;
    }

    this.gameState.lastMove = {
      player: playerIndex,
      action,
      result,
      timestamp: new Date()
    };

    return {
      success: true,
      newGameState: this.gameState,
      result,
      winner
    };
  }

  rollDice(playerIndex) {
    const diceValue = Math.floor(Math.random() * 6) + 1;
    this.gameState.dice = diceValue;
    this.gameState.diceRolled = true;

    const player = this.gameState.players[playerIndex];
    const validMoves = this.getValidMoves(playerIndex, diceValue);

    // Check if player can move any piece
    if (validMoves.length === 0) {
      // No valid moves, switch turn
      this.switchTurn();
      return {
        action: 'rollDice',
        diceValue,
        validMoves: [],
        turnEnded: true,
        message: 'No valid moves available'
      };
    }

    // If rolled 6, player gets another turn
    const canRollAgain = diceValue === 6;
    if (!canRollAgain) {
      this.gameState.canRollAgain = false;
    }

    return {
      action: 'rollDice',
      diceValue,
      validMoves,
      canRollAgain,
      turnEnded: false
    };
  }

  movePiece(playerIndex, pieceId, diceValue) {
    const player = this.gameState.players[playerIndex];
    const piece = player.pieces.find(p => p.id === pieceId);
    
    if (!piece) {
      return { success: false, error: 'Piece not found' };
    }

    const validMoves = this.getValidMoves(playerIndex, diceValue);
    const move = validMoves.find(m => m.pieceId === pieceId);
    
    if (!move) {
      return { success: false, error: 'Invalid move for this piece' };
    }

    let capturedPiece = null;
    const oldPosition = piece.position;

    // Execute the move
    if (piece.position === -1 && diceValue === 6) {
      // Move piece out of base
      piece.position = player.startPosition;
      move.type = 'leaveBase';
    } else if (piece.position >= 0 && !piece.isInHomeStretch) {
      // Regular board movement
      const newPosition = (piece.position + diceValue) % this.boardSize;
      
      // Check for capture
      capturedPiece = this.checkCapture(newPosition, playerIndex);
      if (capturedPiece) {
        this.executeCapture(capturedPiece, playerIndex);
        move.captured = capturedPiece;
      }

      // Check if entering home stretch
      if (this.isEnteringHomeStretch(piece.position, newPosition, playerIndex)) {
        piece.isInHomeStretch = true;
        piece.homeStretchPosition = 0;
        move.type = 'enterHomeStretch';
      } else {
        piece.position = newPosition;
        move.type = 'regular';
      }
    } else if (piece.isInHomeStretch) {
      // Home stretch movement
      const newHomePosition = piece.homeStretchPosition + diceValue;
      
      if (newHomePosition === this.homeStretchLength - 1) {
        // Piece reaches home
        piece.isHome = true;
        piece.homeStretchPosition = newHomePosition;
        move.type = 'reachHome';
      } else if (newHomePosition < this.homeStretchLength - 1) {
        // Move within home stretch
        piece.homeStretchPosition = newHomePosition;
        move.type = 'homeStretch';
      } else {
        // Can't move - overshoot
        return { success: false, error: 'Cannot overshoot home' };
      }
    }

    // Update board state
    this.updateBoard();

    // Reset dice for next turn
    this.gameState.diceRolled = false;
    
    // Switch turn unless rolled 6 or captured a piece
    const shouldSwitchTurn = diceValue !== 6 && !capturedPiece;
    if (shouldSwitchTurn) {
      this.switchTurn();
    }

    return {
      action: 'movePiece',
      pieceId,
      from: oldPosition,
      to: piece.position,
      homePosition: piece.homeStretchPosition,
      moveType: move.type,
      captured: capturedPiece,
      turnEnded: shouldSwitchTurn
    };
  }

  getValidMoves(playerIndex, diceValue) {
    const player = this.gameState.players[playerIndex];
    const validMoves = [];

    player.pieces.forEach(piece => {
      if (piece.isHome) {
        return; // Can't move pieces that are already home
      }

      if (piece.position === -1) {
        // Piece in base - can only move with 6
        if (diceValue === 6) {
          validMoves.push({
            pieceId: piece.id,
            type: 'leaveBase',
            from: -1,
            to: player.startPosition
          });
        }
      } else if (piece.isInHomeStretch) {
        // Piece in home stretch
        const newHomePosition = piece.homeStretchPosition + diceValue;
        if (newHomePosition <= this.homeStretchLength - 1) {
          validMoves.push({
            pieceId: piece.id,
            type: newHomePosition === this.homeStretchLength - 1 ? 'reachHome' : 'homeStretch',
            from: piece.homeStretchPosition,
            to: newHomePosition
          });
        }
      } else {
        // Regular board movement
        const newPosition = (piece.position + diceValue) % this.boardSize;
        
        // Check if move is valid (not blocked by own piece)
        if (!this.isPositionBlocked(newPosition, playerIndex)) {
          validMoves.push({
            pieceId: piece.id,
            type: 'regular',
            from: piece.position,
            to: newPosition
          });
        }
      }
    });

    return validMoves;
  }

  checkCapture(position, attackingPlayerIndex) {
    // Check if position is safe
    if (this.safePositions.includes(position)) {
      return null;
    }

    // Check if there's an opponent piece at this position
    for (let i = 0; i < this.gameState.players.length; i++) {
      if (i === attackingPlayerIndex) continue;
      
      const player = this.gameState.players[i];
      const piece = player.pieces.find(p => 
        p.position === position && 
        !p.isInHomeStretch && 
        !p.isHome
      );
      
      if (piece) {
        return {
          playerIndex: i,
          pieceId: piece.id,
          position
        };
      }
    }

    return null;
  }

  executeCapture(capturedPiece, attackingPlayerIndex) {
    const capturedPlayer = this.gameState.players[capturedPiece.playerIndex];
    const piece = capturedPlayer.pieces.find(p => p.id === capturedPiece.pieceId);
    
    if (piece) {
      // Send piece back to base
      piece.position = -1;
      piece.isInHomeStretch = false;
      piece.homeStretchPosition = -1;
      
      // Record capture
      this.gameState.capturedPieces.push({
        capturedBy: attackingPlayerIndex,
        capturedFrom: capturedPiece.playerIndex,
        pieceId: capturedPiece.pieceId,
        position: capturedPiece.position,
        timestamp: new Date()
      });
    }
  }

  isPositionBlocked(position, playerIndex) {
    // Check if position is blocked by own piece
    const player = this.gameState.players[playerIndex];
    return player.pieces.some(p => 
      p.position === position && 
      !p.isInHomeStretch && 
      !p.isHome
    );
  }

  isEnteringHomeStretch(from, to, playerIndex) {
    const player = this.gameState.players[playerIndex];
    const homeEntryPosition = (player.startPosition + 51) % this.boardSize;
    
    // Check if crossing the home entry point
    if (from < homeEntryPosition && to >= homeEntryPosition) {
      return true;
    }
    
    // Check wrap-around case
    if (from > to && (to >= homeEntryPosition || from < homeEntryPosition)) {
      return true;
    }
    
    return false;
  }

  updateBoard() {
    // Clear board
    this.gameState.board = Array(this.boardSize).fill(null);
    
    // Place all pieces on board
    this.gameState.players.forEach(player => {
      player.pieces.forEach(piece => {
        if (piece.position >= 0 && !piece.isInHomeStretch && !piece.isHome) {
          this.gameState.board[piece.position] = {
            playerIndex: player.id,
            pieceId: piece.id,
            color: player.color
          };
        }
      });
    });
  }

  switchTurn() {
    this.gameState.currentPlayer = (this.gameState.currentPlayer + 1) % this.gameState.players.length;
    this.gameState.dice = 0;
    this.gameState.diceRolled = false;
    this.gameState.canRollAgain = false;
    this.gameState.turnCount++;
  }

  checkWinner() {
    for (let i = 0; i < this.gameState.players.length; i++) {
      const player = this.gameState.players[i];
      const allPiecesHome = player.pieces.every(piece => piece.isHome);
      
      if (allPiecesHome) {
        return {
          playerIndex: i,
          player: player,
          reason: 'all_pieces_home',
          turnCount: this.gameState.turnCount
        };
      }
    }
    
    return null;
  }

  getPlayerIndex(userId) {
    // This should be properly implemented based on user-game mapping
    // For now, returning current player as placeholder
    return this.gameState.currentPlayer;
  }

  getGameState() {
    return {
      ...this.gameState,
      boardSize: this.boardSize,
      safePositions: this.safePositions,
      homeStretchLength: this.homeStretchLength
    };
  }

  // Helper method for AI or auto-play
  getBestMove(playerIndex, diceValue) {
    const validMoves = this.getValidMoves(playerIndex, diceValue);
    
    if (validMoves.length === 0) {
      return null;
    }

    // Prioritize moves in this order:
    // 1. Reach home
    // 2. Capture opponent piece
    // 3. Leave base (if dice is 6)
    // 4. Enter home stretch
    // 5. Regular move (furthest from home)
    
    validMoves.sort((a, b) => {
      // Priority 1: Reach home
      if (a.type === 'reachHome' && b.type !== 'reachHome') return -1;
      if (b.type === 'reachHome' && a.type !== 'reachHome') return 1;
      
      // Priority 2: Capture
      if (a.captured && !b.captured) return -1;
      if (b.captured && !a.captured) return 1;
      
      // Priority 3: Leave base
      if (a.type === 'leaveBase' && b.type !== 'leaveBase') return -1;
      if (b.type === 'leaveBase' && a.type !== 'leaveBase') return 1;
      
      // Priority 4: Enter home stretch
      if (a.type === 'enterHomeStretch' && b.type !== 'enterHomeStretch') return -1;
      if (b.type === 'enterHomeStretch' && a.type !== 'enterHomeStretch') return 1;
      
      // Priority 5: Regular move (prefer pieces closer to home)
      if (a.type === 'regular' && b.type === 'regular') {
        return b.to - a.to; // Higher position number = closer to home
      }
      
      return 0;
    });

    return validMoves[0];
  }
}

module.exports = LudoGame;
