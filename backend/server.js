/**
 * Express server setup
 * Refactored to use constants and centralized error handling
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const assessmentRoutes = require('./routes/assessment');
const healthRoutes = require('./routes/health');
const metricsRoutes = require('./routes/metrics');

// Import middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { metricsMiddleware } = require('./middleware/metrics');

// Import constants
const { SERVER } = require('./config/constants');

const app = express();
const PORT = process.env.PORT || SERVER.DEFAULT_PORT;

// Trust proxy - required when running behind a proxy (e.g., Render.com, Heroku)
// This must be set before rate limiting middleware
app.set('trust proxy', true);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false // Disable CSP for development
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : process.env.NODE_ENV === 'production' 
      ? ['https://your-domain.com'] 
      : ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: SERVER.RATE_LIMIT_WINDOW_MS,
  max: SERVER.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: SERVER.JSON_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: SERVER.URL_ENCODED_LIMIT }));

// Metrics middleware (should be before routes to capture all requests)
// Exclude metrics endpoint itself from metrics collection
app.use((req, res, next) => {
  if (req.path === '/api/metrics') {
    return next();
  }
  metricsMiddleware(req, res, next);
});

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/metrics', metricsRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', notFoundHandler);

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Insurance API server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
