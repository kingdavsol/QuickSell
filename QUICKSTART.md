# QuickSell Quick Start Guide

Welcome to QuickSell! This guide will get you up and running in minutes.

## 🚀 5-Minute Setup (Development)

### Prerequisites
- Node.js 18+ installed
- Docker & Docker Compose (optional, but recommended)
- Git

### Step 1: Clone & Setup
```bash
git clone <repository-url>
cd Traffic2umarketing

# Copy environment template
cp .env.example .env
```

### Step 2: Start Development Environment
```bash
# Option A: Using Docker (Recommended)
make dev

# Option B: Manual setup
cd backend && npm install
npm run dev

# In another terminal:
cd frontend && npm install
npm start

# In another terminal:
cd mobile && npm install
npm start
```

### Step 3: Access the App
- **Backend API**: http://localhost:5000
- **Frontend**: http://localhost:3000
- **Mobile**: http://localhost:19006
- **Admin DB**: http://localhost:5050 (pgAdmin)

---

## 📱 Building & Deploying

### For yakit.store Deployment

```bash
# 1. Update environment variables for production
cp .env.example .env.production

# 2. Build Docker image
make build-backend

# 3. Push to registry
make docker-push-backend

# 4. Deploy
make deploy-backend
```

For detailed instructions, see [DEPLOYMENT.md](./docs/DEPLOYMENT.md#1-backend-deployment-yakitstore)

### For Android Deployment

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Build for Android
cd mobile
eas build --platform android

# 3. Submit to Google Play Store
eas submit --platform android --latest
```

For detailed instructions, see [DEPLOYMENT.md](./docs/DEPLOYMENT.md#3-mobile-app---android-deployment)

### For iOS Deployment

```bash
# 1. Build for iOS
cd mobile
eas build --platform ios

# 2. Submit to Apple App Store
eas submit --platform ios --latest
```

For detailed instructions, see [DEPLOYMENT.md](./docs/DEPLOYMENT.md#4-mobile-app---ios-deployment)

---

## 📚 Common Commands

### Development
```bash
make dev              # Start dev environment
make dev-down         # Stop dev environment
make dev-logs         # View logs
make install          # Install all dependencies
```

### Testing & Quality
```bash
make test             # Run all tests
make test-coverage    # Run tests with coverage
make lint             # Lint all code
make format           # Format all code
```

### Database
```bash
make migrate          # Run migrations
make db-seed          # Seed with sample data
make db-reset         # Reset database
make backup-db        # Backup database
```

### Deployment
```bash
make build-all        # Build all services
make deploy-backend   # Deploy backend
make deploy-frontend  # Deploy frontend
make deploy-mobile-android  # Deploy to Play Store
make deploy-mobile-ios      # Deploy to App Store
```

---

## 🔑 Key Features to Explore

### 1. List Items (Create Selling Post)
- **Endpoint**: `POST /api/v1/listings`
- **Description**: Create a new product listing with photos
- **Try in frontend**: Go to "Create Listing" section

### 2. Multi-Marketplace Posting
- **Endpoint**: `POST /api/v1/listings/:id/publish`
- **Description**: Automatically post to 20+ marketplaces
- **Marketplaces**: eBay, Facebook, Craigslist, Amazon, Mercari, Etsy, Poshmark, and more

### 3. AI Price Estimation
- **Endpoint**: `GET /api/v1/pricing/estimate/:category`
- **Description**: Get AI-powered price estimates for your items
- **Features**: Price range, confidence score, market trend

### 4. Gamification
- **Endpoint**: `GET /api/v1/gamification/user/stats`
- **Description**: Track points, badges, and leaderboard standings
- **Features**: Level system, challenges, rewards

### 5. Sales Tracking
- **Endpoint**: `GET /api/v1/sales`
- **Description**: Monitor all your sales across platforms
- **Features**: Analytics, revenue tracking, performance metrics

### 6. Shipping Calculator
- **Endpoint**: `POST /api/v1/shipping/calculate`
- **Description**: Calculate shipping costs automatically
- **Features**: Multiple carriers, weight-based pricing

---

## 🔐 Setting Up Marketplace Integrations

### eBay Integration
1. Go to [eBay Developer Program](https://developer.ebay.com)
2. Create application to get OAuth credentials
3. Add to `.env`:
   ```
   EBAY_OAUTH_CLIENT_ID=your-client-id
   EBAY_OAUTH_CLIENT_SECRET=your-client-secret
   ```

### Facebook Marketplace
1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create app and get credentials
3. Add to `.env`:
   ```
   FACEBOOK_APP_ID=your-app-id
   FACEBOOK_APP_SECRET=your-app-secret
   ```

### Other Marketplaces
Repeat similar OAuth setup for:
- Amazon Selling Partner API
- Craigslist API (if available)
- Mercari API
- Etsy API
- Poshmark API
- etc.

See [MARKETPLACES.md](./docs/MARKETPLACES.md) for complete list and setup instructions.

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────┐
│       Frontend (React) / Mobile (React Native)
└────────────────┬────────────────────────────┘
                 │
       ┌─────────▼──────────┐
       │   API Gateway       │
       │  (Port 5000)        │
       └─────────┬──────────┘
                 │
    ┌────────────┴────────────────┐
    │   Backend Services          │
    │  - Auth                     │
    │  - Listings                 │
    │  - Marketplace Integration  │
    │  - Pricing                  │
    │  - Gamification             │
    └─────────┬──────────────┬────┘
              │              │
      ┌───────▼────┐   ┌─────▼──────┐
      │ PostgreSQL │   │   Redis    │
      │ (Database) │   │ (Cache)    │
      └────────────┘   └────────────┘
```

For detailed architecture, see [ARCHITECTURE.md](./docs/ARCHITECTURE.md)

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find and kill the process
lsof -i :5000
kill -9 <PID>
```

### Database Connection Error
```bash
# Reset database
make db-reset

# Check database is running
docker-compose ps
```

### Module Not Found
```bash
# Clear and reinstall
rm -rf node_modules
npm install
```

### Docker Issues
```bash
# Rebuild containers
docker-compose down -v
docker-compose up --build
```

---

## 📖 Documentation

- **[Getting Started](./docs/GETTING_STARTED.md)** - Detailed setup guide
- **[Architecture](./docs/ARCHITECTURE.md)** - System design
- **[API Documentation](./docs/API.md)** - API endpoints (TBD)
- **[Database Schema](./docs/DATABASE.md)** - Database structure
- **[Marketplace Integration](./docs/MARKETPLACES.md)** - 20+ marketplaces
- **[Gamification](./docs/GAMIFICATION.md)** - Points, badges, challenges
- **[Deployment](./docs/DEPLOYMENT.md)** - Production deployment

---

## 🤝 Contributing

Interested in contributing? See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## 📞 Support

- **Documentation**: Check `/docs` folder
- **Issues**: Report on GitHub
- **Questions**: Open a discussion
- **Email**: support@quicksell.app

---

## 🎯 Next Steps

1. **Explore the code**: Check out `backend/src` and `frontend/src`
2. **Run tests**: `make test`
3. **Create a listing**: Use the frontend UI
4. **Connect marketplace**: Setup OAuth credentials
5. **Test API**: Use curl or Postman with provided endpoints
6. **Deploy**: Follow deployment guide when ready

---

## 📈 Project Status

- ✅ Backend API structure
- ✅ Frontend scaffolding
- ✅ Mobile app setup
- ✅ Database schema design
- ✅ Deployment configuration
- ⏳ API implementation (in progress)
- ⏳ Frontend UI components (in progress)
- ⏳ Marketplace integrations (in progress)
- ⏳ AI features (in progress)

---

## 🚀 Quick Deploy Commands

```bash
# Development
make dev                    # Start local environment

# Testing
make test                   # Run all tests
make test-coverage          # With coverage report

# Building
make build-all              # Build all services

# Deployment
make deploy-backend         # Deploy to yakit.store
make deploy-frontend        # Deploy web app
make deploy-mobile-android  # Submit to Play Store
make deploy-mobile-ios      # Submit to App Store
```

Happy selling! 🎉
