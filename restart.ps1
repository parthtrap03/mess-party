# PowerShell script to restart frontend and backend servers
# Usage: .\restart.ps1

Write-Host "=== Party App Restart Script ===" -ForegroundColor Cyan
Write-Host ""

# Function to find and kill processes on a specific port
function Stop-ProcessOnPort {
    param([int]$Port)
    
    $processes = netstat -ano | findstr ":$Port"
    if ($processes) {
        Write-Host "Stopping processes on port $Port..." -ForegroundColor Yellow
        $processes | ForEach-Object {
            $line = $_.Trim()
            if ($line -match '\s+(\d+)\s*$') {
                $processId = $matches[1]
                try {
                    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                    Write-Host "  Stopped PID: $processId" -ForegroundColor Green
                }
                catch {
                    Write-Host "  Could not stop PID: $processId" -ForegroundColor Red
                }
            }
        }
    }
    else {
        Write-Host "No processes found on port $Port" -ForegroundColor Gray
    }
}

# Step 1: Stop Frontend (port 5173)
Write-Host "[1/4] Stopping Frontend..." -ForegroundColor Cyan
Stop-ProcessOnPort -Port 5173
Start-Sleep -Seconds 1

# Step 2: Stop Backend (port 3000)
Write-Host "[2/4] Stopping Backend..." -ForegroundColor Cyan
Stop-ProcessOnPort -Port 3000
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "=== Starting Servers ===" -ForegroundColor Cyan
Write-Host ""

# Step 3: Start Backend
Write-Host "[3/4] Starting Backend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; npm start" -WindowStyle Normal
Write-Host "  Backend starting on http://localhost:3000" -ForegroundColor Green
Start-Sleep -Seconds 3

# Step 4: Start Frontend
Write-Host "[4/4] Starting Frontend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal
Write-Host "  Frontend starting on http://localhost:5173" -ForegroundColor Green

Write-Host ""
Write-Host "=== Restart Complete ===" -ForegroundColor Green
Write-Host "Backend: http://localhost:3000" -ForegroundColor White
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
