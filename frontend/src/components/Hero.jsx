import React from 'react'
import { motion } from 'framer-motion'

const Hero = ({ user, walletBalance, onDepositClick }) => {
  return (
    <motion.div 
      className="bg-gradient-to-r from-gaming-primary to-gaming-secondary rounded-2xl p-8 mb-8 relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-4xl font-bold mb-2">
              {user ? `Welcome back, ${user.username}!` : 'Welcome to REXLO'}
            </h2>
            <p className="text-white/90 text-lg">
              {user 
                ? 'Ready to win some money? Choose a game below!' 
                : 'Play skill-based games and win real money!'}
            </p>
          </div>
          
          <div className="text-right">
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 mb-3">
              <div className="text-sm text-white/80 mb-1">Wallet Balance</div>
              <div className="text-3xl font-bold">₹{walletBalance.toFixed(2)}</div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDepositClick}
              className="bg-white text-gaming-primary px-6 py-3 rounded-lg font-bold shadow-lg"
            >
              💰 Deposit
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Hero
