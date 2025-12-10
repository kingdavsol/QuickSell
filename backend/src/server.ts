import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import config
import { logger } from './config/logger';
import { connectDatabase } from './database/connection';
import { initializeRedis } from './config/redis';

// Import routes
import authRoutes from './routes/auth.routes';
import listingRoutes from './routes/listing.routes';
import photoRoutes from './routes/photo.routes';
import marketplaceRoutes from './routes/marketplace.routes';
import bulkMarketplaceSignupRoutes from './routes/bulkMarketplaceSignup.routes';
import pricingRoutes from './routes/pricing.routes';
import gamificationRoutes from './routes/gamification.routes';
import salesRoutes from './routes/sales.routes';
import shippingRoutes from './routes/shipping.routes';
import notificationRoutes from './routes/notification.routes';
import subscriptionRoutes from './routes/subscription.routes';
import publishRoutes from './routes/publish.routes';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

const app: Express = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Security middleware
app.use(helmet());

// CORS configuration - Allow frontend to access API
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:8080',
  'http://localhost:8081',
  'https://quicksell.monster',
  'http://quicksell.monster'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Logging middleware
app.use(morgan('combined'));
app.use(requestLogger);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.'
});

// Apply rate limiting to all routes
app.use('/api/', limiter);

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/listings', listingRoutes);
app.use('/api/v1/photos', photoRoutes);
app.use('/api/v1/marketplaces', bulkMarketplaceSignupRoutes);
app.use('/api/v1/pricing', pricingRoutes);
app.use('/api/v1/gamification', gamificationRoutes);
app.use('/api/v1/sales', salesRoutes);
app.use('/api/v1/shipping', shippingRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/subscription', subscriptionRoutes);
app.use('/api/v1/publish', publishRoutes);
app.use('/api/v1/oauth', publishRoutes);

// ============================================
// 404 HANDLER
// ============================================

app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// ============================================
// ERROR HANDLING
// ============================================

app.use(errorHandler);

// ============================================
// DATABASE & CACHE INITIALIZATION
// ============================================

const initializeApp = async () => {
  try {
    logger.info('Initializing QuickSell API...');

    // Connect to PostgreSQL
    logger.info('Connecting to PostgreSQL database...');
    await connectDatabase();
    logger.info('✓ Connected to PostgreSQL');

    // Initialize Redis
    logger.info('Connecting to Redis cache...');
    await initializeRedis();
    logger.info('✓ Connected to Redis');

    // Start server
    app.listen(PORT, () => {
      logger.info(`✓ QuickSell API running on http://localhost:${PORT}`);
      logger.info(`✓ Environment: ${NODE_ENV}`);
      logger.info(`✓ API Version: v1`);
    });

  } catch (error) {
    logger.error('Failed to initialize application:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Start the application
initializeApp();

export default app;
