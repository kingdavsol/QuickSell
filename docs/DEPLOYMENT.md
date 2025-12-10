# QuickSell Deployment Guide

This guide covers deployment of QuickSell to production environments including quicksell.monster, Google Play Store (Android), and Apple App Store (iOS).

## Prerequisites

### For All Platforms
- Node.js 18+
- Docker and Docker Compose
- GitHub account (for CI/CD)
- Git

### For quicksell.monster (Web/Backend)
- Domain quicksell.monster configured
- Hosting provider (AWS, GCP, DigitalOcean, etc.)
- SSL certificate (auto-renewal with Let's Encrypt)
- Docker Container Registry access

### For Android (Google Play Store)
- Google Play Developer account ($25 registration)
- Android SDK
- Keystore file for signing APK

### For iOS (Apple App Store)
- Apple Developer account ($99/year)
- Mac with Xcode
- Apple ID and password
- Team ID

## 1. Backend Deployment (quicksell.monster)

### Step 1: Prepare Backend for Production

1. **Update environment variables**
   ```bash
   cp .env.example .env.production
   # Edit .env.production with production values
   # Set: FRONTEND_URL=https://quicksell.monster
   #      API_BASE_URL=https://api.quicksell.monster
   ```

2. **Build Docker image**
   ```bash
   cd backend
   docker build -t quicksell-backend:1.0.0 .
   ```

3. **Test production build locally**
   ```bash
   docker run -e NODE_ENV=production -p 5000:5000 quicksell-backend:1.0.0
   ```

### Step 2: Deploy to quicksell.monster

1. **Push to Docker registry**
   ```bash
   # Login to your registry (DockerHub, GitHub Container Registry, etc.)
   docker login registry.example.com
   docker tag quicksell-backend:1.0.0 registry.example.com/quicksell-backend:1.0.0
   docker push registry.example.com/quicksell-backend:1.0.0
   ```

2. **Deploy to quicksell.monster**
   ```bash
   # Option A: Using Docker Compose on VPS
   docker-compose -f docker-compose.prod.yml up -d

   # Option B: Using Kubernetes
   kubectl apply -f k8s/deployment.yaml

   # Option C: Using your hosting provider's deployment tool
   # (AWS ECS, Google Cloud Run, DigitalOcean App Platform, etc.)
   ```

3. **Configure database**
   - Create PostgreSQL database on your hosting provider
   - Run migrations:
     ```bash
     docker exec quicksell-backend npm run migrate
     ```

4. **Set up environment variables on yakit.store**
   - DATABASE_URL
   - REDIS_URL
   - JWT_SECRET (generate new one)
   - All marketplace API keys
   - OpenAI API key
   - Stripe API keys
   - Other sensitive configuration

5. **Verify deployment**
   ```bash
   curl https://api.quicksell.monster/health
   ```

### Step 3: Setup CI/CD for Automatic Deployment

1. **Create GitHub Actions workflow**
   ```yaml
   # .github/workflows/deploy-backend.yml
   name: Deploy Backend
   on:
     push:
       branches: [main]
       paths: ['backend/**']
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Build and push Docker image
           run: |
             docker build -t quicksell-backend:${{ github.sha }} ./backend
             docker push quicksell-backend:${{ github.sha }}
         - name: Deploy to quicksell.monster
           run: |
             # SSH into your server and pull new image
             ssh deploy@quicksell.monster 'cd /app && docker-compose pull && docker-compose up -d'
   ```

## 2. Web Frontend Deployment

### Step 1: Build Frontend

```bash
cd frontend
npm run build
```

This creates a `build/` directory with optimized files.

### Step 2: Deploy to quicksell.monster

1. **Option A: Using Docker with Nginx**
   ```dockerfile
   # frontend/Dockerfile
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=builder /app/build /usr/share/nginx/html
   COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

   ```bash
   docker build -t quicksell-frontend:1.0.0 ./frontend
   docker push registry.example.com/quicksell-frontend:1.0.0
   # Deploy using docker-compose or your hosting provider
   ```

2. **Option B: Direct Static File Upload**
   - Build: `npm run build`
   - Upload `build/` directory to your hosting provider
   - Configure web server (Nginx, Apache, etc.) with routing rules
   - Use provided `frontend/nginx.conf` as base

### Step 3: Configure Frontend

1. **Update API endpoints**
   Create `frontend/.env.production`:
   ```bash
   REACT_APP_API_URL=https://api.quicksell.monster
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_xxxx
   REACT_APP_ENV=production
   ```

2. **Build with environment**
   ```bash
   npm run build  # Uses .env.production automatically
   ```

## 3. Mobile App - Android Deployment

### Step 1: Setup Android Signing

1. **Create or locate keystore**
   ```bash
   # Generate keystore (first time only)
   keytool -genkey -v -keystore quicksell.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias quicksell
   ```

2. **Store keystore securely**
   - Keep `quicksell.keystore` safe (don't commit to repo)
   - Store password securely

### Step 2: Build with EAS

1. **Configure EAS**
   ```bash
   cd mobile
   eas build --platform android
   ```

2. **EAS will prompt for:**
   - Google Play credentials
   - Build type (APK, AAB)
   - Build profile (production)

3. **Monitor build**
   ```bash
   eas build --platform android --status
   ```

### Step 3: Submit to Google Play Store

1. **Setup Google Play Console**
   - Go to https://play.google.com/console
   - Create app listing
   - Fill in app details, screenshots, description

2. **Submit build**
   ```bash
   eas submit --platform android --latest
   ```

3. **Review on Google Play Console**
   - Check app details
   - Set pricing
   - Choose countries
   - Submit for review (takes 24-48 hours)

### Step 4: Android Deployment Checklist

- [ ] App icon (512x512px)
- [ ] Screenshots (2-8 per locale)
- [ ] Description and release notes
- [ ] Content rating questionnaire
- [ ] Privacy policy URL
- [ ] Support email
- [ ] Build signed with production keystore
- [ ] Version code incremented
- [ ] Testing completed on multiple devices

## 4. Mobile App - iOS Deployment

### Step 1: Setup Apple Developer Account

1. **Create developer certificate**
   - Go to https://developer.apple.com/account
   - Create certificate (iOS App Development or Distribution)
   - Download and install certificate

2. **Create provisioning profile**
   - Create App ID
   - Register devices (for testing)
   - Create provisioning profile

### Step 2: Setup EAS for iOS

1. **Configure Apple credentials**
   ```bash
   cd mobile
   eas credentials --platform ios
   ```

2. **Provide:**
   - Apple ID email
   - Apple ID password (or app-specific password)
   - Team ID
   - Production certificates/provisioning profiles

### Step 3: Build for iOS

1. **Build with EAS**
   ```bash
   eas build --platform ios --auto-submit
   ```

2. **EAS will:**
   - Generate adhoc or distribution profile
   - Build iOS app
   - Optionally submit to TestFlight

### Step 4: Submit to App Store

1. **Setup App Store Connect**
   - Go to https://appstoreconnect.apple.com
   - Create new app
   - Fill in app information
   - Add screenshots and description

2. **Submit build**
   ```bash
   eas submit --platform ios --latest
   ```

3. **Review on App Store Connect**
   - Verify app details
   - Review screenshots
   - Check build information
   - Submit for review (takes 1-3 days)

### Step 5: iOS Deployment Checklist

- [ ] App icon (1024x1024px)
- [ ] Screenshots (2-5 per device size)
- [ ] Description (up to 170 characters)
- [ ] Keywords
- [ ] Support URL
- [ ] Privacy policy URL
- [ ] Category selected
- [ ] Age rating
- [ ] Build tested on TestFlight
- [ ] Version number updated
- [ ] All required permissions explained

## 5. Production Environment Setup

### Security Configuration

1. **Enable HTTPS**
   ```nginx
   server {
     listen 443 ssl http2;
     ssl_certificate /path/to/cert.pem;
     ssl_certificate_key /path/to/key.pem;
     ssl_protocols TLSv1.2 TLSv1.3;
   }
   ```

2. **Configure CORS**
   ```typescript
   app.use(cors({
     origin: [
       'https://your-domain.yakit.store',
       'https://app.your-domain.com'
     ],
     credentials: true
   }));
   ```

3. **Setup WAF**
   - Enable DDoS protection
   - Configure rate limiting
   - Enable bot protection

### Database Configuration

1. **Automated backups**
   - Daily incremental backups
   - Weekly full backups
   - 30-day backup retention

2. **Enable replication**
   ```sql
   -- Configure read replicas for analytics queries
   ```

3. **Monitor performance**
   - Setup database monitoring
   - Configure slow query logging
   - Monitor connection pool

### Monitoring & Logging

1. **Setup application monitoring**
   ```typescript
   import * as Sentry from "@sentry/node";
   Sentry.init({ dsn: process.env.SENTRY_DSN });
   ```

2. **Configure log aggregation**
   - ELK Stack or CloudWatch
   - Structured JSON logging
   - Real-time alerting

## 6. Post-Deployment

### Smoke Tests

```bash
# Test API health
curl https://api.your-domain/health

# Test authentication
curl -X POST https://api.your-domain/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# Test marketplace integration
curl https://api.your-domain/api/v1/marketplaces \
  -H "Authorization: Bearer $TOKEN"
```

### Monitor Performance

1. **Frontend**
   - Check Core Web Vitals
   - Monitor API response times
   - Check error rates

2. **Backend**
   - Monitor CPU/Memory
   - Check database query times
   - Monitor API response times

3. **Mobile Apps**
   - Monitor crash rates
   - Check review ratings
   - Monitor uninstall rates

### Rollback Plan

1. **Have previous version ready**
   ```bash
   docker pull quicksell-backend:0.9.0
   docker tag quicksell-backend:0.9.0 quicksell-backend:latest
   docker push quicksell-backend:latest
   ```

2. **Rollback database (if needed)**
   ```bash
   # Restore from backup
   pg_restore -d quicksell backup_file.sql
   ```

## 7. Continuous Deployment Pipeline

### GitHub Actions Configuration

```yaml
name: CD Pipeline
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test

  build-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build backend
        run: docker build -t quicksell-backend:${{ github.sha }} ./backend
      - name: Push image
        run: docker push quicksell-backend:${{ github.sha }}
      - name: Deploy
        run: yakit deploy quicksell-backend:${{ github.sha }}

  build-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build frontend
        run: cd frontend && npm run build
      - name: Deploy to CDN
        run: aws s3 sync frontend/build s3://quicksell-frontend/

  build-mobile:
    needs: test
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup EAS
        run: npm install -g eas-cli
      - name: Build and submit iOS
        run: cd mobile && eas build --platform ios --auto-submit
      - name: Build and submit Android
        run: cd mobile && eas build --platform android --auto-submit
```

## Support & Troubleshooting

### Common Issues

1. **Database connection errors**
   - Check DATABASE_URL format
   - Verify network connectivity
   - Check firewall rules

2. **API timeouts**
   - Check backend service status
   - Monitor server load
   - Check database performance

3. **App store rejection**
   - Review rejection reason
   - Update privacy policy
   - Fix permission descriptions
   - Resubmit

### Getting Help

- Check logs on yakit.store dashboard
- Review deployment documentation
- Contact support@quicksell.app
- Check GitHub issues for solutions

## Version Management

- Use semantic versioning (MAJOR.MINOR.PATCH)
- Tag releases on GitHub
- Maintain CHANGELOG.md
- Document breaking changes

## Security Updates

1. **Subscribe to security alerts**
   - GitHub security advisories
   - Dependency vulnerability alerts

2. **Regular updates**
   - Monthly dependency updates
   - Quarterly security audit
   - Immediate critical patches

3. **Secrets management**
   - Use secrets manager
   - Rotate API keys quarterly
   - Never commit secrets
