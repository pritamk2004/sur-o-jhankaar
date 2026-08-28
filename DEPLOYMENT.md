# 🌐 Deploying Sur o Jhankaar for FREE (Render + Vercel + MongoDB Atlas)

This guide walks you through deploying **Sur o Jhankaar** 100% free with zero monthly cost using:
- **Backend API & WebSockets**: [Render.com](https://render.com) (Free Web Service)
- **Frontend Music Web Player**: [Vercel](https://vercel.com) (Free Hobby Tier)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) (Free M0 512MB Cluster)

---

## 🗄️ Step 1: Create a Free MongoDB Atlas Database (2 mins)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account.
2. Click **Create Deployment** -> Select **M0 (Free)**.
3. Under **Security Quickstart**:
   - Create a Username & Password (e.g. `sur_admin` / `your_secure_password`).
   - Under **IP Access List**, click **Add My Current IP Address** and also add `0.0.0.0/0` (Allow Access from Anywhere so Render can connect).
4. Click **Connect** -> **Drivers** -> Copy the connection string:
   ```
   mongodb+srv://sur_admin:<password>@cluster0.xxxxx.mongodb.net/sur_o_jhankaar?retryWrites=true&w=majority
   ```

---

## 🚀 Step 2: Deploy Backend to Render.com (3 mins)

1. Push this repository to your **GitHub**.
2. Go to [dashboard.render.com](https://dashboard.render.com/) and click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Fill in the deployment details:
   - **Name**: `sur-o-jhankaar-api`
   - **Region**: Choose closest to you (e.g. *Singapore*, *Oregon*, or *Frankfurt*)
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && npm run build:packages && npm --workspace=server run build
     ```
   - **Start Command**:
     ```bash
     node server/dist/server.js
     ```
   - **Instance Type**: `Free`
5. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | *Your MongoDB Atlas connection string from Step 1* |
   | `JWT_SECRET` | *Any long random secret string (32+ chars)* |
   | `JWT_REFRESH_SECRET` | *Any long random secret string (32+ chars)* |
   | `ADMIN_DEFAULT_EMAIL` | `admin@surojhankaar.in` |
   | `ADMIN_DEFAULT_PASSWORD` | `AdminSur@2026` |
6. Click **Create Web Service**.
7. Once deployed, copy your Render URL (e.g., `https://sur-o-jhankaar-api.onrender.com`).

---

## ⚡ Step 3: Deploy Frontend to Vercel (2 mins)

1. Go to [vercel.com](https://vercel.com/) and click **Add New...** -> **Project**.
2. Import your GitHub repository.
3. Under **Project Settings**:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click *Edit* and select **`apps/web`**.
4. Under **Environment Variables**, add:
   | Key | Value | Description |
   |---|---|---|
   | `NEXT_PUBLIC_API_URL` | `https://sur-o-jhankaar-api.onrender.com/api` | *Your Render backend URL with `/api`* |
   | `NEXT_PUBLIC_SOCKET_URL` | `https://sur-o-jhankaar-api.onrender.com` | *Your Render backend URL* |
5. Click **Deploy**.
6. Your web player will be live at `https://sur-o-jhankaar.vercel.app`! 🎉

---

## 🎶 Step 4: Seed the 1,894 Master Songs into MongoDB Atlas

Once your database is created, seed all 1,894 songs and 14 playlists from your computer in 5 seconds:

```bash
# In your local terminal:
$env:MONGO_URI="mongodb+srv://sur_admin:<password>@cluster0.xxxxx.mongodb.net/sur_o_jhankaar?retryWrites=true&w=majority"
npx tsx scripts/seed_master_library.ts
```

*(On Linux / Mac / Git Bash, use `MONGO_URI="..." npx tsx scripts/seed_master_library.ts`)*

---

## ✨ Features Available on Live Deployment:
- **Public Zero-Login Web Player**: Splash screen, 14 master playlists, search, lyrics & story visualizer.
- **Music Mood Atmospheres**: 8 emotional sound archetypes with dynamic Canvas particle backdrops.
- **Vintage Radio Mode**: 4 continuous stream frequencies (98.7, 92.7, 91.9, 104.0 FM).
- **Protected Admin Portal**: Log in at `/admin/login` using `admin@surojhankaar.in` / `AdminSur@2026` to manage tracks, import URLs/CSVs, and view real-time listener telemetry.
