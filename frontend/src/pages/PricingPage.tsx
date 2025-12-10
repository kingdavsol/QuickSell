import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import { Check, Star } from '@mui/icons-material';

const PricingPage: React.FC = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out QuickSell',
      features: [
        'Up to 5 listings per month',
        'AI-powered descriptions',
        'Post to 5 marketplaces',
        'Basic price estimation',
        'Email support',
      ],
      buttonText: 'Get Started Free',
      buttonVariant: 'outlined' as const,
      popular: false,
    },
    {
      name: 'Pro',
      price: '$19',
      period: 'per month',
      description: 'For serious sellers',
      features: [
        'Unlimited listings',
        'AI-powered descriptions',
        'Post to 20+ marketplaces',
        'Advanced price estimation',
        'Priority email support',
        'Sales analytics',
        'Bulk upload (up to 10 items)',
        'Auto-reposting',
      ],
      buttonText: 'Start Pro Trial',
      buttonVariant: 'contained' as const,
      popular: true,
    },
    {
      name: 'Business',
      price: '$49',
      period: 'per month',
      description: 'For power sellers and businesses',
      features: [
        'Everything in Pro',
        'Unlimited bulk uploads',
        'AI chatbot for buyer questions',
        'Inventory management',
        'Custom branding',
        'API access',
        'Dedicated account manager',
        'Phone support',
        'Advanced analytics & reports',
      ],
      buttonText: 'Contact Sales',
      buttonVariant: 'outlined' as const,
      popular: false,
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Navigation */}
      <Box
        sx={{
          background: 'white',
          borderBottom: '1px solid #e0e0e0',
          py: 2,
        }}
      >
        <Container>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <svg width="40" height="40" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                  <rect width="64" height="64" fill="#007AFF" rx="8"/>
                  <circle cx="32" cy="22" r="11" fill="#FF6B6B"/>
                  <circle cx="27" cy="19" r="2.5" fill="#FFFFFF"/>
                  <circle cx="27" cy="19" r="1.2" fill="#000000"/>
                  <circle cx="37" cy="19" r="2.5" fill="#FFFFFF"/>
                  <circle cx="37" cy="19" r="1.2" fill="#000000"/>
                  <path d="M 26 26 Q 32 28 38 26" stroke="#000000" strokeWidth="1" fill="none" strokeLinecap="round"/>
                  <ellipse cx="32" cy="38" rx="11" ry="13" fill="#FF6B6B"/>
                  <ellipse cx="32" cy="40" rx="6" ry="8" fill="#FFB3BA" opacity="0.8"/>
                </svg>
                <Typography variant="h6" fontWeight={700}>
                  QuickSell
                </Typography>
              </Box>
            </Link>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Link to="/auth/login" style={{ textDecoration: 'none' }}>
                <Button variant="outlined">Login</Button>
              </Link>
              <Link to="/auth/register" style={{ textDecoration: 'none' }}>
                <Button variant="contained" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  Sign Up
                </Button>
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            Simple, Transparent Pricing
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: '600px', mx: 'auto' }}>
            Choose the plan that's right for you. All plans include AI-powered listings and marketplace integration.
          </Typography>
        </Container>
      </Box>

      {/* Pricing Cards */}
      <Container sx={{ py: 8 }}>
        <Grid container spacing={4} alignItems="stretch">
          {plans.map((plan) => (
            <Grid item xs={12} md={4} key={plan.name}>
              <Card
                elevation={plan.popular ? 8 : 2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: plan.popular ? '2px solid #667eea' : 'none',
                  transform: plan.popular ? 'scale(1.05)' : 'none',
                }}
              >
                {plan.popular && (
                  <Chip
                    label="Most Popular"
                    icon={<Star />}
                    color="primary"
                    sx={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontWeight: 600,
                    }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1, p: 4 }}>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {plan.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 40 }}>
                    {plan.description}
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h3"
                      fontWeight={700}
                      component="span"
                      sx={{ color: '#667eea' }}
                    >
                      {plan.price}
                    </Typography>
                    <Typography variant="body1" component="span" color="text.secondary">
                      {' /' + plan.period}
                    </Typography>
                  </Box>
                  <List sx={{ mb: 3 }}>
                    {plan.features.map((feature, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Check color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Link to="/auth/register" style={{ textDecoration: 'none' }}>
                    <Button
                      fullWidth
                      variant={plan.buttonVariant}
                      size="large"
                      sx={{
                        py: 1.5,
                        fontWeight: 600,
                        ...(plan.buttonVariant === 'contained' && {
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                          },
                        }),
                      }}
                    >
                      {plan.buttonText}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* FAQ Section */}
        <Box sx={{ mt: 10, textAlign: 'center' }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Frequently Asked Questions
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, textAlign: 'left', height: '100%' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Can I change plans later?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, textAlign: 'left', height: '100%' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  What payment methods do you accept?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We accept all major credit cards, PayPal, and ACH bank transfers for Business plans.
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, textAlign: 'left', height: '100%' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Is there a free trial?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  The Free plan is available forever. Pro and Business plans offer a 14-day free trial.
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, textAlign: 'left', height: '100%' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  What are marketplace fees?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  QuickSell subscription fees are separate from marketplace fees. Each platform has its own fee structure.
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ background: '#2c3e50', color: 'white', py: 4, mt: 8 }}>
        <Container>
          <Typography variant="body2" textAlign="center" sx={{ opacity: 0.7 }}>
            &copy; 2024 QuickSell. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default PricingPage;
