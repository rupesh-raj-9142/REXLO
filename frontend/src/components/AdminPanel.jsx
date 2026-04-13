import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const AdminPanel = ({ token, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
        setMatches(data.recentMatches);
        setTransactions(data.recentTransactions);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchFraudAlerts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/fraud-alerts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setFraudAlerts(data.alerts);
      }
    } catch (error) {
      console.error('Error fetching fraud alerts:', error);
    }
  };

  const toggleUserFreeze = async (userId, isFrozen) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/freeze`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isFrozen,
          reason: isFrozen ? 'Suspicious activity detected' : 'Account reviewed and cleared'
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchUsers();
        fetchFraudAlerts();
      }
    } catch (error) {
      console.error('Error toggling user freeze:', error);
    }
  };

  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
      >
        <h3 className="text-lg font-semibold text-white mb-2">Total Users</h3>
        <p className="text-3xl font-bold text-gaming-accent">{stats?.totalUsers || 0}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
      >
        <h3 className="text-lg font-semibold text-white mb-2">Active Users</h3>
        <p className="text-3xl font-bold text-green-400">{stats?.activeUsers || 0}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
      >
        <h3 className="text-lg font-semibold text-white mb-2">Total Matches</h3>
        <p className="text-3xl font-bold text-blue-400">{stats?.totalMatches || 0}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
      >
        <h3 className="text-lg font-semibold text-white mb-2">Total Revenue</h3>
        <p className="text-3xl font-bold text-purple-400">₹{stats?.totalRevenue || 0}</p>
      </motion.div>
    </div>
  );

  const renderUsers = () => (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-6">User Management</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-white">
          <thead>
            <tr className="border-b border-white/20">
              <th className="text-left p-3">Username</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user._id} className="border-b border-white/10">
                <td className="p-3">{user.username}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    user.isBanned ? 'bg-red-500' : 
                    user.isFrozen ? 'bg-yellow-500' : 'bg-green-500'
                  }`}>
                    {user.isBanned ? 'Banned' : user.isFrozen ? 'Frozen' : 'Active'}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => toggleUserFreeze(user._id, !user.isFrozen)}
                    className={`px-3 py-1 rounded text-sm mr-2 ${
                      user.isFrozen ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'
                    }`}
                  >
                    {user.isFrozen ? 'Unfreeze' : 'Freeze'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderFraudAlerts = () => (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-6">Fraud Alerts</h2>
      <div className="space-y-4">
        {fraudAlerts.map((alert, index) => (
          <motion.div
            key={alert.userId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border ${
              alert.isFrozen ? 'bg-red-500/20 border-red-500' : 'bg-yellow-500/20 border-yellow-500'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-white">{alert.username}</h3>
                <p className="text-sm text-gray-300">{alert.email}</p>
                <p className="text-sm">Fraud Score: {alert.fraudScore}</p>
              </div>
              <button
                onClick={() => toggleUserFreeze(alert.userId, !alert.isFrozen)}
                className={`px-4 py-2 rounded text-sm ${
                  alert.isFrozen ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {alert.isFrozen ? 'Unfreeze' : 'Freeze'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return renderUsers();
      case 'fraud':
        return renderFraudAlerts();
      default:
        return renderDashboard();
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gaming-darker flex items-center justify-center">
        <div className="text-white text-xl">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gaming-darker text-white p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
        >
          Logout
        </button>
      </div>

      <div className="flex space-x-1 mb-8">
        {['dashboard', 'users', 'fraud'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-t-lg capitalize ${
              activeTab === tab 
                ? 'bg-white/20 text-white' 
                : 'bg-white/10 text-gray-300 hover:bg-white/15'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {renderContent()}
    </div>
  );
};

export default AdminPanel;
