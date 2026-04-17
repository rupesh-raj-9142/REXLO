# Rexlo Gaming Platform

A full-stack multiplayer gaming platform where users can play Ludo and Carrom games and win real money.

## Features

### User Side
- User registration and login system
- Wallet system (add money, withdraw money)
- Game selection (Ludo and Carrom)
- Multiplayer game system (2-4 players)
- Real-time gameplay with matchmaking
- Entry fee system with reward money
- Game history and leaderboard
- Modern gaming UI with dark theme

### Admin Panel
- Admin login dashboard
- User management (block/unblock)
- Real-time game monitoring
- Wallet transaction control
- Game management
- Revenue analytics

## Tech Stack

- **Frontend**: React.js with TailwindCSS
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Real-time**: Socket.io
- **Authentication**: JWT
- **Payment**: Razorpay (mock integration)

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install-all
   ```
3. Set up environment variables (see .env.example)
4. Start the development servers:
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Project Structure

```
rexlo/
├── frontend/          # React frontend
├── backend/           # Node.js backend
├── package.json       # Root package.json
└── README.md          # This file
```

## License

MIT License
