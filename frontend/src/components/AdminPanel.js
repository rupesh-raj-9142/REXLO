import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  Shield, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  Settings,
  Eye,
  EyeOff,
  Ban,
  CreditCard,
  Trophy,
  Clock,
  Database,
  Server
} from 'lucide-react';

const AdminPanel = () => {
  const { user, token } = useAuthStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceType, setBalanceType] = useState('credit');

  // Check if user is admin (you should replace with your actual admin check)
  const isAdmin = user?.email === 'admin@rexlo.com'; // Replace with your admin email

  useEffect(() => {
    if (isAdmin) {
      fetchDashboard();
    }
  }, [isAdmin]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin-panel/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin-panel/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin-panel/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserBalance = async () => {
    if (!selectedUser || !balanceAmount) return;

    try {
      const response = await fetch(`/api/admin-panel/user/${selectedUser}/balance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(balanceAmount),
          type: balanceType
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`User balance updated successfully!`);
        setShowBalanceModal(false);
        setSelectedUser(null);
        setBalanceAmount('');
        fetchUsers(); // Refresh users list
      } else {
        alert(data.error || 'Failed to update balance');
      }
    } catch (error) {
      console.error('Failed to update user balance:', error);
      alert('Failed to update user balance');
    }
  };

  const toggleUserBlock = async (userId, isBlocked) => {
    try {
      const response = await fetch(`/api/admin-panel/user/${userId}/block`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isBlocked })
      });

      const data = await response.json();
      if (data.success) {
        alert(`User ${isBlocked ? 'blocked' : 'unblocked'} successfully`);
        fetchUsers(); // Refresh users list
      } else {
        alert(data.error || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Failed to toggle user block:', error);
      alert('Failed to update user status');
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access this panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-red-400 mr-3" />
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            </div>
            <div className="text-gray-300 text-sm">
              Welcome, {user?.username}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 border-b border-gray-700">
          {['dashboard', 'users', 'transactions', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats && (
              <>
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="h-8 w-8 text-blue-400" />
                    <span className="text-gray-400 text-sm">Total Users</span>
                  </div>
                  <div className="text-3xl font-bold text-white">{stats.totalUsers}</div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="h-8 w-8 text-green-400" />
                    <span className="text-gray-400 text-sm">Total Winnings</span>
                  </div>
                  <div className="text-3xl font-bold text-white">${stats.totalWinnings}</div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="h-8 w-8 text-purple-400" />
                    <span className="text-gray-400 text-sm">Platform Balance</span>
                  </div>
                  <div className="text-3xl font-bold text-white">${stats.platformBalance}</div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="h-8 w-8 text-yellow-400" />
                    <span className="text-gray-400 text-sm">Active Games</span>
                  </div>
                  <div className="text-3xl font-bold text-white">{stats.activeGames}</div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-gray-800 rounded-lg">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">User Management</h2>
              <button
                onClick={fetchUsers}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Refresh Users
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left">Username</th>
                    <th className="px-6 py-3 text-left">Email</th>
                    <th className="px-6 py-3 text-left">Balance</th>
                    <th className="px-6 py-3 text-left">Total Spent</th>
                    <th className="px-6 py-3 text-left">Total Winnings</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b border-gray-700 hover:bg-gray-700">
                      <td className="px-6 py-4">{user.username}</td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4 text-green-400">${user.balance}</td>
                      <td className="px-6 py-4 text-yellow-400">${user.totalSpent}</td>
                      <td className="px-6 py-4 text-purple-400">${user.totalWinnings}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.isBlocked 
                            ? 'bg-red-600 text-white' 
                            : 'bg-green-600 text-white'
                        }`}>
                          {user.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user._id);
                              setShowBalanceModal(true);
                            }}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            <CreditCard className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => toggleUserBlock(user._id, !user.isBlocked)}
                            className={`px-3 py-1 rounded text-sm ${
                              user.isBlocked
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-red-600 hover:bg-red-700'
                            } text-white`}
                          >
                            {user.isBlocked ? <Eye className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-gray-800 rounded-lg">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Transaction History</h2>
              <button
                onClick={fetchTransactions}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Refresh Transactions
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left">User</th>
                    <th className="px-6 py-3 text-left">Type</th>
                    <th className="px-6 py-3 text-left">Amount</th>
                    <th className="px-6 py-3 text-left">Description</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction, index) => (
                    <tr key={index} className="border-b border-gray-700">
                      <td className="px-6 py-4">{transaction.userId?.username}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          transaction.type.includes('win') 
                            ? 'bg-green-600 text-white' 
                            : transaction.type.includes('credit')
                            ? 'bg-blue-600 text-white'
                            : 'bg-yellow-600 text-white'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-green-400">${transaction.amount}</td>
                      <td className="px-6 py-4">{transaction.description}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          transaction.status === 'completed' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-yellow-600 text-white'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Database className="h-5 w-5 mr-2 text-purple-400" />
                System Health
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Database Status</span>
                  <span className="text-green-400">Connected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Games</span>
                  <span className="text-blue-400">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Server Uptime</span>
                  <span className="text-green-400">24h 30m</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Server className="h-5 w-5 mr-2 text-blue-400" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                  Backup Database
                </button>
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Clear Cache
                </button>
                <button className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Balance Update Modal */}
      {showBalanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-xl font-bold text-white mb-4">Update User Balance</h3>
            <div className="mb-4">
              <p className="text-gray-400 mb-2">Selected User: {selectedUser}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Amount ($)
                </label>
                <input
                  type="number"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Transaction Type
                </label>
                <select
                  value={balanceType}
                  onChange={(e) => setBalanceType(e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={updateUserBalance}
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                Update Balance
              </button>
              <button
                onClick={() => {
                  setShowBalanceModal(false);
                  setSelectedUser(null);
                  setBalanceAmount('');
                }}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
