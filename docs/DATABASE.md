# Database Schema

## PostgreSQL Schema for QuickSell

### Core Tables

#### users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  profile_picture_url VARCHAR(500),
  bio TEXT,
  phone_number VARCHAR(20),

  -- Account Info
  account_status ENUM('active', 'suspended', 'deleted') DEFAULT 'active',
  email_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,

  -- OAuth
  google_id VARCHAR(255),
  facebook_id VARCHAR(255),
  apple_id VARCHAR(255),

  -- Preferences
  theme ENUM('light', 'dark') DEFAULT 'light',
  language VARCHAR(10) DEFAULT 'en',
  notification_preferences JSONB,

  -- Subscription
  subscription_tier ENUM('free', 'premium', 'premium_plus') DEFAULT 'free',
  subscription_expires_at TIMESTAMP,

  -- Gamification
  points INT DEFAULT 0,
  current_level INT DEFAULT 1,
  total_sales INT DEFAULT 0,
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  avg_rating DECIMAL(3, 2),

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_account_status ON users(account_status);
```

#### listings
```sql
CREATE TABLE listings (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  condition ENUM('new', 'like_new', 'good', 'fair', 'poor') NOT NULL,

  -- Pricing
  price DECIMAL(10, 2) NOT NULL,
  estimated_price DECIMAL(10, 2),

  -- Status
  status ENUM('draft', 'published', 'sold', 'delisted', 'archived') DEFAULT 'draft',

  -- Condition & Details
  brand VARCHAR(255),
  model VARCHAR(255),
  color VARCHAR(100),
  size VARCHAR(50),
  weight_kg DECIMAL(8, 2),
  dimensions VARCHAR(100),

  -- Shipping
  local_pickup_available BOOLEAN DEFAULT FALSE,
  shipping_available BOOLEAN DEFAULT TRUE,
  estimated_shipping_cost DECIMAL(8, 2),

  -- Engagement
  view_count INT DEFAULT 0,
  click_count INT DEFAULT 0,

  -- AI Data
  ai_description_generated BOOLEAN DEFAULT FALSE,
  ai_price_estimated BOOLEAN DEFAULT FALSE,
  confidence_score DECIMAL(3, 2),

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP,
  deleted_at TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_created_at ON listings(created_at);
```

#### listing_versions
```sql
CREATE TABLE listing_versions (
  id SERIAL PRIMARY KEY,
  listing_id INT NOT NULL,
  title VARCHAR(200),
  description TEXT,
  price DECIMAL(10, 2),
  status VARCHAR(50),
  changes JSONB NOT NULL,
  version INT NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT NOT NULL,

  FOREIGN KEY (listing_id) REFERENCES listings(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_listing_versions_listing_id ON listing_versions(listing_id);
```

#### photos
```sql
CREATE TABLE photos (
  id SERIAL PRIMARY KEY,
  listing_id INT NOT NULL,
  user_id INT NOT NULL,

  -- Photo URLs
  original_url VARCHAR(500) NOT NULL,
  thumb_url VARCHAR(500),
  optimized_url VARCHAR(500),

  -- Metadata
  filename VARCHAR(255),
  file_size INT,
  mime_type VARCHAR(50),
  width INT,
  height INT,

  -- AI Analysis
  contains_faces BOOLEAN,
  contains_hands BOOLEAN,
  background_type VARCHAR(50),
  quality_score DECIMAL(3, 2),
  object_confidence DECIMAL(3, 2),

  -- Positioning
  display_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (listing_id) REFERENCES listings(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_photos_listing_id ON photos(listing_id);
CREATE INDEX idx_photos_user_id ON photos(user_id);
```

#### marketplace_accounts
```sql
CREATE TABLE marketplace_accounts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  marketplace_name VARCHAR(100) NOT NULL,

  -- Auth
  marketplace_user_id VARCHAR(500),
  access_token VARCHAR(1000),
  refresh_token VARCHAR(1000),
  token_expires_at TIMESTAMP,

  -- Account Info
  account_name VARCHAR(255),
  seller_rating DECIMAL(3, 2),
  total_sales_on_platform INT DEFAULT 0,

  -- Settings
  is_active BOOLEAN DEFAULT TRUE,
  auto_sync_enabled BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, marketplace_name),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_marketplace_accounts_user_id ON marketplace_accounts(user_id);
```

#### marketplace_listings
```sql
CREATE TABLE marketplace_listings (
  id SERIAL PRIMARY KEY,
  listing_id INT NOT NULL,
  marketplace_account_id INT NOT NULL,
  marketplace_name VARCHAR(100) NOT NULL,

  -- Marketplace IDs
  marketplace_listing_id VARCHAR(500) UNIQUE,
  marketplace_url VARCHAR(500),

  -- Status
  sync_status ENUM('draft', 'active', 'sold', 'delisted', 'error') DEFAULT 'draft',
  last_sync_at TIMESTAMP,

  -- Stats
  views_on_marketplace INT DEFAULT 0,
  clicks_on_marketplace INT DEFAULT 0,

  -- Data
  posted_price DECIMAL(10, 2),
  synced_data JSONB,

  -- Timing
  posted_at TIMESTAMP,
  expires_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (listing_id) REFERENCES listings(id),
  FOREIGN KEY (marketplace_account_id) REFERENCES marketplace_accounts(id)
);

CREATE INDEX idx_marketplace_listings_listing_id ON marketplace_listings(listing_id);
CREATE INDEX idx_marketplace_listings_marketplace_name ON marketplace_listings(marketplace_name);
```

#### sales
```sql
CREATE TABLE sales (
  id SERIAL PRIMARY KEY,
  listing_id INT NOT NULL,
  buyer_id INT,
  seller_id INT NOT NULL,

  -- Sale Details
  marketplace_name VARCHAR(100),
  sale_price DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(8, 2) DEFAULT 0,
  final_amount DECIMAL(10, 2),

  -- Status
  status ENUM('pending', 'completed', 'cancelled', 'refunded') DEFAULT 'pending',

  -- Timestamps
  sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_date TIMESTAMP,

  -- Shipping
  shipping_carrier VARCHAR(100),
  tracking_number VARCHAR(255),
  shipped_at TIMESTAMP,
  delivered_at TIMESTAMP,

  -- Reviews
  seller_rating INT,
  seller_review TEXT,
  buyer_rating INT,
  buyer_review TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (listing_id) REFERENCES listings(id),
  FOREIGN KEY (seller_id) REFERENCES users(id)
);

CREATE INDEX idx_sales_listing_id ON sales(listing_id);
CREATE INDEX idx_sales_seller_id ON sales(seller_id);
CREATE INDEX idx_sales_sale_date ON sales(sale_date);
```

#### user_stats
```sql
CREATE TABLE user_stats (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,

  -- Points & Levels
  total_points INT DEFAULT 0,
  current_level INT DEFAULT 1,

  -- Sales
  total_items_sold INT DEFAULT 0,
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  average_sale_price DECIMAL(10, 2),

  -- Ratings
  positive_ratings INT DEFAULT 0,
  negative_ratings INT DEFAULT 0,
  average_rating DECIMAL(3, 2),

  -- Engagement
  listings_created INT DEFAULT 0,
  photos_uploaded INT DEFAULT 0,

  -- Streaks
  current_posting_streak INT DEFAULT 0,
  best_posting_streak INT DEFAULT 0,
  last_activity_date DATE,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### badges
```sql
CREATE TABLE badges (
  id SERIAL PRIMARY KEY,
  badge_key VARCHAR(100) UNIQUE NOT NULL,
  badge_name VARCHAR(255) NOT NULL,
  badge_description TEXT,
  badge_icon_url VARCHAR(500),
  badge_tier ENUM('1', '2', '3', 'special') DEFAULT '1',

  -- Requirements
  requirement_type VARCHAR(100),
  requirement_value INT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_badges_badge_key ON badges(badge_key);
```

#### user_badges
```sql
CREATE TABLE user_badges (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  badge_id INT NOT NULL,

  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, badge_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (badge_id) REFERENCES badges(id)
);

CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
```

#### challenges
```sql
CREATE TABLE challenges (
  id SERIAL PRIMARY KEY,
  challenge_key VARCHAR(100) UNIQUE NOT NULL,
  challenge_name VARCHAR(255) NOT NULL,
  description TEXT,
  challenge_type ENUM('weekly', 'monthly', 'seasonal', 'limited') DEFAULT 'weekly',

  -- Rewards
  reward_points INT DEFAULT 50,
  reward_badge_id INT,

  -- Timing
  starts_at TIMESTAMP,
  ends_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (reward_badge_id) REFERENCES badges(id)
);
```

#### user_challenges
```sql
CREATE TABLE user_challenges (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  challenge_id INT NOT NULL,

  progress INT DEFAULT 0,
  progress_percentage DECIMAL(5, 2) DEFAULT 0,
  status ENUM('active', 'completed', 'expired') DEFAULT 'active',

  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,

  UNIQUE(user_id, challenge_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (challenge_id) REFERENCES challenges(id)
);

CREATE INDEX idx_user_challenges_user_id ON user_challenges(user_id);
```

#### notifications
```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,

  notification_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  icon_url VARCHAR(500),

  -- Related data
  related_listing_id INT,
  related_sale_id INT,

  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (related_listing_id) REFERENCES listings(id),
  FOREIGN KEY (related_sale_id) REFERENCES sales(id)
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

#### analytics_events
```sql
CREATE TABLE analytics_events (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,

  event_type VARCHAR(100) NOT NULL,
  event_name VARCHAR(255),

  -- Context
  listing_id INT,
  marketplace_name VARCHAR(100),

  -- Event data
  event_data JSONB,

  session_id VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (listing_id) REFERENCES listings(id)
);

CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
```

#### subscriptions
```sql
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,

  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),

  plan_type ENUM('free', 'premium', 'premium_plus') NOT NULL,

  status ENUM('active', 'past_due', 'cancelled', 'expired') DEFAULT 'active',

  current_period_start DATE,
  current_period_end DATE,

  cancel_at_period_end BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
```

## Views for Analytics

### sales_summary_view
```sql
CREATE VIEW sales_summary_view AS
SELECT
  u.id as user_id,
  u.username,
  COUNT(s.id) as total_sales,
  SUM(s.sale_price) as total_revenue,
  AVG(s.sale_price) as avg_sale_price,
  AVG(s.seller_rating) as avg_rating,
  DATE_TRUNC('month', s.sale_date) as month
FROM users u
LEFT JOIN sales s ON u.id = s.seller_id
GROUP BY u.id, u.username, DATE_TRUNC('month', s.sale_date);
```

### listing_performance_view
```sql
CREATE VIEW listing_performance_view AS
SELECT
  l.id,
  l.title,
  l.category,
  COUNT(DISTINCT ml.id) as marketplace_count,
  SUM(ml.views_on_marketplace) as total_views,
  CASE WHEN s.id IS NOT NULL THEN 1 ELSE 0 END as is_sold,
  s.sale_price,
  (l.view_count + COALESCE(SUM(ml.views_on_marketplace), 0)) as total_platform_views
FROM listings l
LEFT JOIN marketplace_listings ml ON l.id = ml.listing_id
LEFT JOIN sales s ON l.id = s.listing_id
GROUP BY l.id, l.title, l.category, s.id, s.sale_price;
```

## Indexing Strategy

### Primary Indexes
- User lookups by email, username, ID
- Listing lookups by ID, user_id, status
- Photo lookups by listing_id
- Marketplace listing lookups by listing_id and marketplace

### Analytical Indexes
- Sales by date range
- Analytics events by user and date
- Leaderboard queries (user_stats)

### Performance Indexes
- Create partial indexes for active listings
- Composite indexes for common queries
- JSONB GIN indexes for notification preferences

## Caching Strategy (Redis)

### Cache Keys
```
user:{id}                    - User profile data
listing:{id}                 - Listing details
marketplace_listings:{id}    - All marketplace copies
user_stats:{id}             - User statistics
user_badges:{id}            - User badges
leaderboard:monthly         - Top sellers this month
leaderboard:weekly          - Top sellers this week
```

### TTL Values
- User profile: 1 hour
- Listing: 30 minutes
- Marketplace listings: 15 minutes
- Leaderboard: 6 hours
- User stats: 1 hour

## Data Retention & Archival

- Active listings: PostgreSQL
- Deleted listings: Archive table (90 days)
- Sales data: Keep forever (legal/compliance)
- Analytics: Archive after 1 year to separate storage
- Temporary files (photos): Clean up after 30 days if unused

## Backup Strategy

- Daily automated backups
- Weekly full backups
- Monthly backup archival
- Point-in-time recovery capability
- Geographically distributed backups
