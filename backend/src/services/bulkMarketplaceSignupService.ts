/**
 * Bulk Marketplace Signup Service
 * Handles marketplace account connections and credential storage
 */

import crypto from 'crypto';
import { pool } from '../database/connection';
import { logger } from '../config/logger';

// Encryption key for storing credentials
const ENCRYPTION_KEY = process.env.MARKETPLACE_ENCRYPTION_KEY || 'quicksell-default-encryption-key-32b';
const ALGORITHM = 'aes-256-cbc';

// Encrypt password before storing
function encryptPassword(password: string): string {
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// Decrypt password when needed
function decryptPassword(encryptedPassword: string): string {
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const [ivHex, encrypted] = encryptedPassword.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Valid marketplaces (updated - removed Amazon, Letgo)
const VALID_MARKETPLACES = [
  'eBay', 'Facebook', 'Craigslist', 'Mercari',
  'Poshmark', 'Etsy', 'Depop', 'Vinted', 'OfferUp'
];

interface BulkSignupParams {
  userId: number;
  email: string;
  password: string;
  selectedMarketplaces: string[];
}

interface SignupResult {
  successCount: number;
  failedCount: number;
  results: Array<{
    marketplace: string;
    status: 'success' | 'failed';
    message: string;
  }>;
}

/**
 * Process bulk signup to multiple marketplaces
 */
async function bulkSignupToMarketplaces(params: BulkSignupParams): Promise<SignupResult> {
  const { userId, email, password, selectedMarketplaces } = params;
  const results: SignupResult['results'] = [];
  let successCount = 0;
  let failedCount = 0;

  const encryptedPassword = encryptPassword(password);

  for (const marketplace of selectedMarketplaces) {
    try {
      if (!VALID_MARKETPLACES.includes(marketplace)) {
        throw new Error(`Invalid marketplace: ${marketplace}`);
      }

      // Check if already connected
      const existing = await pool.query(
        'SELECT id FROM marketplace_accounts WHERE user_id =  AND marketplace_name = ',
        [userId, marketplace]
      );

      if (existing.rows.length > 0) {
        // Update existing
        await pool.query(
          `UPDATE marketplace_accounts 
           SET account_name = , encrypted_password = , is_active = true, updated_at = NOW()
           WHERE user_id =  AND marketplace_name = `,
          [email, encryptedPassword, userId, marketplace]
        );
      } else {
        // Insert new
        await pool.query(
          `INSERT INTO marketplace_accounts 
           (user_id, marketplace_name, account_name, encrypted_password, is_active, auto_sync_enabled)
           VALUES (, , , , true, true)`,
          [userId, marketplace, email, encryptedPassword]
        );
      }

      // Award gamification points (25 points per marketplace)
      await pool.query(
        'UPDATE users SET points = points + 25 WHERE id = ',
        [userId]
      );

      results.push({
        marketplace,
        status: 'success',
        message: `Connected to ${marketplace}`,
      });
      successCount++;

      logger.info(`User ${userId} connected to ${marketplace}`);
    } catch (error) {
      logger.error(`Failed to connect to ${marketplace}:`, error);
      results.push({
        marketplace,
        status: 'failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      failedCount++;
    }
  }

  return { successCount, failedCount, results };
}

/**
 * Get user's connected marketplaces
 */
async function getUserMarketplaces(userId: number): Promise<any[]> {
  const result = await pool.query(
    `SELECT id, marketplace_name, account_name, is_active, auto_sync_enabled, created_at, updated_at
     FROM marketplace_accounts 
     WHERE user_id =  AND is_active = true
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}

/**
 * Disconnect from a marketplace
 */
async function disconnectMarketplace(userId: number, marketplace: string): Promise<void> {
  await pool.query(
    `UPDATE marketplace_accounts 
     SET is_active = false, updated_at = NOW()
     WHERE user_id =  AND marketplace_name = `,
    [userId, marketplace]
  );
  logger.info(`User ${userId} disconnected from ${marketplace}`);
}

/**
 * Get decrypted credentials for a marketplace (for API calls)
 */
async function getMarketplaceCredentials(userId: number, marketplace: string): Promise<{ email: string; password: string } | null> {
  const result = await pool.query(
    `SELECT account_name, encrypted_password 
     FROM marketplace_accounts 
     WHERE user_id =  AND marketplace_name =  AND is_active = true`,
    [userId, marketplace]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return {
    email: result.rows[0].account_name,
    password: decryptPassword(result.rows[0].encrypted_password),
  };
}

export default {
  bulkSignupToMarketplaces,
  getUserMarketplaces,
  disconnectMarketplace,
  getMarketplaceCredentials,
  encryptPassword,
  decryptPassword,
};
