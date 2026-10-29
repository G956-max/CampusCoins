const config = require('../config/env');
const { getSupabaseClient } = require('../config/supabase');
const logger = require('../utils/logger');
const { INITIAL_MISSIONS } = require('../config/rewardRules');
const { awardCoins } = require('./coinService');
const { logAudit } = require('./auditService');
const { createNotification } = require('./notificationService');

// In-memory user missions store: Map<userId, Map<missionId, { progress, status, completed_at, claimed_at }>>
const inMemoryUserMissions = new Map();

/**
 * Get available missions for a user with verified progress
 */
const getAvailableMissions = async (userId) => {
  if (!userId) throw new Error('User ID is required');

  const supabase = getSupabaseClient();
  let userMissionRecords = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('user_missions')
        .select('*')
        .eq('user_id', userId);

      if (!error && data) {
        userMissionRecords = data;
      }
    } catch (err) {
      logger.warn(`[MISSIONS] Supabase fetch fallback: ${err.message}`);
    }
  }

  const memoryUserMap = inMemoryUserMissions.get(userId) || new Map();

  return INITIAL_MISSIONS.map((mission) => {
    const dbRecord = userMissionRecords.find((r) => r.mission_id === mission.id || (mission.uuid && r.mission_id === mission.uuid));
    const memRecord = memoryUserMap.get(mission.id) || (mission.uuid && memoryUserMap.get(mission.uuid));
    const record = dbRecord || memRecord;

    const progress = record ? Number(record.progress) || 0 : 0;
    const status = record ? record.status : 'in_progress';
    const requirement = mission.requirementCount || 1;
    const isCompleted = status === 'completed' || status === 'claimed' || progress >= requirement;

    return {
      ...mission,
      progress: Math.min(progress, requirement),
      requirementCount: requirement,
      status: isCompleted ? (status === 'claimed' ? 'claimed' : 'completed') : 'in_progress',
      isCompleted,
      progressPercentage: Math.min(100, Math.round((progress / requirement) * 100)),
      completed_at: record?.completed_at || null,
      claimed_at: record?.claimed_at || null,
    };
  });
};

/**
 * Update mission progress for a user triggered by an event
 */
const updateMissionProgress = async (userId, eventType, increment = 1) => {
  if (!userId || !eventType) return [];

  const missions = INITIAL_MISSIONS.filter((m) => m.eventType === eventType);
  if (missions.length === 0) return [];

  const completedNow = [];
  const supabase = getSupabaseClient();

  if (!inMemoryUserMissions.has(userId)) {
    inMemoryUserMissions.set(userId, new Map());
  }
  const memoryUserMap = inMemoryUserMissions.get(userId);

  for (const mission of missions) {
    let existing = memoryUserMap.get(mission.id);

    // If not in memory, check Supabase
    if (!existing && supabase) {
      try {
        const { data } = await supabase
          .from('user_missions')
          .select('*')
          .eq('user_id', userId)
          .eq('mission_id', mission.id)
          .maybeSingle();
        if (data) existing = data;
      } catch (err) {
        logger.warn(`[MISSION CHECK] ${err.message}`);
      }
    }

    if (!existing) {
      existing = {
        progress: 0,
        status: 'in_progress',
        completed_at: null,
      };
    }

    if (existing.status === 'completed' || existing.status === 'claimed') {
      continue; // Already finished
    }

    const newProgress = existing.progress + increment;
    const requirement = mission.requirementCount || 1;
    const isNowCompleted = newProgress >= requirement;

    const updated = {
      progress: newProgress,
      status: isNowCompleted ? 'completed' : 'in_progress',
      completed_at: isNowCompleted ? new Date().toISOString() : null,
    };
    memoryUserMap.set(mission.id, updated);

    if (supabase) {
      try {
        await supabase.from('user_missions').upsert({
          user_id: userId,
          mission_id: mission.id,
          progress: newProgress,
          status: updated.status,
          completed_at: updated.completed_at,
        }, { onConflict: 'user_id,mission_id' });
      } catch (err) {
        logger.warn(`[MISSION UPSERT] Supabase error: ${err.message}`);
      }
    }

    if (isNowCompleted) {
      completedNow.push(mission);
      logger.info(`[MISSION COMPLETED] User ${userId} finished mission: "${mission.title}"`);
    }
  }

  return completedNow;
};

/**
 * Complete / Claim mission reward idempotently
 * Strictly validates that mission is actually completed before awarding coins.
 * NEVER defaults missing mission status to completed.
 */
