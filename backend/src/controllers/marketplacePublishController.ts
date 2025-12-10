/**
 * Marketplace Publishing Controller
 * Handles publishing listings to various marketplaces
 */

import { Request, Response } from 'express';
import { logger } from '../config/logger';
import { pool } from '../database/connection';
import ebayIntegration from '../integrations/ebay';
import craigslistIntegration from '../integrations/craigslist';
import * as listingService from '../services/listingService';
import bulkMarketplaceSignupService from '../services/bulkMarketplaceSignupService';

/**
 * Publish listing to eBay
 * POST /api/v1/publish/ebay/:listingId
 */
export const publishToEbay = async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;
    const userId = (req as any).userId;

    // Get listing
    const listing = await listingService.getListing(parseInt(listingId), userId);
    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    // Get eBay credentials/token
    const credentials = await getMarketplaceToken(userId, 'eBay');
    if (!credentials || !credentials.access_token) {
      return res.status(400).json({
        success: false,
        error: 'eBay account not connected. Please connect your eBay account first.',
        requiresAuth: true,
        authUrl: ebayIntegration.getOAuthUrl(userId.toString()),
      });
    }

    // Get user's eBay policies (would need to be set up previously)
    const policies = await getEbayPolicies(userId);
    if (!policies) {
      return res.status(400).json({
        success: false,
        error: 'eBay seller policies not configured. Please set up your eBay seller account.',
      });
    }

    // Publish to eBay
    const result = await ebayIntegration.createAndPublishListing(
      credentials.access_token,
      {
        title: listing.title,
        description: listing.description,
        price: parseFloat(listing.price),
        category: listing.category,
        condition: listing.condition || 'used',
        brand: listing.brand,
        photos: listing.photos || [],
        fulfillmentType: listing.fulfillment_type,
      },
      policies
    );

    if (result.success) {
      // Update listing with eBay listing ID
      await listingService.updateMarketplaceStatus(
        parseInt(listingId),
        'eBay',
        'posted',
        result.listingId
      );

      return res.status(200).json({
        success: true,
        message: 'Successfully published to eBay',
        data: {
          listingId: result.listingId,
          offerId: result.offerId,
          url: `https://www.ebay.com/itm/${result.listingId}`,
        },
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to publish to eBay',
      });
    }
  } catch (error: any) {
    logger.error('eBay publish error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to publish to eBay',
    });
  }
};

/**
 * Publish listing to Craigslist
 * POST /api/v1/publish/craigslist/:listingId
 */
export const publishToCraigslist = async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;
    const { city, zipcode } = req.body;
    const userId = (req as any).userId;

    // Get listing
    const listing = await listingService.getListing(parseInt(listingId), userId);
    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    // Get Craigslist credentials
    const credentials = await bulkMarketplaceSignupService.getMarketplaceCredentials(userId, 'Craigslist');
    if (!credentials) {
      return res.status(400).json({
        success: false,
        error: 'Craigslist account not connected. Please add your Craigslist credentials.',
      });
    }

    // Check if automation is available
    const available = await craigslistIntegration.isAvailable();
    if (!available) {
      return res.status(503).json({
        success: false,
        error: 'Craigslist automation temporarily unavailable. Please use copy buttons to post manually.',
      });
    }

    // Post to Craigslist
    const result = await craigslistIntegration.postToCraigslist(
      credentials,
      {
        title: listing.title,
        description: listing.description,
        price: parseFloat(listing.price),
        category: listing.category,
        photos: listing.photos || [],
        location: {
          city: city || 'san francisco',
          zipcode: zipcode,
        },
      }
    );

    if (result.success) {
      // Update listing with Craigslist status
      await listingService.updateMarketplaceStatus(
        parseInt(listingId),
        'Craigslist',
        result.requiresVerification ? 'pending_verification' : 'posted',
        result.postingId
      );

      return res.status(200).json({
        success: true,
        message: result.requiresVerification
          ? 'Posting submitted - please check your email to confirm'
          : 'Successfully published to Craigslist',
        data: {
          postingId: result.postingId,
          requiresVerification: result.requiresVerification,
        },
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to publish to Craigslist',
      });
    }
  } catch (error: any) {
    logger.error('Craigslist publish error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to publish to Craigslist',
    });
  }
};

/**
 * Get eBay OAuth URL for connecting account
 * GET /api/v1/publish/ebay/auth
 */
export const getEbayAuthUrl = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const authUrl = ebayIntegration.getOAuthUrl(userId.toString());

    return res.status(200).json({
      success: true,
      data: { authUrl },
    });
  } catch (error: any) {
    logger.error('eBay auth URL error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate eBay authentication URL',
    });
  }
};

