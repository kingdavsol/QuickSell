/**
 * Bulk Marketplace Signup Page
 * Allows users to signup to multiple marketplaces with one universal email/password
 */

import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Alert,
  CircularProgress,
  LinearProgress,
  Typography,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import { useDispatch, useSelector } from 'react-redux';
import api from '../services/api';
import logger from '../config/logger';

interface MarketplaceOption {
  id: string;
  name: string;
  description: string;
  category: string;
  tier: number;
  active: boolean;
  connected?: boolean;
}

interface SignupResult {
  marketplace: string;
  status: 'success' | 'failed' | 'pending_oauth';
  message: string;
  error?: string;
}

export const BulkMarketplaceSignup: React.FC = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state: any) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedMarketplaces, setSelectedMarketplaces] = useState<string[]>([]);
  const [availableMarketplaces, setAvailableMarketplaces] = useState<MarketplaceOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<SignupResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  // Load available marketplaces on mount
  useEffect(() => {
    loadMarketplaces();
  }, []);

  const loadMarketplaces = async () => {
    try {
      setLoading(true);
      const response = await api.get('/marketplaces/available');
      if (response.data.success) {
        setAvailableMarketplaces(response.data.data);
      }
    } catch (err) {
      logger.error('Failed to load marketplaces:', err);
      setError('Failed to load available marketplaces');
    } finally {
      setLoading(false);
    }
  };

  const handleMarketplaceToggle = (marketplace: string) => {
    setSelectedMarketplaces((prev) =>
      prev.includes(marketplace)
        ? prev.filter((m) => m !== marketplace)
        : [...prev, marketplace]
    );
  };

  const handleSelectAllTier1 = () => {
    const tier1 = availableMarketplaces.filter((m) => m.tier === 1).map((m) => m.id);
    setSelectedMarketplaces((prev) => {
      const filtered = prev.filter((m) => !availableMarketplaces.some((am) => am.tier === 1 && am.id === m));
      return filtered.length === tier1.length ? [] : [...new Set([...filtered, ...tier1])];
    });
  };

  const handleSelectAll = () => {
    const allMarketplaces = availableMarketplaces.map((m) => m.id);
    setSelectedMarketplaces(
      selectedMarketplaces.length === allMarketplaces.length ? [] : allMarketplaces
    );
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordsMatch(value === confirmPassword);
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    setPasswordsMatch(password === value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (selectedMarketplaces.length === 0) {
      setError('Please select at least one marketplace');
      return;
    }

    setError('');
    setSuccessMessage('');
    setSubmitting(true);

    try {
      const response = await api.post('/marketplaces/bulk-signup', {
        email,
        password,
        selectedMarketplaces,
      });

      if (response.data.success) {
        setResults(response.data.data.results);
        setShowResults(true);
        setSuccessMessage(response.data.message);

        // Clear form on success
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setSelectedMarketplaces([]);

        // Reload marketplace list to show updated connection status
        loadMarketplaces();
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to signup to marketplaces';
      setError(errorMessage);
      logger.error('Bulk signup error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getResultIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon sx={{ color: 'success.main' }} />;
      case 'failed':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
      case 'pending_oauth':
        return <HourglassEmptyIcon sx={{ color: 'warning.main' }} />;
      default:
        return null;
    }
  };

  const groupedMarketplaces = {
    tier1: availableMarketplaces.filter((m) => m.tier === 1),
    tier2: availableMarketplaces.filter((m) => m.tier === 2),
    tier3: availableMarketplaces.filter((m) => m.tier === 3),
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ConnectWithoutContactIcon /> Connect to Multiple Marketplaces
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Sign up to sell on 22+ marketplaces with just one email and password. We'll securely store
              your credentials and automatically connect your account to each marketplace.
            </Typography>
          </Box>
        </Grid>

        {/* Error Alert */}
        {error && (
          <Grid item xs={12}>
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          </Grid>
        )}

        {/* Success Alert */}
        {successMessage && (
          <Grid item xs={12}>
            <Alert severity="success" onClose={() => setSuccessMessage('')}>
              {successMessage}
            </Alert>
          </Grid>
        )}

        {/* Main Form */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Your Account Credentials
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block' }}>
              We encrypt and securely store your credentials. They're never shared with marketplaces directly.
            </Typography>

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                disabled={submitting}
                helperText="This email will be used across all selected marketplaces"
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                margin="normal"
                required
                disabled={submitting}
                helperText="At least 6 characters. Must match confirmation password."
                error={password.length > 0 && password.length < 6}
              />

              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                margin="normal"
                required
                disabled={submitting}
                error={!passwordsMatch && confirmPassword.length > 0}
                helperText={!passwordsMatch && confirmPassword.length > 0 ? 'Passwords do not match' : ''}
              />

              <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Marketplaces: {selectedMarketplaces.length}
                </Typography>
                {selectedMarketplaces.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    {selectedMarketplaces.map((m) => (
                      <Chip
                        key={m}
                        label={m}
                        onDelete={() => handleMarketplaceToggle(m)}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                )}
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={submitting || selectedMarketplaces.length === 0 || !passwordsMatch}
                sx={{ mt: 2 }}
              >
                {submitting ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Connecting...
                  </>
                ) : (
                  `Connect to ${selectedMarketplaces.length} Marketplace${selectedMarketplaces.length !== 1 ? 's' : ''}`
                )}
              </Button>

              {submitting && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress />
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    Please wait while we setup your marketplace connections...
                  </Typography>
                </Box>
              )}
            </form>
          </Paper>
        </Grid>

        {/* Marketplace Selection */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Select Marketplaces</Typography>
              <Box>
                <Button size="small" onClick={handleSelectAllTier1}>
                  Select Tier 1
                </Button>
                <Button size="small" onClick={handleSelectAll}>
                  {selectedMarketplaces.length === availableMarketplaces.length ? 'Deselect All' : 'Select All'}
                </Button>
              </Box>
            </Box>

            {/* Tier 1 Marketplaces */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                🔥 Most Popular (Tier 1)
              </Typography>
              <FormGroup>
                {groupedMarketplaces.tier1.map((marketplace) => (
                  <FormControlLabel
                    key={marketplace.id}
                    control={
                      <Checkbox
                        checked={selectedMarketplaces.includes(marketplace.id)}
                        onChange={() => handleMarketplaceToggle(marketplace.id)}
                        disabled={submitting}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {marketplace.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {marketplace.description}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </FormGroup>
            </Box>

            {/* Tier 2 Marketplaces */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="secondary" gutterBottom>
                Popular (Tier 2)
              </Typography>
              <FormGroup>
                {groupedMarketplaces.tier2.map((marketplace) => (
                  <FormControlLabel
                    key={marketplace.id}
                    control={
                      <Checkbox
                        checked={selectedMarketplaces.includes(marketplace.id)}
                        onChange={() => handleMarketplaceToggle(marketplace.id)}
                        disabled={submitting}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {marketplace.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {marketplace.description}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </FormGroup>
            </Box>

            {/* Tier 3 Marketplaces */}
            {groupedMarketplaces.tier3.length > 0 && (
              <Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Niche/International (Tier 3)
                </Typography>
                <FormGroup>
                  {groupedMarketplaces.tier3.map((marketplace) => (
                    <FormControlLabel
                      key={marketplace.id}
                      control={
                        <Checkbox
                          checked={selectedMarketplaces.includes(marketplace.id)}
                          onChange={() => handleMarketplaceToggle(marketplace.id)}
                          disabled={submitting}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {marketplace.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {marketplace.description}
                          </Typography>
                        </Box>
                      }
                    />
                  ))}
                </FormGroup>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Results Dialog */}
      <Dialog open={showResults} onClose={() => setShowResults(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Marketplace Connection Results</DialogTitle>
        <DialogContent>
          {results.map((result) => (
            <Card key={result.marketplace} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  {getResultIcon(result.status)}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {result.marketplace}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {result.message}
                    </Typography>
                    {result.status === 'failed' && result.error && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                        Error: {result.error}
                      </Typography>
                    )}
                    {result.status === 'pending_oauth' && (
                      <Button size="small" color="primary" sx={{ mt: 1 }}>
                        Complete OAuth Flow
                      </Button>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResults(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BulkMarketplaceSignup;
