import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import io from 'socket.io-client'

const socket = io('http://localhost:5000')

const Leaderboard = () => {
  const [recentWinners, setRecentWinners] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentWinners()
    
    socket.on('game-completed', (data) => {
      fetchRecentWinners()
    })

    return () => {
      socket.off('game-completed')
    }
  }, [])

  const fetchRecentWinners = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/match/available?recent=true')
      const data = await response.json()
      if (data.success) {
        const completedMatches = data.matches
          .filter(m => m.status === 'completed' && m.winnerId)
          .slice(0, 8)
        
        setRecentWinners(completedMatches)
      }
    } catch (error) {
      console.error('Error fetching recent winners:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gaming-dark rounded-xl p-6 mb-6 border-l-4 border-green-500">
        <h3 className="text-xl font-bold mb-4">🔥 Live Winners</h3>
        <div className="text-center py-4 text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <motion.div 
      className="bg-gaming-dark rounded-xl p-6 mb-6 border-l-4 border-green-500"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🔥</span>
        <h3 className="text-xl font-bold">Live Winners</h3>
        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full animate-pulse">
          LIVE
        </span>
      </div>
      
      {recentWinners.length === 0 ? (
        <div className="text-center py-6 text-gray-400">
          <p>Be the first to win today! 🎮</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentWinners.map((match, index) => (
            <motion.div
              key={match._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 bg-gradient-to-r from-green-900/20 to-gaming-darker rounded-lg border border-green-500/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  {match.winnerId?.username?.[0] || 'W'}
                </div>
                <div>
                  <div className="font-semibold text-green-400">
                    {match.winnerId?.username || 'Winner'}
                  </div>
                  <div className="text-xs text-gray-500">{match.gameName}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-green-500 font-bold text-lg">+₹{match.prizePool}</div>
                <div className="text-xs text-gray-500">
                  {new Date(match.completedAt).toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-gray-700 text-center">
        <p className="text-sm text-gray-400">
          💡 Play now to see your name here!
        </p>
      </div>
    </motion.div>
  )
}

export default Leaderboard
