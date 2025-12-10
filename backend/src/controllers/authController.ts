import { Request, Response } from 'express';
import jwt from 'jwt-simple';
import bcryptjs from 'bcryptjs';
import { logger } from '../config/logger';
import { AppError } from '../middleware/errorHandler';
import { createUser, getUserByEmail } from '../services/userService';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        statusCode: 400,
      });
    }

    // Check if user exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists',
        statusCode: 409,
      });
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const passwordHash = await bcryptjs.hash(password, salt);

    // Create user in database
    const user = await createUser(username, email, passwordHash);

    // Create JWT token
    const token = jwt.encode(
      {
        userId: user.id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
      },
      process.env.JWT_SECRET || 'your-secret-key'
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      statusCode: 201,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      },
    });
  } catch (error: any) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Registration failed',
      statusCode: 500,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password required',
        statusCode: 400,
      });
    }

    // Find user by email
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        statusCode: 401,
      });
    }

    // Compare passwords
    const isPasswordValid = await bcryptjs.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        statusCode: 401,
      });
    }

    // Generate JWT token
    const token = jwt.encode(
      {
        userId: user.id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
      },
      process.env.JWT_SECRET || 'your-secret-key'
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      statusCode: 200,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      },
    });
  } catch (error: any) {
    logger.error('Login error:', error);
    res.status(401).json({
      success: false,
      error: error.message || 'Login failed',
      statusCode: 401,
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      statusCode: 200,
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
      statusCode: 500,
    });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    // TODO: Validate existing token
    // TODO: Generate new token

    res.status(200).json({
      success: true,
      message: 'Token refreshed',
      statusCode: 200,
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      error: 'Token refresh failed',
      statusCode: 401,
    });
  }
};
