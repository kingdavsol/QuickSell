/**
 * Monster Guide Component
 * Interactive QuickSell Monster mascot that helps guide users through the app
 * with contextual tips, encouragement, and celebration of achievements
 */

import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, IconButton, Card, CardContent, Fade } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

interface MonsterMessage {
  title: string;
  message: string;
  emoji?: string;
  action?: {
    text: string;
    onClick: () => void;
  };
  type?: 'tip' | 'celebration' | 'welcome' | 'warning' | 'suggestion';
}

interface MonsterGuideProps {
  visible?: boolean;
  message?: MonsterMessage;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  onClose?: () => void;
  onDismiss?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export const MonsterGuide: React.FC<MonsterGuideProps> = ({
  visible = true,
  message,
  position = 'bottom-right',
  onClose,
  onDismiss,
  size = 'medium',
}) => {
  const [isVisible, setIsVisible] = useState(visible);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [monsterMood, setMonsterMood] = useState<'happy' | 'thinking' | 'excited' | 'proud'>('happy');

  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  useEffect(() => {
    if (message?.type === 'celebration') {
      setMonsterMood('excited');
      // Play celebration sound if enabled
      if (soundEnabled) {
        playSound('celebration');
      }
    } else if (message?.type === 'suggestion') {
      setMonsterMood('thinking');
    } else {
      setMonsterMood('happy');
    }
  }, [message, soundEnabled]);

  const playSound = (type: 'celebration' | 'tip' | 'welcome') => {
    // In production, use Web Audio API or sound library
    // For now, just a placeholder
    console.log(`Playing ${type} sound`);
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const getMonsterSVG = () => {
    const sizeMap = {
      small: { width: 80, height: 80, scale: 0.8 },
      medium: { width: 120, height: 120, scale: 1 },
      large: { width: 160, height: 160, scale: 1.3 },
    };

    const config = sizeMap[size];

    // Different expressions based on mood
    const eyeExpression = {
      happy: { eyeY: 55, pupilY: 57 },
      thinking: { eyeY: 50, pupilY: 50 },
      excited: { eyeY: 48, pupilY: 45 },
      proud: { eyeY: 52, pupilY: 55 },
    };

    const expr = eyeExpression[monsterMood];

    return (
      <svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" style={{ width: config.width, height: config.height }}>
        {/* Head */}
        <circle cx="100" cy="80" r="60" fill="#FF6B6B" />

        {/* Horns */}
        <path d="M 70 30 Q 60 10 55 5" stroke="#FF6B6B" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M 130 30 Q 140 10 145 5" stroke="#FF6B6B" strokeWidth="8" fill="none" strokeLinecap="round" />

        {/* Eyes - animated based on mood */}
        <circle cx="80" cy={expr.eyeY} r="12" fill="#FFFFFF" />
        <circle cx="80" cy={expr.eyeY} r="8" fill="#000000" />
        <circle cx="84" cy={expr.pupilY} r="4" fill="#FFFFFF" className="monster-pupil" />

        <circle cx="120" cy={expr.eyeY} r="12" fill="#FFFFFF" />
        <circle cx="120" cy={expr.eyeY} r="8" fill="#000000" />
        <circle cx="124" cy={expr.pupilY} r="4" fill="#FFFFFF" className="monster-pupil" />

        {/* Smile - animated based on mood */}
        {monsterMood === 'excited' ? (
          <>
            <path d="M 85 105 Q 100 120 115 105" stroke="#000000" strokeWidth="3" fill="none" strokeLinecap="round" className="monster-mouth-excited" />
            <path d="M 95 115 L 105 115" stroke="#000000" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <path d="M 85 105 Q 100 115 115 105" stroke="#000000" strokeWidth="3" fill="none" strokeLinecap="round" />
        )}

        {/* Body */}
        <ellipse cx="100" cy="160" rx="45" ry="50" fill="#FF6B6B" />

        {/* Arms */}
        <ellipse cx="60" cy="140" rx="18" ry="35" fill="#FF6B6B" />
        <ellipse cx="140" cy="140" rx="18" ry="35" fill="#FF6B6B" />

        {/* Feet */}
        <ellipse cx="85" cy="210" rx="15" ry="20" fill="#FF6B6B" />
        <ellipse cx="115" cy="210" rx="15" ry="20" fill="#FF6B6B" />

        {/* Excited animation particles (stars) */}
        {monsterMood === 'excited' && (
          <>
            <text x="140" y="40" fontSize="20" className="monster-star">
              ⭐
            </text>
            <text x="160" y="100" fontSize="20" className="monster-star">
              ✨
            </text>
            <text x="50" y="30" fontSize="20" className="monster-star">
              ⭐
            </text>
          </>
        )}

        {/* Thinking animation (bulb) */}
        {monsterMood === 'thinking' && (
          <circle cx="170" cy="50" r="12" fill="#FFD700" stroke="#FFC700" strokeWidth="2" className="monster-idea" />
        )}
      </svg>
    );
  };

  const getTypeColor = () => {
    switch (message?.type) {
      case 'celebration':
        return '#FFD700';
      case 'welcome':
        return '#007AFF';
      case 'warning':
        return '#FF9800';
      case 'suggestion':
        return '#4CAF50';
      default:
        return '#FF6B6B';
    }
  };

  const getTypeEmoji = () => {
    switch (message?.type) {
      case 'celebration':
        return '🎉';
      case 'welcome':
        return '👋';
      case 'warning':
        return '⚠️';
      case 'suggestion':
        return '💡';
      default:
        return '👹';
    }
  };

  if (!isVisible || !message) {
    return null;
  }

  const positionStyles = {
    'bottom-right': { bottom: 20, right: 20 },
    'bottom-left': { bottom: 20, left: 20 },
    'top-right': { top: 20, right: 20 },
    'top-left': { top: 20, left: 20 },
  };

  return (
    <Fade in={isVisible}>
      <Paper
        sx={{
          position: 'fixed',
          ...positionStyles[position],
          maxWidth: 360,
          zIndex: 9999,
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          borderRadius: 2,
          overflow: 'hidden',
          animation: 'slideIn 0.3s ease-out',
          '@keyframes slideIn': {
            from: { transform: 'translateY(20px)', opacity: 0 },
            to: { transform: 'translateY(0)', opacity: 1 },
          },
        }}
      >
        <Card
          sx={{
            background: `linear-gradient(135deg, ${getTypeColor()}15 0%, ${getTypeColor()}30 100%)`,
            borderLeft: `4px solid ${getTypeColor()}`,
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* Monster Avatar */}
              <Box sx={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {getMonsterSVG()}
              </Box>

              {/* Message Content */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {/* Header with close button */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: getTypeColor() }}>
                      {message.emoji || getTypeEmoji()} {message.title}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      sx={{ p: 0.5 }}
                      title={soundEnabled ? 'Mute' : 'Unmute'}
                    >
                      {soundEnabled ? (
                        <VolumeUpIcon sx={{ fontSize: 16 }} />
                      ) : (
                        <VolumeOffIcon sx={{ fontSize: 16 }} />
                      )}
                    </IconButton>
                    <IconButton size="small" onClick={handleClose} sx={{ p: 0.5 }}>
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </Box>

                {/* Message Text */}
                <Typography variant="body2" sx={{ mb: 1.5, color: '#333', lineHeight: 1.5 }}>
                  {message.message}
                </Typography>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {message.action && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => {
                        message.action?.onClick();
                        handleDismiss();
                      }}
                      sx={{
                        background: `linear-gradient(135deg, ${getTypeColor()}, ${getTypeColor()}dd)`,
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      {message.action.text}
                    </Button>
                  )}
                  <Button variant="outlined" size="small" onClick={handleDismiss} sx={{ textTransform: 'none' }}>
                    {message.action ? 'Dismiss' : 'Got it!'}
                  </Button>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Paper>
    </Fade>
  );
};

export default MonsterGuide;
