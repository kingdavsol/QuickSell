/**
 * Bulk Marketplace Signup Controller
 * Handles API endpoints for bulk marketplace signup
 */

import { Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import bulkMarketplaceSignupService from '../services/bulkMarketplaceSignupService';
import { logger } from '../config/logger';

// Marketplace definitions with API status and fulfillment type
const MARKETPLACE_DEFINITIONS = [
  // LOCAL PICKUP MARKETPLACES
  {
    id: 'Craigslist',
    name: 'Craigslist',
    description: 'Post items on Craigslist for local sales',
    icon: 'craigslist-icon',
    category: 'Local Sales',
    fulfillment: 'local',
    hasApi: false,
    automationType: 'browser',
    tier: 1,
    active: true,
  },
  {
    id: 'Facebook',
    name: 'Facebook Marketplace',
    description: 'Sell to local buyers on Facebook Marketplace',
    icon: 'facebook-icon',
    category: 'Local Sales',
    fulfillment: 'local',
    hasApi: true,
    apiType: 'graph-api',
    tier: 1,
    active: true,
  },
  {
    id: 'OfferUp',
    name: 'OfferUp',
    description: 'Sell items locally on OfferUp',
    icon: 'offerup-icon',
    category: 'Local Sales',
    fulfillment: 'local',
    hasApi: false,
    automationType: 'browser',
    tier: 2,
    active: true,
  },
  // BOTH LOCAL & SHIPPING
  {
    id: 'eBay',
    name: 'eBay',
    description: 'List items on eBay - supports local pickup and shipping',
    icon: 'ebay-icon',
    category: 'General Marketplace',
    fulfillment: 'both',
    hasApi: true,
    apiType: 'rest-api',
    tier: 1,
    active: true,
  },
  // SHIPPING ONLY MARKETPLACES
  {
    id: 'Mercari',
    name: 'Mercari',
    description: 'Mobile-friendly marketplace for shipping sales',
    icon: 'mercari-icon',
    category: 'General Marketplace',
    fulfillment: 'shipping',
    hasApi: true,
    apiType: 'rest-api',
    tier: 2,
    active: true,
  },
  {
    id: 'Poshmark',
    name: 'Poshmark',
    description: 'Sell fashion items with prepaid shipping labels',
    icon: 'poshmark-icon',
    category: 'Fashion',
    fulfillment: 'shipping',
    hasApi: false,
    automationType: 'browser',
    tier: 2,
    active: true,
  },
  {
    id: 'Etsy',
    name: 'Etsy',
    description: 'Sell handmade, vintage, and craft supplies',
    icon: 'etsy-icon',
    category: 'Handmade/Vintage',
    fulfillment: 'shipping',
    hasApi: true,
    apiType: 'rest-api',
    tier: 2,
    active: true,
  },
  {
    id: 'Depop',
    name: 'Depop',
    description: 'Sell fashion on this trendy peer-to-peer app',
    icon: 'depop-icon',
    category: 'Fashion',
    fulfillment: 'shipping',
    hasApi: false,
    automationType: 'browser',
    tier: 2,
    active: true,
  },
  {
    id: 'Vinted',
    name: 'Vinted',
    description: 'Sell secondhand fashion - no seller fees',
    icon: 'vinted-icon',
    category: 'Fashion',
    fulfillment: 'shipping',
    hasApi: false,
    automationType: 'browser',
    tier: 3,
    active: true,
  },
];

// Valid marketplace IDs
const VALID_MARKETPLACES = MARKETPLACE_DEFINITIONS.map(m => m.id);

/**
 * Bulk signup to multiple marketplaces at once
 * POST /api/marketplaces/bulk-signup
 */
export const bulkSignupToMarketplaces = async (req: Request, res: Response) => {
  try {
    const { email, password, selectedMarketplaces } = req.body;
    const userId = (req as any).userId;

    if (!email || typeof email !== 'string') {
      throw new AppError('Email is required and must be a string', 400);
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      throw new AppError('Password is required and must be at least 6 characters', 400);
    }

    if (!Array.isArray(selectedMarketplaces) || selectedMarketplaces.length === 0) {
      throw new AppError('At least one marketplace must be selected', 400);
    }

    for (const marketplace of selectedMarketplaces) {
      if (!VALID_MARKETPLACES.includes(marketplace)) {
        throw new AppError(`Invalid marketplace: ${marketplace}`, 400);
      }
    }

    logger.info(`Bulk signup request for user ${userId} to ${selectedMarketplaces.length} marketplaces`);

    const result = await bulkMarketplaceSignupService.bulkSignupToMarketplaces({
      userId,
      email,
      password,
      selectedMarketplaces,
    });

    res.status(200).json({
      success: true,
      message: `Successfully setup ${result.successCount} marketplace(s)`,
      data: result,
    });
  } catch (error) {
    logger.error('Bulk signup error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to setup marketplaces',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get user's connected marketplaces
 * GET /api/marketplaces/connected
 */
export const getConnectedMarketplaces = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const marketplaces = await bulkMarketplaceSignupService.getUserMarketplaces(userId);

    res.status(200).json({
      success: true,
      data: {
        userId,
        marketplaces,
        total: marketplaces.length,
      },
    });
  } catch (error) {
    logger.error('Failed to get connected marketplaces:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve connected marketplaces',
    });
  }
};

/**
 * Disconnect from a marketplace
 * POST /api/marketplaces/:marketplace/disconnect
 */
export const disconnectMarketplace = async (req: Request, res: Response) => {
  try {
    const { marketplace } = req.params;
    const userId = (req as any).userId;

    if (!marketplace || typeof marketplace !== 'string') {
      throw new AppError('Marketplace name is required', 400);
    }

    await bulkMarketplaceSignupService.disconnectMarketplace(userId, marketplace);

    res.status(200).json({
      success: true,
      message: `Disconnected from ${marketplace}`,
      data: { marketplace },
    });
  } catch (error) {
    logger.error('Failed to disconnect marketplace:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect marketplace',
    });
  }
};

