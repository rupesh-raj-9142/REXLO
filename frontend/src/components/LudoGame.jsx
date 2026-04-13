import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const LudoGame = ({ matchId, userId, onExit }) => {
  const [gameState, setGameState] = useState(null);
  const [diceValue, setDiceValue] = useState(null);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    socket.emit('join-game', { matchId, userId, gameType: 'ludo' });

    socket.on('game-state', (state) => {
      setGameState(state);
      setDiceValue(state.diceValue);
    });

    socket.on('dice-rolled', (value) => {
      setDiceValue(value);
      setIsRolling(false);
    });

    socket.on('game-finished', (winner) => {
      alert(`${winner} wins!`);
      onExit();
    });

    return () => {
      socket.off('game-state');
      socket.off('dice-rolled');
      socket.off('game-finished');
    };
  }, [matchId, userId]);

  const rollDice = () => {
    if (gameState?.currentPlayer !== userId || isRolling) return;
    setIsRolling(true);
    socket.emit('roll-dice', { matchId, userId });
    
    // Animate dice
    let rollCount = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      if (rollCount > 10) {
        clearInterval(interval);
      }
    }, 100);
  };

  const movePiece = (pieceId) => {
    if (!diceValue || gameState?.currentPlayer !== userId) return;
    socket.emit('move-piece', { matchId, userId, pieceId, diceValue });
    setDiceValue(null);
    setSelectedPiece(null);
  };

  const renderBoard = () => {
    const colors = ['red', 'green', 'yellow', 'blue'];
    const boardSize = 400;
    const cellSize = boardSize / 15;

    return (
      <div className="relative w-[600px] h-[600px] bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Board Background */}
        <svg width="600" height="600" className="absolute inset-0">
          {/* Home bases */}
          {colors.map((color, i) => {
            const x = i < 2 ? i * 300 : (i === 2 ? 0 : 300);
            const y = i < 2 ? 0 : 300;
            return (
              <rect
                key={color}
                x={x}
                y={y}
                width="300"
                height="300"
                fill={color}
                opacity="0.3"
              />
            );
          })}
          
          {/* Cross paths */}
          <rect x="150" y="0" width="300" height="600" fill="white" />
          <rect x="0" y="150" width="600" height="300" fill="white" />
          
          {/* Center */}
          <rect x="150" y="150" width="300" height="300" fill="none" stroke="#333" strokeWidth="2" />
        </svg>

        {/* Render pieces */}
        {gameState?.pieces && Object.entries(gameState.pieces).map(([playerId, playerData]) => {
          const colorIndex = gameState.players.indexOf(playerId);
          const color = colors[colorIndex];
          
          return playerData.pieces.map((piece, i) => {
            if (piece.position === -1) {
              // Piece at home
              const homeX = colorIndex < 2 ? colorIndex * 300 + 75 : (colorIndex === 2 ? 75 : 375);
              const homeY = colorIndex < 2 ? 75 : (colorIndex === 2 ? 375 : 225);
              return (
                <motion.div
                  key={`${playerId}-${i}`}
                  className="absolute w-8 h-8 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: color,
                    left: homeX,
                    top: homeY,
                    transform: `translate(-50%, -50%)`
                  }}
                  onClick={() => userId === playerId && movePiece(i)}
                  whileHover={{ scale: 1.1 }}
                  animate={selectedPiece === i ? { scale: 1.2 } : {}}
                />
              );
            }
            
            // Piece on board
            const angle = (piece.position / 52) * 2 * Math.PI - Math.PI / 2;
            const radius = 200;
            const x = 300 + Math.cos(angle) * radius * 0.6;
            const y = 300 + Math.sin(angle) * radius * 0.6;
            
            return (
              <motion.div
                key={`${playerId}-${i}`}
                className="absolute w-8 h-8 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
                style={{
                  backgroundColor: color,
                  left: x,
                  top: y,
                  transform: `translate(-50%, -50%)`
                }}
                onClick={() => userId === playerId && movePiece(i)}
                whileHover={{ scale: 1.1 }}
                animate={selectedPiece === i ? { scale: 1.2 } : {}}
              />
            );
          });
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">Ludo</h2>
          <button
            onClick={onExit}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Exit
          </button>
        </div>

        {/* Player info */}
        <div className="flex gap-4 mb-6">
          {gameState?.players.map((player, i) => (
            <div
              key={player}
              className={`px-4 py-2 rounded-lg ${
                gameState.currentPlayer === player
                  ? 'bg-yellow-500 text-white'
                  : 'bg-white/20 text-white'
              }`}
            >
              {player === userId ? 'You' : `Player ${i + 1}`}
            </div>
          ))}
        </div>

        {/* Dice */}
        <div className="flex justify-center mb-6">
          <motion.button
            onClick={rollDice}
            disabled={gameState?.currentPlayer !== userId || isRolling}
            className={`w-20 h-20 rounded-2xl font-bold text-3xl ${
              gameState?.currentPlayer === userId && !isRolling
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 cursor-pointer'
                : 'bg-gray-400 cursor-not-allowed'
            } text-white shadow-xl`}
            whileHover={gameState?.currentPlayer === userId && !isRolling ? { scale: 1.1 } : {}}
            whileTap={gameState?.currentPlayer === userId && !isRolling ? { scale: 0.95 } : {}}
          >
            {diceValue || '🎲'}
          </motion.button>
        </div>

        {/* Board */}
        {renderBoard()}
      </div>
    </div>
  );
};

export default LudoGame;
