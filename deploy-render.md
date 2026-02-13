# Deploying to Render.com

Since Vercel has been difficult, Render.com is a great alternative that handles React + Node.js projects very reliably.

## 🚀 Option 1: One-Click Deployment (Blueprint)
I have created a `render.yaml` file in your root directory. This is like a "instruction manual" for Render.

1.  **Push your code** to GitHub.
2.  Go to the [Render Dashboard](https://dashboard.render.com/).
3.  Click **New +** and select **Blueprint**.
4.  Connect your GitHub repository.
5.  Render will read `render.yaml` and automatically create:
    *   `mess-backend` (Web Service)
    *   `mess-frontend` (Static Site)
6.  It will even link them together for you!

---

## 🛠 Option 2: Manual Setup
If you prefer to set it up manually, follow these settings:

### 1. Backend (Web Service)
*   **Name**: `mess-backend`
*   **Runtime**: `Node`
*   **Root Directory**: `server`
*   **Build Command**: `npm install`
*   **Start Command**: `node server.js`
*   **Environment Variables**:
    *   `ADMIN_PASSKEY`: Your secret admin key.
    *   `PARTY_PASSKEY`: `welcome` (or your choice).

### 2. Frontend (Static Site)
*   **Name**: `mess-frontend`
*   **Build Command**: `npm install && npm run build`
*   **Publish Directory**: `dist`
*   **Crucial Step (Routing)**:
    1.  Go to the **Redirects/Rewrites** tab in the Sidebar.
    2.  Add a **Rewrite**:
        *   Source: `/api/*`
        *   Destination: `https://mess-backend.onrender.com/api/*` (Replace with your actual backend URL).
    3.  Add another **Rewrite**:
        *   Source: `/*`
        *   Destination: `/index.html`

---

## ✅ Why this is better
1.  **No more `vercel.json`**: Render handles the routing in the dashboard, so it's much harder to break.
2.  **Explicit Builds**: You can see the logs clearly while it installs and builds.
3.  **Unified**: You can manage your backend and frontend in one list.

**The script `deploy.ps1` is no longer needed for Render. You just push to GitHub and Render does the rest!**
