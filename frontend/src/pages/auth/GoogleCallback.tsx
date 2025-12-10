import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Box, CircularProgress, Typography } from "@mui/material";
import { loginSuccess } from "../../store/slices/authSlice";

const GoogleCallback: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const userParam = searchParams.get("user");
    const error = searchParams.get("error");

    if (error) {
      navigate(`/login?error=${error}`);
      return;
    }

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        dispatch(loginSuccess({ user, token }));
        navigate("/dashboard");
      } catch (e) {
        navigate("/login?error=parse_error");
      }
    } else {
      navigate("/login?error=missing_params");
    }
  }, [searchParams, dispatch, navigate]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <CircularProgress sx={{ color: "white", mb: 2 }} />
      <Typography variant="h6" sx={{ color: "white" }}>
        Signing you in...
      </Typography>
    </Box>
  );
};

export default GoogleCallback;
