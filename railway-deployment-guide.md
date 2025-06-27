# Railway Deployment Guide for CASHPOT Gaming System

## Step-by-Step Railway Deployment

### 1. Prepare Your GitHub Repository

First, you need to upload your project to GitHub:

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit your code
git commit -m "Initial commit - CASHPOT Gaming Management System"

# Add your GitHub repository as remote
git remote add origin https://github.com/yourusername/cashpot-gaming-system.git

# Push to GitHub
git push -u origin main
```

### 2. Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with your GitHub account
3. This will automatically connect Railway to your GitHub repositories

### 3. Deploy from GitHub

1. **Click "Deploy from GitHub repo"**
2. **Select your repository** - Choose `cashpot-gaming-system`
3. **Railway will automatically detect** your Node.js project
4. **Click "Deploy"**

### 4. Add PostgreSQL Database

1. **In your Railway project dashboard**, click "New Service"
2. **Select "Database"** → **"PostgreSQL"**
3. **Railway will provision** a PostgreSQL 16 database
4. **Database URL will be automatically generated**

### 5. Configure Environment Variables

Railway will automatically set some variables, but you need to add:

**Required Variables:**
```env
SESSION_SECRET=your-super-secret-session-key-generate-this-64-chars
NODE_ENV=production
```

**Generate Session Secret:**
```bash
# Run this command to generate a secure session secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**How to Add Variables in Railway:**
1. Go to your app service (not database)
2. Click **"Variables"** tab
3. Add the variables above
4. Railway automatically provides `DATABASE_URL`

### 6. Configure Build Settings

Railway should automatically detect your build configuration from `package.json`, but verify:

**Build Command:** `npm run build`
**Start Command:** `npm start`

### 7. Domain and SSL

Railway automatically provides:
- **Free subdomain**: `your-app-name.railway.app`
- **Automatic SSL certificate**
- **Custom domain support** (if needed)

### 8. Database Migration

After deployment, you need to set up your database schema:

1. **Go to Railway dashboard**
2. **Click on your database service**
3. **Click "Connect"** and copy the connection string
4. **Run migration using Railway CLI** or use Drizzle Studio

**Option A: Use Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Connect to your project
railway link

# Run database migration
railway run npm run db:push
```

**Option B: Use Drizzle Studio**
1. Set `DATABASE_URL` in your local environment
2. Run `npm run db:studio`
3. Apply schema changes

### 9. Monitor Deployment

**Check Deployment Status:**
1. **Deployment Logs**: View build and runtime logs
2. **Metrics**: Monitor CPU, memory, and request metrics
3. **Health Checks**: Railway automatically monitors your app

**Common Deployment Issues:**
- **Build failures**: Check that all dependencies are in `package.json`
- **Database connection**: Verify `DATABASE_URL` is set correctly
- **Session issues**: Ensure `SESSION_SECRET` is set

### 10. Post-Deployment Setup

**Initial Admin User:**
1. Visit your deployed app URL
2. Register the first user (becomes admin automatically)
3. Start adding companies, locations, and equipment

**File Uploads:**
- Railway provides persistent storage for uploads
- No additional configuration needed

### 11. Automatic Deployments

Railway automatically deploys when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Update feature X"
git push origin main

# Railway automatically rebuilds and deploys
```

### 12. Scaling and Performance

**Railway automatically handles:**
- **Auto-scaling** based on traffic
- **Load balancing** for high availability
- **Database connection pooling**
- **CDN for static assets**

### 13. Monitoring and Maintenance

**Built-in Monitoring:**
- View logs in real-time
- Monitor resource usage
- Set up alerts for downtime

**Database Backups:**
- Railway automatically backs up PostgreSQL
- Point-in-time recovery available
- Manual backup exports possible

### 14. Cost Estimation

**Railway Pricing:**
- **Free tier**: $5/month usage credit
- **Pro plan**: $20/month + usage
- **Database**: ~$5-10/month for PostgreSQL
- **App hosting**: Based on usage (CPU/memory)

### 15. Troubleshooting

**Common Issues and Solutions:**

**Build Errors:**
```bash
# Check build logs in Railway dashboard
# Ensure all dependencies are listed in package.json
# Verify Node.js version compatibility
```

**Database Connection Issues:**
```bash
# Verify DATABASE_URL environment variable
# Check if database service is running
# Test connection with psql or database client
```

**Session/Authentication Problems:**
```bash
# Verify SESSION_SECRET is set
# Check if sessions are persisting in database
# Clear browser cookies and try again
```

**File Upload Issues:**
```bash
# Ensure uploads directory exists
# Check file size limits
# Verify file permissions
```

### 16. Success Indicators

Your deployment is successful when:
- ✅ App loads at Railway URL
- ✅ Database connection works
- ✅ User registration/login functions
- ✅ File uploads work
- ✅ All modules (Slots, Cabinets, etc.) load correctly
- ✅ Export functionality works

### 17. Next Steps After Deployment

1. **Test all functionality** thoroughly
2. **Set up custom domain** (if needed)
3. **Configure monitoring alerts**
4. **Create user accounts** for your team
5. **Import initial data** using the import functionality
6. **Set up regular database backups**

## Support and Resources

- **Railway Documentation**: [docs.railway.app](https://docs.railway.app)
- **Community Support**: Railway Discord server
- **Status Page**: [status.railway.app](https://status.railway.app)

Your CASHPOT Gaming Management System will be live and accessible worldwide within minutes of deployment!