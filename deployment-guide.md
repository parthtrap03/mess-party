# Party Mode Deployment Guide

This guide will help you deploy your Party Mode application to production.

## Quick Start (Local Development)

### Using the Restart Script

Run the automated restart script to cleanly restart both servers:

```powershell
.\restart.ps1
```

This script will:
1. Stop the frontend server (port 5173)
2. Stop the backend server (port 3000)
3. Start the backend server
4. Start the frontend server

### Manual Restart

If you prefer manual control:

1. **Stop servers** (in this order):
   - Frontend: `Ctrl+C` in the frontend terminal
   - Backend: `Ctrl+C` in the backend terminal

2. **Start servers** (in this order):
   ```powershell
   # Terminal 1: Backend
   cd server
   npm start
   
   # Terminal 2: Frontend  
   npm run dev
   ```

## Production Deployment

### Recommended Platforms

- **Frontend**: Vercel, Netlify, or Cloudflare Pages
- **Backend**: Railway, Render, or Fly.io

### Backend Deployment (Railway Example)

1. **Create a Railway project**
   ```bash
   railway login
   railway init
   ```

2. **Set environment variables** in Railway dashboard:
   ```
   PORT=3000
   ADMIN_PASSKEY=your_secure_admin_key
   PARTY_PASSKEY=your_party_passkey
   REQUIRED_GUESTS=9
   ```

3. **Deploy**:
   ```bash
   railway up
   ```

4. **Note your backend URL** (e.g., `https://your-app.railway.app`)

### Frontend Deployment (Vercel Example)

1. **Update API_BASE** in `src/App.jsx`:
   ```javascript
   const API_BASE = 'https://your-backend-url.railway.app/api';
   ```

2. **Build and deploy**:
   ```bash
   npm run build
   vercel --prod
   ```

### Environment Variables

Create a `.env` file in the `server` directory (copy from `.env.example`):

```bash
cp server/.env.example server/.env
```

Then edit `server/.env` with your production values.

## Party Mode Usage

### For the Birthday Person (Host)

1. Share the party link and passkey with friends
2. Be the **first** to enter the passkey
3. Watch the water tank fill as guests join (0/9)
4. Once 9 unique guests have joined, the "Proceed" button unlocks
5. Click "Proceed" to access the party!

### For Guests

1. Receive the link and passkey from the birthday person
2. Enter the passkey
3. See a "Thank You" message
4. Automatically logged out after 3 seconds
5. Each unique browser/IP combination counts as one guest

## Troubleshooting

### Port Already in Use

If you see "EADDRINUSE" error:
```powershell
# Find and kill the process
netstat -ano | findstr :3000
taskkill /F /PID <process_id>
```

Or use the `restart.ps1` script which handles this automatically.

### Guests Not Counting

- Ensure guests are using different browsers or devices
- Clear browser cache and try again
- Check that the backend is running and accessible

### Tank Not Filling

- Verify the backend `/api/party/status` endpoint is responding
- Check browser console for errors
- Ensure CORS is properly configured

## API Endpoints

- `POST /api/party/authenticate` - Authenticate and determine role
- `GET /api/party/status` - Get current party status (polling)
- `POST /api/party/reset` - Reset party state (admin only)

## Security Notes

- Change `ADMIN_PASSKEY` and `PARTY_PASSKEY` in production
- The fingerprinting system uses IP + User-Agent (not foolproof)
- Consider adding rate limiting for production use
- Party state is stored in memory (resets on server restart)
