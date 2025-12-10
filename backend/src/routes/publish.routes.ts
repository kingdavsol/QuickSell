/**
 * Marketplace Publishing Routes
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import publishController from '../controllers/marketplacePublishController';

const router = Router();

// eBay routes
router.get('/ebay/auth', authenticate, publishController.getEbayAuthUrl);
router.post('/ebay/:listingId', authenticate, publishController.publishToEbay);

// Craigslist routes
router.post('/craigslist/:listingId', authenticate, publishController.publishToCraigslist);

// Bulk publish
router.post('/bulk/:listingId', authenticate, publishController.publishToMultiple);

// OAuth callbacks (no auth required - comes from external service)
router.get('/oauth/ebay/callback', publishController.handleEbayCallback);

export default router;
