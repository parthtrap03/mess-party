# Party App Deployment Script for Windows PowerShell
# This script deploys the backend to Railway and frontend to Vercel

Write-Host "=== Party App Deployment Script ===" -ForegroundColor Cyan
Write-Host "This will deploy your app to Railway (backend) and Vercel (frontend)`n" -ForegroundColor Yellow

# Check if CLIs are installed
Write-Host "=== Checking Dependencies ===" -ForegroundColor Cyan

if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}
Write-Host "✓ Vercel CLI installed" -ForegroundColor Green

if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Railway CLI..." -ForegroundColor Yellow
    npm install -g @railway/cli
}
Write-Host "✓ Railway CLI installed" -ForegroundColor Green

# Deploy Backend to Railway
Write-Host "`n=== Deploying Backend to Railway ===" -ForegroundColor Cyan
Set-Location server

Write-Host "Deploying to Railway..." -ForegroundColor Yellow
railway up --detach

Write-Host "`nGetting Railway URL..." -ForegroundColor Yellow
$railwayUrl = railway domain
if (-not $railwayUrl) {
    Write-Host "⚠ No domain found. Generating one..." -ForegroundColor Yellow
    railway domain
    $railwayUrl = railway domain
}

$backendUrl = "https://$railwayUrl"
Write-Host "✓ Backend deployed to: $backendUrl" -ForegroundColor Green

Set-Location ..

# Update Frontend API URLs
Write-Host "`n=== Updating Frontend Configuration ===" -ForegroundColor Cyan

# Backup original files only if they don't already exist
if (-not (Test-Path "src\App.jsx.bak")) {
    Copy-Item "src\App.jsx" "src\App.jsx.bak" -Force
    Write-Host "✓ Backed up src\App.jsx" -ForegroundColor Green
} else {
    Write-Host "⚠ Backup already exists for src\App.jsx" -ForegroundColor Yellow
}

if (-not (Test-Path "src\pages\LandingPage.jsx.bak")) {
    Copy-Item "src\pages\LandingPage.jsx" "src\pages\LandingPage.jsx.bak" -Force
    Write-Host "✓ Backed up src\pages\LandingPage.jsx" -ForegroundColor Green
} else {
    Write-Host "⚠ Backup already exists for src\pages\LandingPage.jsx" -ForegroundColor Yellow
}

# Update App.jsx
$appContent = Get-Content "src\App.jsx" -Raw
$appContent = $appContent -replace "const API_BASE = '[^']*'", "const API_BASE = '$backendUrl/api'"
Set-Content "src\App.jsx" $appContent -NoNewline
Write-Host "✓ Updated src\App.jsx with production API URL" -ForegroundColor Green

# Update LandingPage.jsx
$landingContent = Get-Content "src\pages\LandingPage.jsx" -Raw
$landingContent = $landingContent -replace "const API_BASE = '[^']*'", "const API_BASE = '$backendUrl/api'"
Set-Content "src\pages\LandingPage.jsx" $landingContent -NoNewline
Write-Host "✓ Updated src\pages\LandingPage.jsx with production API URL" -ForegroundColor Green

# Build Frontend
Write-Host "`n=== Building Frontend ===" -ForegroundColor Cyan
npm run build
Write-Host "✓ Frontend built successfully" -ForegroundColor Green

# Deploy Frontend to Vercel
Write-Host "`n=== Deploying Frontend to Vercel ===" -ForegroundColor Cyan
$vercelOutput = vercel --prod --yes 2>&1
$vercelUrl = ($vercelOutput | Select-String -Pattern "https://.*\.vercel\.app" | Select-Object -First 1).Matches.Value

if ($vercelUrl) {
    Write-Host "✓ Frontend deployed to: $vercelUrl" -ForegroundColor Green
} else {
    Write-Host "⚠ Could not extract Vercel URL automatically" -ForegroundColor Yellow
    Write-Host "Please check your Vercel dashboard for the URL" -ForegroundColor Yellow
}

# Update CORS on Backend
if ($vercelUrl) {
    Write-Host "`n=== Configuring Backend CORS ===" -ForegroundColor Cyan
    Set-Location server
    railway variables --set CORS_ORIGIN=$vercelUrl
    Write-Host "✓ CORS configured for $vercelUrl" -ForegroundColor Green
    Set-Location ..
}

# Restore original files
Write-Host "`n=== Restoring Local Development URLs ===" -ForegroundColor Cyan
if (Test-Path "src\App.jsx.bak") {
    Move-Item "src\App.jsx.bak" "src\App.jsx" -Force
    Write-Host "✓ Restored src\App.jsx" -ForegroundColor Green
} else {
    Write-Host "⚠ No backup found for src\App.jsx (skipping restore)" -ForegroundColor Yellow
}

if (Test-Path "src\pages\LandingPage.jsx.bak") {
    Move-Item "src\pages\LandingPage.jsx.bak" "src\pages\LandingPage.jsx" -Force
    Write-Host "✓ Restored src\pages\LandingPage.jsx" -ForegroundColor Green
} else {
    Write-Host "⚠ No backup found for src\pages\LandingPage.jsx (skipping restore)" -ForegroundColor Yellow
}

# Summary
Write-Host "`n=== Deployment Complete! ===" -ForegroundColor Green
Write-Host "Backend URL: $backendUrl" -ForegroundColor Cyan
if ($vercelUrl) {
    Write-Host "Frontend URL: $vercelUrl" -ForegroundColor Cyan
    Write-Host "`nShare this with your guests:" -ForegroundColor Yellow
    Write-Host "URL: $vercelUrl" -ForegroundColor White
    Write-Host "Passkey: [Check your server/.env.production]" -ForegroundColor White
} else {
    Write-Host "Frontend URL: Check Vercel dashboard" -ForegroundColor Cyan
}

Write-Host "`n=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Test your app at the frontend URL" -ForegroundColor White
Write-Host "2. Check Railway logs if backend isn't responding" -ForegroundColor White
Write-Host "3. Share the URL and passkey with your guests" -ForegroundColor White
