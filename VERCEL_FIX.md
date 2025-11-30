# Fixing "Route not found" Error on Vercel

## Quick Fix Steps

### Step 1: Verify Vercel Project Settings

In your Vercel dashboard, make sure these settings are correct:

1. **Root Directory**: Set to `frontend`
   - Go to: Project Settings → General → Root Directory
   - Value: `frontend`

2. **Build Command**: Should be `npm run build` (or leave empty for auto-detection)

3. **Output Directory**: Should be `build` (or leave empty for auto-detection)

4. **Install Command**: Should be `npm install` (or leave empty for auto-detection)

### Step 2: Update vercel.json

The `vercel.json` file has been updated. Make sure it's committed and pushed:

```bash
git add vercel.json
git commit -m "Fix Vercel routing configuration"
git push
```

### Step 3: Redeploy

After pushing, Vercel will automatically redeploy. Or manually trigger:
- Go to Vercel dashboard → Your project → Deployments
- Click "Redeploy" on the latest deployment

## Alternative: Remove vercel.json (Let Vercel Auto-Detect)

If the issue persists, you can delete `vercel.json` and let Vercel auto-detect:

1. **In Vercel Dashboard**:
   - Set **Root Directory** to `frontend`
   - Vercel will auto-detect Create React App
   - It will automatically configure routing for React Router

2. **Delete vercel.json** (optional):
   ```bash
   git rm vercel.json
   git commit -m "Remove vercel.json, use auto-detection"
   git push
   ```

## Check What's Happening

### If the error is on the root URL (`/`)

The app should redirect to `/dashboard`. Check:
1. Browser console for JavaScript errors
2. Network tab to see what's being requested
3. Verify the build completed successfully

### If the error is on API routes (`/api/*`)

If you're trying to access backend API routes, those won't work on Vercel unless:
1. You've set up serverless functions (see DEPLOYMENT.md)
2. Or you're accessing your backend on a different domain (Railway, Render, etc.)

Make sure `REACT_APP_API_URL` is set to your backend URL, not Vercel's domain.

## Common Issues

### Issue 1: Root Directory Not Set
**Symptom**: Build succeeds but routes don't work
**Fix**: Set Root Directory to `frontend` in Vercel dashboard

### Issue 2: Build Output Wrong
**Symptom**: 404 on all routes
**Fix**: Ensure Output Directory is `build` (not `frontend/build`)

### Issue 3: Environment Variables Missing
**Symptom**: App loads but API calls fail
**Fix**: Set `REACT_APP_API_URL` in Vercel environment variables

### Issue 4: Caching Issues
**Symptom**: Old version still showing
**Fix**: 
- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Redeploy in Vercel

## Verify Deployment

After fixing, check:

1. **Root URL** (`https://your-app.vercel.app/`):
   - Should redirect to `/dashboard` or show login page

2. **Login Page** (`https://your-app.vercel.app/login`):
   - Should show the login form

3. **Dashboard** (`https://your-app.vercel.app/dashboard`):
   - Should show dashboard (if authenticated) or redirect to login

4. **Browser Console**:
   - Should have no errors
   - Check Network tab for API calls

## Still Not Working?

1. **Check Build Logs**:
   - Vercel dashboard → Deployments → Click on deployment → View build logs
   - Look for errors or warnings

2. **Check Function Logs**:
   - Vercel dashboard → Functions tab
   - Look for any errors

3. **Test Locally First**:
   ```bash
   cd frontend
   npm run build
   npx serve -s build
   ```
   - Visit http://localhost:3000
   - If it works locally, it's a Vercel config issue

4. **Contact Support**:
   - Vercel has excellent support
   - Include build logs and error messages

