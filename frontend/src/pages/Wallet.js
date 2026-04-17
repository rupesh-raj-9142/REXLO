import React from 'react';
import { Plus, Minus, History, TrendingUp, Wallet as WalletIcon } from 'lucide-react';

const Wallet = () => {
  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Wallet</h1>
          <p className="text-gray-400">Manage your funds and transactions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Balance Card */}
          <div className="lg:col-span-2">
            <div className="card bg-gradient-to-r from-accent-500/20 to-accent-600/20 border-accent-500/30">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Current Balance</p>
                  <p className="text-4xl font-bold text-white">$250.00</p>
                </div>
                <WalletIcon className="h-12 w-12 text-accent-400" />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Total Added</p>
                  <p className="text-lg font-semibold text-green-400">$500</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Total Won</p>
                  <p className="text-lg font-semibold text-yellow-400">$150</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Total Spent</p>
                  <p className="text-lg font-semibold text-red-400">$100</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button className="card p-6 text-center hover:scale-105 transition-transform">
                <Plus className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-1">Add Money</h3>
                <p className="text-gray-400 text-sm">Top up your wallet</p>
              </button>
              <button className="card p-6 text-center hover:scale-105 transition-transform">
                <Minus className="h-8 w-8 text-red-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-1">Withdraw</h3>
                <p className="text-gray-400 text-sm">Transfer to bank</p>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Statistics</h3>
                <TrendingUp className="h-5 w-5 text-accent-400" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">This Week</span>
                  <span className="text-green-400">+$50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">This Month</span>
                  <span className="text-green-400">+$150</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">All Time</span>
                  <span className="text-yellow-400">+$250</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Quick Stats</h3>
                <History className="h-5 w-5 text-accent-400" />
              </div>
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">15</p>
                  <p className="text-gray-400 text-sm">Games Played</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">8</p>
                  <p className="text-gray-400 text-sm">Games Won</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
