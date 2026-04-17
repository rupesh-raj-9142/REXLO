import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../../store/authStore';
import { 
  Circle, 
  Target, 
  MousePointer, 
  Trophy, 
  Users, 
  Clock,
  Zap,
  Crown
} from 'lucide-react';

const CarromGame = ({ gameId, onGameEnd }) => {
  const { user, token } = useAuthStore();
  const [gameState, setGameState] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isAiming, setIsAiming] = useState(false);
  const [aimPosition, setAimPosition] = useState({ x: 50, y: 80 });
  const [power, setPower] = useState(50);
  const [angle, setAngle] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [winner, setWinner] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [gameStats, setGameStats] = useState(null);
  
  const canvasRef = useRef(null);
  const boardRef = useRef(null);
  const animationRef = useRef(null);

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
        
        // Animate the move
        if (data.result) {
          animateMove(data.result);
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

  // Draw game board
  const drawBoard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameState) return;

    const ctx = canvas.getContext('2d');
    const boardSize = Math.min(canvas.width, canvas.height);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw board background
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 0, boardSize, boardSize);
    
    // Draw border
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, boardSize - 10, boardSize - 10);
    
    // Draw pockets
    const pockets = [
      { x: 0, y: 0 }, { x: boardSize / 2, y: 0 }, { x: boardSize, y: 0 },
      { x: 0, y: boardSize }, { x: boardSize / 2, y: boardSize }, { x: boardSize, y: boardSize }
    ];
    
    pockets.forEach(pocket => {
      ctx.beginPath();
      ctx.arc(pocket.x, pocket.y, 20, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
    
    // Draw coins
    if (gameState.coins) {
      // Black coins
      gameState.coins.black.forEach(coin => {
        if (coin.active) {
          drawCoin(ctx, coin.x * boardSize / 100, coin.y * boardSize / 100, '#000000', 8);
        }
      });
      
      // White coins
      gameState.coins.white.forEach(coin => {
        if (coin.active) {
          drawCoin(ctx, coin.x * boardSize / 100, coin.y * boardSize / 100, '#FFFFFF', 8);
        }
      });
      
      // Red coin (queen)
      if (gameState.coins.red && gameState.coins.red.active) {
        drawCoin(ctx, gameState.coins.red.x * boardSize / 100, gameState.coins.red.y * boardSize / 100, '#FF0000', 10);
      }
    }
    
    // Draw striker
    if (gameState.striker) {
      drawStriker(ctx, gameState.striker.x * boardSize / 100, gameState.striker.y * boardSize / 100);
    }
    
    // Draw aiming line
    if (isAiming && currentPlayer === getPlayerIndex()) {
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(aimPosition.x * boardSize / 100, aimPosition.y * boardSize / 100);
      
      const endX = aimPosition.x * boardSize / 100 + Math.cos(angle) * power * 2;
      const endY = aimPosition.y * boardSize / 100 + Math.sin(angle) * power * 2;
      
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [gameState, isAiming, aimPosition, angle, power, currentPlayer]);

  // Helper function to draw coins
  const drawCoin = (ctx, x, y, color, radius) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  // Helper function to draw striker
  const drawStriker = (ctx, x, y) => {
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD700';
    ctx.fill();
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  // Animate moves
  const animateMove = (result) => {
    // Implementation for smooth animations
    console.log('Animating move:', result);
  };

  // Handle mouse events for aiming
  const handleMouseDown = (e) => {
    if (currentPlayer !== getPlayerIndex()) return;
    
    const rect = boardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Check if clicking near striker area
    if (y > 70 && y < 90 && x > 10 && x < 90) {
      setIsAiming(true);
      setAimPosition({ x, y });
    }
  };

  const handleMouseMove = (e) => {
    if (!isAiming) return;
    
    const rect = boardRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
    const mouseY = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Calculate angle
    const dx = mouseX - aimPosition.x;
    const dy = mouseY - aimPosition.y;
    const newAngle = Math.atan2(dy, dx);
    setAngle(newAngle);
    
    // Calculate power based on distance
    const distance = Math.sqrt(dx * dx + dy * dy);
    setPower(Math.min(100, distance / 2));
  };

  const handleMouseUp = () => {
    if (!isAiming) return;
    
    // Make the shot
    makeShot();
    setIsAiming(false);
  };

  // Make a shot
  const makeShot = () => {
    if (!socket) return;
    
    socket.emit('gameMove', {
      strikerX: aimPosition.x,
      strikerY: aimPosition.y,
      velocity: power,
      angle,
      power
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

  // Render game stats
  const renderGameStats = () => {
    if (!gameState) return null;
    
    return (
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
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

  // Render player info
  const renderPlayerInfo = () => {
    if (!gameState) return null;
    
    return (
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <h3 className="text-white font-bold mb-2 flex items-center">
          <Users className="h-5 w-5 mr-2 text-blue-400" />
          Players
        </h3>
        <div className="space-y-2">
          {gameState.players.map((player, index) => (
            <div 
              key={index} 
              className={`flex items-center justify-between p-2 rounded ${
                index === currentPlayer ? 'bg-purple-600/20 border border-purple-500' : 'bg-gray-700'
              }`}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm mr-2">
                  {index + 1}
                </div>
                <span className="text-white">{player.username}</span>
                {index === currentPlayer && (
                  <Crown className="h-4 w-4 text-yellow-400 ml-2" />
                )}
              </div>
              <div className="text-gray-300 text-sm">
                Score: {gameState.scores?.[index] || 0}
              </div>
            </div>
          ))}
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

  useEffect(() => {
    drawBoard();
  }, [drawBoard]);

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
                <h2 className="text-2xl font-bold text-white">Carrom Game</h2>
                <div className="flex items-center space-x-4">
                  <div className="text-white">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Room: {gameId}
                  </div>
                  {currentPlayer === getPlayerIndex() && (
                    <div className="text-green-400 font-semibold">Your Turn!</div>
                  )}
                </div>
              </div>
              
              <div 
                ref={boardRef}
                className="relative bg-gray-900 rounded-lg overflow-hidden cursor-crosshair"
                style={{ paddingBottom: '100%' }}
              >
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={600}
                  className="absolute inset-0 w-full h-full"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={() => setIsAiming(false)}
                />
              </div>
              
              {/* Power indicator */}
              {isAiming && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm">Power:</span>
                    <span className="text-white text-sm">{Math.round(power)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-red-400 h-2 rounded-full transition-all"
                      style={{ width: `${power}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Side Panel */}
          <div className="space-y-4">
            {renderGameStats()}
            {renderPlayerInfo()}
            {renderChat()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarromGame;
