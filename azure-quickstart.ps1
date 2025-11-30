# Azure Quick Start Script
# Simplified deployment with minimal parameters

param(
    [Parameter(Mandatory=$true)]
    [string]$JwtSecret,
    
    [Parameter(Mandatory=$false)]
    [string]$OpenAiApiKey = ""
)

Write-Host "🚀 Azure Quick Deploy for DevOps Insurance" -ForegroundColor Green
Write-Host "This script will deploy to Azure Container Apps with default settings`n" -ForegroundColor Yellow

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Cyan

# Check Docker
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found. Please install Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check Azure CLI
try {
    $azVersion = az version --output json | ConvertFrom-Json
    Write-Host "✓ Azure CLI installed: $($azVersion.'azure-cli')" -ForegroundColor Green
} catch {
    Write-Host "❌ Azure CLI not found. Installing..." -ForegroundColor Yellow
    Write-Host "Please install from: https://aka.ms/installazurecliwindows" -ForegroundColor Yellow
    exit 1
}

# Login check
$account = az account show --output json 2>$null | ConvertFrom-Json
if (-not $account) {
    Write-Host "`n⚠️  Not logged in to Azure. Please log in..." -ForegroundColor Yellow
    az login
    $account = az account show --output json | ConvertFrom-Json
}

Write-Host "✓ Logged in as: $($account.user.name)" -ForegroundColor Green
Write-Host "✓ Subscription: $($account.name)" -ForegroundColor Green

# Confirm deployment
Write-Host "`n📋 Deployment Configuration:" -ForegroundColor Cyan
Write-Host "  Resource Group: devops-insurance-rg" -ForegroundColor White
Write-Host "  Location: eastus" -ForegroundColor White
Write-Host "  Backend App: insurance-backend" -ForegroundColor White
Write-Host "  Frontend App: insurance-frontend" -ForegroundColor White

$confirm = Read-Host "`nContinue with deployment? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Deployment cancelled." -ForegroundColor Yellow
    exit 0
}

# Run main deployment script
Write-Host "`n🚀 Starting deployment...`n" -ForegroundColor Green

& "$PSScriptRoot\azure-deploy.ps1" `
    -ResourceGroupName "devops-insurance-rg" `
    -Location "eastus" `
    -AcrName "devopsinsuranceacr" `
    -EnvironmentName "devops-insurance-env" `
    -BackendAppName "insurance-backend" `
    -FrontendAppName "insurance-frontend" `
    -JwtSecret $JwtSecret `
    -OpenAiApiKey $OpenAiApiKey

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n🎉 Deployment successful!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Deployment failed. Check the errors above." -ForegroundColor Red
    exit 1
}

