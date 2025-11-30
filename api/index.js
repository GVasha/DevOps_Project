/**
 * Vercel Serverless Function Entry Point
 * This wraps the Express app for Vercel's serverless environment
 */

const app = require('../backend/server');

// Export the Express app as a serverless function
module.exports = app;

