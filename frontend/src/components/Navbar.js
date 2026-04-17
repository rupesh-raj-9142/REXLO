import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gamepad2, Wallet, Trophy, Settings, LogOut, User, Menu, X, Zap, Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass sticky top-0 z-50 border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <span className="text-2xl font-black gaming-title bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
              REXLO
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link to="/" className="text-gray-300 hover:text-purple-400 transition-all hover:scale-105 gaming-subtitle">
              ARENA
            </Link>
            <Link to="/games" className="text-gray-300 hover:text-purple-400 transition-all hover:scale-105 gaming-subtitle">
              BATTLES
            </Link>
            <Link to="/leaderboard" className="text-gray-300 hover:text-purple-400 transition-all hover:scale-105 gaming-subtitle">
              HALL OF FAME
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className="text-gray-300 hover:text-purple-400 transition-all hover:scale-105 gaming-subtitle">
                  COMMAND CENTER
                </Link>
                <Link to="/wallet" className="text-gray-300 hover:text-purple-400 transition-all hover:scale-105 gaming-subtitle">
                  VAULT
                </Link>
              </>
            )}
          </div>

          {/* User Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-3 bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/30">
                  <Wallet className="h-5 w-5 text-yellow-400" />
                  <span className="text-yellow-400 font-bold gaming-subtitle">${user?.balance || 0}</span>
                </div>
                <div className="flex items-center space-x-2 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/30">
                  <User className="h-5 w-5 text-blue-400" />
                  <span className="text-blue-400 font-bold gaming-subtitle">{user?.username}</span>
                </div>
                {user?.isAdmin && (
                  <Link to="/admin" className="text-gray-300 hover:text-red-400 transition-all hover:scale-105">
                    <div className="p-2 bg-red-500/10 rounded-full border border-red-500/30">
                      <Shield className="h-5 w-5 text-red-400" />
                    </div>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-red-400 transition-all hover:scale-105"
                >
                  <div className="p-2 bg-red-500/10 rounded-full border border-red-500/30">
                    <LogOut className="h-5 w-5 text-red-400" />
                  </div>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">
                  <span className="gaming-subtitle">LOGIN</span>
                </Link>
                <Link to="/register" className="btn-primary group">
                  <span className="gaming-subtitle">JOIN BATTLE</span>
                  <Zap className="ml-2 h-4 w-4 group-hover:animate-pulse" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-purple-400 transition-colors p-2"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden glass border-t border-purple-500/20">
          <div className="px-2 pt-4 pb-6 space-y-2">
            <Link
              to="/"
              className="block px-4 py-3 text-gray-300 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all gaming-subtitle"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              ARENA
            </Link>
            <Link
              to="/games"
              className="block px-4 py-3 text-gray-300 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all gaming-subtitle"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              BATTLES
            </Link>
            <Link
              to="/leaderboard"
              className="block px-4 py-3 text-gray-300 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all gaming-subtitle"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              HALL OF FAME
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className="block px-4 py-3 text-gray-300 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all gaming-subtitle"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  COMMAND CENTER
                </Link>
                <Link
                  to="/wallet"
                  className="block px-4 py-3 text-gray-300 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all gaming-subtitle"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  VAULT
                </Link>
              </>
            )}
            {isAuthenticated ? (
              <>
                <div className="px-4 py-3 space-y-2">
                  <div className="flex items-center space-x-3 bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/30">
                    <Wallet className="h-5 w-5 text-yellow-400" />
                    <span className="text-yellow-400 font-bold gaming-subtitle">${user?.balance || 0}</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/30">
                    <User className="h-5 w-5 text-blue-400" />
                    <span className="text-blue-400 font-bold gaming-subtitle">{user?.username}</span>
                  </div>
                </div>
                {user?.isAdmin && (
                  <Link
                    to="/admin"
                    className="block px-4 py-3 text-gray-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all gaming-subtitle"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    ADMIN PANEL
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3 text-gray-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all gaming-subtitle"
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-3 text-gray-300 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all gaming-subtitle"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  LOGIN
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-3 text-gray-300 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all gaming-subtitle"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  JOIN BATTLE
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
