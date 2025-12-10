/**
 * Setup Progress Tracker Component
 * Shows users their onboarding progress with checklist and rewards
 * Appears on dashboard until all setup tasks are complete
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Box, Typography, CheckBox, LinearProgress, Button, Collapse, IconButton, Chip } from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface SetupTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action?: {
    text: string;
    link: string;
  };
  pointsReward: number;
}

interface SetupProgressTrackerProps {
  userStats?: {
    profileComplete: boolean;
    firstListingCreated: boolean;
    marketplacesConnected: number;
    firstSaleCompleted: boolean;
  };
}

export const SetupProgressTracker: React.FC<SetupProgressTrackerProps> = ({
  userStats = {
    profileComplete: false,
    firstListingCreated: false,
    marketplacesConnected: 0,
    firstSaleCompleted: false,
  },
}) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(true);
  const [tasks, setTasks] = useState<SetupTask[]>([
    {
      id: 'profile',
      title: '📋 Complete Your Profile',
      description: 'Add your photo, name, and bio to build trust with buyers',
      completed: userStats.profileComplete,
      action: { text: 'Complete Profile', link: '/settings' },
      pointsReward: 25,
    },
    {
      id: 'marketplace',
      title: '🏪 Connect Marketplaces',
      description: `Connect to eBay, Facebook, Amazon, and more (${userStats.marketplacesConnected}/3 connected)`,
      completed: userStats.marketplacesConnected >= 3,
      action: { text: 'Connect Marketplaces', link: '/connect-marketplaces' },
      pointsReward: 50,
    },
    {
      id: 'listing',
      title: '📸 Create Your First Listing',
      description: 'Upload a photo and create your first item for sale',
      completed: userStats.firstListingCreated,
      action: { text: 'Create Listing', link: '/create-listing' },
      pointsReward: 50,
    },
    {
      id: 'sale',
      title: '💰 Make Your First Sale',
      description: 'Complete your first transaction and earn your seller badge',
      completed: userStats.firstSaleCompleted,
      pointsReward: 100,
    },
  ]);

  useEffect(() => {
    // Update tasks based on userStats
    const updatedTasks = [...tasks];
    updatedTasks[0].completed = userStats.profileComplete;
    updatedTasks[1].completed = userStats.marketplacesConnected >= 3;
    updatedTasks[2].completed = userStats.firstListingCreated;
    updatedTasks[3].completed = userStats.firstSaleCompleted;
    setTasks(updatedTasks);
  }, [userStats]);

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalPoints = tasks.filter((t) => t.completed).reduce((sum, t) => sum + t.pointsReward, 0);
  const completionPercentage = Math.round((completedCount / tasks.length) * 100);
  const allComplete = completedCount === tasks.length;

  if (allComplete) {
    return null; // Don't show if all tasks complete
  }

  const handleNavigate = (link: string) => {
    navigate(link);
  };

  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, #007AFF15 0%, #FF6B6B15 100%)',
        borderLeft: '4px solid #007AFF',
        mb: 3,
      }}
    >
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              🚀 Setup Progress
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Complete your setup to unlock features and earn rewards
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{
              background: '#007AFF15',
              '&:hover': { background: '#007AFF25' },
            }}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="caption" color="textSecondary">
              {completedCount}/{tasks.length} Completed
            </Typography>
            <Chip
              label={`+${totalPoints} Points`}
              size="small"
              sx={{
                background: '#FFD700',
                color: '#333',
                fontWeight: 600,
              }}
            />
          </Box>
          <LinearProgress
            variant="determinate"
            value={completionPercentage}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#E0E0E0',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #007AFF, #FF6B6B)',
                borderRadius: 4,
              },
            }}
          />
          <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: '#007AFF', fontWeight: 600 }}>
            {completionPercentage}% Complete
          </Typography>
        </Box>

        {/* Tasks List */}
        <Collapse in={expanded}>
          <Box>
            {tasks.map((task, index) => (
              <Box
                key={task.id}
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  py: 1.5,
                  px: 1,
                  borderRadius: 1,
                  backgroundColor: task.completed ? '#E8F5E930' : 'transparent',
                  mb: index < tasks.length - 1 ? 1 : 0,
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: '#F5F5F5',
                  },
                }}
              >
                {/* Checkbox Icon */}
                <Box sx={{ flex: '0 0 auto', pt: 0.5 }}>
                  {task.completed ? (
                    <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 24 }} />
                  ) : (
                    <RadioButtonUncheckedIcon sx={{ color: '#999', fontSize: 24 }} />
                  )}
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      mb: 0.25,
                      textDecoration: task.completed ? 'line-through' : 'none',
                      color: task.completed ? '#999' : '#333',
                    }}
                  >
                    {task.title}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.75 }}>
                    {task.description}
                  </Typography>

                  {/* Action Button and Points */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {task.action && !task.completed && (
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => handleNavigate(task.action!.link)}
                        sx={{
                          color: '#007AFF',
                          textTransform: 'none',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '2px 8px',
                          '&:hover': {
                            backgroundColor: '#007AFF15',
                          },
                        }}
                      >
                        {task.action.text} →
                      </Button>
                    )}
                    <Chip
                      label={`+${task.pointsReward} pts`}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        backgroundColor: task.completed ? '#E8E8E8' : '#FFD70030',
                        color: task.completed ? '#999' : '#FF8800',
                        fontWeight: 600,
                      }}
                      icon={<Typography sx={{ fontSize: '0.65rem', ml: 0.5 }}>⭐</Typography>}
                    />
                  </Box>
                </Box>
              </Box>
            ))}

            {/* Completion Message */}
            {completionPercentage >= 75 && !allComplete && (
              <Box
                sx={{
                  mt: 2,
                  p: 1.5,
                  backgroundColor: '#FFF3E0',
                  borderRadius: 1,
                  borderLeft: '3px solid #FF9800',
                }}
              >
                <Typography variant="caption" sx={{ color: '#E65100', fontWeight: 600 }}>
                  🔥 Almost there! Complete {tasks.length - completedCount} more task{tasks.length - completedCount !== 1 ? 's' : ''} to
                  unlock full features.
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>

        {/* Collapsed Summary */}
        {!expanded && (
          <Typography variant="caption" color="textSecondary">
            {completedCount}/{tasks.length} tasks complete • {totalPoints} points earned
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default SetupProgressTracker;
