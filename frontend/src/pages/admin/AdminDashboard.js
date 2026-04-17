import React from 'react';
import { Users, Gamepad2, Wallet, TrendingUp, Eye, Ban, CheckCircle } from 'lucide-react';

const AdminDashboard = () => {
  const stats = {
    totalUsers: 1250,
    activeUsers: 342,
    blockedUsers: 15,
    totalGames: 5678,
    activeGames: 23,
    completedGames: 5655,
    totalRevenue: 15420,
    totalWinnings: 12350,
    profit: 3070,
    pendingWithdrawals: 8
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage users, games, and monitor platform performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">{stats.totalUsers}</span>
            </div>
            <h3 className="text-gray-400 text-sm">Total Users</h3>
            <div className="mt-2 text-sm">
              <span className="text-green-400">{stats.activeUsers} active</span>
              <span className="text-red-400 ml-2">{stats.blockedUsers} blocked</span>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <Gamepad2 className="h-8 w-8 text-green-400" />
              <span className="text-2xl font-bold text-white">{stats.totalGames}</span>
            </div>
            <h3 className="text-gray-400 text-sm">Total Games</h3>
            <div className="mt-2 text-sm">
              <span className="text-green-400">{stats.activeGames} active</span>
              <span className="text-gray-400 ml-2">{stats.completedGames} completed</span>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <Wallet className="h-8 w-8 text-yellow-400" />
              <span className="text-2xl font-bold text-white">${stats.totalRevenue}</span>
            </div>
            <h3 className="text-gray-400 text-sm">Total Revenue</h3>
            <div className="mt-2 text-sm">
              <span className="text-green-400">Profit: ${stats.profit}</span>
              <span className="text-gray-400 ml-2">Winnings: ${stats.totalWinnings}</span>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">{stats.pendingWithdrawals}</span>
            </div>
            <h3 className="text-gray-400 text-sm">Pending Withdrawals</h3>
            <div className="mt-2">
              <span className="text-orange-400 text-sm">Awaiting approval</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card hover:scale-105 transition-transform cursor-pointer">
            <Users className="h-8 w-8 text-blue-400 mb-3" />
            <h3 className="text-white font-semibold mb-2">Manage Users</h3>
            <p className="text-gray-400 text-sm">View, block, or unblock users</p>
          </div>
          <div className="card hover:scale-105 transition-transform cursor-pointer">
            <Gamepad2 className="h-8 w-8 text-green-400 mb-3" />
            <h3 className="text-white font-semibold mb-2">Monitor Games</h3>
            <p className="text-gray-400 text-sm">View active and completed games</p>
          </div>
          <div className="card hover:scale-105 transition-transform cursor-pointer">
            <Wallet className="h-8 w-8 text-yellow-400 mb-3" />
            <h3 className="text-white font-semibold mb-2">Withdrawals</h3>
            <p className="text-gray-400 text-sm">Approve or reject withdrawal requests</p>
          </div>
          <div className="card hover:scale-105 transition-transform cursor-pointer">
            <TrendingUp className="h-8 w-8 text-purple-400 mb-3" />
            <h3 className="text-white font-semibold mb-2">Analytics</h3>
            <p className="text-gray-400 text-sm">View revenue and user statistics</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-white text-sm">New user registered</p>
                    <p className="text-gray-500 text-xs">player123 - 2 mins ago</p>
                  </div>
                </div>
                <Eye className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Gamepad2 className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-white text-sm">Game completed</p>
                    <p className="text-gray-500 text-xs">Ludo - Room ABC123 - 5 mins ago</p>
                  </div>
                </div>
                <Eye className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Wallet className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="text-white text-sm">Withdrawal request</p>
                    <p className="text-gray-500 text-xs">$50 - user456 - 10 mins ago</p>
                  </div>
                </div>
                <Eye className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-6">System Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Database</span>
                <span className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400 text-sm">Healthy</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Game Server</span>
                <span className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400 text-sm">Online</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Payment Gateway</span>
                <span className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400 text-sm">Connected</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">API Response Time</span>
                <span className="text-green-400 text-sm">45ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Active Connections</span>
                <span className="text-blue-400 text-sm">342</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
