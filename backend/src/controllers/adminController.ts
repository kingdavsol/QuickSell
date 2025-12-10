/**
 * Admin Dashboard Controller
 * Provides metrics and management endpoints for system administrators
 */

import { Request, Response } from 'express';
import { logger } from '../config/logger';
import { pool } from '../database/connection';

/**
 * Get dashboard metrics overview
 * GET /api/v1/admin/metrics
 */
export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // Verify user is admin
    const adminCheck = await pool.query(
      'SELECT is_admin FROM users WHERE id = $1',
      [userId]
    );

    if (!adminCheck.rows[0]?.is_admin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.',
        statusCode: 403
      });
    }

    // Get all metrics in parallel
    const [
      usersResult,
      listingsResult,
      marketplaceAccountsResult,
      ebayListingsResult,
      subscriptionTiersResult,
      recentUsersResult,
      activeUsersResult
    ] = await Promise.all([
      // Total users
      pool.query('SELECT COUNT(*) as total FROM users'),

      // Total listings
      pool.query('SELECT COUNT(*) as total FROM listings'),

      // Connected marketplace accounts
      pool.query('SELECT COUNT(*) as total FROM marketplace_accounts WHERE is_active = true'),

      // eBay listings
      pool.query('SELECT COUNT(*) as total FROM ebay_listings'),

      // Users by subscription tier
      pool.query(`
        SELECT subscription_tier, COUNT(*) as count
        FROM users
        GROUP BY subscription_tier
      `),

      // Recent users (last 7 days)
      pool.query(`
        SELECT COUNT(*) as count
        FROM users
        WHERE created_at > NOW() - INTERVAL '7 days'
      `),

      // Active users (last 30 days)
      pool.query(`
        SELECT COUNT(DISTINCT user_id) as count
        FROM listings
        WHERE created_at > NOW() - INTERVAL '30 days'
      `)
    ]);

    // Get listings by status
    const listingsByStatusResult = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'draft') as drafts,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'sold') as sold,
        COUNT(*) FILTER (WHERE status = 'archived') as archived
      FROM listings
    `);

    // Get top users by listings
    const topUsersResult = await pool.query(`
      SELECT
        u.id,
        u.username,
        u.email,
        u.subscription_tier,
        COUNT(l.id) as listing_count
      FROM users u
      LEFT JOIN listings l ON u.id = l.user_id
      GROUP BY u.id, u.username, u.email, u.subscription_tier
      ORDER BY listing_count DESC
      LIMIT 10
    `);

    // Calculate revenue (mock - would need actual subscription/payment data)
    const revenueResult = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE subscription_tier = 'premium') as premium_count,
        COUNT(*) FILTER (WHERE subscription_tier = 'premium_plus') as premium_plus_count
      FROM users
    `);

    const premiumCount = parseInt(revenueResult.rows[0]?.premium_count || 0);
    const premiumPlusCount = parseInt(revenueResult.rows[0]?.premium_plus_count || 0);
    const monthlyRevenue = (premiumCount * 4.99) + (premiumPlusCount * 9.99);
    const annualRevenue = monthlyRevenue * 12;

    const metrics = {
      overview: {
        totalUsers: parseInt(usersResult.rows[0]?.total || 0),
        totalListings: parseInt(listingsResult.rows[0]?.total || 0),
        connectedAccounts: parseInt(marketplaceAccountsResult.rows[0]?.total || 0),
        ebayListings: parseInt(ebayListingsResult.rows[0]?.total || 0),
        recentUsers: parseInt(recentUsersResult.rows[0]?.count || 0),
        activeUsers: parseInt(activeUsersResult.rows[0]?.count || 0)
      },
      subscriptions: subscriptionTiersResult.rows.reduce((acc: any, row: any) => {
        acc[row.subscription_tier] = parseInt(row.count);
        return acc;
      }, {}),
      listings: {
        drafts: parseInt(listingsByStatusResult.rows[0]?.drafts || 0),
        active: parseInt(listingsByStatusResult.rows[0]?.active || 0),
        sold: parseInt(listingsByStatusResult.rows[0]?.sold || 0),
        archived: parseInt(listingsByStatusResult.rows[0]?.archived || 0)
      },
      revenue: {
        monthlyRevenue: monthlyRevenue.toFixed(2),
        annualRevenue: annualRevenue.toFixed(2),
        premiumUsers: premiumCount,
        premiumPlusUsers: premiumPlusCount
      },
      topUsers: topUsersResult.rows
    };

    // Log admin activity
    await pool.query(
      `INSERT INTO admin_activity_log (admin_id, action, details, ip_address)
       VALUES ($1, 'view_dashboard', $2, $3)`,
      [userId, JSON.stringify({ timestamp: new Date() }), req.ip]
    );

    res.status(200).json({
      success: true,
      data: metrics,
      statusCode: 200
    });

  } catch (error: any) {
    logger.error('Admin metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard metrics',
      statusCode: 500
    });
  }
};

