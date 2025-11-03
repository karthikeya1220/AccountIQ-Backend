# Deploying AccountIQ Backend to Vercel

This guide walks you through deploying your Express.js backend to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Account**: Push your code to GitHub
3. **Vercel CLI** (optional but recommended):
   ```bash
   npm install -g vercel
   ```

## Deployment Steps

### Option 1: Using Vercel Dashboard (Recommended for beginners)

#### Step 1: Push Your Code to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

#### Step 2: Connect to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Project"**
3. Select **"Import Git Repository"**
4. Paste your GitHub repository URL: `https://github.com/karthikeya1220/AccountIQ-Backend`
5. Click **"Continue"**

#### Step 3: Configure Project
1. **Framework Preset**: Select **"Other"** (Node.js)
2. **Build and Output Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

#### Step 4: Add Environment Variables
1. In the Vercel dashboard, go to **Settings → Environment Variables**
2. Add the following variables:

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | Your Supabase URL from `.env` |
| `SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `FRONTEND_URL` | Your frontend URL (e.g., `https://yourfrontend.vercel.app`) |
| `SESSION_SECRET` | Generate a random secure string (use: `openssl rand -hex 32`) |
| `BACKEND_PORT` | `5000` |
| `NODE_ENV` | `production` |

#### Step 5: Deploy
1. Click **"Deploy"**
2. Wait for deployment to complete
3. Your API will be available at: `https://your-project-name.vercel.app`

---

### Option 2: Using Vercel CLI

#### Step 1: Install and Login
```bash
npm install -g vercel
vercel login
```

#### Step 2: Deploy from Your Project Directory
```bash
cd /Users/darshankarthikeya/Desktop/Work/AccountIQ-Backend
vercel
```

#### Step 3: Follow the Prompts
- Link to existing project or create new one
- Confirm build settings (should auto-detect)
- Confirm output directory: `dist`

#### Step 4: Set Environment Variables
Via CLI:
```bash
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add FRONTEND_URL
vercel env add SESSION_SECRET
```

Or edit `.env.production.local` and deploy:
```bash
vercel --prod
```

---

## Configuration Files Already Created

### `vercel.json`
- Configures Vercel deployment settings
- Routes all requests to `dist/index.js`
- Specifies build and runtime settings

### `.vercelignore`
- Excludes unnecessary files from deployment
- Reduces deployment size

---

## Important Notes

### 1. Build Command
The deployment uses `npm run build` which runs:
```bash
tsc
```
This compiles TypeScript to JavaScript in the `dist/` folder.

### 2. Port Configuration
- Vercel automatically assigns a port (ignore `BACKEND_PORT`)
- Your app runs on a Vercel-managed port
- The app listens on `process.env.PORT` or defaults to 5000

### 3. Environment Variables
All sensitive variables must be set in Vercel dashboard:
- ❌ Do NOT commit `.env` files
- ✅ Set variables in Vercel dashboard or via CLI

### 4. CORS Configuration
Your app has CORS configured to accept:
- `http://localhost:3000` (development)
- `https://localhost:3000`
- URLs from `FRONTEND_URL` environment variable
- GitHub Codespaces URLs

Update `FRONTEND_URL` in Vercel to your frontend URL (e.g., `https://yourfrontend.vercel.app`)

### 5. Database & Storage
- Uses Supabase (already configured in `.env`)
- Vercel deployment will use your production Supabase instance
- Make sure `SUPABASE_SERVICE_ROLE_KEY` is set for admin operations

---

## Troubleshooting

### Build Fails
- Check `npm run build` runs locally: `npm run build`
- Verify TypeScript compilation: `npx tsc`
- Check for missing dependencies: `npm install`

### 502 Bad Gateway
- Check server logs in Vercel dashboard
- Verify environment variables are set
- Ensure Supabase is accessible

### CORS Errors
- Update `FRONTEND_URL` in Vercel environment variables
- Ensure frontend URL matches exactly (including protocol)

### Logs
View logs in real-time:
```bash
vercel logs --follow
```

---

## Testing Your Deployment

1. **Health Check**:
   ```bash
   curl https://your-deployment.vercel.app/health
   ```

2. **API Documentation**:
   ```
   https://your-deployment.vercel.app/api-docs
   ```

3. **Update Frontend**:
   Update your frontend's API base URL:
   ```typescript
   const API_URL = process.env.REACT_APP_API_URL || 'https://your-deployment.vercel.app';
   ```

---

## Additional Resources

- [Vercel Docs](https://vercel.com/docs)
- [Vercel Node.js Support](https://vercel.com/docs/functions/serverless-functions/node-js)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)

---

## Next Steps

1. **Set up auto-deployments**: Vercel auto-deploys on push to `main`
2. **Monitor performance**: Use Vercel Analytics
3. **Set up custom domain**: Add your domain in Vercel dashboard
4. **Configure preview deployments**: Every PR gets a preview URL
