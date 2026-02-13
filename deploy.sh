#!/bin/bash
# Automated Deployment Script for Party Mode App
# This script deploys frontend to Vercel and backend to Railway

set -e  # Exit on error

echo "🚀 Starting Automated Deployment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if required CLIs are installed
echo -e "${BLUE}[1/6] Checking dependencies...${NC}"

if ! command -v vercel &> /dev/null; then
    echo -e "${RED}Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

if ! command -v railway &> /dev/null; then
    echo -e "${RED}Railway CLI not found. Installing...${NC}"
    npm install -g @railway/cli
fi

echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 2: Deploy Backend to Railway
echo -e "${BLUE}[2/6] Deploying Backend to Railway...${NC}"
cd server

# Check if railway is initialized
if [ ! -f "railway.json" ]; then
    echo "Initializing Railway project..."
    railway init
fi

# Deploy backend
railway up

# Get backend URL
BACKEND_URL=$(railway status --json | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
echo -e "${GREEN}✓ Backend deployed to: ${BACKEND_URL}${NC}"
echo ""

cd ..

# Step 3: Update Frontend API URL
echo -e "${BLUE}[3/6] Updating Frontend API configuration...${NC}"

# Update API_BASE in App.jsx
sed -i.bak "s|const API_BASE = 'http://localhost:3000/api'|const API_BASE = '${BACKEND_URL}/api'|g" src/App.jsx

# Update API_BASE in LandingPage.jsx
sed -i.bak "s|const API_BASE = 'http://localhost:3000/api'|const API_BASE = '${BACKEND_URL}/api'|g" src/pages/LandingPage.jsx

echo -e "${GREEN}✓ API URLs updated${NC}"
echo ""

# Step 4: Build Frontend
echo -e "${BLUE}[4/6] Building Frontend...${NC}"
npm run build
echo -e "${GREEN}✓ Frontend built successfully${NC}"
echo ""

# Step 5: Deploy Frontend to Vercel
echo -e "${BLUE}[5/6] Deploying Frontend to Vercel...${NC}"
vercel --prod --yes

# Get frontend URL
FRONTEND_URL=$(vercel ls --json | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4)
echo -e "${GREEN}✓ Frontend deployed to: https://${FRONTEND_URL}${NC}"
echo ""

# Step 6: Update Backend CORS
echo -e "${BLUE}[6/6] Updating Backend CORS settings...${NC}"
cd server
railway variables set CORS_ORIGIN="https://${FRONTEND_URL}"
echo -e "${GREEN}✓ CORS configured${NC}"
echo ""

# Restore original API URLs for local development
echo "Restoring local development URLs..."
cd ..
mv src/App.jsx.bak src/App.jsx 2>/dev/null || true
mv src/pages/LandingPage.jsx.bak src/pages/LandingPage.jsx 2>/dev/null || true

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Frontend: ${BLUE}https://${FRONTEND_URL}${NC}"
echo -e "Backend:  ${BLUE}${BACKEND_URL}${NC}"
echo ""
echo "Share the frontend URL with your guests!"
echo ""
