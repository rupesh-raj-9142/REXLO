# REXLO Deployment Guide

## Backend Deployment (Render.com)

1. Go to [Render.com](https://render.com)
2. Connect your GitHub account
3. Click "New +" → "Web Service"
4. Select the REXLO repository
5. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Node Version**: 18
6. Add Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://your-mongodb-connection-string
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   RAZORPAY_KEY_ID=your-razorpay-key-id
   RAZORPAY_KEY_SECRET=your-razorpay-key-secret
   ```
7. Deploy

## Frontend Deployment (Vercel.com)

1. Go to [Vercel.com](https://vercel.com)
2. Connect your GitHub account
3. Click "Add New Project"
4. Select the REXLO repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add Environment Variables:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```
7. Deploy

## After Deployment

1. Update MongoDB connection string with your actual MongoDB Atlas URI
2. Add Razorpay API keys for payment functionality
3. Test the deployed application

## URLs After Deployment

- **Backend**: https://rexlo-backend.onrender.com
- **Frontend**: https://rexlo-frontend.vercel.app

## Environment Variables Required

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rexlo
JWT_SECRET=your-super-secret-jwt-key
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

### Frontend (.env.production)
```
VITE_API_URL=https://your-backend-url.onrender.com
```
