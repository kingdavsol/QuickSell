import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  Step,
  Stepper,
  StepLabel,
  Typography,
  TextField,
  Grid,
  Card,
  CardMedia,
  CardActions,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Snackbar,
  Divider,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  ContentCopy,
  Save,
  AutoAwesome,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const steps = ['Upload Photos', 'Review & Edit', 'Publish'];

interface ListingData {
  title: string;
  description: string;
  category: string;
  price: string;
  condition: string;
  brand: string;
  model: string;
  color: string;
  size: string;
  fulfillment_type: string;
}

const CreateListing: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [listingData, setListingData] = useState<ListingData>({
    title: '',
    description: '',
    category: '',
    price: '',
    condition: 'good',
    brand: '',
    model: '',
    color: '',
    size: '',
    fulfillment_type: 'both',
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const newPhotos = [...photos, ...files].slice(0, 10);
      setPhotos(newPhotos);

      const newPreviews = newPhotos.map((file) => URL.createObjectURL(file));
      photoPreviews.forEach((url) => URL.revokeObjectURL(url));
      setPhotoPreviews(newPreviews);
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    URL.revokeObjectURL(photoPreviews[index]);
    setPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
  };

  const handleAnalyzeWithAI = async () => {
    if (photos.length === 0) {
      setError('Please upload at least one photo first');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      const formData = new FormData();
      photos.forEach((photo) => {
        formData.append('photos', photo);
      });

      const uploadResponse = await api.post('/api/v1/photos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (uploadResponse.data.success && uploadResponse.data.data.photos.length > 0) {
        const firstPhotoUrl = uploadResponse.data.data.photos[0].url;

        const analysisResponse = await api.post('/api/v1/photos/analyze', {
          photoUrl: firstPhotoUrl,
        });

        if (analysisResponse.data.success) {
          const aiData = analysisResponse.data.data;
          setListingData({
            ...listingData,
            title: aiData.title || listingData.title,
            description: aiData.description || listingData.description,
            category: aiData.category || listingData.category,
            condition: aiData.condition || listingData.condition,
            brand: aiData.brand || listingData.brand,
            color: aiData.color || listingData.color,
            price: aiData.suggestedPrice ? aiData.suggestedPrice.toString() : listingData.price,
          });
          setSuccess('AI analysis complete! Review and edit the details below.');
          setActiveStep(1);
        }
      }
    } catch (err: any) {
      console.error('AI analysis error:', err);
      setError(err.response?.data?.message || 'Failed to analyze photos with AI');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleInputChange = (field: keyof ListingData, value: string) => {
    setListingData({ ...listingData, [field]: value });
  };

  const handleSaveListing = async () => {
    if (!listingData.title || !listingData.description) {
      setError('Please provide at least a title and description');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      photos.forEach((photo) => {
        formData.append('photos', photo);
      });

      const uploadResponse = await api.post('/api/v1/photos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const photoUrls = uploadResponse.data.success
        ? uploadResponse.data.data.photos.map((p: any) => p.url)
        : [];

      const listingPayload = {
        title: listingData.title,
        description: listingData.description,
        category: listingData.category,
        price: parseFloat(listingData.price) || 0,
        condition: listingData.condition,
        brand: listingData.brand,
        model: listingData.model,
        color: listingData.color,
        size: listingData.size,
        fulfillment_type: listingData.fulfillment_type,
        photos: photoUrls,
        status: 'draft',
        ai_generated: analyzing,
      };

      const response = await api.post('/api/v1/listings', listingPayload);

      if (response.data.success) {
        setSuccess('Listing saved successfully!');
        setActiveStep(2);
      }
    } catch (err: any) {
      console.error('Save listing error:', err);
      setError(err.response?.data?.message || 'Failed to save listing');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (marketplace: string) => {
    let copyText = '';

    switch (marketplace) {
      case 'craigslist':
        copyText = `${listingData.title}\n\n${listingData.description}\n\nPrice: $${listingData.price}\nCondition: ${listingData.condition}\nBrand: ${listingData.brand}\nLocation: Local pickup or shipping available`;
        break;

      case 'ebay':
        copyText = `Title: ${listingData.title}\n\nDescription:\n${listingData.description}\n\nCondition: ${listingData.condition}\nBrand: ${listingData.brand}\nModel: ${listingData.model}\nColor: ${listingData.color}\nPrice: $${listingData.price}`;
        break;

      case 'facebook':
        copyText = `${listingData.title}\n\n${listingData.description}\n\nPrice: $${listingData.price}\nCondition: ${listingData.condition}${listingData.brand ? `\nBrand: ${listingData.brand}` : ''}`;
        break;

      default:
        copyText = `${listingData.title}\n\n${listingData.description}\n\nPrice: $${listingData.price}`;
    }

    navigator.clipboard.writeText(copyText).then(
      () => {
        setSuccess(`Copied to clipboard for ${marketplace.charAt(0).toUpperCase() + marketplace.slice(1)}!`);
      },
      (err) => {
        setError('Failed to copy to clipboard');
        console.error('Clipboard error:', err);
      }
    );
  };

  const handleNext = () => {
    if (activeStep === 0 && photos.length === 0) {
      setError('Please upload at least one photo');
      return;
    }
    if (activeStep === 1) {
      handleSaveListing();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Upload Product Photos
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Upload up to 10 photos. First photo will be your main image.
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUpload />}
                disabled={photos.length >= 10}
              >
                Upload Photos
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                {photos.length}/10 photos uploaded
              </Typography>
            </Box>

            {photoPreviews.length > 0 && (
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {photoPreviews.map((preview, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="140"
                        image={preview}
                        alt={`Photo ${index + 1}`}
                      />
                      <CardActions>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemovePhoto(index)}
                        >
                          <Delete />
                        </IconButton>
                        {index === 0 && (
                          <Chip label="Main" size="small" color="primary" />
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {photos.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<AutoAwesome />}
                  onClick={handleAnalyzeWithAI}
                  disabled={analyzing}
                >
                  {analyzing ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Analyzing with AI...
                    </>
                  ) : (
                    'Analyze with AI'
                  )}
                </Button>
              </Box>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review & Edit Listing Details
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={listingData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={listingData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  multiline
                  rows={4}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Category"
                  value={listingData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price ($)"
                  type="number"
                  value={listingData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Condition</InputLabel>
                  <Select
                    value={listingData.condition}
                    label="Condition"
                    onChange={(e) => handleInputChange('condition', e.target.value)}
                  >
                    <MenuItem value="new">New</MenuItem>
                    <MenuItem value="like_new">Like New</MenuItem>
                    <MenuItem value="good">Good</MenuItem>
                    <MenuItem value="fair">Fair</MenuItem>
                    <MenuItem value="poor">Poor</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Brand"
                  value={listingData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Model"
                  value={listingData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Color"
                  value={listingData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Size"
                  value={listingData.size}
                  onChange={(e) => handleInputChange('size', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Fulfillment</InputLabel>
                  <Select
                    value={listingData.fulfillment_type}
                    label="Fulfillment"
                    onChange={(e) => handleInputChange('fulfillment_type', e.target.value)}
                  >
                    <MenuItem value="ship">Ship Only</MenuItem>
                    <MenuItem value="local">Local Pickup Only</MenuItem>
                    <MenuItem value="both">Both</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Publish to Marketplaces
            </Typography>
            <Alert severity="success" sx={{ mt: 2, mb: 3 }}>
              Listing saved successfully! You earned 10 points.
            </Alert>

            <Typography variant="body1" gutterBottom>
              Copy your listing details to publish on these marketplaces:
            </Typography>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Craigslist
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<ContentCopy />}
                    onClick={() => handleCopyToClipboard('craigslist')}
                    fullWidth
                  >
                    Copy for Craigslist
                  </Button>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Opens in your browser
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ mt: 1 }}
                    href="https://www.craigslist.org"
                    target="_blank"
                  >
                    Go to Craigslist
                  </Button>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    eBay
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<ContentCopy />}
                    onClick={() => handleCopyToClipboard('ebay')}
                    fullWidth
                  >
                    Copy for eBay
                  </Button>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Paste in eBay listing form
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ mt: 1 }}
                    href="https://www.ebay.com/sl/sell"
                    target="_blank"
                  >
                    Go to eBay
                  </Button>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Facebook Marketplace
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<ContentCopy />}
                    onClick={() => handleCopyToClipboard('facebook')}
                    fullWidth
                  >
                    Copy for Facebook
                  </Button>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Paste in Facebook listing
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ mt: 1 }}
                    href="https://www.facebook.com/marketplace/create"
                    target="_blank"
                  >
                    Go to Facebook
                  </Button>
                </Paper>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/dashboard')}
              >
                View My Listings
              </Button>
              <Button
                variant="contained"
                onClick={() => window.location.reload()}
                sx={{ ml: 2 }}
              >
                Create Another Listing
              </Button>
            </Box>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Listing
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mt: 3, mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Paper sx={{ p: 3 }}>
          {getStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Box>
              {activeStep === 1 && (
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveListing}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Saving...
                    </>
                  ) : (
                    'Save Listing'
                  )}
                </Button>
              )}
              {activeStep < 2 && activeStep !== 1 && (
                <Button variant="contained" onClick={handleNext}>
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreateListing;
