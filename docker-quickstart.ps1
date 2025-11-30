# Quick start script for Docker setup (PowerShell)

Write-Host "🐳 DevOps Insurance - Docker Quick Start" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "⚠️  .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ Created .env file. Please edit it with your configuration." -ForegroundColor Green
    Write-Host ""
    Read-Host "Press Enter to continue after editing .env, or Ctrl+C to exit"
}

# Check if JWT_SECRET is set
$envContent = Get-Content .env -Raw
if ($envContent -match "your-super-secret-jwt-key-change-this-in-production") {
    Write-Host "⚠️  WARNING: JWT_SECRET is still set to the default value!" -ForegroundColor Yellow
    Write-Host "   Please update it in .env before running in production." -ForegroundColor Yellow
    Write-Host ""
}

# Build and start containers
Write-Host "🔨 Building Docker images..." -ForegroundColor Cyan
docker-compose build

Write-Host ""
Write-Host "🚀 Starting containers..." -ForegroundColor Cyan
docker-compose up -d

Write-Host ""
Write-Host "⏳ Waiting for services to be healthy..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Check health
Write-Host ""
Write-Host "📊 Service Status:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "✅ Services are running!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Access the application:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000"
Write-Host "   Backend API: http://localhost:5000"
Write-Host "   Health Check: https://insurance-backend-latest.onrender.com/api/health"
Write-Host ""
Write-Host "📝 View logs: docker-compose logs -f" -ForegroundColor Gray
Write-Host "🛑 Stop services: docker-compose down" -ForegroundColor Gray
Write-Host ""

