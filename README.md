# 🏥 DevOps Insurance

> AI-powered car damage assessment and insurance claims processing platform

[![CI Pipeline](https://github.com/your-org/devops-insurance/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/devops-insurance/actions)
[![Coverage](https://img.shields.io/badge/coverage-70%25-brightgreen)](https://github.com/your-org/devops-insurance)

DevOps Insurance is a full-stack web application that leverages AI to analyze car damage from images and streamline the insurance claims process. Built with React, Node.js, and Express, featuring comprehensive monitoring, CI/CD pipelines, and Docker support.

---

## 📋 Table of Contents

- [Features](#-features)
- [Project Architecture](#-project-architecture)
- [Prerequisites](#-prerequisites)
- [Local Development](#-local-development)
- [Testing](#-testing)
- [Docker Deployment](#-docker-deployment)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Production Deployment](#-production-deployment)
- [Monitoring](#-monitoring)
- [API Documentation](#-api-documentation)
- [Security](#-security)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

- 🤖 **AI-Powered Damage Assessment** - Automated car damage analysis using OpenAI
- 📸 **Image Upload** - Support for single and multiple image uploads
- 🔐 **Secure Authentication** - JWT-based authentication with bcrypt password hashing
- 📊 **Real-time Monitoring** - Prometheus metrics and Grafana dashboards
- 🐳 **Docker Support** - Containerized deployment with Docker Compose
- ✅ **CI/CD Integration** - Automated testing and deployment with GitHub Actions
- 🛡️ **Security Features** - Rate limiting, CORS, Helmet.js, input validation
- 📱 **Responsive UI** - Modern React frontend with Tailwind CSS

---

## 🏗️ Project Architecture

### System Overview

```
┌─────────────────┐         ┌─────────────────┐
│   React Frontend │ ◄─────► │  Express Backend │
│   (Port 3000)    │   API   │   (Port 5000)   │
└─────────────────┘         └─────────────────┘
                                      │
                                      ▼
                            ┌─────────────────┐
                            │  AI Services   │
                            │  (OpenAI API)  │
                            └─────────────────┘
                                      │
                                      ▼
                            ┌─────────────────┐
                            │  Data Storage   │
                            │  (JSON Files)   │
                            └─────────────────┘
```

### Technology Stack

**Frontend:**
- React 18.2
- React Router
- Tailwind CSS
- Axios for API calls

**Backend:**
- Node.js 18+
- Express.js
- JWT Authentication
- Multer for file uploads
- Prometheus for metrics

**DevOps:**
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- Prometheus & Grafana
- Jest for testing

### Directory Structure

```
devops-insurance/
├── backend/                 # Backend API server
│   ├── config/             # Configuration constants
│   ├── data/               # JSON data storage (dev)
│   ├── middleware/         # Express middleware
│   │   ├── auth.js         # JWT authentication
│   │   ├── errorHandler.js # Error handling
│   │   └── metrics.js      # Prometheus metrics
│   ├── routes/             # API routes
│   │   ├── auth.js         # Authentication endpoints
│   │   ├── upload.js       # File upload endpoints
│   │   ├── assessment.js   # Damage assessment endpoints
│   │   ├── health.js       # Health check endpoint
│   │   └── metrics.js      # Prometheus metrics endpoint
│   ├── services/           # Business logic layer
│   │   ├── aiService.js    # AI analysis service
│   │   ├── UserService.js  # User management
│   │   ├── ClaimService.js # Claims management
│   │   └── AssessmentService.js
│   ├── tests/              # Test suites
│   │   ├── unit/          # Unit tests
│   │   └── integration/    # Integration tests
│   ├── utils/              # Utility functions
│   ├── server.js           # Express server entry point
│   └── Dockerfile          # Backend Docker image
│
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   └── contexts/       # React contexts
│   ├── public/             # Static assets
│   └── Dockerfile           # Frontend Docker image
│
├── prometheus/              # Prometheus configuration
│   └── prometheus.yml
│
├── grafana/                 # Grafana dashboards
│   ├── dashboards/
│   └── datasources/
│
├── .github/workflows/       # CI/CD pipelines
│   └── ci.yml
│
├── docker-compose.yml       # Main Docker Compose file
├── docker-compose.monitoring.yml  # Monitoring stack
└── README.md
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Docker** (optional, for containerized deployment) - [Download](https://www.docker.com/)
- **Docker Compose** (optional) - [Download](https://docs.docker.com/compose/install/)
- **Git** - [Download](https://git-scm.com/)

---

## 🚀 Local Development

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/devops-insurance.git
cd devops-insurance
```

### Step 2: Install Dependencies

Install dependencies for all parts of the application:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

**Or use the convenience script:**

```bash
npm run install-all
```

### Step 3: Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env  # If .env.example exists
```

Edit `.env` and set the following variables:

```env
# Backend Configuration
NODE_ENV=development
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this
OPENAI_API_KEY=your-openai-api-key-optional
CORS_ORIGIN=http://localhost:3000
```

**Important:** 
- Replace `JWT_SECRET` with a strong, random string
- `OPENAI_API_KEY` is optional - the app will use basic analysis if not provided
- Never commit `.env` files to version control

### Step 4: Start Development Servers

From the root directory, start both frontend and backend:

```bash
npm run dev
```

This will start:
- **Backend API** on http://localhost:5000
- **Frontend** on http://localhost:3000

**Or start them separately:**

```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

### Step 5: Verify Installation

1. Open http://localhost:3000 in your browser
2. Check backend health: https://insurance-backend-latest.onrender.com/api/health
3. You should see the login page and a healthy API response

---

## 🧪 Testing

### Running Tests

#### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

#### Frontend Tests

```bash
cd frontend

# Run tests
npm test
```

### Viewing Test Coverage

#### Backend Coverage

After running tests, coverage reports are generated automatically:

```bash
cd backend
npm test
```

Coverage reports are available in:
- **HTML Report**: `backend/coverage/index.html`
- **JSON Summary**: `backend/coverage/coverage-summary.json`
- **LCOV Report**: `backend/coverage/lcov.info`

**View HTML Coverage Report:**

```bash
# On macOS/Linux
open backend/coverage/index.html

# On Windows
start backend/coverage/index.html

# Or navigate to the file in your file explorer
```

**Coverage Requirements:**
- Minimum 70% coverage required for all metrics (lines, statements, functions, branches)
- CI pipeline will fail if coverage is below 70%

#### Coverage Metrics

The test suite tracks:
- **Lines**: Percentage of code lines executed
- **Statements**: Percentage of statements executed
- **Functions**: Percentage of functions called
- **Branches**: Percentage of branches taken

---

## 🐳 Docker Deployment

### Quick Start with Docker Compose

The easiest way to run the entire application is using Docker Compose:

#### Step 1: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env and set required variables
# At minimum, set JWT_SECRET
```

#### Step 2: Build and Run

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Step 3: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: https://insurance-backend-latest.onrender.com/api/health

### Individual Container Builds

#### Backend Only

```bash
cd backend

# Build the image
docker build -t insurance-backend .

# Run the container
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

#### Frontend Only

```bash
cd frontend

# Build the image
docker build --build-arg REACT_APP_API_URL=https://insurance-backend-latest.onrender.com/api -t insurance-frontend .

# Run the container
docker run -d \
  --name insurance-frontend \
  -p 3000:80 \
  insurance-frontend
```

### Docker Compose Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Rebuild images
docker-compose build

# View logs
docker-compose logs -f [service-name]

# Execute command in container
docker-compose exec backend sh
docker-compose exec frontend sh

# Check service status
docker-compose ps
```

For detailed Docker documentation, see [DOCKER.md](./DOCKER.md).

---

## 🔄 CI/CD Pipeline

### Overview

The project uses **GitHub Actions** for continuous integration and deployment. The CI pipeline automatically runs on every push and pull request.

### Pipeline Workflow

The CI pipeline (`.github/workflows/ci.yml`) performs the following steps:

1. **Checkout Code** - Retrieves the latest code from the repository
2. **Setup Node.js** - Configures Node.js 18.x environment
3. **Install Dependencies** - Installs backend and frontend dependencies
4. **Run Backend Tests** - Executes Jest test suite with coverage
5. **Check Coverage Threshold** - Verifies coverage is ≥ 70%
6. **Run Frontend Tests** - Executes React test suite
7. **Build Applications** - Verifies both apps build successfully
8. **Upload Artifacts** - Saves coverage reports as downloadable artifacts

### Pipeline Triggers

The pipeline runs automatically on:
- **Push** to `main`, `develop`, or `master` branches
- **Pull Requests** targeting `main`, `develop`, or `master` branches

### Viewing Pipeline Results

1. Go to your GitHub repository
2. Click on the **Actions** tab
3. Select a workflow run to view details
4. Click on individual jobs to see logs and results

### Coverage Enforcement

The pipeline enforces a **minimum 70% coverage** requirement:
- If coverage falls below 70%, the pipeline fails
- Coverage reports are available as downloadable artifacts
- All metrics (lines, statements, functions, branches) must meet the threshold

### Pipeline Status Badge

Add this badge to your README (update the URL):

```markdown
[![CI Pipeline](https://github.com/your-org/devops-insurance/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/devops-insurance/actions)
```

---

## 🚢 Production Deployment

### Quick Start: Deploy to GitHub + Vercel

For a quick production deployment:

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/devops-insurance.git
   git push -u origin main
   ```

2. **Deploy Frontend to Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "Add New Project" and import your GitHub repository
   - Set **Root Directory** to `frontend`
   - Add environment variable: `REACT_APP_API_URL` (your backend URL)
   - Click "Deploy"

3. **Deploy Backend** (Choose one):
   - **Railway** (Recommended): [railway.app](https://railway.app) - Auto-deploys from GitHub
   - **Render**: [render.com](https://render.com) - Free tier available
   - **Heroku**: Traditional PaaS option

📖 **For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

### Azure Deployment

Deploy to Microsoft Azure using containerized services:

**Quick Start:**
```powershell
# Generate JWT secret
$jwtSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | % {[char]$_})

# Run quick deployment script
.\azure-quickstart.ps1 -JwtSecret $jwtSecret -OpenAiApiKey "your-key-here"
```

**Options:**
- **Azure Container Apps** (Recommended) - Modern serverless containers
- **Azure App Service** - Traditional PaaS with containers
- **Azure Container Instances** - Simple container hosting

📖 **For comprehensive Azure deployment guide, see [AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md)**

### Pre-Deployment Checklist

- [ ] Push code to GitHub
- [ ] Set `NODE_ENV=production`
- [ ] Configure strong `JWT_SECRET`
- [ ] Set production `CORS_ORIGIN` (your Vercel frontend URL)
- [ ] Configure production database (replace JSON files)
- [ ] Set up file storage (e.g., AWS S3)
- [ ] Configure production API keys
- [ ] Set up SSL/TLS certificates (automatic on Vercel)
- [ ] Configure domain names
- [ ] Set up monitoring and alerting

### Backend Deployment

#### Option 1: Docker Deployment (Recommended)

```bash
# Build production image
cd backend
docker build -t insurance-backend:latest .

# Run with production environment
docker run -d \
  --name insurance-backend \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=your-production-secret \
  -e CORS_ORIGIN=https://yourdomain.com \
  -e OPENAI_API_KEY=your-production-key \
  --restart unless-stopped \
  insurance-backend:latest
```

#### Option 2: Traditional Deployment

```bash
# Install production dependencies
cd backend
npm ci --only=production

# Start with PM2 (process manager)
npm install -g pm2
pm2 start server.js --name insurance-api
pm2 save
pm2 startup
```

### Frontend Deployment

#### Option 1: Docker Deployment

```bash
cd frontend
docker build --build-arg REACT_APP_API_URL=https://api.yourdomain.com/api -t insurance-frontend:latest .
docker run -d -p 80:80 --name insurance-frontend insurance-frontend:latest
```

#### Option 2: Vercel Deployment (Recommended)

**Via Vercel Dashboard:**
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. Add Environment Variable:
   - `REACT_APP_API_URL`: Your backend API URL
6. Click **"Deploy"**

**Via Vercel CLI:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Set environment variable
vercel env add REACT_APP_API_URL

# Deploy to production
vercel --prod
```

#### Option 3: Other Static Hosting

```bash
# Build production bundle
cd frontend
npm run build

# Deploy build/ directory to:
# - Netlify
# - AWS S3 + CloudFront
# - Any static hosting service
```

### Environment Variables for Production

```env
# Backend
NODE_ENV=production
PORT=5000
JWT_SECRET=<generate-strong-random-secret>
OPENAI_API_KEY=<your-production-openai-key>
CORS_ORIGIN=https://yourdomain.com

# Frontend (build-time)
REACT_APP_API_URL=https://api.yourdomain.com/api
```

### Database Migration

For production, replace JSON file storage with a proper database:

**Recommended Options:**
- **MongoDB** - Document database, easy migration from JSON
- **PostgreSQL** - Relational database, robust and scalable
- **MySQL** - Popular relational database

**Migration Steps:**
1. Choose and set up your database
2. Create database schema
3. Migrate data from JSON files
4. Update service layer to use database client
5. Test thoroughly before deploying

### GitHub Repository Setup

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub Repository**:
   - Go to [github.com](https://github.com) and create a new repository
   - Copy the repository URL

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/your-username/devops-insurance.git
   git branch -M main
   git push -u origin main
   ```

4. **Enable GitHub Actions**:
   - The CI/CD pipeline (`.github/workflows/ci.yml`) will run automatically
   - Check the **Actions** tab in your GitHub repository

### Environment Variables Setup

**Frontend (Vercel):**
- `REACT_APP_API_URL`: Backend API URL (e.g., `https://api.yourdomain.com/api`)

**Backend (Railway/Render/Heroku):**
- `NODE_ENV=production`
- `PORT=5000` (or auto-assigned)
- `JWT_SECRET`: Strong random string (required)
- `OPENAI_API_KEY`: Your OpenAI API key (optional)
- `CORS_ORIGIN`: Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📊 Monitoring

The application includes comprehensive monitoring with Prometheus metrics and health checks.

### Health Endpoint

**GET** `/api/health`

Returns service health status, version, and system information.

**Example Response:**

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

**Usage:**
- Health checks for load balancers
- Monitoring system status
- Uptime verification

### Metrics Endpoint

**GET** `/api/metrics`

Returns Prometheus-compatible metrics in text format.

**Available Metrics:**

1. **Request Count** (`http_requests_total`)
   - Total HTTP requests by method, route, and status code

2. **Request Latency** (`http_request_duration_seconds`)
   - Request duration histogram
   - Supports p50, p95, p99 percentile calculations

3. **Error Rate** (`http_request_errors_total`)
   - Count of 4xx and 5xx errors
   - Labeled by method, route, and status code

4. **System Metrics** (default Prometheus)
   - CPU usage
   - Memory usage
   - Process information

**Example Query:**

```bash
curl https://insurance-backend-latest.onrender.com/api/metrics
```

### Prometheus Integration

#### Start Monitoring Stack

```bash
# Start application and monitoring
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

#### Access Monitoring Tools

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)

#### Example Prometheus Queries

```promql
# Request rate
rate(http_requests_total[5m])

# Error rate
rate(http_request_errors_total[5m])

# 95th percentile latency
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Error percentage
(sum(rate(http_request_errors_total[5m])) / sum(rate(http_requests_total[5m]))) * 100
```

For detailed monitoring documentation, see [MONITORING.md](./MONITORING.md).

---

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | User registration | No |
| `POST` | `/api/auth/login` | User login (returns JWT) | No |
| `GET` | `/api/auth/profile` | Get user profile | Yes |
| `PUT` | `/api/auth/profile` | Update user profile | Yes |
| `DELETE` | `/api/auth/account` | Delete user account | Yes |

### File Upload Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/upload/single` | Upload single image | Yes |
| `POST` | `/api/upload/multiple` | Upload multiple images | Yes |
| `GET` | `/api/upload/file/:filename` | Get file metadata | Yes |
| `DELETE` | `/api/upload/file/:filename` | Delete file | Yes |

### Assessment & Claims Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/assessment/analyze` | Analyze car damage | Yes |
| `GET` | `/api/assessment/my-assessments` | Get user assessments | Yes |
| `GET` | `/api/assessment/assessment/:id` | Get assessment details | Yes |
| `POST` | `/api/assessment/create-claim` | Create insurance claim | Yes |
| `GET` | `/api/assessment/my-claims` | Get user claims | Yes |
| `GET` | `/api/assessment/claim/:id` | Get claim details | Yes |

### System Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/health` | Health check | No |
| `GET` | `/api/metrics` | Prometheus metrics | No |

### Authentication

Protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## 🔒 Security

### Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Authentication**: Stateless token-based auth
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: All inputs validated and sanitized
- **CORS Protection**: Configured for specific domains
- **Helmet.js**: Security headers protection
- **File Validation**: Strict image type and size validation
- **Error Handling**: Secure, non-descriptive error messages

### Security Best Practices

1. **Never commit `.env` files** - Use environment variables
2. **Use strong JWT secrets** - Generate random, long strings
3. **Enable HTTPS in production** - Use SSL/TLS certificates
4. **Keep dependencies updated** - Regularly update npm packages
5. **Monitor for vulnerabilities** - Use `npm audit`
6. **Implement rate limiting** - Already configured
7. **Validate all inputs** - Already implemented
8. **Use secure file storage** - Consider AWS S3 for production

---

## 🐛 Troubleshooting

### Common Issues

#### Backend Won't Start

**Problem:** Port 5000 is already in use

**Solution:**
```bash
# Find process using port 5000
# On macOS/Linux
lsof -i :5000

# On Windows
netstat -ano | findstr :5000

# Kill the process or change PORT in .env
```

#### Tests Failing

**Problem:** Tests fail with coverage below 70%

**Solution:**
- Write more tests to increase coverage
- Check coverage report: `backend/coverage/index.html`
- Focus on uncovered lines and branches

#### Docker Build Fails

**Problem:** Docker build errors

**Solution:**
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

#### Frontend Can't Connect to Backend

**Problem:** CORS errors or connection refused

**Solution:**
- Verify `REACT_APP_API_URL` is set correctly
- Check backend is running on correct port
- Verify CORS_ORIGIN in backend .env matches frontend URL

#### AI Analysis Fails

**Problem:** OpenAI API errors

**Solution:**
- Verify `OPENAI_API_KEY` is set correctly
- Check API quota and billing status
- App will fall back to basic analysis if OpenAI fails

#### File Upload Issues

**Problem:** Uploads fail or files not saving

**Solution:**
- Check file size (max 10MB)
- Verify file type (jpg, png, gif, webp)
- Ensure `uploads` directory exists and is writable
- Check disk space

### Getting Help

- Check existing issues on GitHub
- Review documentation in `MONITORING.md` and `DOCKER.md`
- Check application logs: `docker-compose logs -f`

---

## 📝 License

MIT License - see LICENSE file for details

---

## 👥 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Development Guidelines:**
- Write tests for new features
- Maintain 70%+ test coverage
- Follow existing code style
- Update documentation as needed

---

## 📞 Support

For questions, issues, or contributions:

- **GitHub Issues**: [Create an issue](https://github.com/your-org/devops-insurance/issues)
- **Documentation**: See `MONITORING.md` and `DOCKER.md` for detailed guides

---

**DevOps Insurance** - Revolutionizing insurance claims with AI-powered damage assessment. 🚀
