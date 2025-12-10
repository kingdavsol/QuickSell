import { Request, Response, NextFunction } from 'express';
import jwt from 'jwt-simple';
import { logger } from '../config/logger';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
  userId?: number;
  token?: string;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new AppError('No authentication token provided', 401);
    }

    const decoded = jwt.decode(
      token,
      process.env.JWT_SECRET || 'your-secret-key',
      true
    );

    if (!decoded.userId) {
      throw new AppError('Invalid token', 401);
    }

    req.userId = decoded.userId;
    req.token = token;

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      statusCode: 401
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        statusCode: 401
      });
    }

    // TODO: Check user roles in database
    next();
  };
};

// Export alias for backward compatibility
export const authMiddleware = authenticate;
