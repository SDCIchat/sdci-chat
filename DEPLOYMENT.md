# Deploying SDCI Chat to Render.com (Free)

Follow these steps to deploy your SDCI Chat backend and frontend to Render.com for free.

## Step 1: Deploy Backend to Render.com

### 1.1 Create a Render.com Account
- Go to [render.com](https://render.com)
- Sign up with your GitHub account (easier deployment)
- Create a new account

### 1.2 Deploy Backend
1. Push your code to GitHub (if not already there)
2. In Render, click **New +** → **Web Service**
3. Select **Build and deploy from a Git repository**
4. Connect your GitHub account and select this repository
5. Configure:
   - **Name**: `sdci-chat-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Free Plan**: Select the free tier

6. Click **Create Web Service**

### 1.3 Add Database
1. In Render dashboard, click **New +** → **PostgreSQL**
2. Configure:
   - **Name**: `sdci-chat-db`
   - **Database**: `sdci_chat`
   - **User**: `sdci_chat`
   - **Plan**: Free tier
3. Click **Create Database**

### 1.4 Connect Database to Backend
1. Go to your backend service in Render
2. Click **Environment** tab
3. The `DATABASE_URL` should be automatically set from the database
4. Make sure `JWT_SECRET` is set (generate a random one)
5. Click **Deploy** to redeploy with database

### 1.5 Get Your Backend URL
- Once deployed, you'll see a URL like: `https://sdci-chat-backend.onrender.com`
- Copy this URL

## Step 2: Configure Frontend for Render Backend

### 2.1 Set Environment Variable
1. Go back to your Replit project (the frontend)
2. Click the **Secrets** button on the left sidebar
3. Click **+ Environment Variable**
4. Add:
   - **Key**: `EXPO_PUBLIC_BACKEND_URL`
   - **Value**: `https://sdci-chat-backend.onrender.com` (replace with your actual URL)
   - **Environment**: `Shared`
5. Click **Add**

## Step 3: Build APK with Render Backend

```bash
eas build --platform android
```

Now your APK will connect to the deployed backend on Render!

## Important Notes

- **Free Tier Limitations**: 
  - Backend spins down after 15 minutes of inactivity (wakes up when accessed)
  - Database is limited to 100MB (fine for a chat app)
  - Up to 750 hours per month (enough for continuous running)

- **How Everyone Uses It**:
  1. Share the APK with friends
  2. They install it on their Android phones
  3. All users connect to the same deployed backend
  4. Everyone can chat in real-time!

## Troubleshooting

If the app crashes when signing up:
1. Check that the backend URL is correct in your environment variable
2. Verify the backend is deployed and running on Render
3. Wait a few seconds if the backend was recently spun down
4. Rebuild the APK and reinstall

## Next Time You Update

If you make changes to the backend:
1. Push to GitHub: `git push`
2. Render automatically redeploys
3. If you changed the frontend, rebuild the APK and redistribute
