import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../../store/authStore';
import { 
  Dice1, 
  Dice2, 
  Dice3, 
  Dice4, 
  Dice5, 
  Dice6,
  Trophy, 
  Users, 
  Clock,
  Zap,
  Crown,
  Home,
  ArrowRight
} from 'lucide-react';

const LudoGame = ({ gameId, onGameEnd }) => {
  const { user, token } = useAuthStore();
  const [gameState, setGameState] = useState(null);
  const [socket, setSocket] = useState(null);
  const [diceValue, setDiceValue] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [winner, setWinner] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [gameStats, setGameStats] = useState(null);
  const [animatingPiece, setAnimatingPiece] = useState(null);
  
  const boardRef = useRef(null);

  // Dice icons mapping
  const diceIcons = {
    1: Dice1,
    2: Dice2,
    3: Dice3,
    4: Dice4,
    5: Dice5,
    6: Dice6
  };

  // Player colors
  const playerColors = ['red', 'blue', 'yellow', 'green'];
  const playerColorClasses = ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500'];

  // Initialize socket connection
  useEffect(() => {
    if (token && gameId) {
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        auth: { token }
      });

      newSocket.on('connect', () => {
        console.log('Connected to game server');
        newSocket.emit('joinGame', gameId);
      });

      newSocket.on('gameStarted', (data) => {
        setGameState(data.gameState);
        setCurrentPlayer(data.gameState.currentPlayer);
      });

      newSocket.on('gameUpdate', (data) => {
        setGameState(data.gameState);
        setCurrentPlayer(data.gameState.currentPlayer);
        
        // Handle move results
        if (data.result) {
          handleMoveResult(data.result);
        }
      });

      newSocket.on('gameEnded', (data) => {
        setWinner(data);
        if (onGameEnd) {
          onGameEnd(data);
        }
      });

      newSocket.on('playerJoined', (data) => {
        console.log('Player joined:', data);
      });

      newSocket.on('chatMessage', (message) => {
        setChatMessages(prev => [...prev, message]);
      });

      newSocket.on('error', (error) => {
        console.error('Game error:', error);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [token, gameId, onGameEnd]);

  // Handle move results
  const handleMoveResult = (result) => {
    if (result.action === 'rollDice') {
      setDiceValue(result.diceValue);
      setValidMoves(result.validMoves || []);
      setIsRolling(false);
    } else if (result.action === 'movePiece') {
      // Animate piece movement
      animatePieceMovement(result);
      setSelectedPiece(null);
      setValidMoves([]);
      setDiceValue(null);
    }
  };

  // Animate piece movement
  const animatePieceMovement = (moveResult) => {
    setAnimatingPiece({
      pieceId: moveResult.pieceId,
      from: moveResult.from,
      to: moveResult.to,
      playerIndex: currentPlayer
    });

    setTimeout(() => {
      setAnimatingPiece(null);
    }, 500);
  };

  // Roll dice
  const rollDice = () => {
    if (!socket || isRolling || currentPlayer !== getPlayerIndex()) return;
    
    setIsRolling(true);
    socket.emit('gameMove', {
      action: 'rollDice'
    });
  };

  // Move piece
  const movePiece = (pieceId) => {
    if (!socket || currentPlayer !== getPlayerIndex() || !diceValue) return;
    
    socket.emit('gameMove', {
      action: 'movePiece',
      pieceId,
      diceValue
    });
  };

  // Get current player index
  const getPlayerIndex = () => {
    if (!gameState || !user) return 0;
    return gameState.players.findIndex(p => p.userId === user._id);
  };

  // Send chat message
  const sendChatMessage = () => {
    if (!socket || !chatInput.trim()) return;
    
    socket.emit('chatMessage', chatInput);
    setChatInput('');
  };

  // Render Ludo board
  const renderBoard = () => {
    if (!gameState) return null;

    const boardSize = 15; // 15x15 grid
    const cells = [];

    // Create board cells
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        const position = row * boardSize + col;
        const isSafe = gameState.safePositions?.includes(position % 52);
        const hasPiece = gameState.board?.[position];
        
        let cellClass = 'w-8 h-8 border border-gray-600 flex items-center justify-center text-xs font-bold ';
        
        if (isSafe) {
          cellClass += 'bg-yellow-900/50 ';
        } else if ((row + col) % 2 === 0) {
          cellClass += 'bg-gray-700 ';
        } else {
          cellClass += 'bg-gray-800 ';
        }

        // Determine path color based on position
        if (position < 13) cellClass += 'border-red-400 ';
        else if (position < 26) cellClass += 'border-blue-400 ';
        else if (position < 39) cellClass += 'border-yellow-400 ';
        else if (position < 52) cellClass += 'border-green-400 ';

        cells.push(
          <div
            key={`${row}-${col}`}
            className={cellClass}
            onClick={() => handleCellClick(position)}
          >
            {renderCellContent(position, hasPiece)}
          </div>
        );
      }
    }

    return (
      <div className="grid grid-cols-15 gap-0 p-4 bg-gray-900 rounded-lg" style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}>
        {cells}
      </div>
    );
  };

  // Render cell content
  const renderCellContent = (position, piece) => {
    if (piece) {
      const playerIndex = piece.playerIndex;
      const colorClass = playerColorClasses[playerIndex];
      const isSelected = selectedPiece === piece.pieceId;
      const isAnimating = animatingPiece && animatingPiece.pieceId === piece.pieceId;
      
      return (
        <div 
          className={`w-6 h-6 rounded-full ${colorClass} border-2 border-white flex items-center justify-center text-white text-xs font-bold cursor-pointer
            ${isSelected ? 'ring-2 ring-yellow-400 scale-110' : ''}
            ${isAnimating ? 'animate-pulse' : ''}
            hover:scale-110 transition-transform`}
        >
          {piece.pieceId + 1}
        </div>
      );
    }

    // Show valid move indicators
    if (validMoves.some(move => move.to === position)) {
      return (
        <div className="w-6 h-6 rounded-full bg-green-400 animate-pulse cursor-pointer" />
      );
    }

    return null;
  };

  // Handle cell click
  const handleCellClick = (position) => {
    if (currentPlayer !== getPlayerIndex()) return;

    // Check if clicking on a valid move
    const validMove = validMoves.find(move => move.to === position);
    if (validMove) {
      movePiece(validMove.pieceId);
      return;
    }

    // Check if clicking on own piece
    const piece = gameState.board?.[position];
    if (piece && piece.playerIndex === getPlayerIndex()) {
      setSelectedPiece(piece.pieceId);
    }
  };

  // Render player bases and home stretches
  const renderPlayerAreas = () => {
    if (!gameState) return null;

    return (
      <div className="grid grid-cols-2 gap-4 mb-4">
        {gameState.players.map((player, index) => (
          <div key={index} className={`bg-gray-800 rounded-lg p-4 border-2 ${playerColorClasses[index].replace('bg-', 'border-')}`}>
            <h3 className="text-white font-bold mb-2 flex items-center">
              <div className={`w-6 h-6 rounded-full ${playerColorClasses[index]} mr-2`} />
              {player.username}
              {index === currentPlayer && <Crown className="h-4 w-4 text-yellow-400 ml-2" />}
            </h3>
            
            {/* Base pieces */}
            <div className="mb-2">
              <div className="text-gray-400 text-sm mb-1">Base:</div>
              <div className="grid grid-cols-2 gap-1">
                {player.pieces?.map((piece, pieceIndex) => (
                  piece.position === -1 && (
                    <div
                      key={pieceIndex}
                      className={`w-8 h-8 rounded-full ${playerColorClasses[index]} border-2 border-white flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:scale-110 transition-transform
                        ${selectedPiece === piece.id ? 'ring-2 ring-yellow-400' : ''}`}
                      onClick={() => setSelectedPiece(piece.id)}
                    >
                      {piece.id + 1}
                    </div>
                  )
                ))}
              </div>
            </div>
            
            {/* Home pieces */}
            <div>
              <div className="text-gray-400 text-sm mb-1">Home:</div>
              <div className="grid grid-cols-2 gap-1">
                {player.pieces?.map((piece, pieceIndex) => (
                  piece.isHome && (
                    <div
                      key={pieceIndex}
                      className={`w-8 h-8 rounded-full ${playerColorClasses[index]} border-2 border-yellow-400 flex items-center justify-center text-white text-xs font-bold`}
                    >
                      <Home className="h-4 w-4" />
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render dice component
  const renderDice = () => {
    const DiceIcon = diceValue ? diceIcons[diceValue] : Dice1;
    
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <h3 className="text-white font-bold mb-4">Dice</h3>
        
        <div className="mb-4">
          {isRolling ? (
            <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center animate-spin">
              <div className="text-white text-2xl">...</div>
            </div>
          ) : diceValue ? (
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white mx-auto">
              <DiceIcon className="w-12 h-12" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 mx-auto">
              <div className="text-4xl">?</div>
            </div>
          )}
        </div>
        
        {currentPlayer === getPlayerIndex() && (
          <button
            onClick={rollDice}
            disabled={isRolling || diceValue !== null}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRolling ? 'Rolling...' : 'Roll Dice'}
          </button>
        )}
      </div>
    );
  };

  // Render game stats
  const renderGameStats = () => {
    if (!gameState) return null;
    
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white font-bold mb-2 flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
          Game Stats
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-gray-300">
            <span className="text-gray-400">Turn:</span> {gameState.turnCount || 0}
          </div>
          <div className="text-gray-300">
            <span className="text-gray-400">Status:</span> {gameState.gameStarted ? 'Playing' : 'Waiting'}
          </div>
        </div>
      </div>
    );
  };

  // Render chat
  const renderChat = () => {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white font-bold mb-2 flex items-center">
          <Zap className="h-5 w-5 mr-2 text-green-400" />
          Chat
        </h3>
        <div className="h-32 overflow-y-auto mb-2 space-y-1">
          {chatMessages.map((msg, index) => (
            <div key={index} className="text-sm">
              <span className="text-purple-400 font-semibold">{msg.username}:</span>
              <span className="text-gray-300 ml-1">{msg.message}</span>
            </div>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-gray-700 text-white px-3 py-1 rounded-l text-sm"
          />
          <button
            onClick={sendChatMessage}
            className="bg-purple-600 text-white px-3 py-1 rounded-r text-sm hover:bg-purple-700"
          >
            Send
          </button>
        </div>
      </div>
    );
  };

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }

  if (winner) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">Game Over!</h2>
          <p className="text-xl text-gray-300 mb-4">
            {winner.winnerUsername} wins ${winner.winnerAmount}!
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Game Board */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Ludo Game</h2>
                <div className="flex items-center space-x-4">
                  <div className="text-white">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Room: {gameId}
                  </div>
                  {currentPlayer === getPlayerIndex() && (
                    <div className="text-green-400 font-semibold flex items-center">
                      <ArrowRight className="h-4 w-4 mr-1" />
                      Your Turn!
                    </div>
                  )}
                </div>
              </div>
              
              {/* Player Areas */}
              {renderPlayerAreas()}
              
              {/* Game Board */}
              {renderBoard()}
              
              {/* Valid moves indicator */}
              {validMoves.length > 0 && (
                <div className="mt-4 p-2 bg-green-900/30 border border-green-500 rounded">
                  <div className="text-green-400 text-sm">
                    Click on a highlighted position to move your piece
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Side Panel */}
          <div className="space-y-4">
            {renderDice()}
            {renderGameStats()}
            {renderChat()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LudoGame;
