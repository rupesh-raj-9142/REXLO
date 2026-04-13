import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const CarromGame = ({ matchId, userId, onExit }) => {
  const [gameState, setGameState] = useState(null);
  const [strikerPos, setStrikerPos] = useState({ x: 200, y: 400 });
  const [isAiming, setIsAiming] = useState(false);
  const [aimAngle, setAimAngle] = useState(0);
  const [power, setPower] = useState(0);

  useEffect(() => {
    socket.emit('join-game', { matchId, userId, gameType: 'carrom' });

    socket.on('game-state', (state) => {
      setGameState(state);
      setStrikerPos(state.striker);
    });

    socket.on('game-updated', (state) => {
      setGameState(state);
      setStrikerPos(state.striker);
    });

    socket.on('game-finished', (winner) => {
      alert(`${winner} wins!`);
      onExit();
    });

    return () => {
      socket.off('game-state');
      socket.off('game-updated');
      socket.off('game-finished');
    };
  }, [matchId, userId]);

  const handleBoardClick = (e) => {
    if (gameState?.currentPlayer !== userId || gameState?.state !== 'aiming') return;
    
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    socket.emit('set-striker', { matchId, userId, x, y });
    setStrikerPos({ x, y });
    setIsAiming(true);
  };

  const handleMouseMove = (e) => {
    if (!isAiming || gameState?.currentPlayer !== userId) return;
    
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const angle = Math.atan2(y - strikerPos.y, x - strikerPos.x);
    setAimAngle(angle);
  };

  const handleMouseUp = (e) => {
    if (!isAiming || gameState?.currentPlayer !== userId) return;
    
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const distance = Math.hypot(x - strikerPos.x, y - strikerPos.y);
    const clampedPower = Math.min(distance / 100, 1) * 20;
    
    const vx = Math.cos(aimAngle) * clampedPower;
    const vy = Math.sin(aimAngle) * clampedPower;
    
    socket.emit('shoot-striker', { matchId, userId, vx, vy });
    setIsAiming(false);
    setPower(0);
  };

  const renderBoard = () => {
    return (
      <div
        className="relative w-[400px] h-[400px] bg-gradient-to-br from-amber-700 to-amber-900 rounded-lg shadow-2xl cursor-crosshair"
        onClick={handleBoardClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Board border */}
        <div className="absolute inset-2 border-4 border-amber-950 rounded-lg">
          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-4 border-amber-950 rounded-full bg-amber-600" />
          
          {/* Pockets */}
          {gameState?.board?.pockets.map((pocket, i) => (
            <div
              key={i}
              className="absolute w-10 h-10 bg-black rounded-full"
              style={{
                left: pocket.x - 20,
                top: pocket.y - 20
              }}
            />
          ))}

          {/* Coins */}
          {gameState?.board?.coins.map((coin) => {
            if (!coin.active) return null;
            
            const color = coin.type === 'queen' ? 'bg-red-500' : 
                         coin.type === 'white' ? 'bg-white' : 'bg-black';
            const border = coin.type === 'black' ? 'border-gray-400' : 'border-transparent';
            
            return (
              <motion.div
                key={coin.id}
                className={`absolute w-5 h-5 rounded-full ${color} ${border} border-2`}
                style={{
                  left: coin.x - 10,
                  top: coin.y - 10
                }}
                animate={{
                  x: 0,
                  y: 0
                }}
              />
            );
          })}

          {/* Striker */}
          <motion.div
            className="absolute w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 border-2 border-yellow-800 shadow-lg"
            style={{
              left: strikerPos.x - 14,
              top: strikerPos.y - 14
            }}
          />

          {/* Aim line */}
          {isAiming && (
            <svg className="absolute inset-0 pointer-events-none">
              <line
                x1={strikerPos.x}
                y1={strikerPos.y}
                x2={strikerPos.x + Math.cos(aimAngle) * 100}
                y2={strikerPos.y + Math.sin(aimAngle) * 100}
                stroke="rgba(255, 255, 255, 0.5)"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            </svg>
          )}

          {/* Power indicator */}
          {isAiming && (
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded">
              Power: {Math.round(power * 100)}%
            </div>
          )}
        </div>

        {/* Baseline */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-amber-950 border-t-2 border-amber-800" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-cyan-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">Carrom</h2>
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
              {gameState.scores?.[player] && (
                <div className="text-sm">
                  W: {gameState.scores[player].white} B: {gameState.scores[player].black}
                  {gameState.scores[player].queen > 0 && ' 👑'}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Turn indicator */}
        <div className="text-center mb-4 text-white">
          {gameState?.currentPlayer === userId ? (
            <p className="text-xl font-bold text-green-400">Your turn! Click to aim, drag to set power</p>
          ) : (
            <p className="text-xl">Waiting for opponent...</p>
          )}
        </div>

        {/* Board */}
        {renderBoard()}

        {/* Instructions */}
        <div className="mt-6 text-white/80 text-sm">
          <p>• Click on baseline to position striker</p>
          <p>• Drag to aim and set power</p>
          <p>• Release to shoot</p>
          <p>• Pocket coins to score points</p>
          <p>• Queen (red) + 8 coins to win</p>
        </div>
      </div>
    </div>
  );
};

export default CarromGame;
