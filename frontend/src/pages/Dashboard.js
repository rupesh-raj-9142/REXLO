import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  Wallet, 
  Gamepad2, 
  Trophy, 
  TrendingUp, 
  Users, 
  Clock,
  Play,
  Plus,
  ArrowRight
} from 'lucide-react';

const Dashboard = () => {
  const { user, refreshUser } = useAuthStore();
  const [stats, setStats] = useState({
    balance: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    totalWinnings: 0,
    winRate: 0
  });
  const [recentGames, setRecentGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        await refreshUser();
        // Mock data for now
        setStats({
          balance: user?.balance || 0,
          gamesPlayed: user?.gamesPlayed || 0,
          gamesWon: user?.gamesWon || 0,
          totalWinnings: user?.totalWinnings || 0,
          winRate: user?.gamesPlayed > 0 ? ((user?.gamesWon / user?.gamesPlayed) * 100).toFixed(1) : 0
        });
        
        setRecentGames([
          {
            id: 1,
            name: 'Ludo',
            status: 'completed',
            result: 'won',
            amount: 50,
            date: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          {
            id: 2,
            name: 'Carrom',
            status: 'completed',
            result: 'lost',
            amount: 25,
            date: new Date(Date.now() - 5 * 60 * 60 * 1000)
          }
        ]);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user, refreshUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-400">
            Ready to play and win today?
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">${stats.balance}</span>
            </div>
            <h3 className="text-gray-400 text-sm">Wallet Balance</h3>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Gamepad2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.gamesPlayed}</span>
            </div>
            <h3 className="text-gray-400 text-sm">Games Played</h3>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.gamesWon}</span>
            </div>
            <h3 className="text-gray-400 text-sm">Games Won</h3>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.winRate}%</span>
            </div>
            <h3 className="text-gray-400 text-sm">Win Rate</h3>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="card mb-6">
              <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  to="/games"
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-accent-500/20 to-accent-600/20 border border-accent-500/30 rounded-lg hover:border-accent-500/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-accent-500 rounded-lg flex items-center justify-center">
                      <Play className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Play Games</h3>
                      <p className="text-gray-400 text-sm">Join a game now</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-accent-400" />
                </Link>

                <Link
                  to="/wallet"
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg hover:border-green-500/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <Plus className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Add Money</h3>
                      <p className="text-gray-400 text-sm">Top up wallet</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-green-400" />
                </Link>

                <Link
                  to="/lobby"
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg hover:border-blue-500/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Game Lobby</h3>
                      <p className="text-gray-400 text-sm">Browse games</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-blue-400" />
                </Link>

                <Link
                  to="/leaderboard"
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg hover:border-yellow-500/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Leaderboard</h3>
                      <p className="text-gray-400 text-sm">View rankings</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-yellow-400" />
                </Link>
              </div>
            </div>

            {/* Recent Games */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Recent Games</h2>
                <Link to="/history" className="text-accent-400 hover:text-accent-300 text-sm">
                  View All
                </Link>
              </div>
              
              {recentGames.length > 0 ? (
                <div className="space-y-4">
                  {recentGames.map((game) => (
                    <div key={game.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          game.result === 'won' ? 'bg-green-500/20' : 'bg-red-500/20'
                        }`}>
                          <Gamepad2 className={`h-5 w-5 ${
                            game.result === 'won' ? 'text-green-400' : 'text-red-400'
                          }`} />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{game.name}</h3>
                          <p className="text-gray-400 text-sm">
                            {game.result === 'won' ? 'Won' : 'Lost'} · ${game.amount}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          game.result === 'won' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {game.result === 'won' ? '+' : '-'}${game.amount}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {new Date(game.date).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Gamepad2 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No games played yet</p>
                  <Link
                    to="/games"
                    className="btn-primary mt-4 inline-flex items-center space-x-2"
                  >
                    <Play className="h-4 w-4" />
                    <span>Play Your First Game</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Active Games */}
            <div className="card">
              <h2 className="text-xl font-semibold text-white mb-4">Active Games</h2>
              <div className="text-center py-6">
                <Clock className="h-8 w-8 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No active games</p>
                <Link
                  to="/lobby"
                  className="btn-primary mt-4 inline-flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Join Game</span>
                </Link>
              </div>
            </div>

            {/* Achievements */}
            <div className="card">
              <h2 className="text-xl font-semibold text-white mb-4">Achievements</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">First Win</p>
                    <p className="text-gray-500 text-xs">Win your first game</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 opacity-50">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Win Streak</p>
                    <p className="text-gray-500 text-xs">Win 5 games in a row</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
