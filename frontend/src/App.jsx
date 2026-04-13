import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import io from 'socket.io-client'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import GameList from './components/GameList'
import Leaderboard from './components/Leaderboard'
import Wallet from './components/Wallet'
import AuthModal from './components/AuthModal'
import GameRoom from './components/GameRoom'
import LudoGame from './components/LudoGame'
import CarromGame from './components/CarromGame'

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000')

function App() {
  const [user, setUser] = useState(null)
  const [walletBalance, setWalletBalance] = useState(0)
  const [showAuth, setShowAuth] = useState(false)
  const [activeGame, setActiveGame] = useState(null)
  const [inGame, setInGame] = useState(false)
  const [currentMatch, setCurrentMatch] = useState(null)
  const [gameType, setGameType] = useState(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('rexlo_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }

    socket.on('match-found', (data) => {
      console.log('Match found:', data)
      setCurrentMatch(data)
      setInGame(true)
    })

    socket.on('game-completed', (data) => {
      console.log('Game completed:', data)
      setInGame(false)
      setCurrentMatch(null)
      setGameType(null)
      if (user) {
        fetchWalletBalance(user.id)
      }
    })

    return () => {
      socket.off('match-found')
      socket.off('game-completed')
    }
  }, [])

  const fetchWalletBalance = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/wallet/balance/${userId}`)
      const data = await response.json()
      if (data.success) {
        setWalletBalance(data.walletBalance)
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error)
    }
  }

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('rexlo_user', JSON.stringify(userData))
    setShowAuth(false)
    fetchWalletBalance(userData.id)
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('rexlo_user')
    setWalletBalance(0)
  }

  const handleGameSelect = (game) => {
    setActiveGame(game)
    setGameType(game.gameType)
  }

  const handleGameExit = () => {
    setInGame(false)
    setCurrentMatch(null)
    setGameType(null)
  }

  if (inGame && currentMatch) {
    if (gameType === 'ludo') {
      return <LudoGame matchId={currentMatch.matchId} userId={user?.id} onExit={handleGameExit} />
    } else if (gameType === 'carrom') {
      return <CarromGame matchId={currentMatch.matchId} userId={user?.id} onExit={handleGameExit} />
    }
    return <GameRoom socket={socket} user={user} onExit={handleGameExit} />
  }

  return (
    <div className="min-h-screen bg-gaming-darker text-white">
      <Navbar 
        user={user} 
        walletBalance={walletBalance}
        onLoginClick={() => setShowAuth(true)}
        onLogout={handleLogout}
      />

      <AnimatePresence>
        {showAuth && (
          <AuthModal onClose={() => setShowAuth(false)} onLogin={handleLogin} />
        )}
      </AnimatePresence>

      <main className="container mx-auto px-4 py-8">
        {!activeGame ? (
          <>
            <Hero 
              user={user} 
              walletBalance={walletBalance}
              onDepositClick={() => user && setShowAuth(false)}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
              <div className="lg:col-span-2">
                <GameList onGameSelect={handleGameSelect} />
              </div>
              <div>
                <Leaderboard />
                <Wallet 
                  user={user} 
                  balance={walletBalance}
                  onBalanceUpdate={(newBalance) => setWalletBalance(newBalance)}
                />
              </div>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button 
              onClick={() => setActiveGame(null)}
              className="mb-4 text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Games
            </button>
            <GameDetail game={activeGame} user={user} socket={socket} />
          </motion.div>
        )}
      </main>
    </div>
  )
}

const GameDetail = ({ game, user, socket }) => {
  const [selectedFee, setSelectedFee] = useState(null)
  const [isSearching, setIsSearching] = useState(false)

  const handlePlay = async () => {
    if (!user) {
      alert('Please login to play')
      return
    }

    if (!selectedFee) {
      alert('Please select an entry fee')
      return
    }

    setIsSearching(true)
    socket.emit('join-waiting-room', {
      userId: user.id,
      entryFee: selectedFee.amount,
      gameId: game.gameId
    })
  }

  return (
    <div className="bg-gaming-dark rounded-2xl p-8">
      <h2 className="text-3xl font-bold mb-4">{game.name}</h2>
      <p className="text-gray-400 mb-6">{game.description}</p>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3">Rules</h3>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          {game.rules?.map((rule, index) => (
            <li key={index}>{rule}</li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3">Select Entry Fee</h3>
        <div className="grid grid-cols-3 gap-4">
          {game.entryFees?.map((fee, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedFee(fee)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedFee?.amount === fee.amount
                  ? 'border-gaming-accent bg-gaming-accent/20'
                  : 'border-gray-600 hover:border-gaming-primary'
              }`}
            >
              <div className="text-lg font-bold">₹{fee.amount}</div>
              <div className="text-sm text-gaming-accent">Win ₹{fee.prizePool}</div>
            </motion.button>
          ))}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handlePlay}
        disabled={isSearching}
        className="w-full bg-gradient-to-r from-gaming-primary to-gaming-secondary py-4 rounded-xl font-bold text-lg disabled:opacity-50"
      >
        {isSearching ? 'Searching for opponent...' : 'Play Now'}
      </motion.button>
    </div>
  )
}

export default App
