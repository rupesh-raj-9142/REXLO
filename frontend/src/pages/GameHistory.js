import React from 'react';
import { Gamepad2, Trophy, Clock, TrendingUp, Filter } from 'lucide-react';

const GameHistory = () => {
  const gameHistory = [
    {
      id: 1,
      game: 'Ludo',
      date: '2024-01-15',
      time: '14:30',
      result: 'won',
      entryFee: 25,
      winnings: 100,
      duration: '15 min',
      players: ['You', 'Player2', 'Player3', 'Player4']
    },
    {
      id: 2,
      game: 'Carrom',
      date: '2024-01-15',
      time: '12:15',
      result: 'lost',
      entryFee: 50,
      winnings: 0,
      duration: '20 min',
      players: ['You', 'Player1', 'Player2']
    },
    {
      id: 3,
      game: 'Ludo',
      date: '2024-01-14',
      time: '18:45',
      result: 'won',
      entryFee: 10,
      winnings: 40,
      duration: '12 min',
      players: ['You', 'Player1', 'Player2']
    }
  ];

  const getResultColor = (result) => {
    return result === 'won' ? 'text-green-400' : 'text-red-400';
  };

  const getResultBg = (result) => {
    return result === 'won' ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30';
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Game History</h1>
            <p className="text-gray-400">View your past games and performance</p>
          </div>
          <button className="btn-secondary flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter</span>
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <Gamepad2 className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">25</span>
            </div>
            <p className="text-gray-400 text-sm">Total Games</p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="h-8 w-8 text-green-400" />
              <span className="text-2xl font-bold text-white">15</span>
            </div>
            <p className="text-gray-400 text-sm">Games Won</p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8 text-yellow-400" />
              <span className="text-2xl font-bold text-white">60%</span>
            </div>
            <p className="text-gray-400 text-sm">Win Rate</p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">$500</span>
            </div>
            <p className="text-gray-400 text-sm">Total Won</p>
          </div>
        </div>

        {/* Game History Table */}
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-6">Recent Games</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Game</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Date & Time</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Result</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Entry Fee</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Winnings</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Duration</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Players</th>
                </tr>
              </thead>
              <tbody>
                {gameHistory.map((game) => (
                  <tr key={game.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Gamepad2 className="h-5 w-5 text-accent-400" />
                        <span className="text-white font-medium">{game.game}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-white text-sm">{game.date}</p>
                        <p className="text-gray-400 text-xs">{game.time}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getResultBg(game.result)} ${getResultColor(game.result)}`}>
                        {game.result === 'won' ? 'Won' : 'Lost'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-white">${game.entryFee}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={game.winnings > 0 ? 'text-green-400' : 'text-gray-400'}>
                        ${game.winnings}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-white text-sm">{game.duration}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {game.players.map((player, index) => (
                          <span 
                            key={index} 
                            className={`px-2 py-1 rounded text-xs ${
                              player === 'You' 
                                ? 'bg-accent-500/20 text-accent-400' 
                                : 'bg-gray-700 text-gray-400'
                            }`}
                          >
                            {player}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="mt-8 card">
          <h2 className="text-xl font-semibold text-white mb-6">Performance Overview</h2>
          <div className="h-64 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-accent-400 mx-auto mb-4" />
              <p className="text-gray-400">Performance chart coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameHistory;
