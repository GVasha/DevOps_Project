# Deploy to GeorgeInsurance Web App

## Step 1: Push Image to Docker Hub (Recommended)

Since you have limited CLI permissions, the easiest way is to use Docker Hub:

### 1.1 Login to Docker Hub
```powershell
docker login
# Enter your Docker Hub username and password
```

### 1.2 Tag and Push Your Image
```powershell
# Tag the image with your Docker Hub username
docker tag insurance-backend:latest YOUR_DOCKERHUB_USERNAME/insurance-backend:latest

# Push to Docker Hub
docker push YOUR_DOCKERHUB_USERNAME/insurance-backend:latest
```

**Replace `YOUR_DOCKERHUB_USERNAME` with your actual Docker Hub username.**

---

## Step 2: Configure Web App in Azure Portal

### 2.1 Navigate to Your Web App
1. Go to [Azure Portal](https://portal.azure.com)
2. Search for "GeorgeInsurance" or navigate to your Web App
3. Click on **GeorgeInsurance**

### 2.2 Configure Container Settings
1. In the left menu, go to **Deployment Center** (or **Deployment** → **Deployment Center**)
2. Click on **Settings** tab
3. Configure:
   - **Source**: Select **Container Registry** or **Docker Hub**
   - **Registry**: 
     - If using Docker Hub: Select **Docker Hub** and enter your credentials
     - If using Azure Container Registry: Select your ACR
   - **Image and tag**: 
     - Docker Hub: `YOUR_DOCKERHUB_USERNAME/insurance-backend:latest`
     - ACR: `devopsinsuranceacr.azurecr.io/insurance-backend:latest`
   - **Startup Command**: Leave empty (or use `node server.js` if needed)
4. Click **Save**

### 2.3 Set Environment Variables
1. Go to **Settings** → **Configuration** (or **Configuration** in left menu)
2. Click **Application settings** tab
3. Click **+ New application setting** and add:

| Name | Value | Notes |
|------|-------|-------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `5000` | App Service maps this automatically |
| `JWT_SECRET` | `your-strong-secret-here` | **Required** - Generate a strong random string |
| `OPENAI_API_KEY` | `your-openai-key` | Optional |
| `CORS_ORIGIN` | `https://your-frontend-url` | Your frontend URL when deployed |

4. Click **Save** (this will restart your app)

### 2.4 Verify Deployment
1. Go to **Overview** in your Web App
2. Click **Browse** to open your app
3. Test the health endpoint: `https://your-app-url.azurewebsites.net/api/health`
4. Check logs: **Log stream** in the left menu

---

## Alternative: Use Azure Container Registry (If You Have Access)

If you can create an ACR via the Azure Portal:

### Option A: Create ACR via Portal
1. Search for "Container registries" in Azure Portal
2. Click **Create**
3. Fill in:
   - **Resource group**: `BCSAI2025-DEVOPS-STUDENT-5B`
   - **Registry name**: `devopsinsuranceacr` (must be globally unique)
   - **Location**: `Canada Central`
   - **SKU**: `Basic`
4. Click **Review + create** → **Create**

### Option B: Push to ACR
```powershell
# Login to ACR
az acr login --name devopsinsuranceacr

# Tag image for ACR
docker tag insurance-backend:latest devopsinsuranceacr.azurecr.io/insurance-backend:latest

# Push to ACR
docker push devopsinsuranceacr.azurecr.io/insurance-backend:latest
```

Then configure the Web App to use this ACR image.

---

## Troubleshooting

### Check Logs
1. Go to **Log stream** in your Web App
2. Or use **Logs** → **Application Logging**

### Common Issues

**Container won't start:**
- Check environment variables are set correctly
- Verify `JWT_SECRET` is set (required)
- Check logs for specific errors

**Can't access the app:**
- Verify the app is **Running** (not Stopped)
- Check the health endpoint: `/api/health`
- Verify port 5000 is exposed in your Dockerfile (it is)

**Image pull errors:**
- Verify Docker Hub credentials are correct
- Check image name and tag match exactly
- Ensure image is public or credentials are configured

---

## Next Steps

1. **Deploy Frontend**: Create another Web App for your React frontend
2. **Update CORS**: Set `CORS_ORIGIN` to your frontend URL
3. **Custom Domain**: Configure a custom domain if needed
4. **Monitoring**: Set up Application Insights for monitoring

---

## Quick PowerShell Commands (If You Get Permissions)

If you get permissions later, you can use:

```powershell
# Set environment variables
az webapp config appsettings set `
  --name GeorgeInsurance `
  --resource-group BCSAI2025-DEVOPS-STUDENT-5B `
  --settings `
    NODE_ENV=production `
    PORT=5000 `
    JWT_SECRET="your-secret" `
    CORS_ORIGIN="https://your-frontend-url"

# View logs
az webapp log tail --name GeorgeInsurance --resource-group BCSAI2025-DEVOPS-STUDENT-5B
```

