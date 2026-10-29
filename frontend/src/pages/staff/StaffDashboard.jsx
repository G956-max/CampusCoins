import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  ShieldAlert,
  MapPin,
  User,
  Timer,
  CheckSquare,
  QrCode,
  Map,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import MetricCard from '../../components/dashboard/MetricCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { useNavigate, Link } from 'react-router-dom';
import complaintApi from '../../services/complaintApi';
import ComplaintStatusBadge from '../../components/complaints/ComplaintStatusBadge';
import PriorityBadge from '../../components/complaints/PriorityBadge';
import { useAuth } from '../../context/AuthContext';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [taskStats, setTaskStats] = useState({
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    slaAlerts: 0,
  });

  useEffect(() => {
    const fetchAssigned = async () => {
      setIsLoading(true);
      try {
        const res = await complaintApi.getStaffComplaints({ limit: 20 });
        const data = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : (res?.complaints || []));
        setTasks(data);

        const assigned = data.filter((c) => c.status === 'assigned').length;
        const inProgress = data.filter((c) => c.status === 'in_progress').length;
        const resolved = data.filter((c) => ['resolved', 'verified'].includes(c.status)).length;
        const slaAlerts = data.filter((c) => ['critical', 'high', 'urgent'].includes(c.priority)).length;

        setTaskStats({ assigned, inProgress, resolved, slaAlerts });
      } catch (err) {
        console.error('Error fetching staff tasks:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssigned();
  }, []);

  const displayName = profile?.full_name || profile?.name || user?.email?.split('@')[0] || 'David Vance';
  const departmentName = profile?.department?.name || 'Facilities & Infrastructure';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header with real staff profile info */}
      <PageHeader
        title="Department Operations Console"
        subtitle={`Welcome, ${displayName} • ${departmentName} • ${profile?.email || user?.email || 'staff@campus.edu'}`}
        badge={
          <Badge variant="success" size="sm" withDot>
            Maintenance Operations
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<QrCode size={15} />}
              onClick={() => navigate('/staff/verify-voucher')}
            >
              Verify Voucher
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<ClipboardList size={15} />}
              onClick={() => navigate('/staff/complaints')}
            >
              Work Orders Queue
            </Button>
          </div>
        }
      />

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Assigned Tickets"
          value={taskStats.assigned}
          subtitle="Awaiting technician response"
          icon={ClipboardList}
          color="indigo"
        />
        <MetricCard
          title="In Progress"
          value={taskStats.inProgress}
          subtitle="Work currently on-site"
          icon={Clock}
          color="amber"
        />
        <MetricCard
          title="Resolved Tickets"
          value={taskStats.resolved}
          subtitle="Successfully completed"
          icon={CheckCircle2}
          color="emerald"
        />
        <MetricCard
          title="High Priority / SLA"
          value={taskStats.slaAlerts}
          subtitle="Urgent campus issues"
          icon={ShieldAlert}
          color="rose"
        />
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card hover className="p-5 flex items-center justify-between border-[#E1E9E2]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF6EE] text-[#168451] border border-[#CBE7D4] flex items-center justify-center">
              <QrCode size={20} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#17211B]">Canteen & Store Voucher Scanner</h4>
              <p className="text-xs text-[#647168]">Verify single-use student redemption QR vouchers</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => navigate('/staff/verify-voucher')}>
            Open Scanner
          </Button>
        </Card>

        <Card hover className="p-5 flex items-center justify-between border-[#E1E9E2]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF6EE] text-[#168451] border border-[#CBE7D4] flex items-center justify-center">
              <Map size={20} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#17211B]">Campus Infrastructure Map</h4>
              <p className="text-xs text-[#647168]">Navigate to buildings, floors, and reported issue pins</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => navigate('/staff/map')}>
            View Map
          </Button>
        </Card>
      </div>

      {/* Task Queue Preview */}
      <Card className="border-[#E1E9E2]">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Assigned Work Queue</CardTitle>
            <p className="text-xs text-[#647168]">
              Active campus complaints assigned to your department account
            </p>
          </div>
          <Link
            to="/staff/complaints"
            className="text-xs font-semibold text-[#168451] hover:text-[#116B42] inline-flex items-center gap-1"
          >
            <span>View Full Queue</span>
            <CheckSquare size={14} />
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-[#647168]">
              Loading work queue...
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-8 text-center">
              <ClipboardList size={32} className="mx-auto text-[#647168]/40 mb-2" />
              <p className="text-sm font-semibold text-[#17211B]">No open work tickets</p>
              <p className="text-xs text-[#647168] mt-1">All assigned campus tickets are completed.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E1E9E2]">
              {tasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F7FAF7] transition-colors cursor-pointer"
                  onClick={() => navigate(`/staff/complaints/${task.id}`)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#647168]">
                        {task.tracking_code || task.id.substring(0, 8)}
                      </span>
                      <PriorityBadge priority={task.priority} />
                      <ComplaintStatusBadge status={task.status} />
                    </div>

                    <h4 className="text-sm font-semibold text-[#17211B]">
                      {task.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#647168]">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-[#647168]" />
                        {task.building?.name || task.general_location || 'Campus Location'}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={12} className="text-[#647168]" />
                        Reported by: {task.student?.full_name || 'Student'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 sm:pt-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/staff/complaints/${task.id}`);
                      }}
                    >
                      Update Work
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffDashboard;
