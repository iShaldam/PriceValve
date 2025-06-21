import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { steamRoutes } from './routes/steam';
import { errorHandler } from './middleware/errorHandler';
import gameRoutes from './routes/gameRoutes';
import { connectDatabase } from './config/database';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDatabase().catch(console.error);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic health check route at /api/health
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'PriceValve API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/steam', steamRoutes);
app.use('/api', gameRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler - use a proper path instead of wildcard
app.use('/', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 PriceValve server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎮 Game analysis: http://localhost:${PORT}/api/analyze/:appId`);
  console.log(`📈 Database stats: http://localhost:${PORT}/api/stats`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Check for required environment variables
  if (!process.env.STEAM_API_KEY) {
    console.warn('⚠️  STEAM_API_KEY not found - Steam API features may be limited');
  }
  
  if (!process.env.MONGODB_URI) {
    console.warn('⚠️  MONGODB_URI not found - using default local MongoDB');
  }
});

export default app; 