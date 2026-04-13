# REXLO - Real Money Gaming Platform

A professional MERN stack gaming platform with real-time multiplayer matches and wallet transactions.

## Tech Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose
- Socket.io for real-time matchmaking
- JWT for authentication
- bcryptjs for password security
- Razorpay for payments

### Frontend
- React with Vite
- TailwindCSS for styling
- Framer Motion for animations
- Axios for API calls
- Socket.io-client for real-time updates

## Setup Instructions

### Backend Setup
1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rexlo
JWT_SECRET=your_jwt_secret_key_here
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup
1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Features

- Real-time multiplayer matchmaking
- Secure wallet transactions with atomic operations
- Game of Skill compliance
- AI fraud detection
- Live leaderboards
- UPI payment integration

## Legal Note

This platform focuses on "Games of Skill" (Chess, Rummy, Quiz) to comply with the Online Gaming (Regulation) Act, 2025-2026.
