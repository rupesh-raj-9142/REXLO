import React from 'react';
import { Trophy, Medal, Award, Crown } from 'lucide-react';

const Leaderboard = () => {
  const leaderboardData = [
    { rank: 1, username: "ProGamer", gamesWon: 145, totalWinnings: 2500, winRate: 78.5, avatar: "crown" },
    { rank: 2, username: "Champion99", gamesWon: 132, totalWinnings: 2200, winRate: 75.2, avatar: "medal" },
    { rank: 3, username: "MasterPlayer", gamesWon: 128, totalWinnings: 2000, winRate: 72.8, avatar: "award" },
    { rank: 4, username: "GameLegend", gamesWon: 115, totalWinnings: 1800, winRate: 69.4, avatar: "trophy" },
    { rank: 5, username: "SkillMaster", gamesWon: 108, totalWinnings: 1650, winRate: 67.1, avatar: "trophy" },
    { rank: 6, username: "ExpertGamer", gamesWon: 95, totalWinnings: 1400, winRate: 64.2, avatar: "trophy" },
    { rank: 7, username: "TopPlayer", gamesWon: 88, totalWinnings: 1200, winRate: 61.8, avatar: "trophy" },
    { rank: 8, username: "ProWinner", gamesWon: 82, totalWinnings: 1050, winRate: 59.3, avatar: "trophy" },
  ];

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return <Crown className="h-6 w-6 text-yellow-400" />;
      case 2: return <Medal className="h-6 w-6 text-gray-300" />;
      case 3: return <Award className="h-6 w-6 text-orange-600" />;
      default: return <Trophy className="h-6 w-6 text-accent-400" />;
    }
  };

  const getRankColor = (rank) => {
    switch(rank) {
      case 1: return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/30";
      case 2: return "bg-gradient-to-r from-gray-500/20 to-gray-600/20 border-gray-500/30";
      case 3: return "bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-orange-500/30";
      default: return "bg-gray-800/50 border-gray-700/50";
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            <Trophy className="inline-block h-8 w-8 text-yellow-400 mr-3" />
            Global Leaderboard
          </h1>
          <p className="text-gray-400 text-lg">Top players competing for the ultimate prize</p>
        </div>

        {/* Top 3 Players */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {leaderboardData.slice(0, 3).map((player, index) => (
            <div key={player.rank} className={`card p-8 text-center ${getRankColor(player.rank)}`}>
              <div className="mb-6">
                {getRankIcon(player.rank)}
              </div>
              <div className="w-20 h-20 bg-gradient-to-r from-accent-400 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">
                  {player.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{player.username}</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Games Won</span>
                  <span className="text-white font-medium">{player.gamesWon}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Win Rate</span>
                  <span className="text-green-400 font-medium">{player.winRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Won</span>
                  <span className="text-yellow-400 font-medium">${player.totalWinnings}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Full Leaderboard */}
        <div className="card">
          <h2 className="text-2xl font-bold text-white mb-6">Complete Rankings</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Rank</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Player</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Games Won</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Win Rate</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Total Won</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((player) => (
                  <tr key={player.rank} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {getRankIcon(player.rank)}
                        <span className="text-white font-medium">#{player.rank}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-accent-400 to-accent-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-white">
                            {player.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-white font-medium">{player.username}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-white font-medium">{player.gamesWon}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-green-400 font-medium">{player.winRate}%</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-yellow-400 font-medium">${player.totalWinnings}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Your Rank */}
        <div className="mt-8">
          <div className="card bg-gradient-to-r from-accent-500/20 to-accent-600/20 border-accent-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold text-accent-400">#15</div>
                <div>
                  <h3 className="text-white font-semibold">Your Current Rank</h3>
                  <p className="text-gray-400">Keep playing to climb the leaderboard!</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Next: #14</p>
                <p className="text-accent-400 font-medium">50 points to go</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
