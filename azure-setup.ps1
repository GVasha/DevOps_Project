# Azure Setup Script for DevOps Insurance
# Run these commands one at a time in PowerShell

# Step 1: Create Azure Container Registry
Write-Host "Creating Azure Container Registry..." -ForegroundColor Cyan
az acr create --resource-group BCSAI2025-DEVOPS-STUDENT-5B --name devopsinsuranceacr --sku Basic --admin-enabled true

# Step 2: Login to ACR
Write-Host "`nLogging in to Azure Container Registry..." -ForegroundColor Cyan
az acr login --name devopsinsuranceacr

# Step 3: Build and push backend image
Write-Host "`nBuilding backend Docker image..." -ForegroundColor Cyan
cd backend
docker build -t devopsinsuranceacr.azurecr.io/insurance-backend:latest .
Write-Host "`nPushing backend image to ACR..." -ForegroundColor Cyan
docker push devopsinsuranceacr.azurecr.io/insurance-backend:latest
cd ..

# Step 4: Get ACR credentials
Write-Host "`nGetting ACR credentials..." -ForegroundColor Cyan
$acrUsername = az acr credential show --name devopsinsuranceacr --query username --output tsv
$acrPassword = az acr credential show --name devopsinsuranceacr --query passwords[0].value --output tsv

# Step 5: Configure Web App to use the container
Write-Host "`nConfiguring Web App container settings..." -ForegroundColor Cyan
az webapp config container set `
  --name GeorgeInsurance `
  --resource-group BCSAI2025-DEVOPS-STUDENT-5B `
  --docker-custom-image-name devopsinsuranceacr.azurecr.io/insurance-backend:latest `
  --docker-registry-server-url https://devopsinsuranceacr.azurecr.io `
  --docker-registry-server-user $acrUsername `
  --docker-registry-server-password $acrPassword

# Step 6: Set environment variables
Write-Host "`nSetting environment variables..." -ForegroundColor Cyan
Write-Host "You'll need to set these manually or provide values:" -ForegroundColor Yellow
Write-Host "  - JWT_SECRET (required)" -ForegroundColor Yellow
Write-Host "  - OPENAI_API_KEY (optional)" -ForegroundColor Yellow
Write-Host "  - CORS_ORIGIN (your frontend URL)" -ForegroundColor Yellow

# Uncomment and set values to configure automatically:
# az webapp config appsettings set `
#   --name GeorgeInsurance `
#   --resource-group BCSAI2025-DEVOPS-STUDENT-5B `
#   --settings `
#     NODE_ENV=production `
#     PORT=5000 `
#     JWT_SECRET="your-secret-here" `
#     OPENAI_API_KEY="your-key-here" `
#     CORS_ORIGIN="https://your-frontend-url"

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Set environment variables in Azure Portal (Settings > Configuration)" -ForegroundColor White
Write-Host "2. Restart the Web App" -ForegroundColor White
Write-Host "3. Check logs: az webapp log tail --name GeorgeInsurance --resource-group BCSAI2025-DEVOPS-STUDENT-5B" -ForegroundColor White

