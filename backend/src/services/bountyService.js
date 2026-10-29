const { getSupabaseClient } = require('../config/supabase');
const logger = require('../utils/logger');
const { awardCoins } = require('./coinService');
const { logAudit } = require('./auditService');
const { createNotification } = require('./notificationService');

const initialBounties = [
  {
    id: 'bty-001',
    title: 'Central Library Reference Section Audit',
    description: 'Inspect and log missing barcode tags across the 2nd-floor reference stacks to prepare for digital checkout integration.',
    category: 'Library',
    reward_coins: 75,
    xp_reward: 120,
    location: 'Central Library, 2nd Floor',
    status: 'active',
    deadline: new Date(Date.now() + 10 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
    claimed_by: null,
  },
  {
    id: 'bty-002',
    title: 'Science Block Rooftop Solar Panel Dust Inspection',
    description: 'Perform visual inspection of rooftop solar collector arrays and log dust accumulation metrics with photographs.',
    category: 'Sustainability',
    reward_coins: 100,
    xp_reward: 150,
    location: 'Science & Research Block, Terrace',
    status: 'active',
    deadline: new Date(Date.now() + 5 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    claimed_by: null,
  },
  {
    id: 'bty-003',
    title: 'Quadrangle Rainwater Harvesting Cleanliness Check',
    description: 'Inspect ground-level storm drains and catch basins after morning showers to ensure water flows unobstructed.',
    category: 'Cleanliness',
    reward_coins: 50,
    xp_reward: 80,
    location: 'Campus Quadrangle West Drain',
    status: 'active',
    deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    claimed_by: null,
  },
];

const inMemoryBounties = new Map(initialBounties.map((b) => [b.id, { ...b }]));

/**
 * Get active community bounties
 */
async function getBounties() {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('community_bounties')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data?.length) return data;
    } catch (err) {
      logger.warn(`[BOUNTIES] ${err.message}`);
    }
  }

  return Array.from(inMemoryBounties.values());
}

/**
 * Claim / Volunteer for a bounty
 */
async function claimBounty(bountyId, studentUser) {
  const bounty = inMemoryBounties.get(bountyId);
  if (!bounty) {
    const error = new Error('Bounty not found');
    error.statusCode = 404;
    throw error;
  }

  if (bounty.status !== 'active') {
    const error = new Error(`Bounty is already ${bounty.status}`);
    error.statusCode = 400;
    throw error;
  }

  bounty.status = 'in_progress';
  bounty.claimed_by = studentUser.id;
  bounty.claimed_at = new Date().toISOString();
  bounty.claimed_by_name = studentUser.full_name || studentUser.email;

  await logAudit({
    userId: studentUser.id,
    action: 'BOUNTY_CLAIMED',
    entityType: 'bounty',
    entityId: bounty.id,
    newData: { bountyTitle: bounty.title },
  });

  await createNotification({
    userId: studentUser.id,
    title: `🏆 Bounty Assigned: ${bounty.title}`,
    message: 'Complete the task and submit your evidence before the deadline to earn coins!',
    type: 'bounty_assigned',
    referenceId: bounty.id,
  });

  return bounty;
}

/**
 * Staff/Admin verifies completed bounty and awards coins
 */
async function verifyBounty(bountyId, verifierUser) {
  const bounty = inMemoryBounties.get(bountyId);
  if (!bounty) {
    const error = new Error('Bounty not found');
    error.statusCode = 404;
    throw error;
  }

  if (!bounty.claimed_by) {
    const error = new Error('Bounty has not been claimed yet');
    error.statusCode = 400;
    throw error;
  }

  bounty.status = 'completed';
  bounty.verified_at = new Date().toISOString();
  bounty.verified_by = verifierUser.id;

  // Award coins to the student who completed it
  const coinResult = await awardCoins({
    userId: bounty.claimed_by,
    amount: bounty.reward_coins,
    transactionType: 'bonus',
    eventType: 'bounty_completed',
    referenceId: `bty-${bounty.id}`,
    description: `Community Bounty Completed: "${bounty.title}"`,
    metadata: { bountyId: bounty.id, verifiedBy: verifierUser.id },
    impactPoints: Math.round(bounty.reward_coins * 1.5),
    xpPoints: bounty.xp_reward || 100,
  });

  await logAudit({
    userId: verifierUser.id,
    action: 'BOUNTY_VERIFIED',
    entityType: 'bounty',
    entityId: bounty.id,
    newData: { rewardCoins: bounty.reward_coins, studentId: bounty.claimed_by },
  });

  await createNotification({
    userId: bounty.claimed_by,
    title: `🌟 Bounty Verified: +${bounty.reward_coins} CampusCoins!`,
    message: `Your work on "${bounty.title}" was verified. Reward granted!`,
    type: 'bounty_rewarded',
    referenceId: bounty.id,
  });

  return {
    success: true,
    bounty,
    wallet: coinResult,
  };
}

/**
 * Create a new bounty (Admin/Staff)
 */
async function createBounty({ title, description, category, reward_coins, xp_reward, location, deadline }, creatorUser) {
  if (!title || !reward_coins || Number(reward_coins) <= 0) {
    const error = new Error('Title and positive coin reward are required');
    error.statusCode = 400;
    throw error;
  }

  const newBounty = {
    id: `bty-${Date.now()}`,
    title,
    description: description || '',
    category: category || 'Campus Improvement',
    reward_coins: Number(reward_coins),
    xp_reward: Number(xp_reward) || 50,
    location: location || 'Campus',
    status: 'active',
    deadline: deadline || new Date(Date.now() + 14 * 86400000).toISOString(),
    created_at: new Date().toISOString(),
    created_by: creatorUser.id,
    claimed_by: null,
  };

  inMemoryBounties.set(newBounty.id, newBounty);

  return newBounty;
}

module.exports = {
  getBounties,
  claimBounty,
  verifyBounty,
  createBounty,
};
