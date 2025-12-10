import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Badge {
  id: number;
  key: string;
  name: string;
  icon: string;
  unlockedAt: string;
}

interface Challenge {
  id: number;
  key: string;
  name: string;
  description: string;
  progress: number;
  progressPercentage: number;
  status: 'active' | 'completed' | 'expired';
  reward: number;
}

interface GamificationState {
  points: number;
  level: number;
  badges: Badge[];
  challenges: Challenge[];
  leaderboard: any[];
  streak: number;
  nextLevelPoints: number;
  loading: boolean;
  error: string | null;
}

const initialState: GamificationState = {
  points: 0,
  level: 1,
  badges: [],
  challenges: [],
  leaderboard: [],
  streak: 0,
  nextLevelPoints: 500,
  loading: false,
  error: null,
};

const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    // Fetch stats
    fetchStatsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchStatsSuccess: (state, action: PayloadAction<any>) => {
      state.points = action.payload.points;
      state.level = action.payload.level;
      state.streak = action.payload.streak;
      state.nextLevelPoints = action.payload.nextLevelPoints;
      state.loading = false;
    },
    fetchStatsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch badges
    fetchBadgesSuccess: (state, action: PayloadAction<Badge[]>) => {
      state.badges = action.payload;
    },

    // Unlock badge
    unlockBadge: (state, action: PayloadAction<Badge>) => {
      if (!state.badges.find((b) => b.id === action.payload.id)) {
        state.badges.push(action.payload);
      }
    },

    // Fetch challenges
    fetchChallengesSuccess: (state, action: PayloadAction<Challenge[]>) => {
      state.challenges = action.payload;
    },

    // Update challenge
    updateChallenge: (state, action: PayloadAction<Challenge>) => {
      const index = state.challenges.findIndex((c) => c.id === action.payload.id);
      if (index >= 0) {
        state.challenges[index] = action.payload;
      }
    },

    // Add points
    addPoints: (state, action: PayloadAction<number>) => {
      state.points += action.payload;
      // Check if level up
      if (state.points >= state.nextLevelPoints) {
        state.level += 1;
        state.points -= state.nextLevelPoints;
        state.nextLevelPoints = Math.floor(state.nextLevelPoints * 1.5);
      }
    },

    // Fetch leaderboard
    fetchLeaderboardSuccess: (state, action: PayloadAction<any[]>) => {
      state.leaderboard = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchStatsStart,
  fetchStatsSuccess,
  fetchStatsFailure,
  fetchBadgesSuccess,
  unlockBadge,
  fetchChallengesSuccess,
  updateChallenge,
  addPoints,
  fetchLeaderboardSuccess,
  clearError,
} = gamificationSlice.actions;

export default gamificationSlice.reducer;
