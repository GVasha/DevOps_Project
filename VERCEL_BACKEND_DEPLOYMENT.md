# Deploying Backend on Vercel (Serverless Functions)

## ⚠️ Important Limitations

Vercel serverless functions have significant limitations for Express backends:

1. **10-second timeout** on free tier (60 seconds on Pro)
2. **File upload size limits** (4.5MB on free tier)
3. **No persistent file storage** - file uploads won't persist
4. **Cold starts** - first request after inactivity can be slow
5. **Not ideal for long-running processes**

## 📋 Prerequisites

- Vercel account (free tier works)
- Backend code in your repository
- Environment variables ready

## 🚀 Step-by-Step Deployment

### Option 1: Deploy Backend + Frontend Together (Recommended for Testing)

1. **Update Root `vercel.json`** (already done):
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "frontend/package.json",
         "use": "@vercel/static-build",
         "config": { "distDir": "build" }
       },
       {
         "src": "api/index.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       { "src": "/api/(.*)", "dest": "/api/index.js" },
       { "src": "/(.*)", "dest": "/frontend/$1" }
     ],
     "rewrites": [
       { "source": "/((?!api/).*)", "destination": "/index.html" }
     ]
   }
   ```

2. **Create `api/index.js`** (already created):
   - This file wraps your Express app for Vercel

3. **Set Environment Variables in Vercel**:
   - Go to: Project Settings → Environment Variables
   - Add:
     - `NODE_ENV=production`
     - `JWT_SECRET=your-secret-key`
     - `CORS_ORIGIN=https://your-frontend.vercel.app`
     - `OPENAI_API_KEY=your-key` (optional)

4. **Deploy**:
   ```bash
   git add vercel.json api/index.js
   git commit -m "Add Vercel serverless function configuration"
   git push
   ```

5. **Update Frontend API URL**:
   - In Vercel Dashboard → Environment Variables
   - Set `REACT_APP_API_URL` to: `https://your-project.vercel.app/api`

### Option 2: Deploy Backend as Separate Project

1. **Create Separate Vercel Project**:
   - Go to Vercel Dashboard → Add New Project
   - Select your repository
   - Set **Root Directory**: `backend`
   - **Framework Preset**: Other
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty

2. **Create `vercel.json` in `backend/` directory**:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "api/index.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/api/index.js"
       }
     ]
   }
   ```

3. **Create `backend/api/index.js`**:
   ```javascript
   const app = require('../server');
   module.exports = app;
   ```

4. **Set Environment Variables** (same as Option 1)

5. **Update Frontend**:
   - Set `REACT_APP_API_URL` to your backend Vercel URL: `https://your-backend.vercel.app/api`

## 🔧 Required Modifications for Vercel

### 1. File Storage Issue

Vercel serverless functions are **stateless** - files uploaded won't persist. You need to:

**Option A: Use External Storage (Recommended)**
- AWS S3
- Cloudinary
- Upload to external service and store URLs

**Option B: Disable File Uploads** (for testing only)
- Comment out file upload routes temporarily

### 2. Update CORS Origin

In `backend/server.js`, make sure CORS allows your Vercel frontend:
```javascript
origin: process.env.CORS_ORIGIN || 'https://your-frontend.vercel.app'
```

### 3. Environment Variables

Set these in Vercel Dashboard:
- `NODE_ENV=production`
- `JWT_SECRET=your-secret`
- `CORS_ORIGIN=https://your-frontend.vercel.app`
- `OPENAI_API_KEY=your-key` (if using)

## ⚠️ Known Issues & Workarounds

1. **File Uploads Don't Persist**
   - Use external storage (S3, Cloudinary)
   - Or disable file uploads for testing

2. **10-Second Timeout**
   - Optimize slow endpoints
   - Consider breaking into smaller functions
   - Upgrade to Pro for 60-second timeout

3. **Cold Starts**
   - First request after inactivity can take 1-2 seconds
   - Keep functions warm with scheduled pings

## 🎯 Better Alternatives for Backend

For production, consider these platforms (better suited for Express backends):

### 1. **Railway** (Recommended)
- Free tier available
- No timeout limits
- Persistent file storage
- Easy deployment
- See: `DEPLOYMENT.md` for instructions

### 2. **Render**
- Free tier available
- Persistent storage
- Auto-deploy from GitHub
- See: `DEPLOYMENT.md` for instructions

### 3. **Heroku**
- Free tier discontinued, but paid plans available
- Very reliable
- Easy deployment

### 4. **Fly.io**
- Free tier available
- Global edge deployment
- Good for Docker containers

## 📝 Testing Your Deployment

1. **Check Health Endpoint**:
   ```
   https://your-backend.vercel.app/api/health
   ```

2. **Test API Endpoints**:
   ```bash
   curl https://your-backend.vercel.app/api/health
   ```

3. **Check Logs**:
   - Vercel Dashboard → Your Project → Logs
   - Monitor for errors

## 🔍 Troubleshooting

### Error: "Route not found"
- Check that `api/index.js` exists
- Verify `vercel.json` routes are correct
- Check build logs in Vercel dashboard

### Error: "Module not found"
- Ensure all dependencies are in `package.json`
- Check that `backend/` directory structure is correct

### Timeout Errors
- Optimize slow endpoints
- Consider upgrading to Pro plan
- Break large operations into smaller chunks

### CORS Errors
- Verify `CORS_ORIGIN` environment variable
- Check that frontend URL is in allowed origins

## 📚 Additional Resources

- [Vercel Serverless Functions Docs](https://vercel.com/docs/functions)
- [Express on Vercel](https://vercel.com/guides/using-express-with-vercel)
- [Vercel Limits](https://vercel.com/docs/platform/limits)

---

**Recommendation**: Use Vercel for frontend, and deploy backend on Railway or Render for better performance and fewer limitations.

