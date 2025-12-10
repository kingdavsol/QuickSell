import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';
import { pool } from '../database/connection';
import { logger } from '../config/logger';

const router = Router();

// Dashboard Overview Stats
router.get('/dashboard', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    // Get total users
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(usersResult.rows[0].count);

    // Get total listings
    const listingsResult = await pool.query('SELECT COUNT(*) as count FROM listings WHERE deleted_at IS NULL');
    const totalListings = parseInt(listingsResult.rows[0].count);

    // Get listings by status
    const statusResult = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM listings
      WHERE deleted_at IS NULL
      GROUP BY status
    `);

    let activeListings = 0;
    let draftListings = 0;
    let publishedListings = 0;

    statusResult.rows.forEach((row: any) => {
      if (row.status === 'active') activeListings = parseInt(row.count);
      if (row.status === 'draft') draftListings = parseInt(row.count);
      if (row.status === 'published') publishedListings = parseInt(row.count);
    });

    // Get total points
    const pointsResult = await pool.query('SELECT SUM(points) as total FROM users');
    const totalPoints = parseInt(pointsResult.rows[0].total) || 0;

    // Calculate average listings per user
    const avgListingsPerUser = totalUsers > 0 ? totalListings / totalUsers : 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalListings,
        activeListings,
        draftListings,
        publishedListings,
        totalPoints,
        avgListingsPerUser,
      },
    });
  } catch (error: any) {
    logger.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message,
    });
  }
});

// Get All Users
router.get('/users', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT id, username, email, subscription_tier, points, current_level, is_admin, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      data: {
        users: result.rows,
        total: result.rows.length,
      },
    });
  } catch (error: any) {
    logger.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
});

// Get Single User
router.get('/users/:id', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT id, username, email, subscription_tier, points, current_level, is_admin, created_at, updated_at
      FROM users
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message,
    });
  }
});

// Update User
router.put('/users/:id', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, email, subscription_tier, points, is_admin } = req.body;

    const result = await pool.query(`
      UPDATE users
      SET username = $1, email = $2, subscription_tier = $3, points = $4, is_admin = $5, updated_at = NOW()
      WHERE id = $6
      RETURNING id, username, email, subscription_tier, points, is_admin
    `, [username, email, subscription_tier, points, is_admin, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: result.rows[0],
    });
  } catch (error: any) {
    logger.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message,
    });
  }
});

// Delete User
router.delete('/users/:id', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // First, delete user's listings
    await pool.query('UPDATE listings SET deleted_at = NOW() WHERE user_id = $1', [id]);

    // Then delete the user
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    logger.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message,
    });
  }
});

// Get All Listings
router.get('/listings', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT id, user_id, title, description, status, price, category, marketplace_listings, created_at
      FROM listings
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      data: {
        listings: result.rows,
        total: result.rows.length,
      },
    });
  } catch (error: any) {
    logger.error('Get listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch listings',
      error: error.message,
    });
  }
});

// Delete Listing
router.delete('/listings/:id', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      UPDATE listings
      SET deleted_at = NOW()
      WHERE id = $1
      RETURNING id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    res.json({
      success: true,
      message: 'Listing deleted successfully',
    });
  } catch (error: any) {
    logger.error('Delete listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete listing',
      error: error.message,
    });
  }
});

// System Health
router.get('/system', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    // Check database connection
    const dbCheck = await pool.query('SELECT NOW()');
    const dbConnected = !!dbCheck.rows[0];

    // Get table sizes
    const tablesResult = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM listings WHERE deleted_at IS NULL) as listings,
        (SELECT COUNT(*) FROM marketplace_accounts) as marketplace_accounts
    `);

    const tables = tablesResult.rows[0];

    // Calculate uptime (approximate)
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const uptimeString = `${hours}h ${minutes}m`;

    res.json({
      success: true,
      data: {
        database: {
          status: 'healthy',
          connected: dbConnected,
        },
        tables,
        uptime: uptimeString,
      },
    });
  } catch (error: any) {
    logger.error('System health error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system health',
      error: error.message,
    });
  }
});

// Analytics (placeholder for future expansion)
router.get('/analytics', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    // Get user growth (last 7 days)
    const userGrowth = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    // Get listing growth (last 7 days)
    const listingGrowth = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM listings
      WHERE created_at >= NOW() - INTERVAL '7 days' AND deleted_at IS NULL
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    res.json({
      success: true,
      data: {
        userGrowth: userGrowth.rows,
        listingGrowth: listingGrowth.rows,
      },
    });
  } catch (error: any) {
    logger.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message,
    });
  }
});

export default router;
