/**
 * Achievement Celebration Component
 * Celebrates user milestones with Monster animation and confetti
 */

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, Box, Typography, Button, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface AchievementCelebrationProps {
  open: boolean;
  onClose: () => void;
  achievement: {
    title: string;
    description: string;
    icon?: string;
    points: number;
    badge?: string;
    nextMilestone?: string;
  };
}

// Confetti particle generator
const Confetti: React.FC<{ count?: number }> = ({ count = 50 }) => {
  const particles = Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 1,
    size: 8 + Math.random() * 12,
  }));

  return (
    <Box sx={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden', top: 0, left: 0 }}>
      {particles.map((particle) => (
        <Box
          key={particle.id}
          sx={{
            position: 'absolute',
            left: `${particle.left}%`,
            top: '-10px',
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            borderRadius: '50%',
            animation: `fall ${particle.duration}s linear forwards`,
            animationDelay: `${particle.delay}s`,
            backgroundColor: ['#FF6B6B', '#007AFF', '#FFD700', '#4CAF50', '#FF9800'][
              Math.floor(Math.random() * 5)
            ],
            opacity: 0.8,
            '@keyframes fall': {
              '0%': { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
              '100%': { transform: 'translateY(500px) rotate(720deg)', opacity: 0 },
            },
          }}
        />
      ))}
    </Box>
  );
};

export const AchievementCelebration: React.FC<AchievementCelebrationProps> = ({
  open,
  onClose,
  achievement,
}) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (open) {
      setShowAnimation(true);
      // Play celebration sound if available
      const audio = new Audio('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==');
      audio.play().catch(() => {}); // Ignore if audio playback fails
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent sx={{ position: 'relative', overflow: 'hidden', py: 4 }}>
        {/* Confetti */}
        {showAnimation && <Confetti count={40} />}

        {/* Content - centered with animation */}
        <Box
          sx={{
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
            animation: 'scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
            '@keyframes scaleIn': {
              '0%': { transform: 'scale(0.5)', opacity: 0 },
              '100%': { transform: 'scale(1)', opacity: 1 },
            },
          }}
        >
          {/* Celebration Icon */}
          <Box
            sx={{
              mb: 2,
              fontSize: '64px',
              animation: 'bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
              '@keyframes bounce': {
                '0%': { transform: 'translateY(-20px)' },
                '100%': { transform: 'translateY(0)' },
              },
            }}
          >
            {achievement.icon || '🎉'}
          </Box>

          {/* Monster Celebration */}
          <Box sx={{ my: 2 }}>
            <svg width="100" height="100" viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="80" r="60" fill="#FF6B6B" />
              <path d="M 70 30 Q 60 10 55 5" stroke="#FF6B6B" strokeWidth="8" fill="none" strokeLinecap="round" />
              <path d="M 130 30 Q 140 10 145 5" stroke="#FF6B6B" strokeWidth="8" fill="none" strokeLinecap="round" />

              {/* Happy eyes */}
              <circle cx="80" cy="48" r="12" fill="#FFFFFF" />
              <circle cx="80" cy="48" r="8" fill="#000000" />
              <circle cx="84" cy="45" r="4" fill="#FFFFFF" />

              <circle cx="120" cy="48" r="12" fill="#FFFFFF" />
              <circle cx="120" cy="48" r="8" fill="#000000" />
              <circle cx="124" cy="45" r="4" fill="#FFFFFF" />

              {/* Big smile */}
              <path d="M 85 105 Q 100 125 115 105" stroke="#000000" strokeWidth="3" fill="none" strokeLinecap="round" />

              {/* Body */}
              <ellipse cx="100" cy="160" rx="45" ry="50" fill="#FF6B6B" />

              {/* Arms up celebrating */}
              <ellipse cx="50" cy="120" rx="15" ry="40" fill="#FF6B6B" transform="rotate(-45 50 120)" />
              <ellipse cx="150" cy="120" rx="15" ry="40" fill="#FF6B6B" transform="rotate(45 150 120)" />

              {/* Feet */}
              <ellipse cx="85" cy="210" rx="15" ry="20" fill="#FF6B6B" />
              <ellipse cx="115" cy="210" rx="15" ry="20" fill="#FF6B6B" />

              {/* Stars */}
              <text x="40" y="60" fontSize="24">
                ⭐
              </text>
              <text x="160" y="80" fontSize="24">
                ✨
              </text>
            </svg>
          </Box>

          {/* Title */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 1,
              color: '#007AFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <CheckCircleIcon sx={{ color: '#4CAF50' }} />
            {achievement.title}
          </Typography>

          {/* Description */}
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            {achievement.description}
          </Typography>

          {/* Points Earned */}
          <Box sx={{ mb: 3 }}>
            <Chip
              label={`+${achievement.points} Points`}
              sx={{
                background: 'linear-gradient(135deg, #FFD700, #FFC700)',
                color: '#333',
                fontWeight: 600,
                fontSize: '1rem',
                padding: '20px 16px',
              }}
              icon={<Typography sx={{ fontSize: '1.2rem' }}>⭐</Typography>}
            />
          </Box>

          {/* Badge Earned */}
          {achievement.badge && (
            <Box sx={{ mb: 3, p: 2, backgroundColor: '#F5F7FF', borderRadius: 1 }}>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                Badge Unlocked:
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#007AFF' }}>
                {achievement.badge}
              </Typography>
            </Box>
          )}

          {/* Next Milestone */}
          {achievement.nextMilestone && (
            <Box sx={{ mb: 3, p: 2, backgroundColor: '#FFF3E0', borderRadius: 1 }}>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                Next Milestone:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#FF8800' }}>
                {achievement.nextMilestone}
              </Typography>
            </Box>
          )}

          {/* Close Button */}
          <Button
            fullWidth
            variant="contained"
            onClick={onClose}
            sx={{
              background: 'linear-gradient(135deg, #007AFF, #0056D4)',
              textTransform: 'none',
              fontWeight: 600,
              py: 1.5,
            }}
          >
            Keep Going! 🚀
          </Button>
        </Box>
      </DialogContent>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </Dialog>
  );
};

export default AchievementCelebration;
