import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  Sparkles,
  Camera,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Flame,
  Trophy,
  Lock,
} from 'lucide-react';
import { getBadges } from '../../services/gamificationApi';

// Icon mapping helper
const getBadgeIcon = (iconName, isUnlocked) => {
  const props = {
    className: `w-8 h-8 ${isUnlocked ? 'text-[#168451]' : 'text-[#647168]'}`,
  };
  switch (iconName) {
    case 'Sparkles':
      return <Sparkles {...props} />;
    case 'Camera':
      return <Camera {...props} />;
    case 'ShieldCheck':
      return <ShieldCheck {...props} />;
    case 'CheckCircle2':
      return <CheckCircle2 {...props} />;
    case 'Calendar':
      return <Calendar {...props} />;
    case 'Flame':
      return <Flame {...props} />;
    case 'Trophy':
    default:
      return <Trophy {...props} />;
  }
};

const BadgesPage = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBadges = async () => {
      try {
        setLoading(true);
        const data = await getBadges();
        setBadges(data || []);
      } catch (err) {
        console.error('Failed to load badges:', err);
      } finally {
        setLoading(false);
      }
    };
    loadBadges();
  }, []);

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E1E9E2] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-[#EAF6EE] border border-[#CBE7D4] text-[#168451]">
              <Award className="w-6 h-6" />
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-[#17211B] tracking-tight">
              Civic Badges & Achievements
            </h1>
          </div>
          <p className="text-[#647168] mt-1 text-sm">
            Recognizing your continuous impact, evidence quality, and problem-solving dedication.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E1E9E2] shadow-xs">
          <span className="text-xs text-[#647168]">Unlocked:</span>
          <span className="text-sm font-bold text-[#168451]">
            {unlockedCount} of {badges.length} Badges
          </span>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-[#647168] text-sm">
            Loading achievement catalog...
          </div>
        ) : (
          badges.map((badge, idx) => {
            const isUnlocked = badge.unlocked;
            return (
              <motion.div
                key={badge.id || idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`rounded-3xl p-6 border relative overflow-hidden transition-all shadow-xs ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-white via-white to-[#EAF6EE] border-[#CBE7D4]'
                    : 'bg-white border-[#E1E9E2] opacity-75'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xs ${
                      isUnlocked
                        ? 'bg-[#EAF6EE] border-[#CBE7D4]'
                        : 'bg-[#F7FAF7] border-[#E1E9E2]'
                    }`}
                  >
                    {getBadgeIcon(badge.icon, isUnlocked)}
                  </div>

                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 border ${
                      isUnlocked
                        ? 'bg-[#EAF6EE] text-[#168451] border-[#CBE7D4]'
                        : 'bg-[#F7FAF7] text-[#647168] border-[#E1E9E2]'
                    }`}
                  >
                    {isUnlocked ? (
                      <>
                        <Sparkles className="w-3 h-3 text-[#168451]" />
                        Unlocked
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-[#647168]" />
                        Locked
                      </>
                    )}
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="text-base font-bold text-[#17211B]">
                    {badge.title || badge.name}
                  </h3>
                  <p className="text-xs text-[#647168] mt-1 leading-relaxed">
                    {badge.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#E1E9E2] flex items-center justify-between text-xs">
                  <span className="text-[#647168]">Reward:</span>
                  <span className="font-bold text-[#168451]">
                    +{badge.reward_xp || 50} XP
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BadgesPage;
