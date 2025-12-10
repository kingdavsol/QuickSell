import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api/v1';

class APIService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  login(email: string, password: string) {
    return this.api.post('/auth/login', { email, password });
  }

  register(username: string, email: string, password: string) {
    return this.api.post('/auth/register', { username, email, password });
  }

  logout() {
    return this.api.post('/auth/logout');
  }

  // Listings
  getListings(page = 1, limit = 10) {
    return this.api.get('/listings', { params: { page, limit } });
  }

  createListing(data: any) {
    return this.api.post('/listings', data);
  }

  getListing(id: number) {
    return this.api.get(`/listings/${id}`);
  }

  updateListing(id: number, data: any) {
    return this.api.put(`/listings/${id}`, data);
  }

  deleteListing(id: number) {
    return this.api.delete(`/listings/${id}`);
  }

  publishListing(id: number, marketplaces: string[]) {
    return this.api.post(`/listings/${id}/publish`, { marketplaces });
  }

  // Photos
  uploadPhotos(listingId: number, files: File[]) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('photos', file);
    });
    return this.api.post(`/photos/upload?listingId=${listingId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async analyzePhoto(file: File) {
    // Convert file to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // Send as JSON with base64 image
    return this.api.post('/photos/analyze', {
      image: base64
    });
  }

  // Marketplaces
  getMarketplaces() {
    return this.api.get('/marketplaces');
  }

  connectMarketplace(marketplace: string) {
    return this.api.post(`/marketplaces/${marketplace}/connect`);
  }

  getMarketplaceAccounts(marketplace: string) {
    return this.api.get(`/marketplaces/${marketplace}/accounts`);
  }

  // Bulk Marketplace Signup
  getAvailableMarketplaces() {
    return this.api.get('/marketplaces/available');
  }

  bulkSignupToMarketplaces(email: string, password: string, selectedMarketplaces: string[]) {
    return this.api.post('/marketplaces/bulk-signup', {
      email,
      password,
      selectedMarketplaces,
    });
  }

  getConnectedMarketplaces() {
    return this.api.get('/marketplaces/connected');
  }

  disconnectMarketplace(marketplace: string) {
    return this.api.post(`/marketplaces/${marketplace}/disconnect`);
  }

  checkMarketplaceStatus(marketplace: string) {
    return this.api.get(`/marketplaces/${marketplace}/status`);
  }

  // Pricing
  estimatePrice(category: string, title: string, condition: string) {
    return this.api.get('/pricing/estimate/' + category, {
      params: { title, condition },
    });
  }

  getSimilarItems(category: string) {
    return this.api.get(`/pricing/similar-items/${category}`);
  }

  getMarketData(category: string) {
    return this.api.get(`/pricing/market-data/${category}`);
  }

  // Gamification
  getGamificationStats() {
    return this.api.get('/gamification/user/stats');
  }

  getBadges() {
    return this.api.get('/gamification/user/badges');
  }

  getChallenges() {
    return this.api.get('/gamification/challenges');
  }

  getLeaderboard(timeframe = 'monthly', category = 'sales') {
    return this.api.get('/gamification/leaderboard', {
      params: { timeframe, category },
    });
  }

  // Sales
  getSales(page = 1, limit = 10) {
    return this.api.get('/sales', { params: { page, limit } });
  }

  getSaleDetails(id: number) {
    return this.api.get(`/sales/${id}`);
  }

  markSaleComplete(id: number) {
    return this.api.post(`/sales/${id}/mark-complete`);
  }

  getSalesAnalytics() {
    return this.api.get('/sales/analytics');
  }

  // Shipping
  calculateShipping(weight: number, dimensions: string, origin: string, destination: string) {
    return this.api.post('/shipping/calculate', {
      weight,
      dimensions,
      origin,
      destination,
    });
  }

  getShippingCarriers() {
    return this.api.get('/shipping/carriers');
  }

  createShippingLabel(saleId: number, carrier: string) {
    return this.api.post('/shipping/create-label', { saleId, carrier });
  }

  // Subscription
  getSubscriptionPlans() {
    return this.api.get('/subscription/plans');
  }

  subscribe(planId: string) {
    return this.api.post('/subscription/subscribe', { planId });
  }

  getCurrentSubscription() {
    return this.api.get('/subscription/current');
  }

  cancelSubscription() {
    return this.api.post('/subscription/cancel');
  }

  // Notifications
  getNotifications() {
    return this.api.get('/notifications');
  }

  markNotificationAsRead(id: number) {
    return this.api.put(`/notifications/${id}/read`);
  }

  deleteNotification(id: number) {
    return this.api.delete(`/notifications/${id}`);
  }
}

export default new APIService();
