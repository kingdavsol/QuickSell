import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Grid, Paper, Typography, Card, CardContent, Button } from '@mui/material';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { RootState } from '../store';

const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const { user } = useSelector((state: RootState) => state.auth);
  const { points, level, badges } = useSelector((state: RootState) => state.gamification);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F5F7FF' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <Box sx={{ flex: 1 }}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
            Welcome back, {user?.firstName || user?.username}!
          </Typography>

          <Grid container spacing={3}>
            {/* Stats Cards */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Points
                  </Typography>
                  <Typography variant="h5">{points}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Level
                  </Typography>
                  <Typography variant="h5">{level}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Badges
                  </Typography>
                  <Typography variant="h5">{badges.length}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Plan
                  </Typography>
                  <Typography variant="h5">{user?.subscriptionTier || 'Free'}</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Actions */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button variant="contained" href="/create-listing">
                    Create New Listing
                  </Button>
                  <Button variant="outlined" href="/listings">
                    View My Listings
                  </Button>
                  <Button variant="outlined" href="/gamification">
                    View Achievements
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;