/**
 * Get all users with filters
 * GET /api/v1/admin/users
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { page = 1, limit = 50, search = '', tier = '' } = req.query;

    // Verify admin
    const adminCheck = await pool.query(
      'SELECT is_admin FROM users WHERE id = $1',
      [userId]
    );

    if (!adminCheck.rows[0]?.is_admin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        statusCode: 403
      });
    }

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let query = `
      SELECT
        u.id, u.username, u.email, u.subscription_tier,
        u.points, u.current_level, u.is_admin,
        u.created_at, u.updated_at,
        COUNT(l.id) as listing_count,
        COUNT(ma.id) as connected_accounts
      FROM users u
      LEFT JOIN listings l ON u.id = l.user_id
      LEFT JOIN marketplace_accounts ma ON u.id = ma.user_id AND ma.is_active = true
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      params.push(`%${search}%`, `%${search}%`);
      query += ` AND (u.username ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex + 1})`;
      paramIndex += 2;
    }

    if (tier) {
      params.push(tier);
      query += ` AND u.subscription_tier = $${paramIndex}`;
      paramIndex++;
    }

    query += ` GROUP BY u.id ORDER BY u.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit as string), offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM users WHERE 1=1';
    const countParams: any[] = [];
    let countParamIndex = 1;

    if (search) {
      countParams.push(`%${search}%`, `%${search}%`);
      countQuery += ` AND (username ILIKE $${countParamIndex} OR email ILIKE $${countParamIndex + 1})`;
      countParamIndex += 2;
    }

    if (tier) {
      countParams.push(tier);
      countQuery += ` AND subscription_tier = $${countParamIndex}`;
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0]?.count || 0);

    res.status(200).json({
      success: true,
      data: {
        users: result.rows,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string))
        }
      },
      statusCode: 200
    });

  } catch (error: any) {
    logger.error('Admin get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
      statusCode: 500
    });
  }
};

/**
 * Get system stats over time
 * GET /api/v1/admin/stats
 */
export const getSystemStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { days = 30 } = req.query;

    // Verify admin
    const adminCheck = await pool.query(
      'SELECT is_admin FROM users WHERE id = $1',
      [userId]
    );

    if (!adminCheck.rows[0]?.is_admin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        statusCode: 403
      });
    }

    // Get user signups over time
    const signupsResult = await pool.query(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as count
      FROM users
      WHERE created_at > NOW() - INTERVAL '${parseInt(days as string)} days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // Get listings created over time
    const listingsResult = await pool.query(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as count
      FROM listings
      WHERE created_at > NOW() - INTERVAL '${parseInt(days as string)} days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    res.status(200).json({
      success: true,
      data: {
        signups: signupsResult.rows,
        listings: listingsResult.rows
      },
      statusCode: 200
    });

  } catch (error: any) {
    logger.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch system stats',
      statusCode: 500
    });
  }
};

/**
 * Get recent admin activity
 * GET /api/v1/admin/activity
 */
export const getAdminActivity = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { limit = 50 } = req.query;

    // Verify admin
    const adminCheck = await pool.query(
      'SELECT is_admin FROM users WHERE id = $1',
      [userId]
    );

    if (!adminCheck.rows[0]?.is_admin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        statusCode: 403
      });
    }

    const result = await pool.query(`
      SELECT
        aal.id, aal.action, aal.target_type, aal.target_id,
        aal.details, aal.ip_address, aal.created_at,
        u.username, u.email
      FROM admin_activity_log aal
      JOIN users u ON aal.admin_id = u.id
      ORDER BY aal.created_at DESC
      LIMIT $1
    `, [parseInt(limit as string)]);

    res.status(200).json({
      success: true,
      data: result.rows,
      statusCode: 200
    });

  } catch (error: any) {
    logger.error('Admin activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin activity',
      statusCode: 500
    });
  }
};

export default {
  getDashboardMetrics,
  getUsers,
  getSystemStats,
  getAdminActivity
};
