import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const GameRoom = ({ socket, user, onExit }) => {
  const [matchFound, setMatchFound] = useState(false)
  const [opponent, setOpponent] = useState(null)
  const [gameState, setGameState] = useState('waiting')
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    socket.on('match-found', (data) => {
      setMatchFound(true)
      setOpponent(data.opponentId)
      setGameState('starting')
      
      // Countdown
      let count = 3
      const interval = setInterval(() => {
        count -= 1
        setCountdown(count)
        if (count === 0) {
          clearInterval(interval)
          setGameState('playing')
        }
      }, 1000)

      return () => clearInterval(interval)
    })

    socket.on('opponent-move', (move) => {
      console.log('Opponent move:', move)
      // Handle opponent move
    })

    return () => {
      socket.off('match-found')
      socket.off('opponent-move')
    }
  }, [socket])

  const handleExit = () => {
    socket.emit('leave-waiting-room', user?.id)
    onExit()
  }

  return (
    <div className="min-h-screen bg-gaming-darker flex items-center justify-center p-4">
      <motion.div 
        className="bg-gaming-dark rounded-2xl p-8 max-w-2xl w-full text-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {!matchFound ? (
          <>
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto mb-4 border-4 border-gaming-primary border-t-transparent rounded-full animate-spin" />
              <h2 className="text-2xl font-bold mb-2">Searching for opponent...</h2>
              <p className="text-gray-400">This won't take long!</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExit}
              className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg"
            >
              Cancel
            </motion.button>
          </>
        ) : gameState === 'starting' ? (
          <>
            <div className="mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-8xl font-bold text-gaming-accent mb-4"
              >
                {countdown}
              </motion.div>
              <h2 className="text-2xl font-bold">Get Ready!</h2>
              <p className="text-gray-400">Match starting soon...</p>
            </div>
          </>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-4 text-gaming-accent">🎮 Game Started!</h2>
              <div className="flex justify-center gap-8 mb-4">
                <div className="bg-gaming-darker px-6 py-3 rounded-lg">
                  <div className="text-sm text-gray-400">You</div>
                  <div className="font-bold">{user?.username}</div>
                </div>
                <div className="text-4xl font-bold text-gray-600">VS</div>
                <div className="bg-gaming-darker px-6 py-3 rounded-lg">
                  <div className="text-sm text-gray-400">Opponent</div>
                  <div className="font-bold">Player</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gaming-darker rounded-xl p-8 mb-6">
              <p className="text-gray-400 mb-4">Game area - Implement your game logic here</p>
              <div className="text-6xl">🎯</div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExit}
              className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg"
            >
              Exit Game
            </motion.button>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default GameRoom
