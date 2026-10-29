import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  Coins,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { getMissions, claimMission } from '../../services/gamificationApi';

const MissionsPage = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);
  const [claimSuccess, setClaimSuccess] = useState(null);

  const fetchMissions = async () => {
    try {
      setLoading(true);
      const data = await getMissions();
      setMissions(data || []);
    } catch (err) {
      console.error('Failed to load missions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  const handleClaim = async (missionId) => {
    try {
      setClaimingId(missionId);
      const res = await claimMission(missionId);
      setClaimSuccess({
        missionId,
        coins: res.coinsAwarded || 30,
      });
      await fetchMissions();
    } catch (err) {
      console.error('Failed to claim mission:', err);
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E1E9E2] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-[#EAF6EE] border border-[#CBE7D4] text-[#168451]">
              <Target className="w-6 h-6" />
            </span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#17211B] tracking-tight">
              Civic Missions & Quests
            </h1>
          </div>
          <p className="text-[#647168] mt-1 text-xs sm:text-sm">
            Complete meaningful campus improvement actions to unlock direct CampusCoin bonuses.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white border border-[#E1E9E2] shadow-xs self-start md:self-auto">
          <span className="text-xs text-[#647168]">Total Missions:</span>
          <span className="text-xs sm:text-sm font-bold text-[#168451]">{missions.length} Available</span>
        </div>
      </div>

      {claimSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-[#EAF6EE] border border-[#CBE7D4] text-[#168451] text-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#168451]" />
            <span>
              Congratulations! You claimed <strong>+{claimSuccess.coins} CampusCoins</strong> for completing your mission!
            </span>
          </div>
          <button onClick={() => setClaimSuccess(null)} className="text-xs font-bold underline hover:text-[#116B42]">
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Missions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-[#647168] text-sm">
            Loading active missions...
          </div>
        ) : missions.length === 0 ? (
          <div className="col-span-full py-16 text-center text-[#647168] text-sm">
            No active missions available right now.
          </div>
        ) : (
          missions.map((mission) => {
            const isClaimed = mission.status === 'claimed';
            const isCompleted = mission.isCompleted && !isClaimed;
            const progress = mission.progress || 0;
            const requirement = mission.requirementCount || 1;
            const percentage = Math.min(100, Math.round((progress / requirement) * 100));

            return (
              <motion.div
                key={mission.id}
                whileHover={{ y: -2 }}
                className={`rounded-2xl sm:rounded-3xl p-4 sm:p-6 border flex flex-col justify-between transition-all shadow-xs ${
                  isClaimed
                    ? 'bg-[#F7FAF7] border-[#E1E9E2] opacity-75'
                    : isCompleted
                    ? 'bg-[#EAF6EE] border-[#168451]'
                    : 'bg-white border-[#E1E9E2]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-[#17211B] flex items-center gap-2">
                        {mission.title}
                      </h3>
                      <p className="text-xs text-[#647168] mt-1 leading-relaxed">
                        {mission.description}
                      </p>
                    </div>

                    <span className="shrink-0 px-3 py-1 rounded-full text-xs font-bold bg-[#EAF6EE] border border-[#CBE7D4] text-[#168451] flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" />
                      +{mission.rewardCoins} CC
                    </span>
                  </div>

                  {/* Progress section */}
                  <div className="mt-5">
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span className="text-[#647168]">Progress</span>
                      <span className="text-[#17211B] font-bold">
                        {progress} / {requirement}
                      </span>
                    </div>

                    <div className="w-full bg-[#E1E9E2] h-2.5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.6 }}
                        className={`h-full rounded-full ${
                          isCompleted || isClaimed
                            ? 'bg-[#168451]'
                            : 'bg-[#168451]'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E1E9E2] flex items-center justify-between">
                  {isClaimed ? (
                    <span className="text-xs font-bold text-[#647168] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#168451]" />
                      Completed & Claimed
                    </span>
                  ) : isCompleted ? (
                    <button
                      disabled={claimingId === mission.id}
                      onClick={() => handleClaim(mission.id)}
                      className="w-full py-2.5 rounded-xl bg-[#168451] hover:bg-[#116B42] text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{claimingId === mission.id ? 'Claiming...' : 'Claim Reward (+Coins)'}</span>
                    </button>
                  ) : (
                    <span className="text-xs text-[#647168] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#647168]" />
                      In Progress ({requirement - progress} remaining)
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MissionsPage;
