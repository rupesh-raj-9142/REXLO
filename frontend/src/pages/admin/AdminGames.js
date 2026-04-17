import React from 'react';
import { Search, Filter, Eye, Gamepad2, Users, Trophy, Clock } from 'lucide-react';

const AdminGames = () => {
  const games = [
    {
      id: 1,
      name: 'Ludo',
      roomCode: 'ABC123',
      status: 'playing',
      players: 4,
      maxPlayers: 4,
      entryFee: 25,
      prizePool: 100,
      createdBy: 'player123',
      createdAt: '2024-01-15 14:30',
      duration: '5 min'
    },
    {
      id: 2,
      name: 'Carrom',
      roomCode: 'XYZ789',
      status: 'waiting',
      players: 2,
      maxPlayers: 4,
      entryFee: 50,
      prizePool: 200,
      createdBy: 'gamer456',
      createdAt: '2024-01-15 14:25',
      duration: '-'
    },
    {
      id: 3,
      name: 'Ludo',
      roomCode: 'DEF456',
      status: 'completed',
      players: 3,
      maxPlayers: 4,
      entryFee: 10,
      prizePool: 30,
      createdBy: 'user789',
      createdAt: '2024-01-15 13:45',
      duration: '12 min',
      winner: 'player123'
    }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'playing': return 'text-green-400';
      case 'waiting': return 'text-yellow-400';
      case 'completed': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status) => {
    switch(status) {
      case 'playing': return 'bg-green-500/20 border-green-500/30';
      case 'waiting': return 'bg-yellow-500/20 border-yellow-500/30';
      case 'completed': return 'bg-blue-500/20 border-blue-500/30';
      default: return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Game Management</h1>
            <p className="text-gray-400">Monitor and manage all platform games</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search games..."
                className="input pl-10 pr-4 py-2 w-64"
              />
            </div>
            <button className="btn-secondary flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Games Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Game</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Players</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Entry Fee</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Prize Pool</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Created By</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Created</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Duration</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game) => (
                  <tr key={game.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-accent-400 to-accent-600 rounded-lg flex items-center justify-center">
                          <Gamepad2 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{game.name}</p>
                          <p className="text-gray-400 text-sm">Room: {game.roomCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBg(game.status)} ${getStatusColor(game.status)}`}>
                        {game.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-white text-sm">{game.players}/{game.maxPlayers}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-white font-medium">${game.entryFee}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-yellow-400 font-medium">${game.prizePool}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-400 text-sm">{game.createdBy}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-400 text-sm">{game.createdAt}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-white text-sm">{game.duration}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded">
                          <Eye className="h-4 w-4" />
                        </button>
                        {game.status === 'playing' && (
                          <button className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded">
                            <Trophy className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <Gamepad2 className="h-8 w-8 text-green-400" />
              <span className="text-2xl font-bold text-white">23</span>
            </div>
            <p className="text-gray-400 text-sm">Active Games</p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">67</span>
            </div>
            <p className="text-gray-400 text-sm">Players Online</p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="h-8 w-8 text-yellow-400" />
              <span className="text-2xl font-bold text-white">156</span>
            </div>
            <p className="text-gray-400 text-sm">Games Today</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminGames;
