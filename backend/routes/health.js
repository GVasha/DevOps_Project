/**
 * Health check endpoint
 * Returns service status, timestamp, and version
 */

const express = require('express');
const router = express.Router();
const { successResponse } = require('../utils/responseHelper');
const packageJson = require('../package.json');

/**
 * Health check endpoint
 * GET /api/health
 */
router.get('/', (req, res) => {
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: packageJson.version,
    service: packageJson.name,
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB'
    }
  };
  
  return successResponse(res, healthData, 'Service is healthy');
});

module.exports = router;

