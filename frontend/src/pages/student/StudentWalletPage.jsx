import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Coins,
  ShieldCheck,
  TrendingUp,
  Award,
  Gift,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { getWallet, getTransactions } from '../../services/gamificationApi';
import { calculateLevelInfo } from '../../config/rewardRules';

const StudentWalletPage = () => {
  const [wallet, setWallet] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const [walletData, txData] = await Promise.all([
        getWallet(),
        getTransactions({ limit: 5, page: 1 }),
      ]);
      setWallet(walletData);
      setRecentTransactions(txData.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load wallet data:', err);
      setError('Unable to load wallet information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const levelInfo = calculateLevelInfo(wallet?.xp || 0);

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E1E9E2] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-[#EAF6EE] border border-[#CBE7D4] text-[#168451]">
              <Coins className="w-6 h-6" />
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-[#17211B] tracking-tight">
              CampusCoins Wallet
            </h1>
          </div>
          <p className="text-[#647168] mt-1 text-sm">
            Earn coins and impact points by reporting verified issues and confirming resolutions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/student/rewards"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#168451] hover:bg-[#116B42] text-white font-bold text-sm transition-all shadow-xs"
          >
            <Gift className="w-4 h-4" />
            <span>Redeem Store</span>
          </Link>
          <Link
            to="/student/wallet/transactions"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F7FAF7] text-[#17211B] text-sm font-bold border border-[#E1E9E2] transition-colors shadow-xs"
          >
            <Clock className="w-4 h-4 text-[#168451]" />
            <span>Ledger History</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchWalletData} className="underline text-xs hover:text-rose-900 font-semibold">
            Retry
          </button>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-white to-[#EAF6EE] border border-[#CBE7D4] p-6 shadow-xs"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#168451]/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-[#168451]">
              Available Balance
            </span>
            <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#EAF6EE] text-[#168451] border border-[#CBE7D4] font-semibold">
              <Sparkles className="w-3 h-3" /> Live
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-black text-[#17211B] tracking-tight">
              {loading ? '...' : (wallet?.balance || 0).toLocaleString()}
            </span>
            <span className="text-[#168451] font-bold text-lg">Coins</span>
          </div>

          <div className="mt-4 pt-4 border-t border-[#E1E9E2] flex items-center justify-between text-xs text-[#647168]">
            <span>Lifetime Earned:</span>
            <span className="text-[#168451] font-bold">
              +{loading ? '...' : (wallet?.lifetime_earned || 0).toLocaleString()} CC
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-[#647168]">
            <span>Lifetime Spent:</span>
            <span className="text-[#17211B] font-semibold">
              -{loading ? '...' : (wallet?.lifetime_spent || 0).toLocaleString()} CC
            </span>
          </div>
        </motion.div>

        {/* Card 2: Level & Progression */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl bg-white border border-[#E1E9E2] p-6 flex flex-col justify-between shadow-xs"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-[#647168]">
                Civic Progression
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full border border-[#CBE7D4] bg-[#EAF6EE] text-[#168451] font-bold">
                Level {levelInfo.currentLevel}
              </span>
            </div>

            <div className="mt-3">
              <h3 className="text-xl font-bold text-[#17211B] flex items-center gap-2">
                <Award className="w-5 h-5 text-[#168451]" />
                {levelInfo.currentLevelName}
              </h3>
              <p className="text-xs text-[#647168] mt-1">
                {levelInfo.isMaxLevel
                  ? 'Maximum civic rank achieved! You are a campus role model.'
                  : `Earn ${levelInfo.nextLevelXP - levelInfo.currentXP} more XP to reach next rank.`}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-[#647168]">XP Progress</span>
              <span className="text-[#17211B] font-bold">
                {levelInfo.currentXP} / {levelInfo.nextLevelXP} XP
              </span>
            </div>
            <div className="w-full bg-[#E1E9E2] h-2.5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${levelInfo.progressPercentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="bg-[#168451] h-full rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Card 3: Impact Score & Civic Contribution */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl bg-white border border-[#E1E9E2] p-6 flex flex-col justify-between shadow-xs"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-[#647168]">
                Quality Index
              </span>
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> Quality &gt; Quantity
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl md:text-4xl font-extrabold text-[#17211B]">
                {loading ? '...' : (wallet?.impact_score || 0).toLocaleString()}
              </span>
              <span className="text-xs font-bold text-sky-700">Impact Score</span>
            </div>
            <p className="text-xs text-[#647168] mt-2 leading-relaxed">
              Calculated exclusively from verified complaints, useful evidence, and confirmed resolutions.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E1E9E2] flex items-center justify-between">
            <Link
              to="/student/leaderboard"
              className="text-xs font-bold text-[#168451] hover:text-[#116B42] flex items-center gap-1 transition-colors"
            >
              <span>View Campus Leaderboard</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Gamification Shortcuts Hub */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          to="/student/rewards"
          className="p-4 rounded-2xl bg-white border border-[#E1E9E2] hover:border-[#168451]/50 hover:bg-[#F7FAF7] transition-all group shadow-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-[#EAF6EE] text-[#168451] border border-[#CBE7D4] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Gift className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-[#17211B] group-hover:text-[#168451] transition-colors">
            Reward Store
          </h4>
          <p className="text-xs text-[#647168] mt-1">Canteen vouchers, passes & merch</p>
        </Link>

        <Link
          to="/student/badges"
          className="p-4 rounded-2xl bg-white border border-[#E1E9E2] hover:border-[#168451]/50 hover:bg-[#F7FAF7] transition-all group shadow-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Award className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-[#17211B] group-hover:text-purple-700 transition-colors">
            Badges
          </h4>
          <p className="text-xs text-[#647168] mt-1">Milestones & civic achievements</p>
        </Link>

        <Link
          to="/student/missions"
          className="p-4 rounded-2xl bg-white border border-[#E1E9E2] hover:border-[#168451]/50 hover:bg-[#F7FAF7] transition-all group shadow-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-[#EAF6EE] text-[#168451] border border-[#CBE7D4] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Target className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-[#17211B] group-hover:text-[#168451] transition-colors">
            Active Missions
          </h4>
          <p className="text-xs text-[#647168] mt-1">Quests & extra coin bonuses</p>
        </Link>

        <Link
          to="/student/leaderboard"
          className="p-4 rounded-2xl bg-white border border-[#E1E9E2] hover:border-[#168451]/50 hover:bg-[#F7FAF7] transition-all group shadow-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-[#17211B] group-hover:text-sky-700 transition-colors">
            Leaderboard
          </h4>
          <p className="text-xs text-[#647168] mt-1">Top campus civic contributors</p>
        </Link>
      </div>

      {/* Recent Activity / Transactions Ledger Preview */}
      <div className="rounded-3xl bg-white border border-[#E1E9E2] overflow-hidden shadow-xs">
        <div className="p-5 border-b border-[#E1E9E2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#168451]" />
            <h3 className="text-base font-bold text-[#17211B]">Recent Ledger Transactions</h3>
          </div>
          <Link
            to="/student/wallet/transactions"
            className="text-xs font-bold text-[#168451] hover:text-[#116B42] flex items-center gap-1 transition-colors"
          >
            <span>View All ({wallet?.lifetime_earned ? 'Full History' : '0'})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-[#E1E9E2]">
          {loading ? (
            <div className="p-8 text-center text-[#647168] text-sm">Loading ledger...</div>
          ) : recentTransactions.length === 0 ? (
            <div className="p-8 text-center text-[#647168] text-sm">
              No transactions recorded yet. Submit verified reports to start earning CampusCoins!
            </div>
          ) : (
            recentTransactions.map((tx) => {
              const isPositive = tx.amount > 0;
              return (
                <div
                  key={tx.id}
                  className="p-4 hover:bg-[#F7FAF7] transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`p-2 rounded-xl ${
                        isPositive
                          ? 'bg-[#EAF6EE] text-[#168451] border border-[#CBE7D4]'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-[#17211B]">
                        {tx.description || tx.event_type}
                      </p>
                      <p className="text-xs text-[#647168] mt-0.5">
                        {new Date(tx.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {' · '}
                        <span className="capitalize">{tx.transaction_type}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-sm font-bold ${
                        isPositive ? 'text-[#168451]' : 'text-rose-600'
                      }`}
                    >
                      {isPositive ? `+${tx.amount}` : tx.amount} CC
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentWalletPage;
