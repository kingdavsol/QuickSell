import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  TextField,
  Chip,
  Alert,
  Paper,
  Tooltip,
  Snackbar,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment
} from '@mui/material';
import {
  PhotoCamera,
  CloudUpload,
  AccountCircle,
  Logout,
  AutoAwesome,
  AttachMoney,
  Public,
  ContentCopy,
  LocalShipping,
  Store,
  Image
} from '@mui/icons-material';
import api from '../services/api';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiData, setAiData] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copySnackbar, setCopySnackbar] = useState('');
  const [fulfillmentType, setFulfillmentType] = useState<string>('both');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Marketplace definitions with fulfillment types
  const LOCAL_MARKETPLACES = ['Craigslist', 'Facebook', 'OfferUp'];
  const SHIPPING_MARKETPLACES = ['Mercari', 'Poshmark', 'Etsy', 'Depop', 'Vinted'];
  const BOTH_MARKETPLACES = ['eBay'];

  const getActiveMarketplaces = () => {
    if (fulfillmentType === 'local') {
      return [...LOCAL_MARKETPLACES, ...BOTH_MARKETPLACES];
    } else if (fulfillmentType === 'shipping') {
      return [...SHIPPING_MARKETPLACES, ...BOTH_MARKETPLACES];
    }
    return [...LOCAL_MARKETPLACES, ...SHIPPING_MARKETPLACES, ...BOTH_MARKETPLACES];
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    setAnalyzing(true);
    setError('');
    try {
      const response = await api.analyzePhoto(file);
      setAiData(response.data.data);
      setSuccess('Photo analyzed! Use copy buttons to paste into marketplace apps.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to analyze photo. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Copy to clipboard functions
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySnackbar(`${label} copied!`);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySnackbar(`${label} copied!`);
    }
  };

  const copyImageToClipboard = async () => {
    if (!selectedImage) return;
    try {
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      setCopySnackbar('Image copied!');
    } catch (err) {
      // If clipboard API fails, provide download option
      const link = document.createElement('a');
      link.href = selectedImage;
      link.download = 'listing-photo.jpg';
      link.click();
      setCopySnackbar('Image downloaded (clipboard not supported)');
    }
  };

  const copyAllToClipboard = async () => {
    if (!aiData) return;
    const fullListing = `TITLE: ${aiData.title || ''}

PRICE: $${aiData.suggestedPrice || ''}

CATEGORY: ${aiData.category || ''}

CONDITION: ${aiData.condition || 'Used'}

DESCRIPTION:
${aiData.description || ''}

---
Listed with QuickSell`;
    
    await copyToClipboard(fullListing, 'Full listing');
  };

  const handleCreateListing = async () => {
    if (!aiData) return;

    try {
      await api.createListing({
        title: aiData.title,
        description: aiData.description,
        price: aiData.suggestedPrice,
        category: aiData.category,
        condition: aiData.condition || 'used',
        fulfillment_type: fulfillmentType,
      });

      setSuccess('Listing saved! Use the copy buttons to post to marketplaces.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create listing. Please try again.');
    }
  };

  // Copy button component
  const CopyButton = ({ onClick, tooltip }: { onClick: () => void; tooltip: string }) => (
    <Tooltip title={tooltip}>
      <IconButton size="small" onClick={onClick} sx={{ ml: 1 }}>
        <ContentCopy fontSize="small" />
      </IconButton>
    </Tooltip>
  );

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', background: '#f5f5f5' }}>
      <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            QuickSell Dashboard
          </Typography>
          <IconButton color="inherit" onClick={handleMenu}>
            <AccountCircle />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
            <MenuItem disabled>
              <Typography variant="body2">{user.email || 'User'}</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} fontSize="small" />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Upload Section */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom fontWeight={600}>
                  <PhotoCamera sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Take or Upload Photo
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Upload a photo of your item and let AI do the rest!
                </Typography>

                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />

                {!selectedImage ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<CloudUpload />}
                      onClick={() => fileInputRef.current?.click()}
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        py: 1.5,
                        px: 4,
                      }}
                    >
                      Choose Photo
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        background: '#f9f9f9',
                        borderRadius: 2,
                        position: 'relative',
                      }}
                    >
                      <img
                        src={selectedImage}
                        alt="Selected item"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '300px',
                          borderRadius: '8px',
                        }}
                      />
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Image />}
                        onClick={copyImageToClipboard}
                        sx={{
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          background: 'rgba(0,0,0,0.7)',
                        }}
                      >
                        Copy Image
                      </Button>
                    </Paper>
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{ mt: 2 }}
                      onClick={() => {
                        setSelectedImage(null);
                        setAiData(null);
                        setSuccess('');
                      }}
                    >
                      Choose Different Photo
                    </Button>
                  </Box>
                )}

                {analyzing && (
                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <CircularProgress />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Analyzing photo with AI...
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* AI Results Section */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" fontWeight={600}>
                    <AutoAwesome sx={{ mr: 1, verticalAlign: 'middle' }} />
                    AI-Generated Details
                  </Typography>
                  {aiData && (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<ContentCopy />}
                      onClick={copyAllToClipboard}
                      sx={{ background: '#4caf50' }}
                    >
                      Copy All
                    </Button>
                  )}
                </Box>

                {aiData ? (
                  <Box>
                    {/* Fulfillment Type Toggle */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Fulfillment Type:
                      </Typography>
                      <ToggleButtonGroup
                        value={fulfillmentType}
                        exclusive
                        onChange={(e, val) => val && setFulfillmentType(val)}
                        size="small"
                        fullWidth
                      >
                        <ToggleButton value="local">
                          <Store sx={{ mr: 1 }} fontSize="small" />
                          Local Pickup
                        </ToggleButton>
                        <ToggleButton value="shipping">
                          <LocalShipping sx={{ mr: 1 }} fontSize="small" />
                          Shipping
                        </ToggleButton>
                        <ToggleButton value="both">
                          Both
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Box>

                    <TextField
                      fullWidth
                      label="Title"
                      value={aiData.title || ''}
                      onChange={(e) => setAiData({ ...aiData, title: e.target.value })}
                      margin="normal"
                      variant="outlined"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <CopyButton onClick={() => copyToClipboard(aiData.title, 'Title')} tooltip="Copy title" />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Description"
                      value={aiData.description || ''}
                      onChange={(e) => setAiData({ ...aiData, description: e.target.value })}
                      margin="normal"
                      multiline
                      rows={4}
                      variant="outlined"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                            <CopyButton onClick={() => copyToClipboard(aiData.description, 'Description')} tooltip="Copy description" />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                      <TextField
                        label="Suggested Price"
                        value={aiData.suggestedPrice || ''}
                        onChange={(e) => setAiData({ ...aiData, suggestedPrice: e.target.value })}
                        InputProps={{
                          startAdornment: <AttachMoney />,
                          endAdornment: (
                            <InputAdornment position="end">
                              <CopyButton onClick={() => copyToClipboard(`$${aiData.suggestedPrice}`, 'Price')} tooltip="Copy price" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ flex: 1 }}
                      />

                      <TextField
                        label="Category"
                        value={aiData.category || ''}
                        onChange={(e) => setAiData({ ...aiData, category: e.target.value })}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <CopyButton onClick={() => copyToClipboard(aiData.category, 'Category')} tooltip="Copy category" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ flex: 1 }}
                      />
                    </Box>

                    <Box sx={{ mt: 3 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <Public sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                        {fulfillmentType === 'local' ? 'Local Pickup Marketplaces:' : 
                         fulfillmentType === 'shipping' ? 'Shipping Marketplaces:' : 
                         'All Marketplaces:'}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {getActiveMarketplaces().map((marketplace) => (
                          <Chip 
                            key={marketplace} 
                            label={marketplace} 
                            color={LOCAL_MARKETPLACES.includes(marketplace) ? 'success' : 
                                   SHIPPING_MARKETPLACES.includes(marketplace) ? 'info' : 'primary'} 
                            size="small" 
                          />
                        ))}
                      </Box>
                    </Box>

                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={handleCreateListing}
                      sx={{
                        mt: 3,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        py: 1.5,
                      }}
                    >
                      Save Listing
                    </Button>

                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
                      Use the copy buttons above to paste into marketplace apps
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <AutoAwesome sx={{ fontSize: 64, color: '#ccc' }} />
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                      No photo analyzed yet
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Stats */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary" fontWeight={700}>
                      0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Listings
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary" fontWeight={700}>
                      $0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Earnings
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary" fontWeight={700}>
                      0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Items Sold
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>

      {/* Copy Snackbar */}
      <Snackbar
        open={!!copySnackbar}
        autoHideDuration={2000}
        onClose={() => setCopySnackbar('')}
        message={copySnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default DashboardPage;
