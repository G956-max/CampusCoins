/**
 * Centralized Reward Configuration for CampusCoins Phase 4
 * Values must be configurable and never hardcoded in multiple files.
 */

const DEFAULT_COIN_RULES = {
  VALID_COMPLAINT: 20,
  USEFUL_EVIDENCE: 10,
  HIGH_IMPACT_ISSUE: 30,
  RESOLUTION_VERIFICATION: 30,
  USEFUL_FOLLOW_UP: 10,
  DUPLICATE_IDENTIFICATION: 15,
  BOUNTY_COMPLETION: 0, // Future feature
  SPAM_PENALTY: -30,
  FAKE_REPORT_PENALTY: -50,
};

const DEFAULT_IMPACT_RULES = {
  VALID_COMPLAINT: 20,
  USEFUL_EVIDENCE: 10,
  HIGH_IMPACT_ISSUE: 30,
  RESOLUTION_VERIFICATION: 30,
  USEFUL_FOLLOW_UP: 10,
  DUPLICATE_IDENTIFICATION: 15,
  SPAM_PENALTY: -30,
  FAKE_REPORT_PENALTY: -50,
};

const DEFAULT_LEVEL_TIERS = [
  { level: 1, name: 'Campus Observer', minXP: 0, maxXP: 99 },
  { level: 2, name: 'Campus Contributor', minXP: 100, maxXP: 249 },
  { level: 3, name: 'Campus Helper', minXP: 250, maxXP: 499 },
  { level: 4, name: 'Campus Champion', minXP: 500, maxXP: 999 },
  { level: 5, name: 'Campus Leader', minXP: 1000, maxXP: 1999 },
  { level: 6, name: 'Campus Impact Maker', minXP: 2000, maxXP: Infinity },
];

const INITIAL_BADGES = [
  {
    id: 'badge-first-report',
    name: 'First Report',
    description: 'Submit your first verified campus complaint.',
    icon: 'Sparkles',
    criteria: { verifiedComplaints: 1 },
  },
  {
    id: 'badge-evidence-expert',
    name: 'Evidence Expert',
    description: 'Provide useful photographic/video evidence 5 times.',
    icon: 'Camera',
    criteria: { usefulEvidence: 5 },
  },
  {
    id: 'badge-campus-helper',
    name: 'Campus Helper',
    description: 'Earn 500 total campus impact score.',
    icon: 'ShieldCheck',
    criteria: { impactScore: 500 },
  },
  {
    id: 'badge-problem-solver',
    name: 'Problem Solver',
    description: 'Successfully verify 5 resolved campus complaints.',
    icon: 'CheckCircle2',
    criteria: { verifiedResolutions: 5 },
  },
  {
    id: 'badge-consistency',
    name: 'Consistency',
    description: 'Contribute on 7 different days.',
    icon: 'Calendar',
    criteria: { activeDays: 7 },
  },
  {
    id: 'badge-high-impact',
    name: 'High Impact',
    description: 'Contribute to 3 high-impact verified campus issues.',
    icon: 'Flame',
    criteria: { highImpactIssues: 3 },
  },
  {
    id: 'badge-community-contributor',
    name: 'Community Contributor',
    description: 'Reach 1000 total campus impact score.',
    icon: 'Trophy',
    criteria: { impactScore: 1000 },
  },
];

const INITIAL_MISSIONS = [
  {
    id: 'mission-first-issue',
    uuid: 'a0000000-0000-0000-0000-000000000001',
    title: 'Report Your First Issue',
    description: 'Submit a valid campus issue verified by administration.',
    rewardCoins: 25,
    requirementCount: 1,
    eventType: 'complaint_verified',
    isActive: true,
  },
  {
    id: 'mission-improve-3',
    uuid: 'a0000000-0000-0000-0000-000000000002',
    title: 'Help Improve 3 Issues',
    description: 'Contribute to 3 verified campus complaints or updates.',
    rewardCoins: 50,
    requirementCount: 3,
    eventType: 'complaint_verified',
    isActive: true,
  },
  {
    id: 'mission-useful-evidence',
    uuid: 'a0000000-0000-0000-0000-000000000003',
    title: 'Provide Useful Evidence',
    description: 'Attach clear, high-quality evidence verified on your reports.',
    rewardCoins: 30,
    requirementCount: 2,
    eventType: 'evidence_verified',
    isActive: true,
  },
  {
    id: 'mission-verify-resolution',
    uuid: 'a0000000-0000-0000-0000-000000000004',
    title: 'Verify a Resolution',
    description: 'Inspect and confirm an issue marked resolved by technicians.',
    rewardCoins: 30,
    requirementCount: 1,
    eventType: 'resolution_verified',
    isActive: true,
  },
  {
    id: 'mission-7-days',
    uuid: 'a0000000-0000-0000-0000-000000000005',
    title: 'Contribute for 7 Days',
    description: 'Log verified campus improvement activity across 7 days.',
    rewardCoins: 75,
    requirementCount: 7,
    eventType: 'daily_activity',
    isActive: true,
  },
];

// In-memory active configuration (allows dynamic admin updates)
let activeCoinRules = { ...DEFAULT_COIN_RULES };
let activeImpactRules = { ...DEFAULT_IMPACT_RULES };
let activeLevelTiers = [...DEFAULT_LEVEL_TIERS];

const getCoinRules = () => activeCoinRules;
const updateCoinRules = (newRules) => {
  activeCoinRules = { ...activeCoinRules, ...newRules };
  return activeCoinRules;
};

const getImpactRules = () => activeImpactRules;
const updateImpactRules = (newRules) => {
  activeImpactRules = { ...activeImpactRules, ...newRules };
  return activeImpactRules;
};

const getLevelTiers = () => activeLevelTiers;
const updateLevelTiers = (newTiers) => {
  activeLevelTiers = [...newTiers];
  return activeLevelTiers;
};

module.exports = {
  DEFAULT_COIN_RULES,
  DEFAULT_IMPACT_RULES,
  DEFAULT_LEVEL_TIERS,
  INITIAL_BADGES,
  INITIAL_MISSIONS,
  getCoinRules,
  updateCoinRules,
  getImpactRules,
  updateImpactRules,
  getLevelTiers,
  updateLevelTiers,
};
