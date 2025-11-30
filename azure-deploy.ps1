# Azure Deployment Script for DevOps Insurance
# This script automates the deployment process to Azure Container Apps

param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroupName = "devops-insurance-rg",
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "eastus",
    
    [Parameter(Mandatory=$false)]
    [string]$AcrName = "devopsinsuranceacr",
    
    [Parameter(Mandatory=$false)]
    [string]$EnvironmentName = "devops-insurance-env",
    
    [Parameter(Mandatory=$false)]
    [string]$BackendAppName = "insurance-backend",
    
    [Parameter(Mandatory=$false)]
    [string]$FrontendAppName = "insurance-frontend",
    
    [Parameter(Mandatory=$true)]
    [string]$JwtSecret,
    
    [Parameter(Mandatory=$false)]
    [string]$OpenAiApiKey = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild = $false
)

Write-Host "🚀 Starting Azure Deployment..." -ForegroundColor Green

# Check if Azure CLI is installed
try {
    $azVersion = az version --output json | ConvertFrom-Json
    Write-Host "✓ Azure CLI version: $($azVersion.'azure-cli')" -ForegroundColor Green
} catch {
    Write-Host "❌ Azure CLI not found. Please install it first." -ForegroundColor Red
    Write-Host "Download from: https://aka.ms/installazurecliwindows" -ForegroundColor Yellow
    exit 1
}

# Check if logged in
$account = az account show --output json 2>$null | ConvertFrom-Json
if (-not $account) {
    Write-Host "⚠️  Not logged in to Azure. Logging in..." -ForegroundColor Yellow
    az login
}

Write-Host "✓ Logged in as: $($account.user.name)" -ForegroundColor Green

# Step 1: Create Resource Group
Write-Host "`n📦 Creating Resource Group..." -ForegroundColor Cyan
$rgExists = az group exists --name $ResourceGroupName --output tsv
if ($rgExists -eq "false") {
    az group create --name $ResourceGroupName --location $Location
    Write-Host "✓ Resource Group created" -ForegroundColor Green
} else {
    Write-Host "✓ Resource Group already exists" -ForegroundColor Yellow
}

