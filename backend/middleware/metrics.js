/**
 * Prometheus metrics middleware
 * Tracks request count, latency, and error rate
 */

const promClient = require('prom-client');

// Create a Registry to register the metrics
const register = new promClient.Registry();

// Add default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestErrors = new promClient.Counter({
  name: 'http_request_errors_total',
  help: 'Total number of HTTP request errors',
  labelNames: ['method', 'route', 'status_code']
});

// Register custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(httpRequestErrors);

/**
 * Middleware to collect metrics
 */
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  // Get route path, fallback to original URL path
  const route = req.route ? req.route.path : req.path || req.originalUrl || 'unknown';
  
  // Override res.end to capture response status and duration
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = (Date.now() - start) / 1000; // Convert to seconds
    const statusCode = res.statusCode || 200;
    const method = req.method || 'UNKNOWN';
    
    // Record metrics
    httpRequestDuration.observe(
      { method, route: String(route), status_code: String(statusCode) },
      duration
    );
    
    httpRequestTotal.inc({ method, route: String(route), status_code: String(statusCode) });
    
    // Count errors (4xx and 5xx status codes)
    if (statusCode >= 400) {
      httpRequestErrors.inc({ method, route: String(route), status_code: String(statusCode) });
    }
    
    // Call original end
    originalEnd.apply(this, args);
  };
  
  next();
};

/**
 * Get metrics in Prometheus format
 */
const getMetrics = async () => {
  return register.metrics();
};

/**
 * Get metrics registry
 */
const getRegister = () => {
  return register;
};

module.exports = {
  metricsMiddleware,
  getMetrics,
  getRegister,
  httpRequestDuration,
  httpRequestTotal,
  httpRequestErrors
};

