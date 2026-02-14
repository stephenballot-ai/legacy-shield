/**
 * Legacy Shield API Server
 * Express + TypeScript + Prisma
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { apiLimiter } from './middleware/rateLimit';
import authRoutes from './routes/auth';
import fileRoutes from './routes/files';
import emergencyAccessRoutes from './routes/emergencyAccess';
import subscriptionRoutes from './routes/subscriptions';
import userRoutes from './routes/users';
import webhookRoutes from './routes/webhooks';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

// Cookie parsing
app.use(cookieParser());

// Stripe webhook needs raw body — must be before json parser
app.use('/api/v1/webhooks', express.raw({ type: 'application/json' }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/', apiLimiter);

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info({
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// ============================================================================
// ROUTES
// ============================================================================

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    dataResidency: 'EU',
  });
});

// API info
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'Legacy Shield API',
    version: '1.0.0',
    description: 'Secure document vault with emergency access',
    dataResidency: 'EU - Hosted in Germany',
    documentation: '/api/docs',
  });
});

// Mount route handlers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/files', fileRoutes);
app.use('/api/v1/emergency-access', emergencyAccessRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/webhooks', webhookRoutes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found',
      path: req.path,
    },
  });
});

// Global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error({
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message:
        NODE_ENV === 'production'
          ? 'An internal error occurred'
          : err.message,
    },
  });
});

// ============================================================================
// SERVER START
// ============================================================================

app.listen(PORT, () => {
  logger.info(`🚀 Legacy Shield API running on port ${PORT}`);
  logger.info(`🌍 Environment: ${NODE_ENV}`);
  logger.info(`🇪🇺 Data Residency: EU (Germany)`);
  logger.info(`📖 API Documentation: http://localhost:${PORT}/api/docs`);
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

export default app;
