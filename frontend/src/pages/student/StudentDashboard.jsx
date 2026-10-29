import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  Coins,
  MapPin,
  Award,
  ChevronRight,
  Gift,
  Target,
  Trophy,
  Plus,
  ShieldCheck,
  Map,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import MetricCard from '../../components/dashboard/MetricCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import complaintApi from '../../services/complaintApi';
import { getWallet, getTransactions } from '../../services/gamificationApi';
import { calculateLevelInfo } from '../../config/rewardRules';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [recentComplaints, setRecentComplaints] = useState([]);
  const [complaintStats, setComplaintStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
  });

  const [walletData, setWalletData] = useState(null);
  const [recentLedger, setRecentLedger] = useState([]);
  const [loadingWallet, setLoadingWallet] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [complaintsRes, walletRes, ledgerRes] = await Promise.allSettled([
          complaintApi.getMyComplaints(),
          getWallet(),
          getTransactions({ limit: 4, page: 1 }),
        ]);

        if (complaintsRes.status === 'fulfilled' && complaintsRes.value) {
          const raw = complaintsRes.value;
          const data = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
          setRecentComplaints(data.slice(0, 5));
          const total = data.length;
          const pending = data.filter((c) =>
            ['submitted', 'under_review', 'assigned', 'in_progress'].includes(c.status)
          ).length;
          const resolved = data.filter((c) =>
            ['resolved', 'verified'].includes(c.status)
          ).length;
          setComplaintStats({ total, pending, resolved });
        }

        if (walletRes.status === 'fulfilled' && walletRes.value) {
          setWalletData(walletRes.value);
        }

        if (ledgerRes.status === 'fulfilled' && ledgerRes.value?.data) {
          setRecentLedger(ledgerRes.value.data);
        }
      } catch (err) {
        console.warn('Dashboard data fetch note:', err);
      } finally {
        setLoadingWallet(false);
      }
    };

    fetchDashboardData();
  }, []);

  const displayName = profile?.full_name || profile?.name || user?.email?.split('@')[0] || 'Student';
  const levelInfo = calculateLevelInfo(walletData?.xp || 0);

  return (
    <div className="space-y-5 animate-fadeIn max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title={`Welcome back, ${displayName}`}
        subtitle={`Student Portal • ${profile?.department?.name || 'Computer Science and Engineering'}`}
        badge={
          <Badge variant="success" size="sm" withDot>
            Active Contributor
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FileText size={14} />}
              onClick={() => navigate('/student/complaints')}
            >
              My Complaints
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={14} />}
              onClick={() => navigate('/student/complaints/new')}
            >
              Report Defect
            </Button>
          </div>
        }
      />

      {/* PROMINENT CAMPUSCOINS HERO CARD */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white via-white to-[#EAF6EE] border border-[#CBE7D4] p-4 sm:p-6 shadow-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#168451]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          {/* Left Column: Balance & Civic Standing */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#EAF6EE] text-[#168451] border border-[#CBE7D4] shadow-xs">
                <Coins className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#168451]">
                  CampusCoin Wallet & Ledger
                </span>
                <h2 className="text-[11px] text-[#647168]">Verified Civic Token Economy</h2>
              </div>
            </div>

            <div className="flex flex-wrap items-baseline gap-2.5">
              <span className="text-3xl sm:text-4xl font-black text-[#17211B] tracking-tight">
                {loadingWallet ? '...' : (walletData?.balance || 0).toLocaleString()}
              </span>
              <span className="text-[#168451] font-bold text-lg sm:text-xl">CampusCoins</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EAF6EE] text-[#168451] border border-[#CBE7D4] font-semibold">
                +{walletData?.lifetime_earned || 0} earned
              </span>
            </div>

            {/* Level & Impact Score Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-[#E1E9E2] text-[#17211B] text-[11px] font-semibold shadow-xs">
                <Award className="w-3.5 h-3.5 text-[#168451]" />
                <span>Level {levelInfo.currentLevel}: {levelInfo.currentLevelName}</span>
                <span className="text-[#647168] font-mono">({levelInfo.currentXP} XP)</span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-[#E1E9E2] text-[#17211B] text-[11px] font-semibold shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1E6091]" />
                <span>Impact: {walletData?.impact_score || 0} pts</span>
              </div>
            </div>
          </div>

          {/* Right Column: Direct Quick-Access Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1 lg:w-96 shrink-0">
            <Link
              to="/student/wallet"
              className="p-3 rounded-xl bg-white hover:bg-[#F7FAF7] border border-[#E1E9E2] text-[#17211B] flex items-center justify-between text-xs font-bold transition-all shadow-xs group hover:border-[#168451]"
            >
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-[#B7791F]" />
                <span>Wallet</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#647168] group-hover:text-[#168451]" />
            </Link>

            <Link
              to="/student/rewards"
              className="p-3 rounded-xl bg-[#168451] hover:bg-[#116B42] text-white flex items-center justify-between text-xs font-bold transition-all shadow-xs group"
            >
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4" />
                <span>Store</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-white" />
            </Link>

            <Link
              to="/student/map"
              className="p-3 rounded-xl bg-white hover:bg-[#F7FAF7] border border-[#E1E9E2] text-[#17211B] flex items-center justify-between text-xs font-bold transition-all shadow-xs group hover:border-[#168451]"
            >
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4 text-[#168451]" />
                <span>Campus Map</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#647168] group-hover:text-[#168451]" />
            </Link>

            <Link
              to="/student/missions"
              className="p-3 rounded-xl bg-white hover:bg-[#F7FAF7] border border-[#E1E9E2] text-[#17211B] flex items-center justify-between text-xs font-bold transition-all shadow-xs group hover:border-[#168451]"
            >
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#168451]" />
                <span>Missions</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#647168] group-hover:text-[#168451]" />
            </Link>
          </div>
        </div>
      </div>

      {/* Complaint Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <MetricCard
          title="Total Reports"
          value={complaintStats.total}
          subtitle="Submitted tickets"
          icon={FileText}
          color="indigo"
        />
        <MetricCard
          title="In Progress"
          value={complaintStats.pending}
          subtitle="Technician on-site"
          icon={Clock}
          color="amber"
        />
        <MetricCard
          title="Resolved"
          value={complaintStats.resolved}
          subtitle="Verified by student"
          icon={CheckCircle2}
          color="emerald"
        />
        <MetricCard
          title="Campus Rank"
          value={walletData?.impact_score ? `#1` : `#--`}
          subtitle="Leaderboard"
          icon={Trophy}
          color="sky"
        />
      </div>

      {/* Main Grid: Recent Activity & Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Complaints */}
        <div className="lg:col-span-2">
          <Card className="border-[#E1E9E2]">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Maintenance Complaints</CardTitle>
                <p className="text-xs text-[#647168]">
                  Track progress and verify completed repairs to earn coins
                </p>
              </div>
              <Link
                to="/student/complaints"
                className="text-xs font-semibold text-[#168451] hover:text-[#116B42] inline-flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight size={14} />
              </Link>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-[#E1E9E2]">
                {recentComplaints.length === 0 ? (
                  <div className="p-8 text-center text-[#647168] text-xs">
                    No complaints submitted yet.{' '}
                    <Link to="/student/complaints/new" className="text-[#168451] font-semibold underline">
                      Report an issue
                    </Link>
                  </div>
                ) : (
                  recentComplaints.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F7FAF7] transition-colors cursor-pointer"
                      onClick={() => navigate(`/student/complaints/${item.id}`)}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#647168]">
                            {item.tracking_code || item.id.substring(0, 8)}
                          </span>
                          <Badge variant={item.statusVariant || 'default'} size="sm">
                            {item.status}
                          </Badge>
                          <span className="text-xs text-[#647168] font-medium">
                            &bull; {item.category}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-[#17211B]">{item.title}</h4>
                        <div className="flex items-center gap-4 text-xs text-[#647168]">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} className="text-[#647168]" />
                            {item.building?.name || item.general_location || 'Campus Location'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E1E9E2]">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/student/complaints/${item.id}`);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Recent Ledger Feed */}
        <div>
          <Card className="border-[#E1E9E2]">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Coin Activity</CardTitle>
                <p className="text-xs text-[#647168]">Transactions & verified contributions</p>
              </div>
              <Link
                to="/student/wallet/transactions"
                className="text-xs font-semibold text-[#168451] hover:text-[#116B42] inline-flex items-center gap-1"
              >
                <span>Ledger</span>
                <ChevronRight size={14} />
              </Link>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-[#E1E9E2]">
                {recentLedger.length === 0 ? (
                  <div className="p-6 text-center text-[#647168] text-xs">
                    No transactions yet. Verify reports to earn coins!
                  </div>
                ) : (
                  recentLedger.map((tx) => {
                    const isPositive = tx.amount > 0;
                    return (
                      <div key={tx.id} className="p-3.5 hover:bg-[#F7FAF7] transition-colors flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-[#17211B] line-clamp-1">
                            {tx.description}
                          </p>
                          <p className="text-[10px] text-[#647168] font-mono capitalize">
                            {tx.event_type}
                          </p>
                        </div>
                        <span className={`text-xs font-bold shrink-0 ${isPositive ? 'text-[#168451]' : 'text-[#C43D3D]'}`}>
                          {isPositive ? `+${tx.amount}` : tx.amount} CC
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
