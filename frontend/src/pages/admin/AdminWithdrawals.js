import React from 'react';
import { Search, Filter, CheckCircle, XCircle, Clock, Wallet, Calendar } from 'lucide-react';

const AdminWithdrawals = () => {
  const withdrawals = [
    {
      id: 1,
      user: 'player123',
      email: 'player@example.com',
      amount: 50,
      status: 'pending',
      requestedAt: '2024-01-15 14:30',
      accountDetails: '**** **** **** 1234',
      reason: ''
    },
    {
      id: 2,
      user: 'gamer456',
      email: 'gamer@example.com',
      amount: 100,
      status: 'pending',
      requestedAt: '2024-01-15 13:15',
      accountDetails: '**** **** **** 5678',
      reason: ''
    },
    {
      id: 3,
      user: 'user789',
      email: 'user@example.com',
      amount: 25,
      status: 'completed',
      requestedAt: '2024-01-15 10:45',
      accountDetails: '**** **** **** 9012',
      processedAt: '2024-01-15 11:30',
      reason: 'Approved'
    },
    {
      id: 4,
      user: 'cheater123',
      email: 'cheater@example.com',
      amount: 200,
      status: 'cancelled',
      requestedAt: '2024-01-15 09:20',
      accountDetails: '**** **** **** 3456',
      processedAt: '2024-01-15 10:15',
      reason: 'Suspicious activity detected'
    }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'text-yellow-400';
      case 'completed': return 'text-green-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-500/20 border-yellow-500/30';
      case 'completed': return 'bg-green-500/20 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 border-red-500/30';
      default: return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Withdrawal Management</h1>
            <p className="text-gray-400">Review and process withdrawal requests</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search withdrawals..."
                className="input pl-10 pr-4 py-2 w-64"
              />
            </div>
            <button className="btn-secondary flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Withdrawals Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">User</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Amount</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Account</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Requested</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Processed</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Reason</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-white font-medium">{withdrawal.user}</p>
                        <p className="text-gray-400 text-sm">{withdrawal.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-white font-medium">${withdrawal.amount}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-400 text-sm">{withdrawal.accountDetails}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-400 text-sm">{withdrawal.requestedAt}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {withdrawal.processedAt ? (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-400 text-sm">{withdrawal.processedAt}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBg(withdrawal.status)} ${getStatusColor(withdrawal.status)}`}>
                        {withdrawal.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-400 text-sm">{withdrawal.reason || '-'}</span>
                    </td>
                    <td className="py-4 px-4">
                      {withdrawal.status === 'pending' && (
                        <div className="flex items-center justify-center space-x-2">
                          <button className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded">
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                      {withdrawal.status !== 'pending' && (
                        <span className="text-gray-500 text-sm">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Withdrawal Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-8 w-8 text-yellow-400" />
              <span className="text-2xl font-bold text-white">8</span>
            </div>
            <p className="text-gray-400 text-sm">Pending</p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-8 w-8 text-green-400" />
              <span className="text-2xl font-bold text-white">45</span>
            </div>
            <p className="text-gray-400 text-sm">Completed Today</p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="h-8 w-8 text-red-400" />
              <span className="text-2xl font-bold text-white">3</span>
            </div>
            <p className="text-gray-400 text-sm">Cancelled Today</p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <Wallet className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">$2,450</span>
            </div>
            <p className="text-gray-400 text-sm">Total Processed Today</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminWithdrawals;
