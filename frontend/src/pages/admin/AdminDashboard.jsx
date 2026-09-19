import React, { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Coins,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Users,
  Download,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import PageHeader from '../../components/common/PageHeader';
import MetricCard from '../../components/dashboard/MetricCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { MOCK_ADMIN_DATA } from '../../constants/mockData';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user, profile } = useAuth();
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Structured for straightforward substitution by API calls in Phase 3
  const { metrics, categoryBreakdown, recentPlatformActivity } = MOCK_ADMIN_DATA;

  const displayName = profile?.full_name || profile?.name || user?.email?.split('@')[0] || 'Dr. Eleanor Vance';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <PageHeader
        title="Executive Campus Oversight"
        subtitle={`Campus-wide incident metrics, SLA performance, and CampusCoins token distribution • ${displayName} (${profile?.email || user?.email || 'admin.office@campus.edu'})`}
        badge={
          <Badge variant="purple" size="sm" withDot>
            SuperAdmin Console (Phase 2)
          </Badge>
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download size={14} />}
            onClick={() => setExportModalOpen(true)}
          >
            Export Report
          </Button>
        }
      />

      {/* ========================================================
          REQUIRED ADMIN METRICS CARDS:
          - Total Complaints
          - Pending
          - Resolved
          - Critical Issues
          - Coins Distributed
          ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Complaints */}
        <MetricCard
          title="Total Complaints"
          value={metrics.totalComplaints}
          subtitle="All-time campus tickets"
          icon={FileText}
          color="indigo"
        />

        {/* Pending */}
        <MetricCard
          title="Pending"
          value={metrics.pending}
          subtitle="Open work in progress"
          icon={Clock}
          color="amber"
        />

        {/* Resolved */}
        <MetricCard
          title="Resolved"
          value={metrics.resolved}
          subtitle="Verified closed tickets"
          icon={CheckCircle2}
          color="emerald"
        />

        {/* Critical Issues */}
        <MetricCard
          title="Critical Issues"
          value={metrics.criticalIssues}
          subtitle="Hazard / emergency alerts"
          icon={AlertOctagon}
          color="rose"
        />

        {/* Coins Distributed */}
        <MetricCard
          title="Coins Distributed"
          value={metrics.coinsDistributed.toLocaleString()}
          badgeText="CC"
          subtitle="Total student incentives"
          icon={Coins}
          color="amber"
        />
      </div>

      {/* Chart & Live Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recharts Complaint Category Breakdown */}
        <Card className="lg:col-span-7 border-slate-800/80">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Complaints by Department Category</CardTitle>
              <p className="text-xs text-slate-400">
                Ticket volume across infrastructure divisions
              </p>
            </div>
            <Badge variant="gold" size="sm">
              Live Aggregate
            </Badge>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="complaints" radius={[6, 6, 0, 0]}>
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Platform Activity Feed */}
        <Card className="lg:col-span-5 border-slate-800/80">
          <CardHeader>
            <CardTitle>Real-Time Campus Activity</CardTitle>
            <p className="text-xs text-slate-400">
              Live events, ticket movements, and coin rewards
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-800/60">
              {recentPlatformActivity.map((activity) => (
                <div key={activity.id} className="p-4 flex items-start gap-3 text-xs">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold shrink-0 mt-0.5">
                    {activity.user.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-200">
                        {activity.user}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {activity.time}
                      </span>
                    </div>
                    <p className="text-slate-300 font-medium mt-0.5">
                      {activity.action}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {activity.context}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Dialog */}
      <Modal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Export Campus Analytics"
        description="Comprehensive report generation for campus governance"
        footer={
          <Button variant="primary" size="sm" onClick={() => setExportModalOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            In Phase 2, automated PDF/CSV report exports will query aggregated ticket volumes,
            average resolution turnaround times, technician SLA compliance, and token ledger flows
            from the Supabase database.
          </p>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-400">
            Total records ready for compilation: 342 tickets &bull; 15,850 CC
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
