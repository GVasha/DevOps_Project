# Monitoring Setup Guide

This guide explains how to set up and use monitoring for the Insurance API using Prometheus and Grafana.

## Overview

The monitoring setup includes:
- **Health Endpoint** (`/api/health`) - Service status, version, and system info
- **Metrics Endpoint** (`/api/metrics`) - Prometheus-compatible metrics
- **Prometheus** - Metrics collection and storage
- **Grafana** - Visualization and dashboards

## Metrics Collected

The following metrics are automatically collected:

1. **Request Count** (`http_requests_total`)
   - Total number of HTTP requests
   - Labeled by method, route, and status code

2. **Request Latency** (`http_request_duration_seconds`)
   - Duration of HTTP requests in seconds
   - Histogram with buckets: 0.1s, 0.3s, 0.5s, 0.7s, 1s, 3s, 5s, 7s, 10s
   - Labeled by method, route, and status code

3. **Error Rate** (`http_request_errors_total`)
   - Total number of HTTP errors (4xx and 5xx)
   - Labeled by method, route, and status code

4. **System Metrics** (default Prometheus metrics)
   - CPU usage
   - Memory usage
   - Process information

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

This will install:
- `prom-client` - Prometheus client library
- `express-prometheus-middleware` - Express middleware for metrics

### 2. Start Application with Monitoring

```bash
# Start application and monitoring stack
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d

# Or start just the application (metrics endpoint will still work)
docker-compose up -d
```

### 3. Access Monitoring Tools

- **Application Health**: https://insurance-backend-latest.onrender.com/api/health
- **Prometheus Metrics**: https://insurance-backend-latest.onrender.com/api/metrics
- **Prometheus UI**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)

## Health Endpoint

### GET /api/health

Returns comprehensive health information:

```json
{
  "success": true,
  "data": {
    "status": "OK",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "version": "1.0.0",
    "service": "insurance-backend",
    "uptime": 3600.5,
    "environment": "production",
    "memory": {
      "used": 45,
      "total": 128,
      "unit": "MB"
    }
  },
  "message": "Service is healthy"
}
```

**Fields:**
- `status`: Service status (OK, ERROR, etc.)
- `timestamp`: Current server timestamp
- `version`: Application version from package.json
- `service`: Service name
- `uptime`: Process uptime in seconds
- `environment`: Node environment
- `memory`: Current memory usage

## Metrics Endpoint

### GET /api/metrics

Returns metrics in Prometheus format:

```
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",route="/api/health",status_code="200"} 150

# HELP http_request_duration_seconds Duration of HTTP requests in seconds
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{method="GET",route="/api/health",status_code="200",le="0.1"} 145
http_request_duration_seconds_bucket{method="GET",route="/api/health",status_code="200",le="0.3"} 150
...

# HELP http_request_errors_total Total number of HTTP request errors
# TYPE http_request_errors_total counter
http_request_errors_total{method="POST",route="/api/auth/login",status_code="401"} 5
```

## Prometheus Setup

### Configuration

Prometheus configuration is in `prometheus/prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'insurance-api'
    metrics_path: '/api/metrics'
    static_configs:
      - targets: ['backend:5000']
```

### Access Prometheus

1. Open http://localhost:9090
2. Go to Status > Targets to verify the API is being scraped
3. Use the Graph tab to query metrics

### Example Queries

**Request Rate:**
```promql
rate(http_requests_total[5m])
```

**Error Rate:**
```promql
rate(http_request_errors_total[5m])
```

**95th Percentile Latency:**
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

**Error Percentage:**
```promql
(sum(rate(http_request_errors_total[5m])) / sum(rate(http_requests_total[5m]))) * 100
```

## Grafana Setup

### Import Dashboard

1. Access Grafana at http://localhost:3001
2. Login with default credentials (admin/admin)
3. The dashboard should be automatically provisioned from `grafana/dashboards/insurance-api-dashboard.json`

### Manual Import

If automatic provisioning doesn't work:

1. Go to Dashboards > Import
2. Upload `grafana/dashboards/insurance-api-dashboard.json`
3. Select Prometheus as the data source
4. Click Import

### Dashboard Panels

The dashboard includes:

1. **Request Rate** - Requests per second over time
2. **Request Latency (p95)** - 95th and 50th percentile latency
3. **Error Rate** - Errors per second
4. **Total Requests** - Total requests in the last hour
5. **Error Rate Percentage** - Percentage of requests that are errors
6. **Request Status Codes** - Breakdown by HTTP status code
7. **Memory Usage** - Process memory consumption

## Running Without Docker

### Local Development

1. Start the backend:
```bash
cd backend
npm start
```

2. Start Prometheus:
```bash
docker run -d \
  -p 9090:9090 \
  -v $(pwd)/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus:latest
```

3. Start Grafana:
```bash
docker run -d \
  -p 3001:3000 \
  -v $(pwd)/grafana/dashboards:/etc/grafana/provisioning/dashboards \
  grafana/grafana:latest
```

### Update Prometheus Config for Local

If running locally, update `prometheus/prometheus.yml`:

```yaml
static_configs:
  - targets: ['host.docker.internal:5000']  # For Docker Prometheus
  # OR
  - targets: ['localhost:5000']  # For local Prometheus
```

## Environment Variables

Add to `.env` for monitoring:

```env
# Prometheus
PROMETHEUS_PORT=9090

# Grafana
GRAFANA_PORT=3001
GRAFANA_USER=admin
GRAFANA_PASSWORD=admin
```

## Monitoring Best Practices

1. **Alerting**: Set up alerts in Prometheus for:
   - High error rate (> 5%)
   - High latency (p95 > 1s)
   - Service down (health check fails)

2. **Retention**: Configure data retention in Prometheus:
   ```yaml
   - '--storage.tsdb.retention.time=200h'
   ```

3. **Scraping Interval**: Adjust based on needs:
   ```yaml
   scrape_interval: 10s  # More frequent = more data, more storage
   ```

4. **Metrics Cardinality**: Be mindful of label combinations to avoid high cardinality

## Troubleshooting

### Metrics Not Appearing

1. Check if metrics endpoint is accessible:
   ```bash
   curl https://insurance-backend-latest.onrender.com/api/metrics
   ```

2. Verify Prometheus can reach the backend:
   - Check Prometheus targets: http://localhost:9090/targets
   - Ensure backend is on the same Docker network

3. Check Prometheus logs:
   ```bash
   docker-compose logs prometheus
   ```

### Grafana Can't Connect to Prometheus

1. Verify Prometheus is running:
   ```bash
   docker-compose ps prometheus
   ```

2. Check Grafana datasource configuration
3. Ensure both are on the same Docker network

### High Memory Usage

- Reduce Prometheus retention time
- Reduce scrape interval
- Limit metrics collection to essential metrics only

## Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [PromQL Query Language](https://prometheus.io/docs/prometheus/latest/querying/basics/)

