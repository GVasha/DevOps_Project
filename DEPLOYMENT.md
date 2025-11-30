# Deployment Guide

This guide covers deploying the DevOps Insurance application to various platforms.

## Table of Contents

- [Vercel Deployment (Frontend)](#vercel-deployment-frontend)
- [Backend Deployment Options](#backend-deployment-options)
- [Environment Variables](#environment-variables)
- [GitHub Setup](#github-setup)
- [Troubleshooting](#troubleshooting)

---

## Vercel Deployment (Frontend)

Vercel is an excellent platform for deploying React applications with automatic SSL, CDN, and global distribution.

### Prerequisites

- GitHub account
- Vercel account (free tier available)
- Backend API deployed and accessible

### Step 1: Push to GitHub

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Ready for deployment"

# Add your GitHub repository as remote
git remote add origin https://github.com/your-username/devops-insurance.git

# Push to GitHub
git push -u origin main
```

### Step 2: Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   - `REACT_APP_API_URL`: Your backend API URL (e.g., `https://api.yourdomain.com/api`)

6. Click **"Deploy"**

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to project root
cd /path/to/devops-insurance

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (Select your account)
# - Link to existing project? No
# - Project name? devops-insurance
# - Directory? frontend
# - Override settings? No

# Set environment variables
vercel env add REACT_APP_API_URL
# Enter your backend API URL when prompted

# Deploy to production
vercel --prod
```

### Step 3: Configure Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to **Domains**
3. Add your custom domain
4. Follow DNS configuration instructions

---

## Backend Deployment Options

The backend Express application can be deployed to various platforms. Here are recommended options:

### Option 1: Railway (Recommended)

Railway is excellent for Node.js applications with automatic deployments from GitHub.

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your repository
5. Configure:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`
6. Add Environment Variables:
   - `NODE_ENV=production`
   - `PORT=5000` (Railway will auto-assign)
   - `JWT_SECRET=<your-secret>`
   - `OPENAI_API_KEY=<your-key>`
   - `CORS_ORIGIN=https://your-frontend-domain.vercel.app`
7. Railway will automatically deploy on every push to main

### Option 2: Render

1. Go to [render.com](https://render.com)
2. Sign in with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your repository
5. Configure:
   - **Name**: `devops-insurance-backend`
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add Environment Variables (same as Railway)
7. Click **"Create Web Service"**

### Option 3: Heroku

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create devops-insurance-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
heroku config:set OPENAI_API_KEY=your-key
heroku config:set CORS_ORIGIN=https://your-frontend.vercel.app

# Deploy
git subtree push --prefix backend heroku main
```

### Option 4: Vercel Serverless Functions

While Vercel is primarily for frontend, you can deploy Express as serverless functions:

1. Create `api/index.js` in the root:
```javascript
const app = require('./backend/server');
module.exports = app;
```

2. Update `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build"
    },
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ]
}
```

**Note**: This approach has limitations (10-second timeout on free tier, file upload size limits). Consider Railway or Render for better backend support.

---

## Environment Variables

### Frontend (Vercel)

Set these in Vercel Dashboard → Project Settings → Environment Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `https://api.yourdomain.com/api` |

### Backend (Railway/Render/Heroku)

Set these in your backend hosting platform:

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment | Yes | `production` |
| `PORT` | Server port | No | `5000` (auto-assigned on Railway) |
| `JWT_SECRET` | JWT signing secret | **Yes** | Generate strong random string |
| `OPENAI_API_KEY` | OpenAI API key | No | `sk-...` |
| `CORS_ORIGIN` | Allowed CORS origin | Yes | `https://your-app.vercel.app` |

### Generating JWT Secret

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Using OpenSSL
openssl rand -hex 64
```

---

## GitHub Setup

### Initial Setup

```bash
# Initialize repository
git init

# Create .gitignore (already created)
# Add files
git add .

# Initial commit
git commit -m "Initial commit"

# Add remote
git remote add origin https://github.com/your-username/devops-insurance.git

# Push to GitHub
git push -u origin main
```

### Branch Strategy

```bash
# Create development branch
git checkout -b develop

# Create feature branch
git checkout -b feature/new-feature

# Push feature branch
git push -u origin feature/new-feature
```

### GitHub Actions CI/CD

The project includes a CI/CD pipeline (`.github/workflows/ci.yml`) that:
- Runs tests on every push
- Checks code coverage (≥70%)
- Builds both frontend and backend
- Uploads coverage reports as artifacts

To enable:
1. Push code to GitHub
2. Go to repository → **Actions** tab
3. The workflow will run automatically

---

## Troubleshooting

### Frontend Can't Connect to Backend

**Problem**: CORS errors or connection refused

**Solutions**:
1. Verify `REACT_APP_API_URL` is set correctly in Vercel
2. Check `CORS_ORIGIN` in backend includes your Vercel domain
3. Ensure backend is deployed and accessible
4. Check browser console for specific error messages

### Build Fails on Vercel

**Problem**: Build errors during deployment

**Solutions**:
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify Node.js version (should be 18+)
4. Check for TypeScript/ESLint errors locally first

### Backend Deployment Issues

**Problem**: Backend won't start

**Solutions**:
1. Verify all environment variables are set
2. Check logs in your hosting platform
3. Ensure `PORT` is correctly configured (some platforms auto-assign)
4. Verify `JWT_SECRET` is set (required)
5. Check file permissions for `uploads` and `data` directories

### Environment Variables Not Working

**Problem**: Variables not being read correctly

**Solutions**:
1. **Frontend**: Variables must start with `REACT_APP_` prefix
2. **Backend**: Ensure `.env` file exists or variables are set in platform
3. Restart/redeploy after adding new variables
4. Check variable names match exactly (case-sensitive)

### File Upload Issues

**Problem**: Uploads fail in production

**Solutions**:
1. Check file size limits (max 10MB)
2. Verify `uploads` directory exists and is writable
3. Consider using cloud storage (AWS S3) for production
4. Check backend logs for specific errors

---

## Production Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production` in backend
- [ ] Generate strong `JWT_SECRET` (64+ characters)
- [ ] Configure `CORS_ORIGIN` with production frontend URL
- [ ] Set `REACT_APP_API_URL` with production backend URL
- [ ] Enable HTTPS/SSL (automatic on Vercel)
- [ ] Set up monitoring and error tracking
- [ ] Configure custom domains
- [ ] Set up database (replace JSON file storage)
- [ ] Configure file storage (consider AWS S3)
- [ ] Set up backup strategy
- [ ] Test all functionality in production environment
- [ ] Set up CI/CD pipeline
- [ ] Document deployment process for team

---

## Support

For deployment issues:
- Check platform-specific documentation
- Review application logs
- Test locally first
- Check GitHub Issues

---

**Happy Deploying! 🚀**

