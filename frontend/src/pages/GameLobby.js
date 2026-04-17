import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Users, Trophy, Clock, Plus } from 'lucide-react';

const GameLobby = () => {
  const mockGames = [
    {
      id: '1',
      name: 'Ludo',
      roomCode: 'ABC123',
      players: 2,
      maxPlayers: 4,
      entryFee: 10,
      prizePool: 40,
      status: 'waiting',
      createdBy: 'Player1'
    },
    {
      id: '2',
      name: 'Carrom',
      roomCode: 'XYZ789',
      players: 3,
      maxPlayers: 4,
      entryFee: 25,
      prizePool: 100,
      status: 'waiting',
      createdBy: 'Player2'
    }
  ];

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Game Lobby</h1>
            <p className="text-gray-400">Join existing games or create your own</p>
          </div>
          <Link
            to="/create-game"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create Game</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockGames.map((game) => (
            <div key={game.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-accent-400 to-accent-600 rounded-lg flex items-center justify-center">
                    <Gamepad2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{game.name}</h3>
                    <p className="text-sm text-gray-400">Room: {game.roomCode}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                  {game.status}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-400">
                      {game.players}/{game.maxPlayers} Players
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-yellow-400">${game.prizePool}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Entry: ${game.entryFee}</span>
                  <span className="text-sm text-gray-400">by {game.createdBy}</span>
                </div>
              </div>

              <Link
                to={`/game/${game.id}`}
                className="btn-primary w-full py-2"
              >
                Join Game
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameLobby;
