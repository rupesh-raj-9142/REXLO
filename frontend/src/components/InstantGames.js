import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  Gamepad2, 
  Clock, 
  DollarSign, 
  Trophy, 
  Zap,
  Play,
  Timer
} from 'lucide-react';

const InstantGames = () => {
  const { user, token } = useAuthStore();
  const [activeGames, setActiveGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gameType, setGameType] = useState('carrom');
  const [entryFee, setEntryFee] = useState(50);

  // Fetch active games
  useEffect(() => {
    fetchActiveGames();
  }, []);

  const fetchActiveGames = async () => {
    try {
      const response = await fetch('/api/instant/available', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setActiveGames(data.games);
      }
    } catch (error) {
      console.error('Failed to fetch active games:', error);
    }
  };

  // Start new instant game
  const startInstantGame = async () => {
    if (!entryFee || entryFee < 10 || entryFee > 1000) {
      alert('Entry fee must be between $10 and $1000');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/instant/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          gameType,
          entryFee
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Game started! Win within 1 hour to earn $${entryFee * 2}!`);
        fetchActiveGames(); // Refresh games list
      } else {
        alert(data.error || 'Failed to start game');
      }
    } catch (error) {
      console.error('Start game error:', error);
      alert('Failed to start game');
    } finally {
      setLoading(false);
    }
  };

  // Format time remaining
  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 gaming-title">
            Instant Gaming Arena
          </h1>
          <p className="text-gray-400 text-lg">
            Start playing instantly! Win within 1 hour and get 2x your entry fee!
          </p>
        </div>

        {/* Game Creation */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Gamepad2 className="h-6 w-6 mr-2 text-purple-400" />
            Start New Game
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Game Type Selection */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Game Type
              </label>
              <select
                value={gameType}
                onChange={(e) => setGameType(e.target.value)}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="carrom">Carrom</option>
                <option value="ludo">Ludo</option>
              </select>
            </div>

            {/* Entry Fee */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Entry Fee ($)
              </label>
              <input
                type="number"
                min="10"
                max="1000"
                step="10"
                value={entryFee}
                onChange={(e) => setEntryFee(parseInt(e.target.value))}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
              <p className="text-gray-400 text-sm mt-1">
                Prize Pool: ${entryFee * 2}
              </p>
            </div>

            {/* Start Button */}
            <div className="flex items-end">
              <button
                onClick={startInstantGame}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Timer className="h-5 w-5 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Start Game
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Active Games */}
        {activeGames.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Clock className="h-6 w-6 mr-2 text-blue-400" />
              Your Active Games
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeGames.map((game) => (
                <div key={game.gameId} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-white capitalize">
                        {game.gameType}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Game ID: {game.gameId}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold">
                        ${game.prizePool}
                      </div>
                      <div className="text-gray-400 text-sm">
                        Prize Pool
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Entry Fee:</span>
                      <span className="text-yellow-400 font-medium">${game.entryFee}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Time Left:</span>
                      <span className={`font-medium ${
                        game.timeRemaining < 60000 ? 'text-red-400' : 'text-blue-400'
                      }`}>
                        {formatTime(game.timeRemaining)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Status:</span>
                      <span className={`font-medium ${
                        game.isExpired ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {game.isExpired ? 'Expired' : 'Active'}
                      </span>
                    </div>
                  </div>

                  {!game.isExpired && (
                    <button
                      onClick={() => window.location.href = `/games/${game.gameType}/${game.gameId}`}
                      className="w-full mt-3 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Continue Playing
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-400" />
            How to Play
          </h3>
          <div className="space-y-3 text-gray-300">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3 flex-shrink-0">
                1
              </div>
              <p>Choose your game type and set entry fee (minimum $10, maximum $1000)</p>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3 flex-shrink-0">
                2
              </div>
              <p>Click "Start Game" to begin playing instantly</p>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3 flex-shrink-0">
                3
              </div>
              <p>Win within 1 hour to earn 2x your entry fee instantly!</p>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold mr-3 flex-shrink-0">
                ✓
              </div>
              <p>All winnings are added to your wallet immediately</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstantGames;
