import React, { useState } from 'react'
import { motion } from 'framer-motion'

const Wallet = ({ user, balance, onBalanceUpdate }) => {
  const [showDeposit, setShowDeposit] = useState(false)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleDeposit = async () => {
    if (!user) {
      alert('Please login to deposit')
      return
    }

    if (!amount || amount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount), userId: user.id })
      })
      const data = await response.json()
      
      if (data.success) {
        // In production, integrate Razorpay checkout here
        alert(`Razorpay order created: ${data.order.id}`)
        // For demo, simulate successful deposit
        onBalanceUpdate(balance + parseFloat(amount))
      }
    } catch (error) {
      console.error('Deposit error:', error)
      alert('Deposit failed')
    } finally {
      setLoading(false)
      setShowDeposit(false)
      setAmount('')
    }
  }

  return (
    <motion.div 
      className="bg-gaming-dark rounded-xl p-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h3 className="text-xl font-bold mb-4">💰 Wallet</h3>
      
      <div className="bg-gradient-to-r from-gaming-primary to-gaming-secondary rounded-lg p-4 mb-4">
        <div className="text-sm text-white/80">Current Balance</div>
        <div className="text-3xl font-bold">₹{balance.toFixed(2)}</div>
      </div>

      {!showDeposit ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowDeposit(true)}
          className="w-full bg-gaming-accent hover:bg-green-600 py-3 rounded-lg font-bold transition-colors"
        >
          Deposit Money
        </motion.button>
      ) : (
        <div className="space-y-3">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount (₹)"
            className="w-full bg-gaming-darker border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-gaming-primary"
          />
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDeposit}
              disabled={loading}
              className="flex-1 bg-gaming-accent hover:bg-green-600 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDeposit(false)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-bold transition-colors"
            >
              Cancel
            </motion.button>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-700">
        <h4 className="text-sm font-semibold mb-2 text-gray-400">Quick Deposit</h4>
        <div className="grid grid-cols-3 gap-2">
          {[50, 100, 500, 1000, 2000, 5000].map((amt) => (
            <motion.button
              key={amt}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAmount(amt)}
              className="bg-gaming-darker hover:bg-gray-800 py-2 rounded-lg text-sm transition-colors"
            >
              ₹{amt}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default Wallet
