# Quick Start Guide

Get your DevOps Insurance application up and running quickly!

## 🚀 Quick Deploy to GitHub + Vercel

### Step 1: Prepare Your Code

```bash
# Make sure you're in the project root
cd "C:\Users\grego\Desktop\DevOps Insurance"

# Check git status
git status

# If not initialized, initialize git
git init

# Add all files (respects .gitignore)
git add .

# Commit
git commit -m "Initial commit - Ready for deployment"
```

### Step 2: Push to GitHub

1. **Create a GitHub Repository**:
   - Go to [github.com](https://github.com) and sign in
   - Click **"New repository"**
   - Name it: `devops-insurance`
   - Choose **Public** or **Private**
   - **Don't** initialize with README (you already have one)
   - Click **"Create repository"**

2. **Push Your Code**:
   ```bash
   # Add remote (replace YOUR_USERNAME with your GitHub username)
   git remote add origin https://github.com/YOUR_USERNAME/devops-insurance.git
   
   # Rename branch to main (if needed)
   git branch -M main
   
   # Push to GitHub
   git push -u origin main
   ```

### Step 3: Deploy Frontend to Vercel

1. **Go to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub

2. **Import Project**:
   - Click **"Add New Project"**
   - Select your `devops-insurance` repository
   - Click **"Import"**

3. **Configure Project**:
   - **Framework Preset**: Create React App (auto-detected)
   - **Root Directory**: `frontend` ⚠️ **Important!**
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `build` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Add Environment Variable**:
   - Click **"Environment Variables"**
   - Add:
     - **Name**: `REACT_APP_API_URL`
     - **Value**: `https://your-backend-url.com/api` (you'll update this after deploying backend)
     - For now, you can use: `http://localhost:5000/api` (for testing)

5. **Deploy**:
   - Click **"Deploy"**
   - Wait for build to complete (~2-3 minutes)
   - Your app will be live at: `https://devops-insurance-xxxxx.vercel.app`

### Step 4: Deploy Backend (Choose One)

#### Option A: Railway (Easiest) ⭐ Recommended

1. **Go to Railway**:
   - Visit [railway.app](https://railway.app)
   - Sign in with GitHub

2. **Create Project**:
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**
   - Choose your `devops-insurance` repository

3. **Configure Service**:
   - Railway will detect it's a Node.js app
   - Click on the service
   - Go to **Settings** → **Root Directory**: Set to `backend`
   - Go to **Settings** → **Start Command**: Should be `npm start`

4. **Add Environment Variables**:
   - Go to **Variables** tab
   - Add:
     ```
     NODE_ENV=production
     JWT_SECRET=<generate-strong-secret>
     OPENAI_API_KEY=<your-openai-key> (optional)
     CORS_ORIGIN=https://your-frontend.vercel.app
     ```
   - **Generate JWT Secret**:
     ```bash
     node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
     ```

5. **Get Backend URL**:
   - Railway will assign a URL like: `https://devops-insurance-production.up.railway.app`
   - Copy this URL

6. **Update Frontend**:
   - Go back to Vercel
   - Project Settings → Environment Variables
   - Update `REACT_APP_API_URL` to: `https://your-railway-url.up.railway.app/api`
   - Redeploy (or it will auto-redeploy)

#### Option B: Render

1. **Go to Render**:
   - Visit [render.com](https://render.com)
   - Sign in with GitHub

2. **Create Web Service**:
   - Click **"New +"** → **"Web Service"**
   - Connect your repository

3. **Configure**:
   - **Name**: `devops-insurance-backend`
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Add Environment Variables** (same as Railway)

5. **Deploy** and get your URL

### Step 5: Update CORS in Backend

After deploying backend, update the `CORS_ORIGIN` environment variable to include your Vercel frontend URL:

```
CORS_ORIGIN=https://your-app.vercel.app
```

### Step 6: Test Your Deployment

1. **Frontend**: Visit your Vercel URL
2. **Backend Health**: Visit `https://your-backend-url.com/api/health`
3. **Test Login**: Try registering/logging in
4. **Test Upload**: Try uploading an image

## ✅ Verification Checklist

- [ ] Code pushed to GitHub
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed (Railway/Render)
- [ ] Environment variables set correctly
- [ ] CORS configured with frontend URL
- [ ] Frontend can connect to backend
- [ ] Health check endpoint works
- [ ] Authentication works
- [ ] File upload works

## 🐛 Troubleshooting

### Frontend can't connect to backend
- Check `REACT_APP_API_URL` in Vercel matches your backend URL
- Check `CORS_ORIGIN` in backend includes your Vercel URL
- Check browser console for errors

### Build fails
- Check build logs in Vercel/Railway
- Ensure all dependencies are in `package.json`
- Check for TypeScript/ESLint errors

### Backend won't start
- Verify `JWT_SECRET` is set (required)
- Check logs in Railway/Render dashboard
- Ensure `PORT` is configured (or auto-assigned)

## 📚 Next Steps

- Read [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment options
- Read [README.md](./README.md) for full documentation
- Set up custom domains
- Configure monitoring
- Set up database (replace JSON files)

---

**Need Help?** Check the [DEPLOYMENT.md](./DEPLOYMENT.md) for more detailed instructions!

