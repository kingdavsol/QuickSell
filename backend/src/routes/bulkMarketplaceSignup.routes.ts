/**
 * Bulk Marketplace Signup Routes
 * Endpoints for bulk signup to multiple marketplaces
 */

import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import bulkMarketplaceSignupController from '../controllers/bulkMarketplaceSignupController';

const router = Router();

/**
 * Public routes (no authentication required)
 */

/**
 * GET /api/marketplaces/available
 * Get list of available marketplaces
 */
router.get('/available', bulkMarketplaceSignupController.getAvailableMarketplaces);

/**
 * Protected routes (authentication required)
 */

/**
 * POST /api/marketplaces/bulk-signup
 * Bulk signup to multiple marketplaces
 * Body: { email, password, selectedMarketplaces: [] }
 */
router.post(
  '/bulk-signup',
  authMiddleware,
  bulkMarketplaceSignupController.bulkSignupToMarketplaces
);

/**
 * GET /api/marketplaces/connected
 * Get user's connected marketplaces
 */
router.get(
  '/connected',
  authMiddleware,
  bulkMarketplaceSignupController.getConnectedMarketplaces
);

/**
 * GET /api/marketplaces/:marketplace/status
 * Check status of a specific marketplace connection
 */
router.get(
  '/:marketplace/status',
  authMiddleware,
  bulkMarketplaceSignupController.checkMarketplaceStatus
);

/**
 * POST /api/marketplaces/:marketplace/disconnect
 * Disconnect from a marketplace
 */
router.post(
  '/:marketplace/disconnect',
  authMiddleware,
  bulkMarketplaceSignupController.disconnectMarketplace
);

export default router;
