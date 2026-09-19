import React, { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  Coins,
  Sparkles,
  AlertCircle,
  MapPin,
  Award,
  ChevronRight,
  TrendingUp,
  Filter,
  Plus,
  Compass,
  User,
  Shield,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import MetricCard from '../../components/dashboard/MetricCard';
import QuickActionCard from '../../components/dashboard/QuickActionCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { MOCK_STUDENT_DATA } from '../../constants/mockData';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const { user, profile, wallet } = useAuth();
  const [modalInfo, setModalInfo] = useState({
    isOpen: false,
    title: '',
    description: '',
    content: '',
  });

  // Complaint mock dataset preserved for Phase 3 ticket lifecycle
  const { metrics, recentComplaints } = MOCK_STUDENT_DATA;

  const displayName = profile?.full_name || profile?.name || user?.email?.split('@')[0] || 'Student';
  const realCoinBalance = wallet?.balance ?? 0;

  const handleActionClick = (title, phase, description) => {
    setModalInfo({
      isOpen: true,
      title: `${title} (${phase})`,
      description: 'Phase Roadmap Preview',
      content: description,
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header with real profile data */}
      <PageHeader
        title={`Welcome back, ${displayName}`}
        subtitle={`Student Portal • ${profile?.email || user?.email || 'student@campus.edu'} • ${profile?.department?.name || 'Computer Science and Engineering'}`}
        badge={
          <Badge variant="gold" size="sm" withDot>
            Phase 2 Supabase Live
          </Badge>
        }
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={16} />}
            onClick={() =>
              handleActionClick(
                'Report an Issue',
                'Phase 3',
                'The full multi-step complaint reporting workflow with photo evidence upload and auto-tagging will be implemented in Phase 3.'
              )
            }
          >
            Report Issue
          </Button>
        }
      />

      {/* ========================================================
          1. REQUIRED METRICS CARDS:
          - My Complaints
          - Pending Complaints
          - Resolved Complaints
          - CampusCoins (Live from Wallets table)
          - Impact Score
          ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* My Complaints */}
        <MetricCard
          title="My Complaints"
          value={metrics.myComplaints}
          subtitle="Total issues submitted"
          icon={FileText}
          color="indigo"
        />

        {/* Pending Complaints */}
        <MetricCard
          title="Pending"
          value={metrics.pendingComplaints}
          subtitle="Under department review"
          icon={Clock}
          color="amber"
        />

        {/* Resolved Complaints */}
        <MetricCard
          title="Resolved"
          value={metrics.resolvedComplaints}
          subtitle="Verified fixes"
          icon={CheckCircle2}
          color="emerald"
        />

        {/* CampusCoins (Live from real Supabase Wallet balance) */}
        <MetricCard
          title="CampusCoins"
          value={realCoinBalance}
          badgeText="CC"
          subtitle="Real Supabase wallet balance"
          icon={Coins}
          color="amber"
        />

        {/* Impact Score */}
        <MetricCard
          title="Impact Score"
          value={`${metrics.impactScore}%`}
          subtitle="Civic contribution score"
          icon={TrendingUp}
          color="sky"
        />
      </div>

      {/* ========================================================
          2. REQUIRED QUICK ACTIONS:
          - Report an Issue
          - View Complaints
          - Campus Map
          - Rewards
          ======================================================== */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Sparkles size={16} className="text-coin-400" />
            Quick Actions
          </h3>
          <span className="text-xs text-slate-400">
            Interactive shortcuts for student workflows
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Action 1: Report an Issue */}
          <QuickActionCard
            title="Report an Issue"
            description="Submit an infrastructure defect with photos and location details."
            icon={AlertCircle}
            badge="Phase 3"
            onClick={() =>
              handleActionClick(
                'Report an Issue',
                'Phase 3',
                'Full Complaint Submission & Evidence Upload to Supabase Storage launches in Phase 3.'
              )
            }
          />

          {/* Action 2: View Complaints */}
          <QuickActionCard
            title="View Complaints"
            description="Inspect the live status, comments, and technician notes of your tickets."
            icon={FileText}
            badge="Phase 3"
            onClick={() =>
              handleActionClick(
                'Complaint Tracking',
                'Phase 3',
                'Real-time complaint tracking and student resolution verification launches in Phase 3.'
              )
            }
          />

          {/* Action 3: Campus Map */}
          <QuickActionCard
            title="Campus Map"
            description="Turn-by-turn navigation between classrooms, labs, and reported incidents."
            icon={Compass}
            badge="Phase 4"
            onClick={() =>
              handleActionClick(
                'Campus Map & Navigation',
                'Phase 4',
                'OpenStreetMap / MapLibre indoor and outdoor route finding with Dijkstra/A* path algorithms will be released in Phase 4.'
              )
            }
          />

          {/* Action 4: Rewards */}
          <QuickActionCard
            title="Rewards Shop"
            description="Redeem your earned CampusCoins for campus canteen discounts & merch."
            icon={Award}
            badge="Phase 5"
            onClick={() =>
              handleActionClick(
                'Rewards & Bounties',
                'Phase 5',
                'The decentralized coin ledger, reward redemption, and bounty contributions will launch in Phase 5.'
              )
            }
          />
        </div>
      </div>

      {/* ========================================================
          3. RECENT ACTIVITY & COMPLAINTS PREVIEW
          ======================================================== */}
      <Card className="border-slate-800/80">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Complaints & Updates</CardTitle>
            <p className="text-xs text-slate-400">
              Your latest submitted tickets and their current resolution status
            </p>
          </div>
          <Badge variant="purple" size="sm">
            Phase 3 Pipeline
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-slate-800/60">
            {recentComplaints.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {item.id}
                    </span>
                    <Badge variant={item.statusVariant} size="sm">
                      {item.status}
                    </Badge>
                    <span className="text-xs text-slate-500 font-medium">
                      &bull; {item.category}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-slate-500" />
                      {item.location}
                    </span>
                    <span>Assigned: {item.assignedDept}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="text-right">
                    <span className="text-xs font-bold text-coin-400 block">
                      +{item.coinsAwarded} Coins
                    </span>
                    <span className="text-[11px] text-slate-500">{item.date}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() =>
                      handleActionClick(
                        `Details: ${item.id}`,
                        'Phase 3',
                        `Detailed lifecycle timeline and technician notes for ticket ${item.id} (${item.title}) will query the complaints table in Phase 3.`
                      )
                    }
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Phase Roadmap Modal */}
      <Modal
        isOpen={modalInfo.isOpen}
        onClose={() => setModalInfo({ ...modalInfo, isOpen: false })}
        title={modalInfo.title}
        description={modalInfo.description}
        footer={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setModalInfo({ ...modalInfo, isOpen: false })}
          >
            Understood
          </Button>
        }
      >
        <div className="space-y-4 text-sm text-slate-300">
          <p className="leading-relaxed">{modalInfo.content}</p>
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs text-slate-400">
            <span className="font-semibold text-slate-200 block">
              Phase 2 Status:
            </span>
            <p>
              Supabase Authentication, Sessions, Wallets, and Database schemas are fully configured.
              Complaint CRUD workflow will be introduced in Phase 3.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentDashboard;
