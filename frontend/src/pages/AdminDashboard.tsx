import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  People,
  ShoppingCart,
  TrendingUp,
  Storage,
  Edit,
  Delete,
  Refresh,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface DashboardStats {
  totalUsers: number;
  totalListings: number;
  activeListings: number;
  draftListings: number;
  publishedListings: number;
  totalPoints: number;
  avgListingsPerUser: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  subscription_tier: string;
  points: number;
  current_level: number;
  is_admin: boolean;
  created_at: string;
}

interface Listing {
  id: number;
  user_id: number;
  title: string;
  status: string;
  price: number;
  category: string;
  created_at: string;
  marketplace_listings: any;
}

interface MarketplaceStats {
  craigslist: number;
  ebay: number;
  facebook: number;
  total: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Stats
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalListings: 0,
    activeListings: 0,
    draftListings: 0,
    publishedListings: 0,
    totalPoints: 0,
    avgListingsPerUser: 0,
  });

  // Users
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Listings
  const [listings, setListings] = useState<Listing[]>([]);
  const [marketplaceStats, setMarketplaceStats] = useState<MarketplaceStats>({
    craigslist: 0,
    ebay: 0,
    facebook: 0,
    total: 0,
  });

  // System Health
  const [systemHealth, setSystemHealth] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch dashboard stats
      const dashboardRes = await api.get('/api/v1/admin/dashboard');
      if (dashboardRes.data.success) {
        setStats(dashboardRes.data.data);
      }

      // Fetch users
      const usersRes = await api.get('/api/v1/admin/users');
      if (usersRes.data.success) {
        setUsers(usersRes.data.data.users || []);
      }

      // Fetch all listings
      const listingsRes = await api.get('/api/v1/admin/listings');
      if (listingsRes.data.success) {
        const allListings = listingsRes.data.data.listings || [];
        setListings(allListings);

        // Calculate marketplace stats
        const mpStats = allListings.reduce((acc: MarketplaceStats, listing: Listing) => {
          if (listing.marketplace_listings) {
            const mp = listing.marketplace_listings;
            if (mp.craigslist) acc.craigslist++;
            if (mp.ebay) acc.ebay++;
            if (mp.facebook) acc.facebook++;
          }
          return acc;
        }, { craigslist: 0, ebay: 0, facebook: 0, total: allListings.length });

        setMarketplaceStats(mpStats);
      }

      // Fetch system health
      const healthRes = await api.get('/api/v1/admin/system');
      if (healthRes.data.success) {
        setSystemHealth(healthRes.data.data);
      }

      setError('');
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');

      // Check if unauthorized
      if (err.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
        setTimeout(() => navigate('/dashboard'), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await api.put(`/api/v1/admin/users/${selectedUser.id}`, {
        username: selectedUser.username,
        email: selectedUser.email,
        subscription_tier: selectedUser.subscription_tier,
        points: selectedUser.points,
        is_admin: selectedUser.is_admin,
      });

      if (response.data.success) {
        setSuccess('User updated successfully');
        setEditDialogOpen(false);
        fetchDashboardData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.delete(`/api/v1/admin/users/${userId}`);
      if (response.data.success) {
        setSuccess('User deleted successfully');
        fetchDashboardData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeleteListing = async (listingId: number) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      const response = await api.delete(`/api/v1/admin/listings/${listingId}`);
      if (response.data.success) {
        setSuccess('Listing deleted successfully');
        fetchDashboardData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete listing');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'success';
      case 'active': return 'info';
      case 'draft': return 'default';
      case 'archived': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DashboardIcon /> Admin Dashboard
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchDashboardData}
          >
            Refresh
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
          <Tab label="Overview" />
          <Tab label="Users" />
          <Tab label="Listings" />
          <Tab label="System Health" />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Stat Cards */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="text.secondary" variant="overline">
                        Total Users
                      </Typography>
                      <Typography variant="h4">{stats.totalUsers}</Typography>
                    </Box>
                    <People sx={{ fontSize: 48, color: 'primary.main', opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="text.secondary" variant="overline">
                        Total Listings
                      </Typography>
                      <Typography variant="h4">{stats.totalListings}</Typography>
                    </Box>
                    <ShoppingCart sx={{ fontSize: 48, color: 'success.main', opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="text.secondary" variant="overline">
                        Published
                      </Typography>
                      <Typography variant="h4">{stats.publishedListings}</Typography>
                    </Box>
                    <TrendingUp sx={{ fontSize: 48, color: 'info.main', opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="text.secondary" variant="overline">
                        Avg per User
                      </Typography>
                      <Typography variant="h4">{stats.avgListingsPerUser.toFixed(1)}</Typography>
                    </Box>
                    <Storage sx={{ fontSize: 48, color: 'warning.main', opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Marketplace Distribution */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Marketplace Distribution
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Craigslist</Typography>
                      <Typography variant="body2">{marketplaceStats.craigslist}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(marketplaceStats.craigslist / (marketplaceStats.total || 1)) * 100}
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">eBay</Typography>
                      <Typography variant="body2">{marketplaceStats.ebay}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(marketplaceStats.ebay / (marketplaceStats.total || 1)) * 100}
                      sx={{ height: 8, borderRadius: 1 }}
                      color="success"
                    />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Facebook Marketplace</Typography>
                      <Typography variant="body2">{marketplaceStats.facebook}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(marketplaceStats.facebook / (marketplaceStats.total || 1)) * 100}
                      sx={{ height: 8, borderRadius: 1 }}
                      color="info"
                    />
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Listing Status Breakdown */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Listing Status Breakdown
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Published</Typography>
                    <Chip label={stats.publishedListings} color="success" size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Active</Typography>
                    <Chip label={stats.activeListings} color="info" size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Draft</Typography>
                    <Chip label={stats.draftListings} color="default" size="small" />
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1">Total</Typography>
                    <Typography variant="h6">{stats.totalListings}</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Users Tab */}
        <TabPanel value={tabValue} index={1}>
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Tier</TableCell>
                    <TableCell>Points</TableCell>
                    <TableCell>Level</TableCell>
                    <TableCell>Admin</TableCell>
                    <TableCell>Joined</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.subscription_tier || 'free'}
                          size="small"
                          color={user.subscription_tier === 'enterprise' ? 'error' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{user.points}</TableCell>
                      <TableCell>{user.current_level}</TableCell>
                      <TableCell>
                        {user.is_admin && <Chip label="Admin" color="primary" size="small" />}
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleEditUser(user)}>
                          <Edit />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteUser(user.id)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>

        {/* Listings Tab */}
        <TabPanel value={tabValue} index={2}>
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>User ID</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {listings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell>{listing.id}</TableCell>
                      <TableCell>{listing.title}</TableCell>
                      <TableCell>{listing.user_id}</TableCell>
                      <TableCell>
                        <Chip
                          label={listing.status}
                          size="small"
                          color={getStatusColor(listing.status)}
                        />
                      </TableCell>
                      <TableCell>${listing.price}</TableCell>
                      <TableCell>{listing.category || 'N/A'}</TableCell>
                      <TableCell>{formatDate(listing.created_at)}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="error" onClick={() => handleDeleteListing(listing.id)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>

        {/* System Health Tab */}
        <TabPanel value={tabValue} index={3}>
          {systemHealth ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Database Status
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Status: <Chip label={systemHealth.database?.status || 'healthy'} color="success" size="small" />
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Connected: {systemHealth.database?.connected ? 'Yes' : 'No'}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Table Sizes
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {systemHealth.tables && Object.entries(systemHealth.tables).map(([table, count]: [string, any]) => (
                      <Box key={table} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">{table}</Typography>
                        <Typography variant="body2" fontWeight="bold">{count} rows</Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    System Information
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Uptime: {systemHealth.uptime || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Last Check: {new Date().toLocaleString()}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <Alert severity="info">System health data not available</Alert>
          )}
        </TabPanel>
      </Box>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Username"
                value={selectedUser.username}
                onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={selectedUser.email}
                onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Points"
                type="number"
                value={selectedUser.points}
                onChange={(e) => setSelectedUser({ ...selectedUser, points: parseInt(e.target.value) })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                select
                label="Subscription Tier"
                value={selectedUser.subscription_tier || 'free'}
                onChange={(e) => setSelectedUser({ ...selectedUser, subscription_tier: e.target.value })}
                SelectProps={{ native: true }}
                sx={{ mb: 2 }}
              >
                <option value="free">Free</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </TextField>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateUser} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
