import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PricingPage from './pages/PricingPage';
import Dashboard from './pages/DashboardPage';
import CreateListing from './pages/CreateListing';
import ListingDetails from './pages/ListingDetails';
import MyListings from './pages/MyListings';
import Sales from './pages/Sales';
import Gamification from './pages/Gamification';
import Settings from './pages/Settings';
import BulkMarketplaceSignup from './pages/BulkMarketplaceSignup';
import GoogleCallback from './pages/auth/GoogleCallback';
import { TermsOfService, PrivacyPolicy, CookiePolicy } from './pages/legal';
import PrivateRoute from './components/PrivateRoute';

// Redux
import { RootState } from './store';
import { initializeAuth } from './store/slices/authSlice';

// Styles
import './styles/App.css';

// Create theme with QuickSell branding
const theme = createTheme({
  palette: {
    primary: {
      main: '#007AFF', // QuickSell Blue
      light: '#4DA3FF',
      dark: '#0056D4',
    },
    secondary: {
      main: '#FF6B6B', // Monster Red
      light: '#FF8888',
      dark: '#E41A1A',
    },
    success: {
      main: '#FFD700', // Gold
    },
    background: {
      default: '#F5F7FF',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Helvetica Neue", Tahoma, Geneva, Verdana, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 700,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
});

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    // Initialize auth state from localStorage on app mount
    dispatch(initializeAuth());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader">
          <svg className="monster-loader" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="95" fill="#007AFF" opacity="0.1" stroke="#007AFF" strokeWidth="2" />
            <ellipse cx="100" cy="110" rx="45" ry="50" fill="#FF6B6B" className="bounce" />
            <circle cx="100" cy="60" r="40" fill="#FF6B6B" />
            <circle cx="85" cy="50" r="8" fill="#FFFFFF" />
            <circle cx="85" cy="50" r="5" fill="#000000" />
            <circle cx="115" cy="50" r="8" fill="#FFFFFF" />
            <circle cx="115" cy="50" r="5" fill="#000000" />
            <path d="M 85 70 Q 100 80 115 70" stroke="#000000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </svg>
          <p>Loading QuickSell...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/auth/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route path="/auth/callback" element={<GoogleCallback />} />
          <Route path="/auth/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />} />
          <Route path="/login" element={<Navigate to="/auth/login" />} />
          <Route path="/register" element={<Navigate to="/auth/register" />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/create-listing" element={<PrivateRoute><CreateListing /></PrivateRoute>} />
          <Route path="/listings" element={<PrivateRoute><MyListings /></PrivateRoute>} />
          <Route path="/listing/:id" element={<PrivateRoute><ListingDetails /></PrivateRoute>} />
          <Route path="/sales" element={<PrivateRoute><Sales /></PrivateRoute>} />
          <Route path="/gamification" element={<PrivateRoute><Gamification /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="/connect-marketplaces" element={<PrivateRoute><BulkMarketplaceSignup /></PrivateRoute>} />
          <Route path="/legal/terms-of-service" element={<TermsOfService />} />
          <Route path="/legal/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/legal/cookie-policy" element={<CookiePolicy />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
