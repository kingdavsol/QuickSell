/**
 * Smart Recommendations Component
 * Suggests next actions based on user progress and behavior
 */

import React, { useMemo } from 'react';
import { Card, CardContent, Box, Typography, Button, Grid, Chip, LinearProgress } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  LocalFireDepartment as FireIcon,
  EmojiEvents as BadgeIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface UserProgress {
  listingsCount: number;
  marketplacesConnected: number;
  totalSales: number;
  totalRevenue: number;
  points: number;
  level: number;
  joinedDaysAgo: number;
}

interface Recommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  icon: React.ReactNode;
  action: {
    text: string;
    link: string;
  };
  reward?: {
    points: number;
    badge?: string;
  };
  color: string;
}

interface SmartRecommendationsProps {
  userProgress: Partial<UserProgress>;
}

export const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({ userProgress }) => {
  const navigate = useNavigate();

  const recommendations = useMemo((): Recommendation[] => {
    const recs: Recommendation[] = [];

    // Recommendation 1: Create first listing
    if ((userProgress.listingsCount || 0) === 0) {
      recs.push({
        id: 'first-listing',
        priority: 'high',
        title: '📸 Create Your First Listing',
        description: 'Stop the clock! You\'re ready to make your first sale. Upload a photo now.',
        icon: <TrendingUpIcon />,
        action: { text: 'Create Listing', link: '/create-listing' },
        reward: { points: 50, badge: 'Newbie Seller' },
        color: '#FF6B6B',
      });
    }

    // Recommendation 2: Connect more marketplaces
    if ((userProgress.marketplacesConnected || 0) === 0) {
      recs.push({
        id: 'marketplaces',
        priority: 'high',
        title: '🏪 Unlock 22+ Marketplaces',
        description: 'One password = 22+ marketplaces. Your items will sell everywhere.',
        icon: <SpeedIcon />,
        action: { text: 'Connect Marketplaces', link: '/connect-marketplaces' },
        reward: { points: 25 },
        color: '#007AFF',
      });
    } else if ((userProgress.marketplacesConnected || 0) < 3) {
      recs.push({
        id: 'more-marketplaces',
        priority: 'medium',
        title: '🚀 Expand Your Reach',
        description: `Connect ${3 - (userProgress.marketplacesConnected || 0)} more marketplace${3 - (userProgress.marketplacesConnected || 0) > 1 ? 's' : ''} to maximize sales.`,
        icon: <TrendingUpIcon />,
        action: { text: 'Add Marketplaces', link: '/connect-marketplaces' },
        reward: { points: 25 },
        color: '#4CAF50',
      });
    }

    // Recommendation 3: Create more listings
    if ((userProgress.listingsCount || 0) > 0 && (userProgress.listingsCount || 0) < 5) {
      recs.push({
        id: 'more-listings',
        priority: 'high',
        title: '📈 Increase Your Inventory',
        description: `You have ${userProgress.listingsCount} listing(s). Sellers with 5+ listings earn 3x more.`,
        icon: <FireIcon />,
        action: { text: 'Create More Listings', link: '/create-listing' },
        reward: { points: 50 },
        color: '#FF9800',
      });
    }

    // Recommendation 4: Optimize pricing
    if ((userProgress.totalSales || 0) > 0 && (userProgress.totalRevenue || 0) > 0) {
      const avgPrice = userProgress.totalRevenue! / userProgress.totalSales!;
      if (avgPrice < 20) {
        recs.push({
          id: 'pricing-optimization',
          priority: 'medium',
          title: '💰 Optimize Your Pricing',
          description: 'Your average selling price is low. AI can help you price items better.',
          icon: <TrendingUpIcon />,
          action: { text: 'View Analytics', link: '/sales' },
          color: '#FFD700',
        });
      }
    }

    // Recommendation 5: Earn badges
    if ((userProgress.points || 0) < 200 && (userProgress.listingsCount || 0) > 0) {
      recs.push({
        id: 'earn-badges',
        priority: 'medium',
        title: '🏆 Unlock More Badges',
        description: `You're ${((userProgress.points || 0) / 200) * 100}% toward your next badge tier.`,
        icon: <BadgeIcon />,
        action: { text: 'View Challenges', link: '/gamification' },
        reward: { points: 100 },
        color: '#9C27B0',
      });
    }

    // Recommendation 6: Update profile (if new)
    if ((userProgress.joinedDaysAgo || 0) < 7) {
      recs.push({
        id: 'complete-profile',
        priority: 'low',
        title: '👤 Complete Your Profile',
        description: 'Buyers trust sellers with complete profiles. Add your photo and bio.',
        icon: <TrendingUpIcon />,
        action: { text: 'Update Profile', link: '/settings' },
        reward: { points: 25 },
        color: '#00BCD4',
      });
    }

    // Sort by priority
    return recs.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [userProgress]);

  const handleNavigate = (link: string) => {
    navigate(link);
  };

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        💡 Smart Recommendations for You
      </Typography>

      <Grid container spacing={2}>
        {recommendations.map((rec) => (
          <Grid item xs={12} sm={6} key={rec.id}>
            <Card
              sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${rec.color}15 0%, ${rec.color}08 100%)`,
                borderLeft: `4px solid ${rec.color}`,
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 24px ${rec.color}20`,
                },
              }}
            >
              <CardContent>
                {/* Priority Badge */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ fontSize: '24px' }}>{rec.title.split(' ')[0]}</Box>
                  <Chip
                    label={rec.priority.toUpperCase()}
                    size="small"
                    sx={{
                      background:
                        rec.priority === 'high'
                          ? '#FF5252'
                          : rec.priority === 'medium'
                            ? '#FFC400'
                            : '#4CAF50',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.65rem',
                    }}
                  />
                </Box>

                {/* Title */}
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, color: '#333' }}>
                  {rec.title}
                </Typography>

                {/* Description */}
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1.5, minHeight: 40 }}>
                  {rec.description}
                </Typography>

                {/* Reward */}
                {rec.reward && (
                  <Box sx={{ mb: 1.5, p: 1, backgroundColor: '#FFF8E1', borderRadius: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#F57F17' }}>
                      Earn: +{rec.reward.points} {rec.reward.points === 1 ? 'point' : 'points'}
                      {rec.reward.badge && ` + ${rec.reward.badge} badge`}
                    </Typography>
                  </Box>
                )}

                {/* Action Button */}
                <Button
                  fullWidth
                  variant="contained"
                  size="small"
                  onClick={() => handleNavigate(rec.action.link)}
                  sx={{
                    background: `linear-gradient(135deg, ${rec.color}, ${rec.color}dd)`,
                    textTransform: 'none',
                    fontWeight: 600,
                    mb: 1,
                  }}
                >
                  {rec.action.text}
                </Button>

                {/* Progress Indicator for relevant recs */}
                {rec.id === 'more-listings' && userProgress.listingsCount && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="textSecondary">
                        Listings
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {userProgress.listingsCount}/5
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(userProgress.listingsCount / 5) * 100}
                      sx={{ height: 4, borderRadius: 2 }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SmartRecommendations;
