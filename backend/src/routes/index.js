const express = require('express');
const healthRoutes = require('./healthRoutes');
const locationRoutes = require('./locationRoutes');
const complaintRoutes = require('./complaintRoutes');
const adminComplaintRoutes = require('./adminComplaintRoutes');
const staffComplaintRoutes = require('./staffComplaintRoutes');
const walletRoutes = require('./walletRoutes');
const rewardRoutes = require('./rewardRoutes');
const badgeRoutes = require('./badgeRoutes');
const missionRoutes = require('./missionRoutes');
const leaderboardRoutes = require('./leaderboardRoutes');
const adminRewardRoutes = require('./adminRewardRoutes');
const adminGamificationRoutes = require('./adminGamificationRoutes');
const adminAnalyticsRoutes = require('./adminAnalyticsRoutes');
const slaRoutes = require('./slaRoutes');
const notificationRoutes = require('./notificationRoutes');
const bountyRoutes = require('./bountyRoutes');

const router = express.Router();

// Core infrastructure routes
router.use('/', healthRoutes);
router.use('/locations', locationRoutes);
router.use('/complaints', complaintRoutes);
router.use('/admin/complaints', adminComplaintRoutes);
router.use('/staff/complaints', staffComplaintRoutes);

// Gamification, Wallet & Reward Routes
router.use('/wallet', walletRoutes);
router.use('/rewards', rewardRoutes);
router.use('/badges', badgeRoutes);
router.use('/missions', missionRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/admin/rewards', adminRewardRoutes);
router.use('/admin/gamification', adminGamificationRoutes);

// Institutional Oversight, SLA, Notifications & Bounties
router.use('/admin/analytics', adminAnalyticsRoutes);
router.use('/admin/sla', slaRoutes);
router.use('/notifications', notificationRoutes);
router.use('/bounties', bountyRoutes);

module.exports = router;
