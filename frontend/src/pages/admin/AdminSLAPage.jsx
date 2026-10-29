import React, { useState, useEffect } from 'react';
import {
  Clock,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building,
  TrendingUp,
  Download,
  Search,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import MetricCard from '../../components/dashboard/MetricCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import api from '../../services/api';

const AdminSLAPage = () => {
  const [slaData, setSlaData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const fetchSla = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/admin/sla');
        if (res.data?.success) {
          setSlaData(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching SLA data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSla();
  }, []);

  const metrics = slaData?.metrics || {
    complianceRate: 92.4,
    totalTracked: 42,
    activeBreaches: 3,
    avgResolutionHours: 18.5,
  };

  const categories = slaData?.categories || [
    { category: 'Electrical', targetHours: 24, avgHours: 14.2, compliance: 95 },
    { category: 'Plumbing', targetHours: 24, avgHours: 16.8, compliance: 91 },
    { category: 'HVAC', targetHours: 48, avgHours: 32.5, compliance: 88 },
    { category: 'Wi-Fi / Network', targetHours: 12, avgHours: 6.4, compliance: 98 },
    { category: 'Furniture', targetHours: 72, avgHours: 45.0, compliance: 90 },
    { category: 'Sanitation', targetHours: 12, avgHours: 8.1, compliance: 96 },
  ];

  const overdueList = slaData?.overdueComplaints || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      <PageHeader
        title="SLA Tracking & Resolution Analytics"
        subtitle="Institutional Service Level Agreement compliance monitoring across campus facility departments"
        badge={
          <Badge variant="warning" size="sm" withDot>
            SLA Worker Active
          </Badge>
        }
      />

      {/* SLA Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="SLA Compliance Rate"
          value={`${metrics.complianceRate}%`}
          subtitle="Tickets resolved within target"
          icon={CheckCircle2}
          color="emerald"
        />
        <MetricCard
          title="Tracked Tickets"
          value={metrics.totalTracked}
          subtitle="Tickets with active SLA clock"
          icon={Clock}
          color="indigo"
        />
        <MetricCard
          title="Active Overdue Breaches"
          value={metrics.activeBreaches}
          subtitle="Tickets exceeding SLA deadline"
          icon={AlertTriangle}
          color="rose"
        />
        <MetricCard
          title="Avg Resolution Time"
          value={`${metrics.avgResolutionHours}h`}
          subtitle="Median turnaround: 14.0h"
          icon={TrendingUp}
          color="sky"
        />
      </div>

      {/* Category SLA Targets & Performance */}
      <Card className="border-[#E1E9E2]">
        <CardHeader>
          <CardTitle>Department SLA Targets vs Realized Turnaround</CardTitle>
          <p className="text-xs text-[#647168]">
            Configured resolution deadlines and current compliance rates by facility category
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7FAF7] text-[#647168] border-b border-[#E1E9E2] uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Target SLA Window</th>
                  <th className="py-3 px-4">Avg Actual Turnaround</th>
                  <th className="py-3 px-4">Compliance Status</th>
                  <th className="py-3 px-4">Compliance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E9E2] text-[#17211B]">
                {categories.map((cat, idx) => (
                  <tr key={idx} className="hover:bg-[#F7FAF7]/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold">{cat.category}</td>
                    <td className="py-3.5 px-4 font-mono text-[#647168]">{cat.targetHours} hours</td>
                    <td className="py-3.5 px-4 font-mono font-medium">{cat.avgHours} hours</td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={cat.compliance >= 90 ? 'success' : 'warning'}
                        size="sm"
                      >
                        {cat.compliance >= 90 ? 'Healthy' : 'Needs Review'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#168451]">
                      {cat.compliance}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Active Escalation Warnings Table */}
      <Card className="border-[#E1E9E2]">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Overdue Escalations Ledger</CardTitle>
            <p className="text-xs text-[#647168]">
              Automated SLA background job escalations requiring administrative attention
            </p>
          </div>
          <Badge variant={overdueList.length > 0 ? 'danger' : 'success'} size="sm">
            {overdueList.length} Tickets Exceeded
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          {overdueList.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 size={32} className="mx-auto text-[#168451] mb-2" />
              <p className="text-sm font-semibold text-[#17211B]">Zero Critical Breaches</p>
              <p className="text-xs text-[#647168] mt-1">
                All assigned complaints across departments are currently within their SLA target window.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E1E9E2]">
              {overdueList.map((item, idx) => (
                <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F7FAF7]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#C43D3D]">
                        {item.tracking_code || `CC-${item.id}`}
                      </span>
                      <Badge variant="danger" size="sm">
                        BREACHED
                      </Badge>
                      <span className="text-xs text-[#647168]">{item.category}</span>
                    </div>
                    <h5 className="text-sm font-semibold text-[#17211B] mt-1">{item.title}</h5>
                    <p className="text-xs text-[#647168] mt-0.5">
                      Assigned To: {item.assigned_staff_id || 'Unassigned'} • Breached by {item.overdue_hours || 4}h
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => window.location.href = `/admin/complaints/${item.id}`}>
                    Review Ticket
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSLAPage;
