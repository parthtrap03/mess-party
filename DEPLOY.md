# Quick Deployment Guide

## 🚀 One-Command Deployment

### Windows (PowerShell)
```powershell
.\deploy.ps1
```

### Linux/Mac (Bash)
```bash
chmod +x deploy.sh
./deploy.sh
```

## 📋 What the Script Does

1. ✅ Installs Vercel and Railway CLIs (if needed)
2. ✅ Deploys backend to Railway
3. ✅ Updates frontend API URLs automatically
4. ✅ Builds frontend
5. ✅ Deploys frontend to Vercel
6. ✅ Configures CORS on backend
7. ✅ Restores local development URLs

## 🔑 First-Time Setup

### 1. Login to Services

```powershell
# Login to Vercel
vercel login

# Login to Railway
railway login
```

### 2. Update Production Secrets

Edit `server/.env.production`:
```env
PARTY_PASSKEY=your_secret_passkey_here
ADMIN_PASSKEY=your_admin_key_here
REQUIRED_GUESTS=9
```

### 3. Run Deployment

```powershell
.\deploy.ps1
```

## 🎯 Manual Deployment (If Script Fails)

### Backend (Railway)

```powershell
cd server
railway init
railway up

# Set environment variables in Railway dashboard:
# - PARTY_PASSKEY
# - ADMIN_PASSKEY
# - REQUIRED_GUESTS=9
# - PORT=3000
```

### Frontend (Vercel)

```powershell
# Update API_BASE in src/App.jsx and src/pages/LandingPage.jsx
# Replace: const API_BASE = 'http://localhost:3000/api'
# With: const API_BASE = 'https://your-backend.railway.app/api'

npm run build
vercel --prod
```

## 🔄 Redeployment

Just run the script again:
```powershell
.\deploy.ps1
```

## 📊 Monitoring

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Railway Dashboard**: https://railway.app/dashboard

## 🐛 Troubleshooting

### "Command not found: vercel"
```powershell
npm install -g vercel
```

### "Command not found: railway"
```powershell
npm install -g @railway/cli
```

### CORS Errors
Update CORS_ORIGIN in Railway dashboard to match your Vercel URL.

### API Not Responding
Check Railway logs for backend errors.

## ✅ Post-Deployment Checklist

- [ ] Frontend loads at Vercel URL
- [ ] Can enter passkey and see pill choice
- [ ] Blue pill tracks guests correctly
- [ ] Red pill navigates to home (host only)
- [ ] Backend API responding
- [ ] No CORS errors in browser console

## 🎉 Share With Guests

Once deployed, share the Vercel URL with your guests:
```
https://your-app.vercel.app
Passkey: [your passkey]
```

Guests click the blue pill to contribute!
