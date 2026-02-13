# PowerShell Automated Deployment Script
# Deploys frontend to Vercel and backend to Railway

Write-Host "🚀 Starting Automated Deployment..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Check dependencies
Write-Host "[1/6] Checking dependencies..." -ForegroundColor Blue

if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
}

if (!(Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "Railway CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g @railway/cli
}

Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 2: Deploy Backend
Write-Host "[2/6] Deploying Backend to Railway..." -ForegroundColor Blue
Set-Location server

if (!(Test-Path "railway.json")) {
    Write-Host "Initializing Railway project..."
    railway init
}

railway up
$backendUrl = (railway status --json | ConvertFrom-Json).url

Write-Host "✓ Backend deployed to: $backendUrl" -ForegroundColor Green
Write-Host ""

Set-Location ..

# Step 3: Update Frontend API URLs
Write-Host "[3/6] Updating Frontend API configuration..." -ForegroundColor Blue

# Backup and update App.jsx
Copy-Item "src\App.jsx" "src\App.jsx.bak"
(Get-Content "src\App.jsx") -replace "const API_BASE = 'http://localhost:3000/api'", "const API_BASE = '$backendUrl/api'" | Set-Content "src\App.jsx"

# Backup and update LandingPage.jsx
Copy-Item "src\pages\LandingPage.jsx" "src\pages\LandingPage.jsx.bak"
(Get-Content "src\pages\LandingPage.jsx") -replace "const API_BASE = 'http://localhost:3000/api'", "const API_BASE = '$backendUrl/api'" | Set-Content "src\pages\LandingPage.jsx"

Write-Host "✓ API URLs updated" -ForegroundColor Green
Write-Host ""

# Step 4: Build Frontend
Write-Host "[4/6] Building Frontend..." -ForegroundColor Blue
npm run build
Write-Host "✓ Frontend built successfully" -ForegroundColor Green
Write-Host ""

# Step 5: Deploy Frontend
Write-Host "[5/6] Deploying Frontend to Vercel..." -ForegroundColor Blue
vercel --prod --yes

$frontendUrl = (vercel ls --json | ConvertFrom-Json)[0].url
Write-Host "✓ Frontend deployed to: https://$frontendUrl" -ForegroundColor Green
Write-Host ""

# Step 6: Update Backend CORS
Write-Host "[6/6] Updating Backend CORS settings..." -ForegroundColor Blue
Set-Location server
railway variables set CORS_ORIGIN="https://$frontendUrl"
Write-Host "✓ CORS configured" -ForegroundColor Green
Write-Host ""

Set-Location ..

# Restore original files
Write-Host "Restoring local development URLs..."
Move-Item "src\App.jsx.bak" "src\App.jsx" -Force
Move-Item "src\pages\LandingPage.jsx.bak" "src\pages\LandingPage.jsx" -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: " -NoNewline
Write-Host "https://$frontendUrl" -ForegroundColor Blue
Write-Host "Backend:  " -NoNewline
Write-Host "$backendUrl" -ForegroundColor Blue
Write-Host ""
Write-Host "Share the frontend URL with your guests!"
Write-Host ""

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
