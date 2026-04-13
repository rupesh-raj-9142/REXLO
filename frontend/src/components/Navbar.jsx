import React from 'react'
import { motion } from 'framer-motion'

const Navbar = ({ user, walletBalance, onLoginClick, onLogout }) => {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-gaming-dark border-b border-gray-800 sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <motion.h1 
          className="text-2xl font-bold bg-gradient-to-r from-gaming-primary to-gaming-secondary bg-clip-text text-transparent cursor-pointer"
          whileHover={{ scale: 1.05 }}
        >
          REXLO
        </motion.h1>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="bg-gaming-darker px-4 py-2 rounded-lg flex items-center gap-3">
                <span className="text-gray-400">Wallet:</span>
                <span className="text-gaming-accent font-bold">₹{walletBalance.toFixed(2)}</span>
              </div>
              <div className="text-gray-300">
                <span className="text-gray-500">Welcome,</span> {user.username}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
              >
                Logout
              </motion.button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLoginClick}
              className="bg-gaming-primary hover:bg-gaming-secondary px-6 py-2 rounded-lg transition-colors"
            >
              Login
            </motion.button>
          )}
        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar
