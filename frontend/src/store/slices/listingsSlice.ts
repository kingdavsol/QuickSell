import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Listing {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  estimatedPrice?: number;
  status: 'draft' | 'published' | 'sold' | 'delisted';
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  photos: string[];
  createdAt: string;
  publishedAt?: string;
  marketplaces?: string[];
}

interface ListingsState {
  items: Listing[];
  selectedListing: Listing | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
  page: number;
  limit: number;
}

const initialState: ListingsState = {
  items: [],
  selectedListing: null,
  loading: false,
  error: null,
  totalCount: 0,
  page: 1,
  limit: 10,
};

const listingsSlice = createSlice({
  name: 'listings',
  initialState,
  reducers: {
    // Fetch listings
    fetchListingsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchListingsSuccess: (state, action: PayloadAction<{ items: Listing[]; total: number }>) => {
      state.items = action.payload.items;
      state.totalCount = action.payload.total;
      state.loading = false;
    },
    fetchListingsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create listing
    createListingStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createListingSuccess: (state, action: PayloadAction<Listing>) => {
      state.items.unshift(action.payload);
      state.loading = false;
    },
    createListingFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Select listing
    selectListing: (state, action: PayloadAction<Listing>) => {
      state.selectedListing = action.payload;
    },

    // Update listing
    updateListingSuccess: (state, action: PayloadAction<Listing>) => {
      const index = state.items.findIndex((item) => item.id === action.payload.id);
      if (index >= 0) {
        state.items[index] = action.payload;
      }
      state.selectedListing = action.payload;
    },

    // Delete listing
    deleteListingSuccess: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },

    // Publish listing
    publishListingSuccess: (state, action: PayloadAction<Listing>) => {
      const index = state.items.findIndex((item) => item.id === action.payload.id);
      if (index >= 0) {
        state.items[index] = action.payload;
      }
    },

    // Set page
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchListingsStart,
  fetchListingsSuccess,
  fetchListingsFailure,
  createListingStart,
  createListingSuccess,
  createListingFailure,
  selectListing,
  updateListingSuccess,
  deleteListingSuccess,
  publishListingSuccess,
  setPage,
  clearError,
} = listingsSlice.actions;

export default listingsSlice.reducer;
