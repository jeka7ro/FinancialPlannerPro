# Deployment Guide

## Quick Deployment Options

### Option 1: Railway (Recommended)

1. **Create Railway Account** at [railway.app](https://railway.app)

2. **Deploy from GitHub**
   ```bash
   # Fork or upload your repository to GitHub
   # Connect Railway to your GitHub repository
   ```

3. **Environment Variables**
   ```env
   DATABASE_URL=postgresql://...  # Railway will provide this
   SESSION_SECRET=your-random-secret
   NODE_ENV=production
   ```

4. **Railway automatically detects and builds the project**

### Option 2: Vercel + Neon

1. **Frontend on Vercel**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Database on Neon**
   - Create account at [neon.tech](https://neon.tech)
   - Create PostgreSQL database
   - Get connection string

3. **Backend on Railway/Render**
   - Deploy server folder separately
   - Set DATABASE_URL from Neon

### Option 3: Traditional VPS

1. **Server Setup**
   ```bash
   # Install Node.js 20+
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2
   npm install -g pm2
   ```

2. **Deploy Application**
   ```bash
   git clone your-repo
   cd cashpot-gaming-system
   npm install
   npm run build
   pm2 start npm --name "cashpot" -- start
   ```

3. **Database Setup**
   ```bash
   # Install PostgreSQL
   sudo apt-get install postgresql postgresql-contrib
   
   # Create database
   sudo -u postgres createdb cashpot_gaming
   ```

## Environment Configuration

### Production Environment Variables

```env
# Database (Required)
DATABASE_URL=postgresql://user:password@host:port/database

# Security (Required)
SESSION_SECRET=generate-random-64-char-string

# Environment
NODE_ENV=production

# Optional: Custom Port
PORT=5000

# Optional: File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### Generate Session Secret

```bash
# Generate secure session secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Build Process

### Production Build

```bash
# Install dependencies
npm install

# Build frontend and backend
npm run build

# Start production server
npm start
```

### Build Output
- `dist/public/` - Static frontend files
- `dist/server/` - Compiled backend server

## Database Setup

### Database Migration

```bash
# Push schema to database
npm run db:push

# Alternative: Use Drizzle Studio for management
npm run db:studio
```

### Initial Data Setup

1. **Admin User Creation**
   - First user registered becomes admin
   - Or manually insert admin user in database

2. **Basic Configuration**
   - Create initial companies
   - Set up locations
   - Configure providers

## SSL/HTTPS Setup

### Automatic (Railway/Vercel)
- SSL certificates provided automatically

### Manual (VPS)

```bash
# Install Certbot
sudo apt-get install certbot

# Get SSL certificate
sudo certbot certonly --standalone -d yourdomain.com

# Configure Nginx
sudo nano /etc/nginx/sites-available/cashpot
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Monitoring & Maintenance

### PM2 Process Management

```bash
# Start application
pm2 start npm --name "cashpot" -- start

# Monitor processes
pm2 monit

# View logs
pm2 logs cashpot

# Restart application
pm2 restart cashpot

# Auto-restart on server reboot
pm2 startup
pm2 save
```

### Database Backup

```bash
# Create database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql $DATABASE_URL < backup_file.sql
```

### Log Management

```bash
# Application logs (PM2)
pm2 logs --lines 1000

# System logs
sudo journalctl -u nginx -f
```

## Security Checklist

- [ ] Strong DATABASE_URL with secure password
- [ ] Random SESSION_SECRET (64+ characters)
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Firewall configured (only ports 80, 443, 22)
- [ ] Regular database backups
- [ ] Updated dependencies
- [ ] Environment variables secured
- [ ] File upload limits configured
- [ ] CORS properly configured

## Performance Optimization

### Database
- Enable connection pooling
- Add database indexes for frequent queries
- Regular VACUUM and ANALYZE

### Frontend
- Static assets served via CDN
- Gzip compression enabled
- Cache headers configured

### Backend
- Enable compression middleware
- Use PM2 cluster mode for multiple cores
- Monitor memory usage

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check DATABASE_URL format
   echo $DATABASE_URL
   
   # Test connection
   psql $DATABASE_URL -c "SELECT 1;"
   ```

2. **Session Issues**
   ```bash
   # Verify SESSION_SECRET is set
   echo $SESSION_SECRET
   
   # Clear browser cookies
   ```

3. **File Upload Issues**
   ```bash
   # Check uploads directory permissions
   ls -la uploads/
   
   # Create if missing
   mkdir -p uploads && chmod 755 uploads
   ```

4. **Build Errors**
   ```bash
   # Clear node_modules and rebuild
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

## Support

For deployment support:
- Check application logs first
- Verify environment variables
- Test database connectivity
- Review server resource usage

## Recommended Resources

- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 20GB minimum for logs and uploads
- **CPU**: 2 cores minimum
- **Bandwidth**: Depends on user load and file uploads