# Azure Deployment Guide

This guide covers deploying the DevOps Insurance application to Microsoft Azure using various container-based deployment options.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Deployment Options](#deployment-options)
  - [Option 1: Azure Container Apps (Recommended)](#option-1-azure-container-apps-recommended)
  - [Option 2: Azure App Service with Containers](#option-2-azure-app-service-with-containers)
  - [Option 3: Azure Container Instances](#option-3-azure-container-instances)
  - [Option 4: Azure Static Web Apps + App Service](#option-4-azure-static-web-apps--app-service)
- [Environment Variables](#environment-variables)
- [Azure Container Registry](#azure-container-registry)
- [CI/CD with GitHub Actions](#cicd-with-github-actions)
- [Troubleshooting](#troubleshooting)
- [Cost Optimization](#cost-optimization)

---

## Prerequisites

- Azure account ([Free tier available](https://azure.microsoft.com/free/))
- Azure CLI installed ([Install guide](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli))
- Docker installed locally (for building images)
- GitHub repository (for CI/CD)

### Install Azure CLI

```bash
# Windows (PowerShell)
Invoke-WebRequest -Uri https://aka.ms/installazurecliwindows -OutFile .\AzureCLI.msi
Start-Process msiexec.exe -Wait -ArgumentList '/I AzureCLI.msi /quiet'

# macOS
brew install azure-cli

# Linux
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

### Login to Azure

```bash
az login
az account set --subscription "Your Subscription Name"
```

---

## Deployment Options

### Option 1: Azure Container Apps (Recommended)

Azure Container Apps is a modern, serverless container platform that's perfect for microservices. It provides automatic scaling, built-in load balancing, and integrated monitoring.

#### Step 1: Create Resource Group

```bash
az group create \
  --name devops-insurance-rg \
  --location eastus
```

#### Step 2: Create Container Apps Environment

```bash
az containerapp env create \
  --name devops-insurance-env \
  --resource-group devops-insurance-rg \
  --location eastus
```

#### Step 3: Create Azure Container Registry (ACR)

```bash
# Create ACR
az acr create \
  --resource-group devops-insurance-rg \
  --name devopsinsuranceacr \
  --sku Basic \
  --admin-enabled true

# Login to ACR
az acr login --name devopsinsuranceacr

# Get ACR login server
ACR_LOGIN_SERVER=$(az acr show --name devopsinsuranceacr --query loginServer --output tsv)
echo $ACR_LOGIN_SERVER
```

#### Step 4: Build and Push Backend Image

```bash
# Navigate to backend directory
cd backend

# Build and tag image
docker build -t devopsinsuranceacr.azurecr.io/insurance-backend:latest .

# Push to ACR
docker push devopsinsuranceacr.azurecr.io/insurance-backend:latest
```

#### Step 5: Deploy Backend Container App

```bash
# Get ACR credentials
ACR_USERNAME=$(az acr credential show --name devopsinsuranceacr --query username --output tsv)
ACR_PASSWORD=$(az acr credential show --name devopsinsuranceacr --query passwords[0].value --output tsv)

# Create backend container app
az containerapp create \
  --name insurance-backend \
  --resource-group devops-insurance-rg \
  --environment devops-insurance-env \
  --image devopsinsuranceacr.azurecr.io/insurance-backend:latest \
  --registry-server devopsinsuranceacr.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --target-port 5000 \
  --ingress external \
  --env-vars \
    NODE_ENV=production \
    PORT=5000 \
    JWT_SECRET="your-jwt-secret-here" \
    OPENAI_API_KEY="your-openai-key-here" \
    CORS_ORIGIN="https://your-frontend-url.azurecontainerapps.io"
```

#### Step 6: Build and Push Frontend Image

```bash
# Navigate to frontend directory
cd ../frontend

# Get backend URL (you'll need this for the build arg)
BACKEND_URL=$(az containerapp show --name insurance-backend --resource-group devops-insurance-rg --query properties.configuration.ingress.fqdn --output tsv)
echo "Backend URL: https://$BACKEND_URL"

# Build with backend URL
docker build \
  --build-arg REACT_APP_API_URL=https://$BACKEND_URL/api \
  -t devopsinsuranceacr.azurecr.io/insurance-frontend:latest .

# Push to ACR
docker push devopsinsuranceacr.azurecr.io/insurance-frontend:latest
```

#### Step 7: Deploy Frontend Container App

```bash
az containerapp create \
  --name insurance-frontend \
  --resource-group devops-insurance-rg \
  --environment devops-insurance-env \
  --image devopsinsuranceacr.azurecr.io/insurance-frontend:latest \
  --registry-server devopsinsuranceacr.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --target-port 80 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 3
```

#### Step 8: Update Backend CORS

After getting the frontend URL, update the backend CORS:

```bash
FRONTEND_URL=$(az containerapp show --name insurance-frontend --resource-group devops-insurance-rg --query properties.configuration.ingress.fqdn --output tsv)

az containerapp update \
  --name insurance-backend \
  --resource-group devops-insurance-rg \
  --set-env-vars CORS_ORIGIN="https://$FRONTEND_URL"
```

#### Get Application URLs

```bash
# Backend URL
az containerapp show \
  --name insurance-backend \
  --resource-group devops-insurance-rg \
  --query properties.configuration.ingress.fqdn \
  --output tsv

# Frontend URL
az containerapp show \
  --name insurance-frontend \
  --resource-group devops-insurance-rg \
  --query properties.configuration.ingress.fqdn \
  --output tsv
```

---

### Option 2: Azure App Service with Containers

Azure App Service provides a more traditional PaaS experience with container support.

#### Step 1: Create App Service Plan

```bash
az appservice plan create \
  --name devops-insurance-plan \
  --resource-group devops-insurance-rg \
  --is-linux \
  --sku B1
```

#### Step 2: Create Backend Web App

```bash
# Create web app for backend
az webapp create \
  --resource-group devops-insurance-rg \
  --plan devops-insurance-plan \
  --name devops-insurance-backend \
  --deployment-container-image-name devopsinsuranceacr.azurecr.io/insurance-backend:latest

# Configure ACR credentials
az webapp config container set \
  --name devops-insurance-backend \
  --resource-group devops-insurance-rg \
  --docker-custom-image-name devopsinsuranceacr.azurecr.io/insurance-backend:latest \
  --docker-registry-server-url https://devopsinsuranceacr.azurecr.io \
  --docker-registry-server-user $ACR_USERNAME \
  --docker-registry-server-password $ACR_PASSWORD

# Set environment variables
az webapp config appsettings set \
  --resource-group devops-insurance-rg \
  --name devops-insurance-backend \
  --settings \
    NODE_ENV=production \
    PORT=5000 \
    JWT_SECRET="your-jwt-secret" \
    OPENAI_API_KEY="your-openai-key" \
    CORS_ORIGIN="https://devops-insurance-frontend.azurewebsites.net"
```

#### Step 3: Create Frontend Web App

```bash
# Create web app for frontend
az webapp create \
  --resource-group devops-insurance-rg \
  --plan devops-insurance-plan \
  --name devops-insurance-frontend \
  --deployment-container-image-name devopsinsuranceacr.azurecr.io/insurance-frontend:latest

# Configure ACR credentials
az webapp config container set \
  --name devops-insurance-frontend \
  --resource-group devops-insurance-rg \
  --docker-custom-image-name devopsinsuranceacr.azurecr.io/insurance-frontend:latest \
  --docker-registry-server-url https://devopsinsuranceacr.azurecr.io \
  --docker-registry-server-user $ACR_USERNAME \
  --docker-registry-server-password $ACR_PASSWORD
```

#### Step 4: Enable Continuous Deployment

```bash
# Enable continuous deployment from ACR
az webapp deployment container config \
  --enable-cd true \
  --name devops-insurance-backend \
  --resource-group devops-insurance-rg

az webapp deployment container config \
  --enable-cd true \
  --name devops-insurance-frontend \
  --resource-group devops-insurance-rg
```

---

### Option 3: Azure Container Instances

Simple container hosting for quick deployments or development/testing.

#### Step 1: Create Backend Container Instance

```bash
az container create \
  --resource-group devops-insurance-rg \
  --name insurance-backend \
  --image devopsinsuranceacr.azurecr.io/insurance-backend:latest \
  --registry-login-server devopsinsuranceacr.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --dns-name-label insurance-backend \
  --ports 5000 \
  --environment-variables \
    NODE_ENV=production \
    PORT=5000 \
    JWT_SECRET="your-jwt-secret" \
    OPENAI_API_KEY="your-openai-key" \
    CORS_ORIGIN="http://insurance-frontend.eastus.azurecontainer.io"
```

#### Step 2: Create Frontend Container Instance

```bash
az container create \
  --resource-group devops-insurance-rg \
  --name insurance-frontend \
  --image devopsinsuranceacr.azurecr.io/insurance-frontend:latest \
  --registry-login-server devopsinsuranceacr.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --dns-name-label insurance-frontend \
  --ports 80
```

**Note**: ACI is best for development/testing. For production, use Container Apps or App Service.

---

### Option 4: Azure Static Web Apps + App Service

Deploy frontend as a static site and backend as a containerized app.

#### Frontend: Azure Static Web Apps

```bash
# Install Static Web Apps extension
az extension add --name staticwebapp

# Create static web app
az staticwebapp create \
  --name devops-insurance-frontend \
  --resource-group devops-insurance-rg \
  --location eastus2 \
  --sku Free

# Build and deploy (requires GitHub connection)
# Or use Azure Static Web Apps CLI
npm install -g @azure/static-web-apps-cli

cd frontend
npm run build
swa deploy ./build --deployment-token <your-token>
```

#### Backend: Use Option 1 or 2 above

---

## Environment Variables

### Backend Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment | Yes | `production` |
| `PORT` | Server port | No | `5000` |
| `JWT_SECRET` | JWT signing secret | **Yes** | Generate strong random string |
| `OPENAI_API_KEY` | OpenAI API key | No | `sk-...` |
| `CORS_ORIGIN` | Allowed CORS origin | Yes | `https://your-frontend-url` |

### Frontend Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `REACT_APP_API_URL` | Backend API URL | Yes | `https://backend-url/api` |

**Note**: Frontend variables must be set at **build time** using Docker build args.

### Generating JWT Secret

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Using OpenSSL
openssl rand -hex 64

# Using PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | % {[char]$_})
```

---

## Azure Container Registry

### Build Images Locally and Push

```bash
# Login to ACR
az acr login --name devopsinsuranceacr

# Build and push backend
cd backend
docker build -t devopsinsuranceacr.azurecr.io/insurance-backend:latest .
docker push devopsinsuranceacr.azurecr.io/insurance-backend:latest

# Build and push frontend
cd ../frontend
docker build --build-arg REACT_APP_API_URL=https://your-backend-url/api -t devopsinsuranceacr.azurecr.io/insurance-frontend:latest .
docker push devopsinsuranceacr.azurecr.io/insurance-frontend:latest
```

### Use ACR Build Tasks (Cloud Build)

```bash
# Build backend in ACR
az acr build \
  --registry devopsinsuranceacr \
  --image insurance-backend:latest \
  --file backend/Dockerfile \
  ./backend

# Build frontend in ACR
az acr build \
  --registry devopsinsuranceacr \
  --image insurance-frontend:latest \
  --file frontend/Dockerfile \
  --build-arg REACT_APP_API_URL=https://your-backend-url/api \
  ./frontend
```

### Enable Admin User (for testing)

```bash
az acr update --name devopsinsuranceacr --admin-enabled true
```

---

## CI/CD with GitHub Actions

Create `.github/workflows/azure-deploy.yml`:

```yaml
name: Deploy to Azure

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  AZURE_WEBAPP_NAME_BACKEND: devops-insurance-backend
  AZURE_WEBAPP_NAME_FRONTEND: devops-insurance-frontend
  AZURE_RESOURCE_GROUP: devops-insurance-rg
  ACR_NAME: devopsinsuranceacr
  CONTAINER_APP_ENV: devops-insurance-env

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Login to Azure Container Registry
        run: |
          az acr login --name ${{ env.ACR_NAME }}

      - name: Build and push backend image
        run: |
          cd backend
          docker build -t ${{ env.ACR_NAME }}.azurecr.io/insurance-backend:${{ github.sha }} .
          docker build -t ${{ env.ACR_NAME }}.azurecr.io/insurance-backend:latest .
          docker push ${{ env.ACR_NAME }}.azurecr.io/insurance-backend:${{ github.sha }}
          docker push ${{ env.ACR_NAME }}.azurecr.io/insurance-backend:latest

      - name: Build and push frontend image
        run: |
          cd frontend
          BACKEND_URL="https://${{ env.AZURE_WEBAPP_NAME_BACKEND }}.azurewebsites.net"
          docker build \
            --build-arg REACT_APP_API_URL=$BACKEND_URL/api \
            -t ${{ env.ACR_NAME }}.azurecr.io/insurance-frontend:${{ github.sha }} .
          docker build \
            --build-arg REACT_APP_API_URL=$BACKEND_URL/api \
            -t ${{ env.ACR_NAME }}.azurecr.io/insurance-frontend:latest .
          docker push ${{ env.ACR_NAME }}.azurecr.io/insurance-frontend:${{ github.sha }}
          docker push ${{ env.ACR_NAME }}.azurecr.io/insurance-frontend:latest

      - name: Deploy to Azure Container Apps
        run: |
          # Update backend
          az containerapp update \
            --name insurance-backend \
            --resource-group ${{ env.AZURE_RESOURCE_GROUP }} \
            --image ${{ env.ACR_NAME }}.azurecr.io/insurance-backend:${{ github.sha }}

          # Update frontend
          az containerapp update \
            --name insurance-frontend \
            --resource-group ${{ env.AZURE_RESOURCE_GROUP }} \
            --image ${{ env.ACR_NAME }}.azurecr.io/insurance-frontend:${{ github.sha }}
```

### Setup GitHub Secrets

1. Create Azure Service Principal:

```bash
az ad sp create-for-rbac --name "github-actions-deploy" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/devops-insurance-rg \
  --sdk-auth
```

2. Copy the JSON output and add it to GitHub Secrets as `AZURE_CREDENTIALS`:
   - Go to your GitHub repository
   - Settings → Secrets and variables → Actions
   - New repository secret
   - Name: `AZURE_CREDENTIALS`
   - Value: Paste the JSON output

---

## Troubleshooting

### Container Won't Start

```bash
# Check container logs (Container Apps)
az containerapp logs show \
  --name insurance-backend \
  --resource-group devops-insurance-rg \
  --follow

# Check logs (App Service)
az webapp log tail \
  --name devops-insurance-backend \
  --resource-group devops-insurance-rg

# Check container status (ACI)
az container show \
  --name insurance-backend \
  --resource-group devops-insurance-rg \
  --query instanceView.state
```

### Image Pull Errors

```bash
# Verify ACR credentials
az acr credential show --name devopsinsuranceacr

# Test ACR login
az acr login --name devopsinsuranceacr
docker pull devopsinsuranceacr.azurecr.io/insurance-backend:latest
```

### CORS Issues

1. Verify `CORS_ORIGIN` matches your frontend URL exactly
2. Check backend logs for CORS errors
3. Ensure frontend is using HTTPS if backend expects HTTPS

### Environment Variables Not Working

```bash
# List current environment variables (Container Apps)
az containerapp show \
  --name insurance-backend \
  --resource-group devops-insurance-rg \
  --query properties.template.containers[0].env

# Update environment variables
az containerapp update \
  --name insurance-backend \
  --resource-group devops-insurance-rg \
  --set-env-vars KEY=value
```

### Port Configuration

- **Backend**: Exposes port 5000
- **Frontend**: Exposes port 80
- Azure automatically maps these to external ports

### Health Check Failures

```bash
# Test health endpoint
curl https://your-backend-url/api/health

# Check health check configuration
az containerapp show \
  --name insurance-backend \
  --resource-group devops-insurance-rg \
  --query properties.template.containers[0].probes
```

---

## Cost Optimization

### Azure Container Apps

- **Consumption Plan**: Pay per use, scales to zero
- **Dedicated Plan**: Fixed pricing, better for consistent workloads
- **Recommendation**: Start with Consumption Plan

### Azure App Service

- **Free Tier**: Limited features, not for production
- **Basic (B1)**: ~$13/month, good for small apps
- **Standard (S1)**: ~$70/month, recommended for production

### Azure Container Instances

- Pay per second of usage
- Good for dev/test, not cost-effective for production

### Cost-Saving Tips

1. Use **Azure Container Apps Consumption Plan** for auto-scaling
2. Enable **auto-shutdown** for dev/test environments
3. Use **Azure Reserved Instances** for predictable workloads
4. Monitor costs in Azure Cost Management
5. Delete unused resources

### Estimated Monthly Costs

| Service | Tier | Estimated Cost |
|---------|------|----------------|
| Container Apps (Consumption) | Per use | $20-50/month |
| App Service | Basic B1 | ~$13/month per app |
| Container Registry | Basic | ~$5/month |
| **Total (Container Apps)** | | **~$25-55/month** |
| **Total (App Service)** | | **~$31/month** |

---

## Production Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production` in backend
- [ ] Generate strong `JWT_SECRET` (64+ characters)
- [ ] Configure `CORS_ORIGIN` with production frontend URL
- [ ] Set `REACT_APP_API_URL` with production backend URL
- [ ] Enable HTTPS/SSL (automatic on Azure)
- [ ] Set up Application Insights for monitoring
- [ ] Configure custom domains
- [ ] Set up database (replace JSON file storage with Azure Database)
- [ ] Configure Azure Blob Storage for file uploads
- [ ] Set up backup strategy
- [ ] Configure auto-scaling rules
- [ ] Set up alerts and monitoring
- [ ] Test all functionality in production environment
- [ ] Set up CI/CD pipeline
- [ ] Document deployment process for team
- [ ] Review and optimize costs

---

## Additional Resources

- [Azure Container Apps Documentation](https://docs.microsoft.com/azure/container-apps/)
- [Azure App Service Documentation](https://docs.microsoft.com/azure/app-service/)
- [Azure Container Registry Documentation](https://docs.microsoft.com/azure/container-registry/)
- [Azure CLI Reference](https://docs.microsoft.com/cli/azure/)
- [Docker on Azure](https://docs.microsoft.com/azure/containers/)

---

**Happy Deploying! 🚀**

