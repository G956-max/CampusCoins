import React, { useState, useEffect } from 'react';
import {
  Coins,
  ShieldCheck,
  TrendingUp,
  Settings,
  Save,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  adminGetGamificationAnalytics,
  adminGetGamificationRules,
  adminUpdateGamificationRules,
} from '../../services/gamificationApi';
import Button from '../../components/common/Button';

const AdminGamificationPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [rules, setRules] = useState({
    VALID_COMPLAINT: 20,
    USEFUL_EVIDENCE: 10,
    HIGH_IMPACT_ISSUE: 30,
    RESOLUTION_VERIFICATION: 30,
    USEFUL_FOLLOW_UP: 10,
    DUPLICATE_IDENTIFICATION: 15,
    SPAM_PENALTY: -30,
    FAKE_REPORT_PENALTY: -50,
  });
  const [loading, setLoading] = useState(true);
  const [savingRules, setSavingRules] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsData, rulesData] = await Promise.all([
        adminGetGamificationAnalytics(),
        adminGetGamificationRules().catch(() => null),
      ]);
      setAnalytics(analyticsData);
      if (rulesData?.coinRules) {
        setRules(rulesData.coinRules);
      }
    } catch (err) {
      console.error('Failed to load gamification admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRuleChange = (key, value) => {
    setRules((prev) => ({
      ...prev,
      [key]: Number(value),
    }));
  };

  const handleSaveRules = async (e) => {
    e.preventDefault();
    try {
      setSavingRules(true);
      await adminUpdateGamificationRules({ coinRules: rules });
      setFeedback({ type: 'success', message: 'Reward rules updated and saved globally.' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update rules.' });
    } finally {
      setSavingRules(false);
    }
  };

  const metrics = analytics?.metrics || {
    totalCoinsDistributed: 340,
    totalCoinsRedeemed: 100,
    activeStudents: 5,
    averageImpactScore: 180,
    pendingRedemptions: 1,
    activeRewardsCount: 5,
    activeMissionsCount: 5,
  };

  const monthlyTrends = analytics?.monthlyTrends || [
    { month: 'Apr', coinsEarned: 120, coinsRedeemed: 40 },
    { month: 'May', coinsEarned: 210, coinsRedeemed: 80 },
    { month: 'Jun', coinsEarned: 350, coinsRedeemed: 120 },
    { month: 'Jul', coinsEarned: 480, coinsRedeemed: 190 },
    { month: 'Aug', coinsEarned: 620, coinsRedeemed: 250 },
    { month: 'Sep', coinsEarned: 840, coinsRedeemed: 340 },
  ];

  const eventDistribution = analytics?.eventDistribution || [
    { name: 'Verified Complaints', value: 45 },
    { name: 'Useful Evidence', value: 25 },
    { name: 'Resolution Verified', value: 20 },
    { name: 'High Impact Issues', value: 10 },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E1E9E2] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-[#EAF6EE] border border-[#CBE7D4] text-[#168451]">
              <Coins className="w-6 h-6" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#17211B] tracking-tight">
              Gamification & Economy Engine Console
            </h1>
          </div>
          <p className="text-[#647168] mt-1 text-xs sm:text-sm">
            Monitor CampusCoins circulation, impact distributions, and configure reward thresholds.
          </p>
        </div>

        <button
          onClick={loadData}
          className="self-start md:self-auto p-2.5 rounded-xl bg-white hover:bg-[#F7FAF7] text-[#17211B] border border-[#E1E9E2] transition-colors shadow-xs"
          title="Refresh Console"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold shadow-xs ${
            feedback.type === 'success'
              ? 'bg-[#EAF6EE] border border-[#CBE7D4] text-[#168451]'
              : 'bg-rose-50 border border-rose-200 text-rose-700'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-[#E1E9E2] shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-[#647168] uppercase tracking-wider block">
            Coins Distributed
          </span>
          <span className="text-xl sm:text-3xl font-black text-[#168451] mt-1 sm:mt-2 block">
            {metrics.totalCoinsDistributed.toLocaleString()} CC
          </span>
          <span className="text-[11px] sm:text-xs text-[#647168] mt-0.5 sm:mt-1 block">Total tokens minted</span>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-[#E1E9E2] shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-[#647168] uppercase tracking-wider block">
            Coins Redeemed
          </span>
          <span className="text-xl sm:text-3xl font-black text-[#116B42] mt-1 sm:mt-2 block">
            {metrics.totalCoinsRedeemed.toLocaleString()} CC
          </span>
          <span className="text-[11px] sm:text-xs text-[#647168] mt-0.5 sm:mt-1 block">Redeemed for perks</span>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-[#E1E9E2] shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-[#647168] uppercase tracking-wider block">
            Avg Impact Score
          </span>
          <span className="text-xl sm:text-3xl font-black text-sky-700 mt-1 sm:mt-2 block">
            {metrics.averageImpactScore} pts
          </span>
          <span className="text-[11px] sm:text-xs text-[#647168] mt-0.5 sm:mt-1 block">Quality over quantity metric</span>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-[#E1E9E2] shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-[#647168] uppercase tracking-wider block">
            Pending Redemptions
          </span>
          <span className="text-xl sm:text-3xl font-black text-purple-700 mt-1 sm:mt-2 block">
            {metrics.pendingRedemptions}
          </span>
          <span className="text-[11px] sm:text-xs text-[#647168] mt-0.5 sm:mt-1 block">Vouchers awaiting fulfillment</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Coins Earned vs Redeemed Trend */}
        <div className="p-6 rounded-3xl bg-white border border-[#E1E9E2] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#17211B]">Economy Volume Trend</h3>
              <p className="text-xs text-[#647168]">Tokens earned vs redeemed across months</p>
            </div>
            <TrendingUp className="w-4 h-4 text-[#168451]" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends}>
                <defs>
                  <linearGradient id="colorEarnedLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#168451" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#168451" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRedeemedLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E1E9E2" />
                <XAxis dataKey="month" stroke="#647168" textAnchor="end" fontSize={11} />
                <YAxis stroke="#647168" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E1E9E2', borderRadius: '0.75rem', color: '#17211B' }}
                  itemStyle={{ fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area
                  type="monotone"
                  dataKey="coinsEarned"
                  name="Coins Earned"
                  stroke="#168451"
                  fillOpacity={1}
                  fill="url(#colorEarnedLight)"
                />
                <Area
                  type="monotone"
                  dataKey="coinsRedeemed"
                  name="Coins Redeemed"
                  stroke="#0284c7"
                  fillOpacity={1}
                  fill="url(#colorRedeemedLight)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Event Type Distribution */}
        <div className="p-6 rounded-3xl bg-white border border-[#E1E9E2] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#17211B]">Contribution Distribution</h3>
              <p className="text-xs text-[#647168]">Share of verified campus actions (%)</p>
            </div>
            <ShieldCheck className="w-4 h-4 text-[#168451]" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E1E9E2" />
                <XAxis dataKey="name" stroke="#647168" fontSize={10} interval={0} />
                <YAxis stroke="#647168" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E1E9E2', borderRadius: '0.75rem', color: '#17211B' }}
                  itemStyle={{ fontSize: 12 }}
                />
                <Bar dataKey="value" name="Contribution Share %" fill="#168451" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Configurable Reward Rules Editor */}
      <div className="rounded-3xl bg-white border border-[#E1E9E2] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-[#E1E9E2] pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#17211B] flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#168451]" />
              Configurable Reward & Penalty Rules
            </h3>
            <p className="text-xs text-[#647168] mt-0.5">
              Adjust coin incentives without touching application source code. Students cannot edit these values.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveRules} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-[#17211B] block mb-1">
                Valid Complaint (CC)
              </label>
              <input
                type="number"
                value={rules.VALID_COMPLAINT}
                onChange={(e) => handleRuleChange('VALID_COMPLAINT', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E1E9E2] rounded-xl text-sm text-[#17211B] focus:outline-none focus:border-[#168451]"
              />
              <span className="text-[11px] text-[#647168] mt-1 block">Default: +20</span>
            </div>

            <div>
              <label className="text-xs font-bold text-[#17211B] block mb-1">
                Useful Evidence (CC)
              </label>
              <input
                type="number"
                value={rules.USEFUL_EVIDENCE}
                onChange={(e) => handleRuleChange('USEFUL_EVIDENCE', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E1E9E2] rounded-xl text-sm text-[#17211B] focus:outline-none focus:border-[#168451]"
              />
              <span className="text-[11px] text-[#647168] mt-1 block">Default: +10</span>
            </div>

            <div>
              <label className="text-xs font-bold text-[#17211B] block mb-1">
                High Impact Issue (CC)
              </label>
              <input
                type="number"
                value={rules.HIGH_IMPACT_ISSUE}
                onChange={(e) => handleRuleChange('HIGH_IMPACT_ISSUE', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E1E9E2] rounded-xl text-sm text-[#17211B] focus:outline-none focus:border-[#168451]"
              />
              <span className="text-[11px] text-[#647168] mt-1 block">Default: +30</span>
            </div>

            <div>
              <label className="text-xs font-bold text-[#17211B] block mb-1">
                Resolution Verified (CC)
              </label>
              <input
                type="number"
                value={rules.RESOLUTION_VERIFICATION}
                onChange={(e) => handleRuleChange('RESOLUTION_VERIFICATION', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E1E9E2] rounded-xl text-sm text-[#17211B] focus:outline-none focus:border-[#168451]"
              />
              <span className="text-[11px] text-[#647168] mt-1 block">Default: +30</span>
            </div>

            <div>
              <label className="text-xs font-bold text-[#17211B] block mb-1">
                Useful Follow-up (CC)
              </label>
              <input
                type="number"
                value={rules.USEFUL_FOLLOW_UP}
                onChange={(e) => handleRuleChange('USEFUL_FOLLOW_UP', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E1E9E2] rounded-xl text-sm text-[#17211B] focus:outline-none focus:border-[#168451]"
              />
              <span className="text-[11px] text-[#647168] mt-1 block">Default: +10</span>
            </div>

            <div>
              <label className="text-xs font-bold text-[#17211B] block mb-1">
                Duplicate Identified (CC)
              </label>
              <input
                type="number"
                value={rules.DUPLICATE_IDENTIFICATION}
                onChange={(e) => handleRuleChange('DUPLICATE_IDENTIFICATION', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E1E9E2] rounded-xl text-sm text-[#17211B] focus:outline-none focus:border-[#168451]"
              />
              <span className="text-[11px] text-[#647168] mt-1 block">Default: +15</span>
            </div>

            <div>
              <label className="text-xs font-bold text-rose-700 block mb-1">
                Spam Penalty (CC)
              </label>
              <input
                type="number"
                value={rules.SPAM_PENALTY}
                onChange={(e) => handleRuleChange('SPAM_PENALTY', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-rose-300 rounded-xl text-sm text-rose-700 focus:outline-none focus:border-rose-500"
              />
              <span className="text-[11px] text-[#647168] mt-1 block">Default: -30</span>
            </div>

            <div>
              <label className="text-xs font-bold text-rose-700 block mb-1">
                Fake Report Penalty (CC)
              </label>
              <input
                type="number"
                value={rules.FAKE_REPORT_PENALTY}
                onChange={(e) => handleRuleChange('FAKE_REPORT_PENALTY', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-rose-300 rounded-xl text-sm text-rose-700 focus:outline-none focus:border-rose-500"
              />
              <span className="text-[11px] text-[#647168] mt-1 block">Default: -50</span>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#E1E9E2]">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={savingRules}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Configuration
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminGamificationPage;
