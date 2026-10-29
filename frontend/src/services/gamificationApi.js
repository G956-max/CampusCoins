import api from './api';

// ==========================================
// STUDENT WALLET & TRANSACTIONS
// ==========================================

export const getWallet = async () => {
  const response = await api.get('/api/wallet');
  return response.data;
};

export const getTransactions = async (params = {}) => {
  const response = await api.get('/api/wallet/transactions', { params });
  return response;
};

// ==========================================
// REWARDS & STORE
// ==========================================

export const getRewards = async () => {
  const response = await api.get('/api/rewards');
  return response.data;
};

export const redeemReward = async (rewardId) => {
  const response = await api.post(`/api/rewards/${rewardId}/redeem`);
  return response.data;
};

export const getMyRedemptions = async () => {
  const response = await api.get('/api/rewards/redemptions');
  return response.data;
};

// ==========================================
// BADGES & MISSIONS
// ==========================================

export const getBadges = async () => {
  const response = await api.get('/api/badges');
  return response.data;
};

export const getMissions = async () => {
  const response = await api.get('/api/missions');
  return response.data;
};

export const claimMission = async (missionId) => {
  const response = await api.post(`/api/missions/${missionId}/claim`);
  return response.data;
};

// ==========================================
// LEADERBOARD
// ==========================================

export const getLeaderboard = async (params = {}) => {
  const response = await api.get('/api/leaderboard', { params });
  return response.data;
};

export const getLeaderboardVisibility = async () => {
  const response = await api.get('/api/leaderboard/visibility');
  return response.data;
};

export const setLeaderboardVisibility = async (leaderboard_visible) => {
  const response = await api.patch('/api/leaderboard/visibility', { leaderboard_visible });
  return response.data;
};

// ==========================================
// ADMIN REWARD & REDEMPTION MANAGEMENT
// ==========================================

export const adminGetAllRewards = async () => {
  const response = await api.get('/api/admin/rewards');
  return response.data;
};

export const adminCreateReward = async (rewardData) => {
  const response = await api.post('/api/admin/rewards', rewardData);
  return response.data;
};

export const adminUpdateReward = async (id, updates) => {
  const response = await api.patch(`/api/admin/rewards/${id}`, updates);
  return response.data;
};

export const adminDeleteReward = async (id) => {
  const response = await api.delete(`/api/admin/rewards/${id}`);
  return response.data;
};

export const adminGetAllRedemptions = async (params = {}) => {
  const response = await api.get('/api/admin/rewards/redemptions', { params });
  return response.data;
};

export const adminApproveRedemption = async (id) => {
  const response = await api.post(`/api/admin/rewards/redemptions/${id}/approve`);
  return response.data;
};

export const adminFulfillRedemption = async (id) => {
  const response = await api.post(`/api/admin/rewards/redemptions/${id}/fulfill`);
  return response.data;
};

export const adminCancelRedemption = async (id, reason) => {
  const response = await api.post(`/api/admin/rewards/redemptions/${id}/cancel`, { reason });
  return response.data;
};

// ==========================================
// ADMIN GAMIFICATION & ANALYTICS
// ==========================================

export const adminGetGamificationAnalytics = async () => {
  const response = await api.get('/api/admin/gamification');
  return response.data;
};

export const adminGetGamificationRules = async () => {
  const response = await api.get('/api/admin/gamification/rules');
  return response.data;
};

export const adminUpdateGamificationRules = async (rulesData) => {
  const response = await api.patch('/api/admin/gamification/rules', rulesData);
  return response.data;
};

// ==========================================
// ADMIN COMPLAINT REWARD HOOKS
// ==========================================

export const adminVerifyComplaint = async (id, { is_useful_evidence, is_high_impact }) => {
  const response = await api.post(`/api/admin/complaints/${id}/verify`, {
    is_useful_evidence,
    is_high_impact,
  });
  return response.data;
};

export const adminMarkSpam = async (id) => {
  const response = await api.post(`/api/admin/complaints/${id}/spam`);
  return response.data;
};

export const adminMarkFake = async (id) => {
  const response = await api.post(`/api/admin/complaints/${id}/fake`);
  return response.data;
};
