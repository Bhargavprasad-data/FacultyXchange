# Render Deployment Guide - Faculty Class Exchange System

This guide outlines the steps to deploy the application on **Render**. We recommend **Option A** (Single Web Service), as it is simpler, cost-effective, avoids CORS configuration, and handles SPA client-side routing automatically.

---

## Prerequisites: MongoDB Atlas Database Setup

Before deploying the application, you need a live MongoDB database. You can get a free database on **MongoDB Atlas**:
1. Sign up/Log in at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a new free cluster (Shared Tier).
3. Under **Database Access**, create a database user with a username and password.
4. Under **Network Access**, add an IP address rule: allow access from anywhere (`0.0.0.0/0`) because Render's dynamic IP addresses change.
5. In the **Database** dashboard, click **Connect** -> **Drivers** -> Copy the connection string.
   - It will look like: `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
   - Replace `<password>` with the actual password of the database user you created.

---

## Option A: Single Web Service Deployment (Recommended)

This compiles both frontend and backend and runs them together on a single Render Web Service instance.

### Step 1: Create a Web Service
1. Log in to [Render](https://render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.

### Step 2: Configure the Service
In the creation form, configure the following settings:
* **Name**: `faculty-class-exchange` (or any preferred name)
* **Region**: Select the region closest to your users.
* **Branch**: `main` (or the branch you want to deploy)
* **Root Directory**: *Keep empty* (refers to the repository root)
* **Runtime**: `Node`
* **Build Command**: `npm run install-all && npm run build`
* **Start Command**: `npm start`
* **Instance Type**: `Free` (or any tier)

### Step 3: Configure Environment Variables
Click **Advanced** and add the following Environment Variables:
1. `NODE_ENV` = `production`
2. `MONGO_URI` = `YOUR_MONGODB_ATLAS_CONNECTION_STRING` (from the prerequisites step)
3. `JWT_SECRET` = `YOUR_SUPER_SECRET_KEY` (a random secure string)

Click **Create Web Service**. Render will automatically clone the repository, install all dependencies, build the React frontend, and boot up the Express server. The URL of your web service will serve both the backend API and the frontend application.

---

## Option B: Separate Services Deployment

Use this option if you want to scale the frontend and backend servers separately.

### 1. Backend: Render Web Service
1. Click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Name**: `faculty-exchange-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add the following environment variables:
   - `MONGO_URI` = `YOUR_MONGODB_ATLAS_CONNECTION_STRING`
   - `JWT_SECRET` = `YOUR_SUPER_SECRET_KEY`
   - `NODE_ENV` = `production`
5. Click **Create Web Service** and copy the resulting service URL (e.g., `https://faculty-exchange-backend.onrender.com`).

### 2. Frontend: Render Static Site
1. Click **New +** -> **Static Site**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Name**: `faculty-exchange-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. Add the following environment variable:
   - `VITE_API_URL` = `https://faculty-exchange-backend.onrender.com/api` (use the backend URL copied from the step above, appending `/api`)
5. Click **Create Static Site**.
6. **CRITICAL (Fix SPA 404 Route Errors):**
   Once the frontend finishes creating, go to its page on Render:
   - Click **Redirects/Rewrites**.
   - Click **Add Rule**.
   - Set **Source**: `/*`
   - Set **Destination**: `/index.html`
   - Set **Action**: `Rewrite`
   - Save the rule. (This ensures that paths like `/my-bookings` refresh or load directly without throwing a 404).
