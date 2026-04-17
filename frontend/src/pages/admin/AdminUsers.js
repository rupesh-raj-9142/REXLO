import React from 'react';
import { Search, Filter, Ban, CheckCircle, Eye, MoreVertical } from 'lucide-react';

const AdminUsers = () => {
  const users = [
    {
      id: 1,
      username: 'player123',
      email: 'player@example.com',
      fullName: 'John Doe',
      status: 'active',
      gamesPlayed: 25,
      gamesWon: 15,
      totalWinnings: 500,
      balance: 250,
      joinDate: '2024-01-10',
      lastLogin: '2024-01-15 14:30'
    },
    {
      id: 2,
      username: 'gamer456',
      email: 'gamer@example.com',
      fullName: 'Jane Smith',
      status: 'active',
      gamesPlayed: 18,
      gamesWon: 12,
      totalWinnings: 300,
      balance: 180,
      joinDate: '2024-01-08',
      lastLogin: '2024-01-15 12:15'
    },
    {
      id: 3,
      username: 'cheater789',
      email: 'cheater@example.com',
      fullName: 'Bad User',
      status: 'blocked',
      gamesPlayed: 5,
      gamesWon: 5,
      totalWinnings: 100,
      balance: 0,
      joinDate: '2024-01-12',
      lastLogin: '2024-01-14 18:45'
    }
  ];

  const getStatusColor = (status) => {
    return status === 'active' ? 'text-green-400' : 'text-red-400';
  };

  const getStatusBg = (status) => {
    return status === 'active' ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30';
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
            <p className="text-gray-400">View and manage all platform users</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                className="input pl-10 pr-4 py-2 w-64"
              />
            </div>
            <button className="btn-secondary flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">User</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Games</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Win Rate</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Balance</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Join Date</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Last Login</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-accent-400 to-accent-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-white">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.username}</p>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBg(user.status)} ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div>
                        <p className="text-white text-sm">{user.gamesPlayed}</p>
                        <p className="text-green-400 text-xs">{user.gamesWon} won</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-green-400 font-medium">
                        {user.gamesPlayed > 0 ? ((user.gamesWon / user.gamesPlayed) * 100).toFixed(1) : 0}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-white font-medium">${user.balance}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-400 text-sm">{user.joinDate}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-400 text-sm">{user.lastLogin}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded">
                          <Eye className="h-4 w-4" />
                        </button>
                        {user.status === 'active' ? (
                          <button className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded">
                            <Ban className="h-4 w-4" />
                          </button>
                        ) : (
                          <button className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-gray-400 text-sm">
            Showing 1 to {users.length} of {users.length} users
          </p>
          <div className="flex items-center space-x-2">
            <button className="btn-secondary px-3 py-1 text-sm">Previous</button>
            <button className="btn-primary px-3 py-1 text-sm">1</button>
            <button className="btn-secondary px-3 py-1 text-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
