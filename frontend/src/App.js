import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import InstantGames from './components/InstantGames';
import AdminPanel from './components/AdminPanel';
import PaymentScanner from './components/PaymentScanner';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Games from './pages/Games';
import GameLobby from './pages/GameLobby';
import GameRoom from './pages/GameRoom';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import GameHistory from './pages/GameHistory';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminGames from './pages/admin/AdminGames';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !user?.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />

            {/* Protected User Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/games" element={
              <ProtectedRoute>
                <Games />
              </ProtectedRoute>
            } />
            <Route path="/lobby" element={
              <ProtectedRoute>
                <GameLobby />
              </ProtectedRoute>
            } />
            <Route path="/game/:gameId" element={
              <ProtectedRoute>
                <GameRoom />
              </ProtectedRoute>
            } />
            <Route path="/wallet" element={
              <ProtectedRoute>
                <Wallet />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/leaderboard" element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute>
                <GameHistory />
              </ProtectedRoute>
            } />

            {/* Instant Games Route */}
            <Route path="/instant-games" element={
              <ProtectedRoute>
                <InstantGames />
              </ProtectedRoute>
            } />
            <Route path="/payment-scanner" element={
              <ProtectedRoute>
                <PaymentScanner />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute adminOnly>
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/games" element={
              <ProtectedRoute adminOnly>
                <AdminGames />
              </ProtectedRoute>
            } />
            <Route path="/admin/withdrawals" element={
              <ProtectedRoute adminOnly>
                <AdminWithdrawals />
              </ProtectedRoute>
            } />
            <Route path="/admin-panel" element={
              <ProtectedRoute adminOnly>
                <AdminPanel />
              </ProtectedRoute>
            } />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
