import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const GameList = ({ onGameSelect }) => {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGames()
  }, [])

  const fetchGames = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/game/')
      const data = await response.json()
      if (data.success) {
        setGames(data.games)
      }
    } catch (error) {
      console.error('Error fetching games:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading games...</div>
  }

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4">Available Games</h3>
      <div className="space-y-4">
        {games.map((game, index) => (
          <motion.div
            key={game._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.01, translateX: 5 }}
            onClick={() => onGameSelect(game)}
            className="bg-gaming-dark rounded-xl p-5 cursor-pointer border border-gray-800 hover:border-gaming-primary transition-all flex items-center gap-6"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="text-xl font-bold">{game.name}</h4>
                <span className="text-xs bg-gaming-primary/20 text-gaming-primary px-2 py-1 rounded">
                  {game.category}
                </span>
              </div>
              <p className="text-gray-400 text-sm">{game.description}</p>
              <div className="flex gap-6 mt-3 text-sm text-gray-500">
                <span>Entry: ₹{game.entryFees?.[0]?.amount || 0}</span>
                <span>Avg: {game.avgDuration} min</span>
                <span>{game.totalMatchesPlayed} matches</span>
              </div>
            </div>
            
            <div className="text-right bg-gaming-darker rounded-lg px-6 py-4 border-2 border-green-500/30">
              <div className="text-sm text-gray-400 mb-1">Prize Pool</div>
              <div className="text-3xl font-bold text-green-500">
                ₹{game.entryFees?.[0]?.prizePool || 0}
              </div>
              <div className="text-xs text-green-600 mt-1">WIN BIG!</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default GameList
