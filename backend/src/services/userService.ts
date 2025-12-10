import { query } from '../database/connection';
import { logger } from '../config/logger';

export const createUser = async (username: string, email: string, passwordHash: string) => {
  try {
    const result = await query(
      'INSERT INTO users (username, email, password_hash, subscription_tier, points, current_level) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, email',
      [username, email, passwordHash, 'free', 0, 1]
    );
    return result.rows[0];
  } catch (error) {
    logger.error('Create user error:', error);
    throw error;
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  } catch (error) {
    logger.error('Get user by email error:', error);
    throw error;
  }
};

export const getUserById = async (id: number) => {
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  } catch (error) {
    logger.error('Get user by ID error:', error);
    throw error;
  }
};

export const updateUser = async (id: number, data: any) => {
  try {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');

    const result = await query(`UPDATE users SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`, [
      ...values,
      id,
    ]);
    return result.rows[0];
  } catch (error) {
    logger.error('Update user error:', error);
    throw error;
  }
};

export const addUserPoints = async (userId: number, points: number) => {
  try {
    const result = await query(
      'UPDATE users SET points = points + $1, updated_at = NOW() WHERE id = $2 RETURNING points, current_level',
      [points, userId]
    );
    return result.rows[0];
  } catch (error) {
    logger.error('Add user points error:', error);
    throw error;
  }
};
