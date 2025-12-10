/**
 * Contextual Help Component
 * Smart tooltips that appear in context to help users understand features
 * Integrated with Monster guide for personality
 */

import React, { useState, useEffect } from 'react';
import { Tooltip, Box, Typography, IconButton } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export interface ContextualHelpContent {
  title?: string;
  description: string;
  examples?: string[];
  tip?: string;
}

interface ContextualHelpProps {
  content: ContextualHelpContent;
  position?: 'top' | 'right' | 'bottom' | 'left';
  icon?: React.ReactNode;
  inline?: boolean;
  alwaysVisible?: boolean;
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({
  content,
  position = 'top',
  icon,
  inline = false,
  alwaysVisible = false,
}) => {
  const [open, setOpen] = useState(alwaysVisible);

  const tooltipContent = (
    <Box sx={{ maxWidth: 280 }}>
      {content.title && (
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
          {content.title}
        </Typography>
      )}

      <Typography variant="caption" sx={{ display: 'block', mb: 1, lineHeight: 1.5 }}>
        {content.description}
      </Typography>

      {content.examples && content.examples.length > 0 && (
        <Box sx={{ mb: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
            Examples:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: '0.75rem' }}>
            {content.examples.map((example, idx) => (
              <li key={idx}>{example}</li>
            ))}
          </ul>
        </Box>
      )}

      {content.tip && (
        <Box sx={{ p: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 0.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.25 }}>
            💡 Pro Tip:
          </Typography>
          <Typography variant="caption">{content.tip}</Typography>
        </Box>
      )}
    </Box>
  );

  if (inline) {
    return (
      <Box
        sx={{
          p: 1.5,
          backgroundColor: 'rgba(0, 122, 255, 0.05)',
          border: '1px solid rgba(0, 122, 255, 0.1)',
          borderRadius: 1,
          mb: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Box sx={{ flex: '0 0 auto', pt: 0.25 }}>
            <HelpOutlineIcon sx={{ fontSize: 18, color: '#007AFF' }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            {content.title && (
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.25 }}>
                {content.title}
              </Typography>
            )}
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', lineHeight: 1.5 }}>
              {content.description}
            </Typography>
            {content.tip && (
              <Typography variant="caption" sx={{ color: '#FF8800', display: 'block', mt: 0.5, fontWeight: 500 }}>
                {content.tip}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Tooltip
      title={tooltipContent}
      placement={position as any}
      arrow
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      sx={{
        '& .MuiTooltip-tooltip': {
          backgroundColor: '#333',
          color: 'white',
          fontSize: '0.875rem',
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        },
        '& .MuiTooltip-arrow': {
          color: '#333',
        },
      }}
    >
      <IconButton size="small" sx={{ p: 0.25, ml: 0.5 }}>
        {icon || <HelpOutlineIcon sx={{ fontSize: 16, color: '#999' }} />}
      </IconButton>
    </Tooltip>
  );
};

// Common help content templates
export const HelpContent = {
  listings: {
    title: 'What\'s a Listing?',
    description: 'A listing is an item you want to sell. Each listing includes a photo, description, and price.',
    examples: [
      'A used iPhone 12 for $300',
      'Vintage leather boots size 8',
      'Brand new desk lamp',
    ],
    tip: 'Better photos = More sales! Use clear, well-lit images.',
  },

  marketplaces: {
    title: 'Why Connect Marketplaces?',
    description: 'When you connect your marketplaces, your listings appear on all of them automatically.',
    examples: [
      'List once on eBay, see it on Facebook',
      'Sell to 22+ million buyers across platforms',
      'Auto-sync inventory across all sites',
    ],
    tip: 'More marketplaces = More visibility = More sales',
  },

  pricing: {
    title: 'How is Pricing Suggested?',
    description: 'Our AI analyzes similar items across marketplaces to suggest optimal pricing for maximum profit.',
    examples: [
      'Similar iPhone 12s selling for $250-400',
      'Suggested price: $325 (competitive & profitable)',
    ],
    tip: 'Competitive pricing increases your sales velocity.',
  },

  gamification: {
    title: 'How Do I Earn Points?',
    description: 'Earn points by completing actions in the app. Accumulate points to unlock badges and reach new levels.',
    examples: [
      'Create a listing: +50 points',
      'Make a sale: +100 points',
      'Connect a marketplace: +25 points',
    ],
    tip: 'Higher levels unlock exclusive features and seller perks!',
  },

  photos: {
    title: 'Photo Tips',
    description: 'Clear, quality photos are essential for selling. Show multiple angles if possible.',
    examples: [
      'Use good lighting (natural light is best)',
      'Show the whole item + close-ups of any damage',
      'Use a clean, simple background',
    ],
    tip: 'Items with 4+ photos sell 50% faster on average.',
  },

  description: {
    title: 'Writing Descriptions',
    description: 'Good descriptions answer buyer questions and help items rank in searches.',
    examples: [
      'Include size, color, condition, brand',
      'Mention any flaws or damage',
      'Use keywords people search for',
    ],
    tip: 'Our AI can auto-generate descriptions from your photos!',
  },

  shipping: {
    title: 'Shipping Options',
    description: 'Choose how items ship to your buyers. Faster shipping = more sales.',
    examples: [
      'Free shipping (build cost into price)',
      'Flat rate shipping',
      'Calculated based on location',
    ],
    tip: 'Offer free shipping when possible - buyers love it!',
  },

  sales: {
    title: 'Track Your Sales',
    description: 'Monitor your earnings, best-selling items, and marketplace performance in one dashboard.',
    examples: [
      'See which items sell fastest',
      'Track revenue by marketplace',
      'Monitor sales trends over time',
    ],
    tip: 'Use analytics to optimize your inventory.',
  },

  points: {
    title: 'Points System',
    description: 'Points are earned for every action. Accumulate them to level up and unlock rewards.',
    examples: [
      '50 points = Level 1 "New Seller"',
      '200 points = Level 2 "Hustler"',
      '500 points = Level 3 "Power Seller"',
    ],
    tip: 'Share your achievements on social media for bonus points!',
  },

  badges: {
    title: 'Badges & Achievements',
    description: 'Earn badges for reaching milestones. Display them on your profile to build trust.',
    examples: [
      '"First Sale" - Make your first sale',
      '"Connector" - Link 3+ marketplaces',
      '"Power Seller" - 50+ sales',
    ],
    tip: 'More badges = More credibility = Higher sales',
  },
};

export default ContextualHelp;
