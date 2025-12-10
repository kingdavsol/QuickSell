import { Request, Response } from "express";
import jwt from "jwt-simple";
import { OAuth2Client } from "google-auth-library";
import { logger } from "../config/logger";
import { query } from "../database/connection";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Get Google OAuth URL for redirect
export const getGoogleAuthUrl = async (req: Request, res: Response) => {
  try {
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || "https://quicksell.monster/api/v1/auth/google/callback";
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      return res.status(500).json({
        success: false,
        error: "Google OAuth not configured",
        statusCode: 500,
      });
    }

    const authUrl = "https://accounts.google.com/o/oauth2/v2/auth?" +
      "client_id=" + clientId +
      "&redirect_uri=" + encodeURIComponent(redirectUri) +
      "&response_type=code" +
      "&scope=" + encodeURIComponent("openid email profile") +
      "&access_type=offline" +
      "&prompt=consent";

    res.json({
      success: true,
      data: { authUrl },
      statusCode: 200,
    });
  } catch (error: any) {
    logger.error("Google auth URL error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate Google auth URL",
      statusCode: 500,
    });
  }
};

// Handle Google OAuth callback
export const googleCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect("/login?error=no_code");
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || "https://quicksell.monster/api/v1/auth/google/callback";

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: code as string,
        client_id: clientId || "",
        client_secret: clientSecret || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenResponse.json() as { id_token?: string; access_token?: string; error?: string };

    if (!tokens.id_token) {
      logger.error("No id_token in response:", tokens);
      return res.redirect("/login?error=token_failed");
    }

    // Verify the ID token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.redirect("/login?error=invalid_token");
    }

    const { email, name, picture, sub: googleId } = payload;

    // Check if user exists
    let user = await query("SELECT * FROM users WHERE email = $1", [email]);

    if (user.rows.length === 0) {
      // Create new user
      const username = name || (email ? email.split("@")[0] : "User");
      user = await query(
        "INSERT INTO users (username, email, password_hash, google_id, avatar_url, subscription_tier, points, current_level) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, username, email, avatar_url",
        [username, email, "google_oauth", googleId, picture, "free", 0, 1]
      );
    } else if (!user.rows[0].google_id) {
      // Link Google account to existing user
      await query(
        "UPDATE users SET google_id = $1, avatar_url = COALESCE(avatar_url, $2) WHERE email = $3",
        [googleId, picture, email]
      );
    }

    const dbUser = user.rows[0];

    // Generate JWT token
    const token = jwt.encode(
      {
        userId: dbUser.id,
        email: dbUser.email,
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      },
      process.env.JWT_SECRET || "your-secret-key"
    );

    // Redirect to frontend with token
    const userJson = JSON.stringify({
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.username,
      avatar_url: dbUser.avatar_url,
    });
    res.redirect("/auth/callback?token=" + token + "&user=" + encodeURIComponent(userJson));
  } catch (error: any) {
    logger.error("Google callback error:", error);
    res.redirect("/login?error=" + encodeURIComponent(error.message || "auth_failed"));
  }
};

// Verify Google ID token (for frontend Google Sign-In button)
export const verifyGoogleToken = async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        error: "No credential provided",
        statusCode: 400,
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
        statusCode: 401,
      });
    }

    const { email, name, picture, sub: googleId } = payload;

    // Check if user exists
    let userResult = await query("SELECT * FROM users WHERE email = $1", [email]);

    if (userResult.rows.length === 0) {
      // Create new user
      const username = name || (email ? email.split("@")[0] : "User");
      userResult = await query(
        "INSERT INTO users (username, email, password_hash, google_id, avatar_url, subscription_tier, points, current_level) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, username, email, avatar_url",
        [username, email, "google_oauth", googleId, picture, "free", 0, 1]
      );
    } else if (!userResult.rows[0].google_id) {
      // Link Google account to existing user
      await query(
        "UPDATE users SET google_id = $1, avatar_url = COALESCE(avatar_url, $2) WHERE email = $3",
        [googleId, picture, email]
      );
    }

    const user = userResult.rows[0];

    // Generate JWT token
    const token = jwt.encode(
      {
        userId: user.id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      },
      process.env.JWT_SECRET || "your-secret-key"
    );

    res.json({
      success: true,
      message: "Google authentication successful",
      statusCode: 200,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          avatar_url: user.avatar_url,
        },
      },
    });
  } catch (error: any) {
    logger.error("Google token verification error:", error);
    res.status(401).json({
      success: false,
      error: error.message || "Token verification failed",
      statusCode: 401,
    });
  }
};
