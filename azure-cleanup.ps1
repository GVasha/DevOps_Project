# Azure Cleanup Script
# Removes all Azure resources created for the DevOps Insurance deployment

param(
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroupName = "devops-insurance-rg",
    
    [Parameter(Mandatory=$false)]
    [switch]$Force = $false
)

Write-Host "🧹 Azure Cleanup Script" -ForegroundColor Yellow
Write-Host "This will delete the resource group: $ResourceGroupName" -ForegroundColor Yellow
Write-Host "⚠️  This action cannot be undone!`n" -ForegroundColor Red

# Check if resource group exists
$rgExists = az group exists --name $ResourceGroupName --output tsv
if ($rgExists -eq "false") {
    Write-Host "✓ Resource group '$ResourceGroupName' does not exist. Nothing to clean up." -ForegroundColor Green
    exit 0
}

# List resources
Write-Host "📋 Resources in resource group:" -ForegroundColor Cyan
az resource list --resource-group $ResourceGroupName --output table

if (-not $Force) {
    $confirm = Read-Host "`nAre you sure you want to delete all resources? Type 'DELETE' to confirm"
    if ($confirm -ne "DELETE") {
        Write-Host "Cleanup cancelled." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "`n🗑️  Deleting resource group..." -ForegroundColor Red
az group delete --name $ResourceGroupName --yes --no-wait

Write-Host "✓ Deletion initiated. Resources are being deleted in the background." -ForegroundColor Green
Write-Host "You can check the status in Azure Portal." -ForegroundColor Yellow

