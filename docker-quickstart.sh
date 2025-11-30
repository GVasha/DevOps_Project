#!/bin/bash

# Quick start script for Docker setup

set -e

echo "🐳 DevOps Insurance - Docker Quick Start"
echo "=========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please edit it with your configuration."
    echo ""
    read -p "Press Enter to continue after editing .env, or Ctrl+C to exit..."
fi

# Check if JWT_SECRET is set
if grep -q "your-super-secret-jwt-key-change-this-in-production" .env 2>/dev/null; then
    echo "⚠️  WARNING: JWT_SECRET is still set to the default value!"
    echo "   Please update it in .env before running in production."
    echo ""
fi

# Build and start containers
echo "🔨 Building Docker images..."
docker-compose build

echo ""
echo "🚀 Starting containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 5

# Check health
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ Services are running!"
echo ""
echo "📍 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo "   Health Check: https://insurance-backend-latest.onrender.com/api/health"
echo ""
echo "📝 View logs: docker-compose logs -f"
echo "🛑 Stop services: docker-compose down"
echo ""

