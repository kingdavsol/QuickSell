# Getting Started with QuickSell

## Quick Start Guide

### Prerequisites
- Node.js 16 or higher
- Docker and Docker Compose (optional, for development environment)
- PostgreSQL 12+ (if not using Docker)
- Redis 6+ (if not using Docker)

### Installation

#### Option 1: Using Docker (Recommended for Development)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Traffic2umarketing
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration values.

3. **Start development environment**
   ```bash
   docker-compose up -d
   ```
   This will start:
   - PostgreSQL database
   - Redis cache
   - Backend API on port 5000
   - pgAdmin on port 5050
   - Redis Commander on port 8081

4. **Initialize database**
   ```bash
   docker-compose exec backend npm run migrate
   docker-compose exec backend npm run seed
   ```

5. **Access the services**
   - Backend API: http://localhost:5000
   - pgAdmin: http://localhost:5050 (admin@quicksell.local / admin)
   - Redis Commander: http://localhost:8081

#### Option 2: Local Development

1. **Setup PostgreSQL**
   ```bash
   # macOS with Homebrew
   brew install postgresql
   brew services start postgresql

   # Linux (Ubuntu/Debian)
   sudo apt-get install postgresql postgresql-contrib
   sudo systemctl start postgresql

   # Windows
   # Download and install from https://www.postgresql.org/download/windows/
   ```

2. **Setup Redis**
   ```bash
   # macOS with Homebrew
   brew install redis
   brew services start redis

   # Linux (Ubuntu/Debian)
   sudo apt-get install redis-server
   sudo systemctl start redis-server

   # Windows
   # Download from https://github.com/microsoftarchive/redis/releases
   ```

3. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp ../.env.example ../.env
   npm run migrate
   npm run dev
   ```

4. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```
   Access at http://localhost:3000

5. **Mobile Setup**
   ```bash
   cd mobile
   npm install
   npm start
   # Then choose: i (iOS), a (Android), or w (web)
   ```

### API Documentation

The API uses RESTful endpoints with JWT authentication.

#### Authentication
```bash
# Register
POST /api/v1/auth/register
{
  "username": "username",
  "email": "email@example.com",
  "password": "password"
}

# Login
POST /api/v1/auth/login
{
  "email": "email@example.com",
  "password": "password"
}
```

#### Using the API
Include JWT token in Authorization header:
```bash
Authorization: Bearer <your-jwt-token>
```

### Common Development Tasks

#### Database Migrations
```bash
# Create new migration
npm run migrate:make -- <migration-name>

# Run migrations
npm run migrate

# Rollback migrations
npm run migrate:rollback
```

#### Running Tests
```bash
# Backend tests
cd backend
npm test
npm run test:coverage

# Frontend tests
cd frontend
npm test

# Mobile tests
cd mobile
npm test
```

#### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format

# Type checking
npm run typecheck
```

### Environment Variables

See `.env.example` for all available environment variables. Key variables:

- `NODE_ENV` - Development/production environment
- `PORT` - Backend API port (default: 5000)
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - Secret for JWT signing
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `STRIPE_SECRET_KEY` - Stripe API key for payments

### Marketplace Integration

To connect to marketplaces, you'll need API credentials:

1. **eBay**
   - Get OAuth credentials from eBay Developer Program
   - Set `EBAY_OAUTH_CLIENT_ID` and `EBAY_OAUTH_CLIENT_SECRET`

2. **Facebook Marketplace**
   - Create Facebook App
   - Set `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET`

3. **Other Marketplaces**
   - Follow similar OAuth setup process
   - Add credentials to `.env` file

### Troubleshooting

#### Port Already in Use
```bash
# Find process using port
lsof -i :5000

# Kill the process
kill -9 <PID>
```

#### Database Connection Issues
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Reset database
psql -U postgres -c "DROP DATABASE quicksell; CREATE DATABASE quicksell;"
```

#### Redis Connection Issues
```bash
# Test Redis connection
redis-cli ping
# Should return: PONG
```

#### Node Modules Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Development Workflow

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and test**
   ```bash
   npm run lint
   npm test
   ```

3. **Commit changes**
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

4. **Push to remote**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Go to GitHub repository
   - Create PR with description
   - Wait for code review

### Performance Tips

1. **Use Redis caching** for frequently accessed data
2. **Optimize images** before uploading
3. **Use batch operations** for bulk listings
4. **Monitor database queries** for performance
5. **Enable gzip compression** in production

### Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Use HTTPS in production
- [ ] Enable CORS for specific origins
- [ ] Rotate API keys regularly
- [ ] Use environment variables for secrets
- [ ] Enable database encryption
- [ ] Set up rate limiting
- [ ] Implement proper error handling

### Next Steps

1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
2. Check [API.md](./API.md) for API endpoints
3. Review [MARKETPLACES.md](./MARKETPLACES.md) for marketplace integration
4. Explore [GAMIFICATION.md](./GAMIFICATION.md) for gamification system

### Getting Help

- Check documentation in `/docs` folder
- Review error logs in `/logs` folder
- Check GitHub issues
- Contact support at support@quicksell.app

### Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.
