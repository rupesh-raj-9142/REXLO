import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Plus, Users, Trophy, Clock } from 'lucide-react';

const Games = () => {
  const availableGames = [
    {
      id: 'ludo',
      name: 'Ludo',
      description: 'Classic board game with modern twist. Roll the dice and race your pieces to home.',
      icon: 'dice',
      players: '2-4',
      entryFee: '$5 - $100',
      color: 'from-red-500 to-orange-500',
      rating: 4.8,
      reviews: 2341
    },
    {
      id: 'carrom',
      name: 'Carrom',
      description: 'Strike and pocket the carrom men. Use your skills to outsmart opponents.',
      icon: 'target',
      players: '2-4',
      entryFee: '$10 - $200',
      color: 'from-blue-500 to-purple-500',
      rating: 4.7,
      reviews: 1856
    }
  ];

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Choose Your Game</h1>
          <p className="text-gray-400">Select a game and start playing to win real money</p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {availableGames.map((game) => (
            <div key={game.id} className="card group hover:scale-105 transition-transform duration-300">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${game.color} rounded-xl flex items-center justify-center`}>
                    <Gamepad2 className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{game.name}</h2>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-4 w-4 ${i < Math.floor(game.rating) ? 'text-yellow-400' : 'text-gray-600'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-400">{game.rating} ({game.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-gray-400 mb-6 leading-relaxed">{game.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-accent-400" />
                  <div>
                    <p className="text-white font-medium">{game.players}</p>
                    <p className="text-gray-500 text-sm">Players</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-accent-400" />
                  <div>
                    <p className="text-white font-medium">{game.entryFee}</p>
                    <p className="text-gray-500 text-sm">Entry Fee</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Link
                  to={`/lobby?game=${game.id}`}
                  className="btn-primary flex-1 py-3 flex items-center justify-center space-x-2"
                >
                  <Users className="h-5 w-5" />
                  <span>Join Game</span>
                </Link>
                <Link
                  to={`/create-game?game=${game.id}`}
                  className="btn-secondary flex-1 py-3 flex items-center justify-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create Game</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* How to Play Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">How to Play</h2>
            <p className="text-gray-400 text-lg">Get started in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-accent-400 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Choose Your Game</h3>
              <p className="text-gray-400">Select from Ludo, Carrom, or other exciting games</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-accent-400 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Pay Entry Fee</h3>
              <p className="text-gray-400">Add money to your wallet and join games with entry fees</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-accent-400 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Play & Win</h3>
              <p className="text-gray-400">Compete with other players and win real cash prizes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Games;
