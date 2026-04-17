import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  Gamepad2, 
  Trophy, 
  Users, 
  Shield, 
  Star, 
  ArrowRight,
  Zap,
  Target,
  Crown
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-32 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-blue-900/20 to-pink-900/20"></div>
        <div className="absolute inset-0 gaming-grid opacity-20"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-full px-6 py-3 mb-12 backdrop-blur-sm">
              <Zap className="h-5 w-5 text-yellow-400 animate-pulse" />
              <span className="text-yellow-400 text-sm font-semibold tracking-wide">🔥 New: Ludo & Carrom Tournaments</span>
            </div>
            
            {/* Main Heading with Enhanced Typography */}
            <div className="relative mb-8">
              <h1 className="text-6xl md:text-8xl font-black mb-4 leading-tight">
                <span className="block bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent drop-shadow-2xl">
                  Play
                </span>
                <span className="block bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent drop-shadow-2xl">
                  Games,
                </span>
                <span className="block bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent drop-shadow-2xl">
                  Win Real
                </span>
                <span className="block bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent drop-shadow-2xl">
                  Money
                </span>
              </h1>
              
              {/* Glowing Underline Effect */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse"></div>
            </div>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
              Join the ultimate multiplayer gaming platform. Challenge friends in epic battles of <span className="text-purple-400 font-bold">Ludo</span> and <span className="text-blue-400 font-bold">Carrom</span> while competing for real cash prizes.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {isAuthenticated ? (
                <Link
                  to="/games"
                  className="btn-primary text-lg px-10 py-5 inline-flex items-center justify-center space-x-3 text-lg font-bold transform hover:scale-105 transition-all duration-300 shadow-2xl"
                >
                  <Gamepad2 className="h-6 w-6" />
                  <span>Play Now</span>
                  <ArrowRight className="h-6 w-6" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn-primary text-lg px-10 py-5 inline-flex items-center justify-center space-x-3 text-lg font-bold transform hover:scale-105 transition-all duration-300 shadow-2xl"
                  >
                    <Users className="h-6 w-6" />
                    <span>Get Started</span>
                    <ArrowRight className="h-6 w-6" />
                  </Link>
                  <Link
                    to="/login"
                    className="btn-secondary text-lg px-10 py-5 inline-flex items-center justify-center space-x-3 text-lg font-semibold transform hover:scale-105 transition-all duration-300 shadow-xl"
                  >
                    <span>Sign In</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <div className="py-32 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-6xl md:text-7xl font-black mb-6">
              <span className="gaming-title">Why Choose Rexlo?</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 gaming-subtitle max-w-2xl mx-auto">Experience gaming like never before with cutting-edge features</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center gaming-hover group relative overflow-hidden">
              {/* Card Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative mb-8">
                <div className="absolute inset-0 h-24 w-24 bg-yellow-400/30 rounded-full blur-2xl animate-pulse mx-auto"></div>
                <Trophy className="h-24 w-24 text-yellow-400 mx-auto relative z-10 transform group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-6 gaming-subtitle">Win Real Money</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Compete in skill-based battles and claim epic cash prizes
              </p>
              
              {/* Hover Icon */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Crown className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
            
            <div className="card text-center gaming-hover group relative overflow-hidden">
              {/* Card Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative mb-8">
                <div className="absolute inset-0 h-24 w-24 bg-blue-400/30 rounded-full blur-2xl animate-pulse delay-1000 mx-auto"></div>
                <Users className="h-24 w-24 text-blue-400 mx-auto relative z-10 transform group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-6 gaming-subtitle">Multiplayer Battles</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Challenge friends or dominate global leaderboards
              </p>
              
              {/* Hover Icon */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Target className="h-6 w-6 text-blue-400" />
              </div>
            </div>
            
            <div className="card text-center gaming-hover group relative overflow-hidden">
              {/* Card Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative mb-8">
                <div className="absolute inset-0 h-24 w-24 bg-purple-400/30 rounded-full blur-2xl animate-pulse delay-2000 mx-auto"></div>
                <Zap className="h-24 w-24 text-purple-400 mx-auto relative z-10 transform group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-6 gaming-subtitle">Instant Action</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                No downloads - jump straight into the action
              </p>
              
              {/* Hover Icon */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Star className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Games */}
      <div className="py-32 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-6xl md:text-7xl font-black mb-6">
              <span className="gaming-title">Featured Games</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 gaming-subtitle max-w-2xl mx-auto">Choose your battlefield and dominate the competition</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="card gaming-hover group relative overflow-hidden">
              {/* Game Card Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="flex items-center space-x-8 relative z-10">
                <div className="relative">
                  <div className="w-40 h-40 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                    <Gamepad2 className="h-20 w-20 text-white" />
                  </div>
                  <div className="absolute inset-0 w-40 h-40 bg-purple-500/40 rounded-3xl blur-3xl group-hover:scale-110 transition-transform duration-300"></div>
                  
                  {/* Floating Badge */}
                  <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                    HOT
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-4xl font-black text-white mb-4 gaming-subtitle">LUDO MASTER</h3>
                  <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                    Strategic board warfare with modern combat mechanics
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2 bg-purple-500/20 px-3 py-2 rounded-lg">
                      <Users className="h-5 w-5 text-purple-400" />
                      <span className="text-purple-400 font-semibold">4 Players</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-2 rounded-lg">
                      <Target className="h-5 w-5 text-green-400" />
                      <span className="text-green-400 font-semibold">$5 Entry</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-yellow-500/20 px-3 py-2 rounded-lg">
                      <Star className="h-5 w-5 text-yellow-400" />
                      <span className="text-yellow-400 font-semibold">4.8★</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card gaming-hover group relative overflow-hidden">
              {/* Game Card Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="flex items-center space-x-8 relative z-10">
                <div className="relative">
                  <div className="w-40 h-40 bg-gradient-to-br from-pink-600 to-orange-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                    <Gamepad2 className="h-20 w-20 text-white" />
                  </div>
                  <div className="absolute inset-0 w-40 h-40 bg-pink-500/40 rounded-3xl blur-3xl group-hover:scale-110 transition-transform duration-300"></div>
                  
                  {/* Floating Badge */}
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    NEW
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-4xl font-black text-white mb-4 gaming-subtitle">CARROM STRIKE</h3>
                  <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                    Precision-based combat with realistic physics engine
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2 bg-pink-500/20 px-3 py-2 rounded-lg">
                      <Users className="h-5 w-5 text-pink-400" />
                      <span className="text-pink-400 font-semibold">2 Players</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-2 rounded-lg">
                      <Target className="h-5 w-5 text-green-400" />
                      <span className="text-green-400 font-semibold">$10 Entry</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-yellow-500/20 px-3 py-2 rounded-lg">
                      <Star className="h-5 w-5 text-yellow-400" />
                      <span className="text-yellow-400 font-semibold">4.9★</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-32 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="card glass-neon relative overflow-hidden">
            {/* Stats Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-pink-500/10"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center relative z-10">
              <div className="group">
                <div className="text-5xl md:text-6xl font-black text-purple-400 mb-3 gaming-title transform group-hover:scale-110 transition-transform duration-300">50K+</div>
                <p className="text-gray-300 gaming-subtitle text-lg font-semibold">Active Warriors</p>
                <div className="mt-2 h-1 bg-purple-400/30 rounded-full group-hover:bg-purple-400 transition-colors duration-300"></div>
              </div>
              <div className="group">
                <div className="text-5xl md:text-6xl font-black text-blue-400 mb-3 gaming-title transform group-hover:scale-110 transition-transform duration-300">$1M+</div>
                <p className="text-gray-300 gaming-subtitle text-lg font-semibold">Prize Pool</p>
                <div className="mt-2 h-1 bg-blue-400/30 rounded-full group-hover:bg-blue-400 transition-colors duration-300"></div>
              </div>
              <div className="group">
                <div className="text-5xl md:text-6xl font-black text-green-400 mb-3 gaming-title transform group-hover:scale-110 transition-transform duration-300">100K+</div>
                <p className="text-gray-300 gaming-subtitle text-lg font-semibold">Daily Battles</p>
                <div className="mt-2 h-1 bg-green-400/30 rounded-full group-hover:bg-green-400 transition-colors duration-300"></div>
              </div>
              <div className="group">
                <div className="text-5xl md:text-6xl font-black text-yellow-400 mb-3 gaming-title transform group-hover:scale-110 transition-transform duration-300">24/7</div>
                <p className="text-gray-300 gaming-subtitle text-lg font-semibold">Non-Stop Action</p>
                <div className="mt-2 h-1 bg-yellow-400/30 rounded-full group-hover:bg-yellow-400 transition-colors duration-300"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-32 px-4 relative">
        <div className="max-w-5xl mx-auto text-center">
          <div className="card glass-neon relative overflow-hidden">
            {/* CTA Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-pink-600/20"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/50 to-transparent"></div>
            
            {/* Floating Elements */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-purple-500/30 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-24 h-24 bg-blue-500/30 rounded-full blur-xl animate-pulse delay-1000"></div>
            
            <div className="relative z-10 py-16">
              <div className="relative mb-8">
                <div className="absolute inset-0 h-32 w-32 bg-purple-400/20 rounded-full blur-3xl mx-auto animate-pulse"></div>
                <Shield className="h-24 w-24 text-purple-400 mx-auto relative z-10 transform hover:scale-110 transition-transform duration-300" />
              </div>
              
              <h2 className="text-5xl md:text-7xl font-black mb-8">
                <span className="gaming-title">Ready for Glory?</span>
              </h2>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                Join the elite gaming community and claim your throne among champions
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link to="/register" className="btn-primary text-lg px-12 py-6 text-xl font-bold group transform hover:scale-105 transition-all duration-300 shadow-2xl">
                  <span className="flex items-center space-x-3">
                    <Crown className="h-6 w-6" />
                    <span>Join the Battle</span>
                    <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                  </span>
                </Link>
                
                <Link to="/games" className="btn-secondary text-lg px-12 py-6 text-xl font-semibold group transform hover:scale-105 transition-all duration-300 shadow-xl">
                  <span className="flex items-center space-x-3">
                    <Gamepad2 className="h-6 w-6" />
                    <span>View Games</span>
                  </span>
                </Link>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-12 flex justify-center space-x-8">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-400" />
                  <span className="text-gray-400 text-sm">Secure Gaming</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  <span className="text-gray-400 text-sm">Fair Play</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-purple-400" />
                  <span className="text-gray-400 text-sm">Instant Payouts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
