# Docker Setup Guide

This guide explains how to build and run the Insurance application using Docker.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Quick Start

### 1. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and set the required environment variables:

- `JWT_SECRET`: A secure random string for JWT token signing (required)
- `OPENAI_API_KEY`: Your OpenAI API key (optional, app will use basic analysis if not provided)
- `CORS_ORIGIN`: Frontend URL for CORS (default: http://localhost:3000)
- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:5000/api)

### 2. Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Individual Container Builds

### Backend Only

```bash
# Build the backend image
cd backend
docker build -t insurance-backend .

# Run the backend container
docker run -d \
  --name insurance-backend \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e PORT=5000 \
  -e JWT_SECRET=your-secret-key \
  -e OPENAI_API_KEY=your-api-key \
  -e CORS_ORIGIN=http://localhost:3000 \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/data:/app/data \
  insurance-backend
```

### Frontend Only

```bash
# Build the frontend image
cd frontend
docker build --build-arg REACT_APP_API_URL=http://localhost:5000/api -t insurance-frontend .

# Run the frontend container
docker run -d \
  --name insurance-frontend \
  -p 3000:80 \
  insurance-frontend
```

## Docker Compose Commands

```bash
# Start services in detached mode
docker-compose up -d

# Start services and view logs
docker-compose up

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild images
docker-compose build

# Rebuild and restart
docker-compose up -d --build

# View logs
docker-compose logs -f [service-name]

# Execute command in container
docker-compose exec backend sh
docker-compose exec frontend sh

# Check service status
docker-compose ps

# View resource usage
docker-compose top
```

## Environment Variables

### Backend Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Node environment | No | `production` |
| `PORT` | Server port | No | `5000` |
| `JWT_SECRET` | JWT signing secret | **Yes** | - |
| `OPENAI_API_KEY` | OpenAI API key | No | - |
| `CORS_ORIGIN` | Allowed CORS origin | No | `http://localhost:3000` |

### Frontend Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `REACT_APP_API_URL` | Backend API URL | No | `http://localhost:5000/api` |

**Note:** Frontend environment variables must be set at build time using `--build-arg` when building the Docker image.

## Production Deployment

### 1. Update Environment Variables

For production, update `.env` with production values:

```env
NODE_ENV=production
BACKEND_PORT=5000
JWT_SECRET=<generate-a-strong-secret>
OPENAI_API_KEY=<your-production-api-key>
CORS_ORIGIN=https://yourdomain.com
FRONTEND_PORT=80
REACT_APP_API_URL=https://api.yourdomain.com/api
```

### 2. Build for Production

```bash
# Rebuild with production environment
docker-compose build

# Start services
docker-compose up -d
```

### 3. Security Considerations

- **Never commit `.env` files** to version control
- Use strong, randomly generated `JWT_SECRET` values
- Set `CORS_ORIGIN` to your actual frontend domain in production
- Use HTTPS in production
- Consider using Docker secrets or external secret management for sensitive data

### 4. Using Docker Secrets (Optional)

For enhanced security, you can use Docker secrets:

```yaml
# docker-compose.yml
services:
  backend:
    secrets:
      - jwt_secret
      - openai_api_key

secrets:
  jwt_secret:
    external: true
  openai_api_key:
    external: true
```

Create secrets:
```bash
echo "your-secret" | docker secret create jwt_secret -
echo "your-api-key" | docker secret create openai_api_key -
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Check container status
docker-compose ps

# Inspect container
docker inspect insurance-backend
```

### Port already in use

If ports 3000 or 5000 are already in use, update `.env`:

```env
BACKEND_PORT=5001
FRONTEND_PORT=3001
```

### Permission issues with volumes

If you encounter permission issues with mounted volumes:

```bash
# Fix uploads directory permissions
sudo chown -R 1001:1001 backend/uploads
sudo chown -R 1001:1001 backend/data
```

### Frontend can't connect to backend

1. Ensure `REACT_APP_API_URL` is set correctly at build time
2. Check that backend is running and accessible
3. Verify CORS settings in backend
4. Check network connectivity: `docker-compose exec frontend ping backend`

### Rebuild after code changes

```bash
# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Rebuild and restart
docker-compose up -d --build
```

## Health Checks

Both containers include health checks:

- **Backend**: `http://localhost:5000/api/health`
- **Frontend**: `http://localhost:3000/health`

Check health status:
```bash
docker-compose ps
```

## Image Sizes

The multi-stage builds produce optimized images:

- **Backend**: ~150MB (Alpine-based)
- **Frontend**: ~50MB (Nginx Alpine with static files)

## Development vs Production

### Development

For development, you may want to mount source code:

```yaml
services:
  backend:
    volumes:
      - ./backend:/app
      - /app/node_modules
```

### Production

The provided Dockerfiles are optimized for production with:
- Multi-stage builds
- Minimal image sizes
- Non-root users
- Health checks
- Proper caching

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

