import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
} from "@mui/material";
import { Visibility, VisibilityOff, Google as GoogleIcon } from "@mui/icons-material";
import api from "../services/api";
import { loginSuccess } from "../store/slices/authSlice";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) {
      setError(decodeURIComponent(urlError).replace(/_/g, " "));
    }

    // Load Google Sign-In script
    if (GOOGLE_CLIENT_ID) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = () => {
        // @ts-ignore
        window.google?.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
        });
        // @ts-ignore
        window.google?.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          {
            theme: "outline",
            size: "large",
            width: "100%",
            text: "signin_with",
          }
        );
      };

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [searchParams]);

  const handleGoogleCredentialResponse = async (response: any) => {
    setGoogleLoading(true);
    setError("");
    try {
      const result = await api.post("/auth/google/verify", {
        credential: response.credential,
      });

      if (result.data.data?.token) {
        dispatch(
          loginSuccess({
            user: result.data.data.user,
            token: result.data.data.token,
          })
        );
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleRedirect = async () => {
    setGoogleLoading(true);
    try {
      const response = await api.get("/auth/google");
      if (response.data.data?.authUrl) {
        window.location.href = response.data.data.authUrl;
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to start Google sign-in");
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const response = await api.login(email, password);

      if (response.data.data?.token) {
        dispatch(
          loginSuccess({
            user: response.data.data.user,
            token: response.data.data.token,
          })
        );
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            borderRadius: 2,
          }}
        >
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <svg
              width="60"
              height="60"
              viewBox="0 0 64 64"
              xmlns="http://www.w3.org/2000/svg"
              style={{ marginBottom: "16px" }}
            >
              <rect width="64" height="64" fill="#007AFF" rx="8" />
              <circle cx="32" cy="22" r="11" fill="#FF6B6B" />
              <circle cx="27" cy="19" r="2.5" fill="#FFFFFF" />
              <circle cx="27" cy="19" r="1.2" fill="#000000" />
              <circle cx="37" cy="19" r="2.5" fill="#FFFFFF" />
              <circle cx="37" cy="19" r="1.2" fill="#000000" />
              <path
                d="M 26 26 Q 32 28 38 26"
                stroke="#000000"
                strokeWidth="1"
                fill="none"
                strokeLinecap="round"
              />
              <ellipse cx="32" cy="38" rx="11" ry="13" fill="#FF6B6B" />
              <ellipse cx="32" cy="40" rx="6" ry="8" fill="#FFB3BA" opacity="0.8" />
            </svg>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to continue selling
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Google Sign-In Button */}
          <Box sx={{ mb: 2 }}>
            {GOOGLE_CLIENT_ID ? (
              <Box id="google-signin-btn" sx={{ display: "flex", justifyContent: "center" }} />
            ) : (
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleRedirect}
                disabled={googleLoading}
                sx={{
                  py: 1.5,
                  borderColor: "#dadce0",
                  color: "#3c4043",
                  textTransform: "none",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  "&:hover": {
                    borderColor: "#dadce0",
                    backgroundColor: "#f8f9fa",
                  },
                }}
              >
                {googleLoading ? "Signing in..." : "Sign in with Google"}
              </Button>
            )}
          </Box>

          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              or
            </Typography>
          </Divider>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="email"
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="current-password"
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                },
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Don&apos;t have an account?{" "}
                <Link
                  to="/auth/register"
                  style={{
                    color: "#667eea",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Sign up
                </Link>
              </Typography>
            </Box>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Link
                to="/"
                style={{
                  color: "#666",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                }}
              >
                Back to Home
              </Link>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
