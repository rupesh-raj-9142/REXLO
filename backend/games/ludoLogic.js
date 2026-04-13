// Ludo Game Logic
class LudoGame {
  constructor(gameId, players) {
    this.gameId = gameId;
    this.players = players; // Array of player IDs
    this.currentPlayer = 0;
    this.diceValue = null;
    this.state = 'waiting'; // waiting, rolling, moving, finished
    this.pieces = this.initializePieces();
    this.winner = null;
  }

  initializePieces() {
    const pieces = {};
    const colors = ['red', 'green', 'yellow', 'blue'];
    this.players.forEach((playerId, index) => {
      pieces[playerId] = {
        color: colors[index],
        pieces: [
          { id: 0, position: -1, isHome: false },
          { id: 1, position: -1, isHome: false },
          { id: 2, position: -1, isHome: false },
          { id: 3, position: -1, isHome: false }
        ],
        homePieces: 4,
        finishedPieces: 0
      };
    });
    return pieces;
  }

  rollDice() {
    this.diceValue = Math.floor(Math.random() * 6) + 1;
    return this.diceValue;
  }

  canMove(playerId, pieceId) {
    const playerPieces = this.pieces[playerId];
    const piece = playerPieces.pieces[pieceId];

    // If piece is at home, need 6 to start
    if (piece.position === -1) {
      return this.diceValue === 6;
    }

    // If piece is already home, can't move
    if (piece.isHome) {
      return false;
    }

    return true;
  }

  movePiece(playerId, pieceId) {
    if (!this.canMove(playerId, pieceId)) {
      return { success: false, message: 'Cannot move this piece' };
    }

    const playerPieces = this.pieces[playerId];
    const piece = playerPieces.pieces[pieceId];

    // If piece is at home and dice is 6, move to starting position
    if (piece.position === -1 && this.diceValue === 6) {
      piece.position = this.getStartPosition(playerId);
      playerPieces.homePieces--;
      return { success: true, piece, position: piece.position };
    }

    // Move piece
    const newPosition = (piece.position + this.diceValue) % 52;
    piece.position = newPosition;

    // Check if piece reached home
    if (this.isHomePosition(playerId, newPosition)) {
      piece.isHome = true;
      playerPieces.finishedPieces++;
      
      // Check if player won
      if (playerPieces.finishedPieces === 4) {
        this.winner = playerId;
        this.state = 'finished';
      }
    }

    return { success: true, piece, position: piece.position };
  }

  getStartPosition(playerId) {
    // Each color has different starting position on the board
    const startPositions = [0, 13, 26, 39]; // Red, Green, Yellow, Blue
    const playerIndex = this.players.indexOf(playerId);
    return startPositions[playerIndex];
  }

  isHomePosition(playerId, position) {
    // Check if position is in home stretch for this player
    const homeStretches = [
      [50, 51, 52, 53, 54], // Red home
      [11, 12, 13, 14, 15], // Green home
      [24, 25, 26, 27, 28], // Yellow home
      [37, 38, 39, 40, 41]  // Blue home
    ];
    const playerIndex = this.players.indexOf(playerId);
    return homeStretches[playerIndex].includes(position);
  }

  checkCapture(playerId, position) {
    // Check if another player's piece is at this position
    for (const otherPlayerId of this.players) {
      if (otherPlayerId === playerId) continue;
      
      const otherPieces = this.pieces[otherPlayerId].pieces;
      for (const piece of otherPieces) {
        if (piece.position === position && !piece.isHome && piece.position !== -1) {
          // Capture the piece
          piece.position = -1;
          this.pieces[otherPlayerId].homePieces++;
          return { captured: true, capturedPlayer: otherPlayerId, piece };
        }
      }
    }
    return { captured: false };
  }

  nextTurn() {
    this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
    this.diceValue = null;
  }

  getGameState() {
    return {
      gameId: this.gameId,
      currentPlayer: this.players[this.currentPlayer],
      diceValue: this.diceValue,
      state: this.state,
      pieces: this.pieces,
      winner: this.winner
    };
  }
}

module.exports = LudoGame;