const completeMission = async (userId, missionId) => {
  if (!userId || !missionId) throw new Error('User ID and Mission ID are required');

  const mission = INITIAL_MISSIONS.find((m) => m.id === missionId || m.uuid === missionId);
  if (!mission) {
    const error = new Error('Mission not found');
    error.statusCode = 404;
    throw error;
  }

  const requirement = mission.requirementCount || 1;
  const supabase = getSupabaseClient();

  // 1. Try atomic Supabase RPC if configured
  if (supabase) {
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('claim_mission_atomic', {
        p_user_id: userId,
        p_mission_id: mission.id,
      });

      if (rpcError) {
        if (config.nodeEnv === 'production' || !config.allowDevMockAuth) {
          logger.error(`[MISSION RPC] Supabase execution failed in production: ${rpcError.message}`);
          const err = new Error(rpcError.message || 'Database error claiming mission');
          err.statusCode = 500;
          throw err;
        }
        logger.warn(`[MISSION RPC] Fallback: ${rpcError.message}`);
      } else if (rpcData) {
        if (!rpcData.success) {
          const err = new Error(rpcData.message || 'Mission claim failed');
          err.statusCode = rpcData.status_code || 400;
          throw err;
        }
        return rpcData;
      }
    } catch (err) {
      if (err.statusCode || config.nodeEnv === 'production' || !config.allowDevMockAuth) {
        throw err;
      }
      logger.warn(`[MISSION RPC] Fallback: ${err.message}`);
    }
  }

  // 2. Verified In-Memory / Database fallback (Dev/Test only)
  if (config.nodeEnv === 'production' || (!config.allowDevMockAuth && supabase)) {
    const err = new Error('Database mission claim failed in production mode');
    err.statusCode = 500;
    throw err;
  }
  if (!inMemoryUserMissions.has(userId)) {
    inMemoryUserMissions.set(userId, new Map());
  }
  const memoryUserMap = inMemoryUserMissions.get(userId);

  let current = memoryUserMap.get(mission.id) || memoryUserMap.get(mission.uuid) || memoryUserMap.get(missionId);

  // Check Supabase record if not in memory
  if (!current && supabase) {
    try {
      const { data } = await supabase
        .from('user_missions')
        .select('*')
        .eq('user_id', userId)
        .or(`mission_id.eq.${mission.id},mission_id.eq.${mission.uuid || mission.id}`)
        .maybeSingle();
      if (data) current = data;
    } catch (err) {
      logger.warn(`[MISSION FETCH] ${err.message}`);
    }
  }

  // Strict check: if missing or progress < requirement, REJECT!
  if (!current || (current.progress || 0) < requirement) {
    const error = new Error(`Mission requirement not met. Current progress: ${current?.progress || 0}/${requirement}.`);
    error.statusCode = 400;
    throw error;
  }

  if (current.status === 'claimed') {
    return {
      success: false,
      alreadyClaimed: true,
      message: 'Mission reward has already been claimed.',
    };
  }

  // Mark as claimed
  current.status = 'claimed';
  current.claimed_at = new Date().toISOString();
  current.completed_at = current.completed_at || new Date().toISOString();
  memoryUserMap.set(missionId, current);

  if (supabase) {
    try {
      await supabase.from('user_missions').upsert({
        user_id: userId,
        mission_id: mission.id,
        progress: requirement,
        status: 'claimed',
        completed_at: current.completed_at,
        claimed_at: current.claimed_at,
      }, { onConflict: 'user_id,mission_id' });
    } catch (err) {
      logger.warn(`[MISSION PERSIST] ${err.message}`);
    }
  }

  // Award mission reward coins atomically
  const rewardResult = await awardCoins({
    userId,
    amount: mission.rewardCoins,
    transactionType: 'bonus',
    eventType: 'mission_completed',
    referenceId: `mission-${missionId}`,
    description: `Mission Completed: "${mission.title}"`,
    metadata: { mission_id: missionId, mission_title: mission.title },
    impactPoints: Math.round(mission.rewardCoins / 2),
    xpPoints: mission.rewardCoins,
  });

  await logAudit({
    userId,
    action: 'MISSION_COMPLETED',
    entityType: 'mission',
    entityId: missionId,
    newData: { missionTitle: mission.title, rewardCoins: mission.rewardCoins },
  });

  await createNotification({
    userId,
    title: `🎯 Mission Completed: ${mission.title}!`,
    message: `You earned +${mission.rewardCoins} CampusCoins!`,
    type: 'mission_completed',
    referenceId: `mission-${missionId}`,
  });

  return {
    success: true,
    mission,
    coinsAwarded: mission.rewardCoins,
    wallet: rewardResult,
  };
};

module.exports = {
  getAvailableMissions,
  updateMissionProgress,
  completeMission,
  inMemoryUserMissions,
};