/**
 * Handle eBay OAuth callback
 * GET /api/v1/oauth/ebay/callback
 */
export const handleEbayCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;

    if (!code || typeof code !== 'string') {
      return res.redirect('/dashboard?error=ebay_auth_failed');
    }

    const userId = parseInt(state as string);

    // Exchange code for token
    const tokenResult = await ebayIntegration.exchangeCodeForToken(code);

    if (!tokenResult.success || !tokenResult.accessToken) {
      logger.error('eBay token exchange failed:', tokenResult.error);
      return res.redirect('/dashboard?error=ebay_token_failed');
    }

    // Store token in marketplace_accounts
    await pool.query(
      `INSERT INTO marketplace_accounts 
       (user_id, marketplace_name, access_token, refresh_token, token_expires_at, is_active)
       VALUES ($1, 'eBay', $2, $3, NOW() + INTERVAL '$4 seconds', true)
       ON CONFLICT (user_id, marketplace_name) 
       DO UPDATE SET 
         access_token = $2, 
         refresh_token = $3, 
         token_expires_at = NOW() + INTERVAL '$4 seconds',
         is_active = true,
         updated_at = NOW()`,
      [userId, tokenResult.accessToken, tokenResult.refreshToken, tokenResult.expiresIn]
    );

    logger.info(`eBay account connected for user ${userId}`);
    return res.redirect('/dashboard?success=ebay_connected');
  } catch (error: any) {
    logger.error('eBay callback error:', error);
    return res.redirect('/dashboard?error=ebay_callback_failed');
  }
};

/**
 * Publish to multiple marketplaces at once
 * POST /api/v1/publish/bulk/:listingId
 */
export const publishToMultiple = async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;
    const { marketplaces, city, zipcode } = req.body;
    const userId = (req as any).userId;

    if (!Array.isArray(marketplaces) || marketplaces.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one marketplace must be selected',
      });
    }

    const results: Record<string, { success: boolean; error?: string; data?: any }> = {};

    // Process each marketplace
    for (const marketplace of marketplaces) {
      try {
        if (marketplace === 'eBay') {
          // Call eBay publish logic
          const listing = await listingService.getListing(parseInt(listingId), userId);
          const credentials = await getMarketplaceToken(userId, 'eBay');
          
          if (!credentials?.access_token) {
            results['eBay'] = { 
              success: false, 
              error: 'eBay not connected',
              data: { authUrl: ebayIntegration.getOAuthUrl(userId.toString()) }
            };
          } else {
            // Would call publish logic here
            results['eBay'] = { success: false, error: 'eBay bulk publish not yet implemented' };
          }
        } else if (marketplace === 'Craigslist') {
          const credentials = await bulkMarketplaceSignupService.getMarketplaceCredentials(userId, 'Craigslist');
          if (!credentials) {
            results['Craigslist'] = { success: false, error: 'Craigslist credentials not found' };
          } else {
            results['Craigslist'] = { success: false, error: 'Craigslist bulk publish not yet implemented' };
          }
        } else {
          results[marketplace] = { 
            success: false, 
            error: 'Use copy buttons to post to this marketplace' 
          };
        }
      } catch (err: any) {
        results[marketplace] = { success: false, error: err.message };
      }
    }

    const successCount = Object.values(results).filter(r => r.success).length;

    return res.status(200).json({
      success: successCount > 0,
      message: `Published to ${successCount} of ${marketplaces.length} marketplaces`,
      data: results,
    });
  } catch (error: any) {
    logger.error('Bulk publish error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to publish listings',
    });
  }
};

// Helper functions

async function getMarketplaceToken(userId: number, marketplace: string): Promise<any> {
  const result = await pool.query(
    `SELECT access_token, refresh_token, token_expires_at 
     FROM marketplace_accounts 
     WHERE user_id = $1 AND marketplace_name = $2 AND is_active = true`,
    [userId, marketplace]
  );
  return result.rows[0] || null;
}

async function getEbayPolicies(userId: number): Promise<any> {
  // In production, these would be stored per-user after they set up their eBay seller account
  // For now, return null to indicate policies need to be configured
  const result = await pool.query(
    `SELECT policies FROM marketplace_accounts 
     WHERE user_id = $1 AND marketplace_name = 'eBay' AND is_active = true`,
    [userId]
  );
  
  if (result.rows[0]?.policies) {
    return result.rows[0].policies;
  }
  
  return null;
}

export default {
  publishToEbay,
  publishToCraigslist,
  getEbayAuthUrl,
  handleEbayCallback,
  publishToMultiple,
};
