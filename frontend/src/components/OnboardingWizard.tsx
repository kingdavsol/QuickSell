/**
 * Onboarding Wizard Component
 * Multi-step guided setup flow for new users
 * Helps users through: Profile Setup → Photo Upload → Marketplace Connection → First Listing
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Avatar,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  Image as ImageIcon,
  Store as StoreIcon,
  ShoppingCart as CartIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface OnboardingWizardProps {
  open: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const steps = [
  {
    label: 'Welcome',
    icon: <CheckCircleIcon />,
    description: 'Let\'s get you started with QuickSell',
  },
  {
    label: 'Profile Setup',
    icon: <PersonIcon />,
    description: 'Tell us about yourself',
  },
  {
    label: 'Connect Marketplaces',
    icon: <StoreIcon />,
    description: 'Add your marketplace accounts',
  },
  {
    label: 'Create Your First Listing',
    icon: <CartIcon />,
    description: 'Upload a photo and create your first item',
  },
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ open, onClose, onComplete }) => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [profileData, setProfileData] = useState({
    fullName: '',
    bio: '',
    profileImage: '',
  });
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([true, false, false, false]);

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      const newCompleted = [...completedSteps];
      newCompleted[activeStep] = true;
      setCompletedSteps(newCompleted);
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSkip = () => {
    const newCompleted = [...completedSteps];
    newCompleted[activeStep] = true;
    setCompletedSteps(newCompleted);
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleComplete = () => {
    onComplete?.();
    onClose();
  };

  const handleNavigateTo = (path: string) => {
    navigate(path);
    handleNext();
  };

  const completionPercentage = Math.round((completedSteps.filter(Boolean).length / steps.length) * 100);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <svg width="32" height="32" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" fill="#007AFF" rx="8" />
            <circle cx="32" cy="22" r="11" fill="#FF6B6B" />
            <circle cx="26" cy="18" r="2.5" fill="#FFFFFF" />
            <circle cx="26" cy="18" r="1" fill="#000000" />
            <circle cx="38" cy="18" r="2.5" fill="#FFFFFF" />
            <circle cx="38" cy="18" r="1" fill="#000000" />
            <ellipse cx="32" cy="38" rx="11" ry="13" fill="#FF6B6B" />
          </svg>
          <Typography variant="h6">Welcome to QuickSell! 🎉</Typography>
        </Box>
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
          Let's get you selling in minutes
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ py: 0 }}>
        {/* Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="caption" color="textSecondary">
              Setup Progress
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#007AFF' }}>
              {completionPercentage}%
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={completionPercentage} sx={{ height: 8, borderRadius: 4 }} />
        </Box>

        {/* Steps */}
        <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 2 }}>
          {steps.map((step, index) => (
            <Step key={step.label} completed={completedSteps[index]}>
              <StepLabel>{step.label}</StepLabel>
              <StepContent>
                {/* Step 0: Welcome */}
                {index === 0 && (
                  <Box>
                    <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                      {step.description}
                    </Typography>
                    <Card sx={{ bgcolor: '#F5F7FF', mb: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Here's what we'll do:
                        </Typography>
                        <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.875rem' }}>
                          <li>Set up your profile</li>
                          <li>Connect to 22+ marketplaces</li>
                          <li>Upload your first photo</li>
                          <li>Create your first listing</li>
                          <li>Earn rewards! 🏆</li>
                        </ul>
                      </CardContent>
                    </Card>
                    <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block' }}>
                      Estimated time: 5-10 minutes
                    </Typography>
                  </Box>
                )}

                {/* Step 1: Profile Setup */}
                {index === 1 && (
                  <Box>
                    <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                      Help your customers know who you are
                    </Typography>
                    <TextField
                      fullWidth
                      label="Full Name"
                      placeholder="John Doe"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      margin="normal"
                      size="small"
                    />
                    <TextField
                      fullWidth
                      label="Bio"
                      placeholder="Brief description about yourself or your business"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      margin="normal"
                      size="small"
                      multiline
                      rows={3}
                    />
                    <Alert severity="info" sx={{ mt: 2, mb: 2, fontSize: '0.875rem' }}>
                      💡 A complete profile increases buyer trust and can lead to more sales!
                    </Alert>
                  </Box>
                )}

                {/* Step 2: Marketplace Connection */}
                {index === 2 && (
                  <Box>
                    <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                      Connect to marketplaces to instantly list your items everywhere
                    </Typography>
                    <Card sx={{ bgcolor: '#FFF3E0', mb: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          💥 Sell to Millions
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Connect to eBay, Facebook, Amazon, and 19+ more marketplaces with one universal
                          password. Your items will sell on all of them simultaneously!
                        </Typography>
                      </CardContent>
                    </Card>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleNavigateTo('/connect-marketplaces')}
                      sx={{ mb: 1 }}
                    >
                      Connect Marketplaces
                    </Button>
                    <Button fullWidth variant="outlined" onClick={handleSkip}>
                      Skip for Now
                    </Button>
                  </Box>
                )}

                {/* Step 3: First Listing */}
                {index === 3 && (
                  <Box>
                    <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                      Let's create your first listing and earn rewards!
                    </Typography>
                    <Card sx={{ bgcolor: '#E8F5E9', mb: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          🎯 Earn Your First 50 Points
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Create your first listing and automatically earn 50 points toward badges and rewards!
                        </Typography>
                      </CardContent>
                    </Card>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleNavigateTo('/create-listing')}
                      sx={{ mb: 1 }}
                    >
                      Create Your First Listing
                    </Button>
                    <Button fullWidth variant="outlined" onClick={handleSkip}>
                      Skip
                    </Button>
                  </Box>
                )}

                {/* Step Buttons */}
                <Box sx={{ mb: 2, mt: 2, display: 'flex', gap: 1 }}>
                  <Button disabled={index === 0} onClick={handleBack}>
                    Back
                  </Button>
                  {index === steps.length - 1 ? (
                    <Button variant="contained" onClick={handleComplete}>
                      Complete Setup 🎉
                    </Button>
                  ) : (
                    <>
                      <Button variant="contained" onClick={handleNext}>
                        Continue
                      </Button>
                    </>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {/* Completion Message */}
        {completionPercentage === 100 && (
          <Card sx={{ bgcolor: '#E8F5E9', mb: 2 }}>
            <CardContent>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  🎊 All Set!
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  You're ready to start selling. Visit your dashboard to see your earnings, progress, and next steps.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingWizard;
