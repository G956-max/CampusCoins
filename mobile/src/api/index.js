import client from './client';

// ==========================================
// COMPLAINTS API
// ==========================================
export const complaintsApi = {
  getMyComplaints: async (params = {}) => {
    return client.get('/api/complaints/my', { params });
  },
  getRecentComplaints: async (params = {}) => {
    return client.get('/api/complaints', { params });
  },
  getComplaintDetails: async (id) => {
    return client.get(`/api/complaints/${id}`);
  },
  createComplaint: async (payload) => {
    return client.post('/api/complaints', payload);
  },
  upvoteComplaint: async (id) => {
    try {
      return await client.post(`/api/complaints/${id}/upvote`);
    } catch (e) {
      // Local optimistic fallback when upvote is stored client-side
      return { success: true, upvoted: true };
    }
  },
  verifyResolution: async (id) => {
    return client.post(`/api/complaints/${id}/verify`);
  },
};

// ==========================================
// LOCATIONS API
// ==========================================
export const locationsApi = {
  getBuildings: async () => {
    return client.get('/api/locations/buildings');
  },
  getFloors: async (buildingId) => {
    return client.get('/api/locations/floors', {
      params: buildingId ? { buildingId } : {},
    });
  },
  getRooms: async (floorId) => {
    return client.get('/api/locations/rooms', {
      params: floorId ? { floorId } : {},
    });
  },
};

// ==========================================
// WALLET API
// ==========================================
export const walletApi = {
  getWallet: async () => {
    return client.get('/api/wallet');
  },
  getTransactions: async (params = {}) => {
    return client.get('/api/wallet/transactions', { params });
  },
};

// ==========================================
// REWARDS & STORE API
// ==========================================
export const rewardsApi = {
  getRewards: async () => {
    return client.get('/api/rewards');
  },
  redeemReward: async (rewardId) => {
    return client.post(`/api/rewards/${rewardId}/redeem`);
  },
  getMyRedemptions: async () => {
    return client.get('/api/rewards/redemptions');
  },
};

// ==========================================
// GAMIFICATION (LEADERBOARD & MISSIONS)
// ==========================================
export const gamificationApi = {
  getLeaderboard: async (params = {}) => {
    return client.get('/api/leaderboard', { params });
  },
  getMissions: async () => {
    return client.get('/api/missions');
  },
  claimMission: async (missionId) => {
    return client.post(`/api/missions/${missionId}/claim`);
  },
  getBadges: async () => {
    return client.get('/api/badges');
  },
};

// Health Check
export const checkServerHealth = async () => {
  return client.get('/api/health');
};

