import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Button,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Add as AddIcon,
  List as ListIcon,
  LocalShipping as ShippingIcon,
  EmojiEvents as TrophyIcon,
  Settings as SettingsIcon,
  ConnectWithoutContact as ConnectIcon,
} from '@mui/icons-material';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Create Listing', icon: <AddIcon />, path: '/create-listing' },
    { text: 'My Listings', icon: <ListIcon />, path: '/listings' },
    { text: 'Connect Marketplaces', icon: <ConnectIcon />, path: '/connect-marketplaces' },
    { text: 'Sales', icon: <ShippingIcon />, path: '/sales' },
    { text: 'Achievements', icon: <TrophyIcon />, path: '/gamification' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          bgcolor: '#F5F7FF',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <svg width="40" height="40" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" fill="#007AFF" rx="8" />
            <circle cx="32" cy="22" r="11" fill="#FF6B6B" />
            <circle cx="26" cy="18" r="2.5" fill="#FFFFFF" />
            <circle cx="26" cy="18" r="1" fill="#000000" />
            <circle cx="38" cy="18" r="2.5" fill="#FFFFFF" />
            <circle cx="38" cy="18" r="1" fill="#000000" />
            <ellipse cx="32" cy="38" rx="11" ry="13" fill="#FF6B6B" />
          </svg>
          <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#007AFF' }}>
            QuickSell
          </span>
        </Box>

        <List>
          {menuItems.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  borderRadius: 1,
                  '&.Mui-selected': {
                    bgcolor: '#007AFF',
                    color: 'white',
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                    '&:hover': {
                      bgcolor: '#0056D4',
                    },
                  },
                  '&:hover': {
                    bgcolor: '#E8F1FF',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1, textAlign: 'center' }}>
          <Box sx={{ fontSize: '12px', color: '#999', mb: 1 }}>Your Plan</Box>
          <Box sx={{ fontWeight: 'bold', color: '#007AFF', mb: 1 }}>Free Tier</Box>
          <Button
            variant="contained"
            size="small"
            fullWidth
            onClick={() => navigate('/settings')}
          >
            Upgrade
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