/**
 * Get available marketplaces to signup
 * GET /api/marketplaces/available
 * Query params: fulfillment=local|shipping|both
 */
export const getAvailableMarketplaces = async (req: Request, res: Response) => {
  try {
    const { fulfillment } = req.query;
    
    let marketplaces = [...MARKETPLACE_DEFINITIONS];
    
    // Filter by fulfillment type if specified
    if (fulfillment === 'local') {
      marketplaces = marketplaces.filter(m => m.fulfillment === 'local' || m.fulfillment === 'both');
    } else if (fulfillment === 'shipping') {
      marketplaces = marketplaces.filter(m => m.fulfillment === 'shipping' || m.fulfillment === 'both');
    }

    // If user is authenticated, mark connected marketplaces
    if ((req as any).userId) {
      const userId = (req as any).userId;
      const connected = await bulkMarketplaceSignupService.getUserMarketplaces(userId);
      const connectedNames = new Set(connected.map((m: any) => m.marketplace_name));

      marketplaces = marketplaces.map((m) => ({
        ...m,
        connected: connectedNames.has(m.id),
      }));
    }

    res.status(200).json({
      success: true,
      data: marketplaces,
      meta: {
        total: marketplaces.length,
        withApi: marketplaces.filter(m => m.hasApi).length,
        browserAutomation: marketplaces.filter(m => !m.hasApi).length,
        fulfillmentFilter: fulfillment || 'all',
      },
    });
  } catch (error) {
    logger.error('Failed to get available marketplaces:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve available marketplaces',
    });
  }
};

/**
 * Check marketplace connection status
 * GET /api/marketplaces/:marketplace/status
 */
export const checkMarketplaceStatus = async (req: Request, res: Response) => {
  try {
    const { marketplace } = req.params;
    const userId = (req as any).userId;

    if (!marketplace || typeof marketplace !== 'string') {
      throw new AppError('Marketplace name is required', 400);
    }

    const marketplaces = await bulkMarketplaceSignupService.getUserMarketplaces(userId);
    const connected = marketplaces.find(
      (m: any) => m.marketplace_name === marketplace && m.is_active
    );

    const definition = MARKETPLACE_DEFINITIONS.find(m => m.id === marketplace);

    res.status(200).json({
      success: true,
      data: {
        marketplace,
        connected: !!connected,
        details: connected || null,
        hasApi: definition?.hasApi || false,
        fulfillment: definition?.fulfillment || 'unknown',
      },
    });
  } catch (error) {
    logger.error('Failed to check marketplace status:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to check marketplace status',
    });
  }
};

export default {
  bulkSignupToMarketplaces,
  getConnectedMarketplaces,
  disconnectMarketplace,
  getAvailableMarketplaces,
  checkMarketplaceStatus,
  MARKETPLACE_DEFINITIONS,
};
