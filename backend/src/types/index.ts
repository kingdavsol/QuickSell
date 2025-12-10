// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  bio?: string;
  subscriptionTier: 'free' | 'premium' | 'premium_plus';
  points: number;
  currentLevel: number;
  totalSales: number;
  totalRevenue: number;
  averageRating?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Listing Types
export type ListingStatus = 'draft' | 'published' | 'sold' | 'delisted' | 'archived';
export type ListingCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';

export interface Listing {
  id: number;
  userId: number;
  title: string;
  description: string;
  category: string;
  condition: ListingCondition;
  price: number;
  estimatedPrice?: number;
  status: ListingStatus;
  brand?: string;
  model?: string;
  localPickupAvailable: boolean;
  shippingAvailable: boolean;
  estimatedShippingCost?: number;
  viewCount: number;
  clickCount: number;
  aiDescriptionGenerated: boolean;
  aiPriceEstimated: boolean;
  confidenceScore?: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

// Photo Types
export interface Photo {
  id: number;
  listingId: number;
  userId: number;
  originalUrl: string;
  thumbUrl?: string;
  optimizedUrl?: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  width: number;
  height: number;
  displayOrder: number;
  isPrimary: boolean;
  qualityScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Marketplace Types
export interface MarketplaceAccount {
  id: number;
  userId: number;
  marketplaceName: string;
  marketplaceUserId?: string;
  accountName?: string;
  sellerRating?: number;
  isActive: boolean;
  autoSyncEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketplaceListing {
  id: number;
  listingId: number;
  marketplaceAccountId: number;
  marketplaceName: string;
  marketplaceListingId?: string;
  marketplaceUrl?: string;
  syncStatus: 'draft' | 'active' | 'sold' | 'delisted' | 'error';
  viewsOnMarketplace: number;
  clicksOnMarketplace: number;
  postedPrice?: number;
  postedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Sale Types
export interface Sale {
  id: number;
  listingId: number;
  buyerId?: number;
  sellerId: number;
  marketplaceName?: string;
  salePrice: number;
  shippingCost: number;
  finalAmount: number;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  saleDate: Date;
  completedDate?: Date;
  shippingCarrier?: string;
  trackingNumber?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  sellerRating?: number;
  sellerReview?: string;
  buyerRating?: number;
  buyerReview?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Gamification Types
export interface Badge {
  id: number;
  badgeKey: string;
  badgeName: string;
  badgeDescription?: string;
  badgeIconUrl?: string;
  badgeTier: '1' | '2' | '3' | 'special';
  requirementType?: string;
  requirementValue?: number;
}

export interface UserBadge {
  id: number;
  userId: number;
  badgeId: number;
  unlockedAt: Date;
  badge?: Badge;
}

export interface Challenge {
  id: number;
  challengeKey: string;
  challengeName: string;
  description?: string;
  challengeType: 'weekly' | 'monthly' | 'seasonal' | 'limited';
  rewardPoints: number;
  startsAt?: Date;
  endsAt?: Date;
  isActive: boolean;
}

export interface UserChallenge {
  id: number;
  userId: number;
  challengeId: number;
  progress: number;
  progressPercentage: number;
  status: 'active' | 'completed' | 'expired';
  startedAt: Date;
  completedAt?: Date;
}

// Subscription Types
export interface Subscription {
  id: number;
  userId: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  planType: 'free' | 'premium' | 'premium_plus';
  status: 'active' | 'past_due' | 'cancelled' | 'expired';
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
  timestamp: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
