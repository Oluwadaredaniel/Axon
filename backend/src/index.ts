import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorLogger, requestLogger } from './middleware/logger.middleware';

// Routes
import authRoutes from './routes/auth.routes';
import workspaceRoutes from './routes/workspace.routes';
import aiRoutes from './routes/ai.routes';
import teamRoutes from './routes/team.routes';
import adminRoutes from './routes/admin.routes';
import historyRoutes from './routes/history.routes';
import collectionRoutes from './routes/collection.routes';
import billingRoutes from './routes/billing.routes';
import notificationRoutes from './routes/notification.routes';
import searchRoutes from './routes/search.routes';
import environmentRoutes from './routes/environment.routes';
import docsRoutes from './routes/docs.routes';
import apiKeyRoutes from './routes/apikey.routes';
import { cronService } from './services/cron.service';

const app = express();

// Security
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// CORS
app.use(cors({
  origin: [
    env.frontendUrl,
    'http://localhost:3000',
    /\.vercel\.app$/,
    /\.netlify\.app$/,
  ],
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('dev'));
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Axon API is running',
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
  });
});

// Welcome
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Axon API',
    version: '1.0.0',
    endpoints: [
      '/auth',
      '/workspaces',
      '/ai',
      '/teams',
      '/admin',
      '/history',
      '/collections',
      '/billing',
      '/notifications',
      '/search',
      '/environments',
      '/docs',
    ],
  });
});

// Mount routes
app.use('/auth', authRoutes);
app.use('/workspaces', workspaceRoutes);
app.use('/ai', aiRoutes);
app.use('/teams', teamRoutes);
app.use('/admin', adminRoutes);
app.use('/history', historyRoutes);
app.use('/collections', collectionRoutes);
app.use('/billing', billingRoutes);
app.use('/notifications', notificationRoutes);
app.use('/search', searchRoutes);
app.use('/environments', environmentRoutes);
app.use('/docs', docsRoutes);
app.use('/api-keys', apiKeyRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorLogger);

// Start server
app.listen(env.port, () => {
  console.log(`
  🚀 Axon API running
  🌍 Environment: ${env.nodeEnv}
  📡 Port: ${env.port}
  🔗 URL: http://localhost:${env.port}
  `);
  cronService.start();
});

export default app;