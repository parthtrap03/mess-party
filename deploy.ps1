# PowerShell Automated Deployment Script
# Deploys frontend to Vercel and backend to Railway

# Anchor all paths to the script's own directory
$ProjectRoot = $PSScriptRoot

Write-Host "🚀 Starting Automated Deployment..." -ForegroundColor Cyan
Write-Host "   Project root: $ProjectRoot"
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
Push-Location "$ProjectRoot\server"

if (!(Test-Path "railway.json")) {
    Write-Host "Initializing Railway project..."
    railway init
}

# Capture Railway output to find the URL
$railwayLog = "$ProjectRoot\railway-deploy.log"
railway up 2>&1 | Tee-Object -FilePath $railwayLog
Pop-Location

# Extract the production URL from Railway output
$railwayContent = Get-Content $railwayLog -Raw
$railwayMatches = [regex]::Matches($railwayContent, "https://[^\s]*\.railway\.app[^\s]*")
if ($railwayMatches.Count -gt 0) {
    # Take the last railway.app URL
    $backendUrl = $railwayMatches[$railwayMatches.Count - 1].Value
}
else {
    Write-Host "⚠ Could not auto-detect Railway URL from output." -ForegroundColor Yellow
    $backendUrl = Read-Host "Paste your Railway backend URL (e.g. https://server-production-xxxx.up.railway.app)"
}
Remove-Item $railwayLog -ErrorAction SilentlyContinue

Write-Host "✓ Backend deployed to: $backendUrl" -ForegroundColor Green
Write-Host ""

# Step 3: Update Frontend API URLs
Write-Host "[3/6] Updating Frontend API configuration..." -ForegroundColor Blue

$appJsx = "$ProjectRoot\src\App.jsx"
$appJsxBak = "$ProjectRoot\src\App.jsx.bak"
$landingJsx = "$ProjectRoot\src\pages\LandingPage.jsx"
$landingJsxBak = "$ProjectRoot\src\pages\LandingPage.jsx.bak"

# Backup and update App.jsx
Copy-Item $appJsx $appJsxBak
(Get-Content $appJsx) -replace "const API_BASE = 'http://localhost:3000/api'", "const API_BASE = '$backendUrl/api'" | Set-Content $appJsx

# Backup and update LandingPage.jsx
Copy-Item $landingJsx $landingJsxBak
(Get-Content $landingJsx) -replace "const API_BASE = 'http://localhost:3000/api'", "const API_BASE = '$backendUrl/api'" | Set-Content $landingJsx

Write-Host "✓ API URLs updated" -ForegroundColor Green
Write-Host ""

# Step 4: Build Frontend
Write-Host "[4/6] Building Frontend..." -ForegroundColor Blue
Push-Location $ProjectRoot
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "X Build failed. Stopping deployment." -ForegroundColor Red
    Pop-Location
    exit 1
}
Write-Host "✓ Frontend built successfully" -ForegroundColor Green
Write-Host ""

# Step 5: Deploy Frontend
Write-Host "[5/6] Preparing and Deploying to Vercel (Production Update)..." -ForegroundColor Blue

$vercelLog = "$ProjectRoot\vercel-deploy.log"
# 1. Build the deployment locally (uses your local dist folder)
Write-Host "   Running local Vercel build..."
vercel build --prod --yes

# 2. Upload the prebuilt result to Vercel
Write-Host "   Uploading prebuilt files..."
vercel deploy --prebuilt --prod --yes 2>&1 | Tee-Object -FilePath $vercelLog
Pop-Location

# Extract the production URL from Vercel output
$logContent = Get-Content $vercelLog -Raw
# Match deployment URLs (contain .vercel.app)
$urlMatches = [regex]::Matches($logContent, "https://[^\s]*\.vercel\.app[^\s]*")
if ($urlMatches.Count -gt 0) {
    # Take the last .vercel.app URL (the production URL)
    $frontendUrl = $urlMatches[$urlMatches.Count - 1].Value
}
else {
    Write-Host "⚠ Could not auto-detect Vercel URL from output:" -ForegroundColor Yellow
    Write-Host $logContent
    $frontendUrl = Read-Host "Paste your Vercel production URL (e.g. https://mess-xyz.vercel.app)"
}
Remove-Item $vercelLog -ErrorAction SilentlyContinue
Write-Host "✓ Frontend deployed to: $frontendUrl" -ForegroundColor Green
Write-Host ""

# Step 6: Update Backend CORS
Write-Host "[6/6] Updating Backend CORS settings..." -ForegroundColor Blue
Push-Location "$ProjectRoot\server"
railway variables set CORS_ORIGIN="$frontendUrl"
Write-Host "✓ CORS configured" -ForegroundColor Green
Write-Host ""
Pop-Location

# Restore original files
Write-Host "Restoring local development URLs..."
Move-Item $appJsxBak $appJsx -Force
Move-Item $landingJsxBak $landingJsx -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: " -NoNewline
Write-Host "$frontendUrl" -ForegroundColor Blue
Write-Host "Backend:  " -NoNewline
Write-Host "$backendUrl" -ForegroundColor Blue
Write-Host ""
Write-Host "Share the frontend URL with your guests!"
Write-Host ""

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
