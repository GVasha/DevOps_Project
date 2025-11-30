/**
 * Prometheus metrics endpoint
 * GET /api/metrics
 */

const express = require('express');
const router = express.Router();
const { getMetrics } = require('../middleware/metrics');

/**
 * Prometheus metrics endpoint
 * Returns metrics in Prometheus format
 */
router.get('/', async (req, res) => {
  try {
    const metrics = await getMetrics();
    res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.status(200).send(metrics);
  } catch (error) {
    res.status(500).send(`Error generating metrics: ${error.message}`);
  }
});

module.exports = router;