# Step 2: Create Container Apps Environment
Write-Host "`n🌍 Creating Container Apps Environment..." -ForegroundColor Cyan
$envExists = az containerapp env show --name $EnvironmentName --resource-group $ResourceGroupName --output json 2>$null
if (-not $envExists) {
    az containerapp env create `
        --name $EnvironmentName `
        --resource-group $ResourceGroupName `
        --location $Location
    Write-Host "✓ Container Apps Environment created" -ForegroundColor Green
} else {
    Write-Host "✓ Container Apps Environment already exists" -ForegroundColor Yellow
}

# Step 3: Create Azure Container Registry
Write-Host "`n📦 Creating Azure Container Registry..." -ForegroundColor Cyan
$acrExists = az acr show --name $AcrName --resource-group $ResourceGroupName --output json 2>$null
if (-not $acrExists) {
    az acr create `
        --resource-group $ResourceGroupName `
        --name $AcrName `
        --sku Basic `
        --admin-enabled true
    Write-Host "✓ Container Registry created" -ForegroundColor Green
} else {
    Write-Host "✓ Container Registry already exists" -ForegroundColor Yellow
}

# Get ACR credentials
Write-Host "`n🔐 Getting ACR credentials..." -ForegroundColor Cyan
$acrLoginServer = az acr show --name $AcrName --query loginServer --output tsv
$acrUsername = az acr credential show --name $AcrName --query username --output tsv
$acrPassword = az acr credential show --name $AcrName --query passwords[0].value --output tsv

az acr login --name $AcrName
Write-Host "✓ Logged in to ACR" -ForegroundColor Green

# Step 4: Build and Push Backend
if (-not $SkipBuild) {
    Write-Host "`n🔨 Building Backend Image..." -ForegroundColor Cyan
    Push-Location backend
    docker build -t "$acrLoginServer/insurance-backend:latest" .
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Backend build failed" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    docker push "$acrLoginServer/insurance-backend:latest"
    Pop-Location
    Write-Host "✓ Backend image built and pushed" -ForegroundColor Green
}

# Step 5: Deploy Backend Container App
Write-Host "`n🚀 Deploying Backend..." -ForegroundColor Cyan
$backendExists = az containerapp show --name $BackendAppName --resource-group $ResourceGroupName --output json 2>$null

$envVars = @(
    "NODE_ENV=production",
    "PORT=5000",
    "JWT_SECRET=$JwtSecret"
)

if ($OpenAiApiKey) {
    $envVars += "OPENAI_API_KEY=$OpenAiApiKey"
}

if (-not $backendExists) {
    az containerapp create `
        --name $BackendAppName `
        --resource-group $ResourceGroupName `
        --environment $EnvironmentName `
        --image "$acrLoginServer/insurance-backend:latest" `
        --registry-server $acrLoginServer `
        --registry-username $acrUsername `
        --registry-password $acrPassword `
        --target-port 5000 `
        --ingress external `
        --env-vars $envVars
    Write-Host "✓ Backend deployed" -ForegroundColor Green
} else {
    az containerapp update `
        --name $BackendAppName `
        --resource-group $ResourceGroupName `
        --image "$acrLoginServer/insurance-backend:latest" `
        --set-env-vars $envVars
    Write-Host "✓ Backend updated" -ForegroundColor Green
}

# Get backend URL
$backendUrl = az containerapp show --name $BackendAppName --resource-group $ResourceGroupName --query properties.configuration.ingress.fqdn --output tsv
Write-Host "✓ Backend URL: https://$backendUrl" -ForegroundColor Green

# Step 6: Build and Push Frontend
if (-not $SkipBuild) {
    Write-Host "`n🔨 Building Frontend Image..." -ForegroundColor Cyan
    Push-Location frontend
    docker build `
        --build-arg REACT_APP_API_URL="https://$backendUrl/api" `
        -t "$acrLoginServer/insurance-frontend:latest" .
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Frontend build failed" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    docker push "$acrLoginServer/insurance-frontend:latest"
    Pop-Location
    Write-Host "✓ Frontend image built and pushed" -ForegroundColor Green
}

# Step 7: Deploy Frontend Container App
Write-Host "`n🚀 Deploying Frontend..." -ForegroundColor Cyan
$frontendExists = az containerapp show --name $FrontendAppName --resource-group $ResourceGroupName --output json 2>$null

if (-not $frontendExists) {
    az containerapp create `
        --name $FrontendAppName `
        --resource-group $ResourceGroupName `
        --environment $EnvironmentName `
        --image "$acrLoginServer/insurance-frontend:latest" `
        --registry-server $acrLoginServer `
        --registry-username $acrUsername `
        --registry-password $acrPassword `
        --target-port 80 `
        --ingress external `
        --min-replicas 1 `
        --max-replicas 3
    Write-Host "✓ Frontend deployed" -ForegroundColor Green
} else {
    az containerapp update `
        --name $FrontendAppName `
        --resource-group $ResourceGroupName `
        --image "$acrLoginServer/insurance-frontend:latest"
    Write-Host "✓ Frontend updated" -ForegroundColor Green
}

# Get frontend URL
$frontendUrl = az containerapp show --name $FrontendAppName --resource-group $ResourceGroupName --query properties.configuration.ingress.fqdn --output tsv
Write-Host "✓ Frontend URL: https://$frontendUrl" -ForegroundColor Green

# Step 8: Update Backend CORS
Write-Host "`n🔧 Updating Backend CORS..." -ForegroundColor Cyan
az containerapp update `
    --name $BackendAppName `
    --resource-group $ResourceGroupName `
    --set-env-vars "CORS_ORIGIN=https://$frontendUrl"
Write-Host "✓ CORS updated" -ForegroundColor Green

# Summary
Write-Host "`n✅ Deployment Complete!" -ForegroundColor Green
Write-Host "`n📋 Deployment Summary:" -ForegroundColor Cyan
Write-Host "  Backend URL:  https://$backendUrl" -ForegroundColor White
Write-Host "  Frontend URL: https://$frontendUrl" -ForegroundColor White
Write-Host "`n💡 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Test the backend: https://$backendUrl/api/health" -ForegroundColor White
Write-Host "  2. Open the frontend: https://$frontendUrl" -ForegroundColor White
Write-Host "  3. Monitor logs: az containerapp logs show --name $BackendAppName --resource-group $ResourceGroupName --follow" -ForegroundColor White

