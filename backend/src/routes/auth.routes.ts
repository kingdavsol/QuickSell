import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { register, login, logout, refreshToken } from "../controllers/authController";
import { getGoogleAuthUrl, googleCallback, verifyGoogleToken } from "../controllers/googleAuthController";

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    User login
 * @access  Public
 */
router.post("/login", login);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    User logout
 * @access  Private
 */
router.post("/logout", authenticate, logout);

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Refresh JWT token
 * @access  Private
 */
router.post("/refresh-token", authenticate, refreshToken);

/**
 * @route   GET /api/v1/auth/google
 * @desc    Get Google OAuth URL
 * @access  Public
 */
router.get("/google", getGoogleAuthUrl);

/**
 * @route   GET /api/v1/auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
router.get("/google/callback", googleCallback);

/**
 * @route   POST /api/v1/auth/google/verify
 * @desc    Verify Google ID token (for frontend Sign-In button)
 * @access  Public
 */
router.post("/google/verify", verifyGoogleToken);

export default router;
