/**
 * Empty State Guide Component
 * Helpful guidance screens shown when sections are empty
 * Encourages users to take next steps with Monster character assistance
 */

import React from 'react';
import { Box, Card, CardContent, Typography, Button, Stack } from '@mui/material';

export type EmptyStateType = 'listings' | 'sales' | 'marketplaces' | 'achievements' | 'followers';

interface EmptyStateGuideProps {
  type: EmptyStateType;
  onAction?: () => void;
}

interface EmptyStateConfig {
  [key: string]: {
    icon: React.ReactNode;
    title: string;
    description: string;
    tips: string[];
    actionText: string;
    actionLink: string;
    monsterMood: 'thinking' | 'encouraging' | 'excited';
  };
}

export const EmptyStateGuide: React.FC<EmptyStateGuideProps> = ({ type, onAction }) => {
  const config: EmptyStateConfig = {
    listings: {
      icon: '📸',
      title: 'No Listings Yet',
      description: 'Start selling by creating your first listing. It only takes 2 minutes!',
      tips: [
        'Take a clear photo of your item',
        'AI will auto-generate a description',
        'AI will suggest optimal pricing',
        'Publish to 22+ marketplaces with 1 click',
      ],
      actionText: 'Create Your First Listing',
      actionLink: '/create-listing',
      monsterMood: 'encouraging',
    },
    sales: {
      icon: '💰',
      title: 'No Sales Yet',
      description: 'Keep listing more items! The more you list, the more you earn. Your first sale is closer than you think!',
      tips: [
        'Better photos = more sales',
        'Competitive pricing matters',
        'List in the right category',
        'Update item details regularly',
      ],
      actionText: 'Create More Listings',
      actionLink: '/create-listing',
      monsterMood: 'encouraging',
    },
    marketplaces: {
      icon: '🏪',
      title: 'No Marketplaces Connected',
      description: 'Connect your accounts to instantly reach 22+ marketplaces. Your items will sell on all of them!',
      tips: [
        'One universal password',
        'Auto-sync across platforms',
        'Real-time inventory updates',
        'Earn 25 points per marketplace',
      ],
      actionText: 'Connect Marketplaces',
      actionLink: '/connect-marketplaces',
      monsterMood: 'excited',
    },
    achievements: {
      icon: '🏆',
      title: 'No Achievements Yet',
      description: 'Start earning badges by completing challenges! Every action counts.',
      tips: [
        'Create listings to earn "Starter" badge',
        'Make your first sale to get "Seller" badge',
        'Reach 5 sales for "Hustler" badge',
        'Connect 3 marketplaces for "Connector" badge',
      ],
      actionText: 'Explore Challenges',
      actionLink: '/gamification',
      monsterMood: 'thinking',
    },
    followers: {
      icon: '👥',
      title: 'Build Your Following',
      description: 'Great items and positive feedback build your seller reputation. Keep listing and selling!',
      tips: [
        'Respond to messages quickly',
        'Ship items promptly',
        'Keep your profile updated',
        'Share your best items on social media',
      ],
      actionText: 'Create Listings',
      actionLink: '/create-listing',
      monsterMood: 'encouraging',
    },
  };

  const emptyState = config[type];

  return (
    <Card
      sx={{
        textAlign: 'center',
        py: 4,
        background: 'linear-gradient(135deg, #F5F7FF 0%, #FFF5F7 100%)',
        border: '1px dashed #DDD',
      }}
    >
      <CardContent>
        {/* Monster Avatar - Thinking/Encouraging Mood */}
        <Box sx={{ mb: 2, fontSize: '64px', animation: 'float 3s ease-in-out infinite' }}>
          {emptyState.icon}
        </Box>

        {/* Title */}
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#333' }}>
          {emptyState.title}
        </Typography>

        {/* Description */}
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto', lineHeight: 1.6 }}>
          {emptyState.description}
        </Typography>

        {/* Tips Card */}
        <Box
          sx={{
            backgroundColor: 'white',
            borderRadius: 1,
            p: 2,
            mb: 3,
            border: '1px solid #EEE',
            textAlign: 'left',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#007AFF' }}>
            💡 Quick Tips
          </Typography>
          <ul
            style={{
              margin: 0,
              paddingLeft: 20,
              fontSize: '0.875rem',
              color: '#666',
            }}
          >
            {emptyState.tips.map((tip, index) => (
              <li key={index} style={{ marginBottom: 6 }}>
                {tip}
              </li>
            ))}
          </ul>
        </Box>

        {/* Action Button */}
        <Stack direction="row" spacing={1} justifyContent="center">
          <Button
            variant="contained"
            size="large"
            onClick={onAction}
            sx={{
              background: 'linear-gradient(135deg, #007AFF, #0056D4)',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
            }}
          >
            {emptyState.actionText}
          </Button>
        </Stack>

        {/* Motivation Quote */}
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 3,
            color: '#999',
            fontStyle: 'italic',
          }}
        >
          "Every expert was once a beginner. You've got this! 🚀"
        </Typography>
      </CardContent>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </Card>
  );
};

export default EmptyStateGuide;
