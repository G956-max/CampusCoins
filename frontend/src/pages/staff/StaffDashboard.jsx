import React, { useState } from 'react';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  ShieldAlert,
  AlertTriangle,
  MapPin,
  User,
  Timer,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import MetricCard from '../../components/dashboard/MetricCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useNavigate, Link } from 'react-router-dom';
import complaintApi from '../../services/complaintApi';
import ComplaintStatusBadge from '../../components/complaints/ComplaintStatusBadge';
import PriorityBadge from '../../components/complaints/PriorityBadge';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Pulling from mock data structured for Phase 3 ticket lifecycle fallback
  const { metrics } = MOCK_STAFF_DATA;
  const [tasks, setTasks] = useState([]);
  const [taskStats, setTaskStats] = useState({
    assigned: metrics.assignedComplaints,
    inProgress: metrics.pendingTasks,
    resolved: metrics.resolvedToday,
    slaAlerts: metrics.slaAlerts,
  });

  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        const res = await complaintApi.getStaffComplaints();
        if (res.data && res.data.length > 0) {
          setTasks(res.data.slice(0, 5));
          const assigned = res.data.filter((c) => c.status === 'assigned').length;
          const inProgress = res.data.filter((c) => c.status === 'in_progress').length;
          const resolved = res.data.filter((c) => ['resolved', 'verified'].includes(c.status)).length;
          const slaAlerts = res.data.filter((c) => ['critical', 'high'].includes(c.priority)).length;
          setTaskStats({ assigned, inProgress, resolved, slaAlerts });
        } else {
          setTasks(MOCK_STAFF_DATA.assignedTasks);
        }
      } catch {
        setTasks(MOCK_STAFF_DATA.assignedTasks);
      }
    };
    fetchAssigned();
  }, []);

  const displayName = profile?.full_name || profile?.name || user?.email?.split('@')[0] || 'David Vance';
  const departmentName = profile?.department?.name || 'Campus Facilities & Maintenance';

  const handleTaskClick = (task) => {
    if (task.tracking_code || (task.id && task.id.length > 10)) {
      navigate(`/staff/complaints/${task.id}`);
    } else {
      setSelectedTask(task);
      setModalOpen(true);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header with real staff profile info */}
      <PageHeader
        title="Department Operations Console"
        subtitle={`Welcome, ${displayName} • ${departmentName} • ${profile?.email || user?.email || 'staff@campus.edu'}`}
        badge={
          <Badge variant="info" size="sm" withDot>
            Staff Portal (Phase 3 Active)
          </Badge>
        }
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<ClipboardList size={16} />}
              onClick={() => navigate('/staff/complaints')}
            >
              Work Orders Queue
            </Button>
          </div>
        }
      />

      {/* ========================================================
          REQUIRED METRICS CARDS:
          - Assigned Complaints
          - Pending Tasks
          - Resolved Today
          - SLA Alerts
          ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Assigned Complaints */}
        <MetricCard
          title="Assigned Complaints"
          value={metrics.assignedComplaints}
          subtitle="Open tickets for your crew"
          icon={ClipboardList}
          color="indigo"
        />

        {/* Pending Tasks */}
        <MetricCard
          title="Pending Tasks"
          value={metrics.pendingTasks}
          subtitle="Awaiting technician visit"
          icon={Clock}
          color="amber"
        />

        {/* Resolved Today */}
        <MetricCard
          title="Resolved Today"
          value={metrics.resolvedToday}
          subtitle="Completed maintenance jobs"
          icon={CheckCircle2}
          color="emerald"
        />

        {/* SLA Alerts */}
        <MetricCard
          title="SLA Alerts"
          value={metrics.slaAlerts}
          subtitle="Near breach deadline (<4h)"
          icon={ShieldAlert}
          color="rose"
        />
      </div>

      {/* Task Queue Preview */}
      <Card className="border-slate-800/80">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Active Assigned Work Queue</CardTitle>
            <p className="text-xs text-slate-400">
              Campus complaints prioritized by urgency and status
            </p>
          </div>
          <Link
            to="/staff/complaints"
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 inline-flex items-center gap-1"
          >
            <span>View All Queue</span>
            <CheckSquare size={14} />
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-slate-800/60">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors cursor-pointer"
                onClick={() => handleTaskClick(task)}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {task.tracking_code || task.id}
                    </span>
                    <Badge variant={task.priorityVariant || 'warning'} size="sm">
                      {task.priority}
                    </Badge>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Timer size={12} className="text-amber-400" />
                      Status: {task.status || 'Assigned'}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-200">
                    {task.title}
                  </h4>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-slate-500" />
                      {task.location || task.general_location || 'Campus Location'}
                    </span>
                    <span className="flex items-center gap-1">
                      <User size={12} className="text-slate-500" />
                      Reported by: {task.student?.full_name || task.reportedBy || 'Student'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 sm:pt-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTaskClick(task);
                    }}
                  >
                    Open Ticket
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Task Details Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedTask ? `${selectedTask.id} - ${selectedTask.title}` : 'Task Details'}
        description="Technician Work Order (Phase 3 Roadmap)"
        footer={
          <Button variant="primary" size="sm" onClick={() => setModalOpen(false)}>
            Close
          </Button>
        }
      >
        {selectedTask && (
          <div className="space-y-4 text-sm text-slate-300">
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block">Location:</span>
                <span className="font-semibold text-slate-200">{selectedTask.location}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Reporter:</span>
                <span className="font-semibold text-slate-200">{selectedTask.reportedBy}</span>
              </div>
              <div>
                <span className="text-slate-500 block">SLA Deadline:</span>
                <span className="font-semibold text-amber-300">{selectedTask.timeRemaining}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Priority:</span>
                <span className="font-semibold text-rose-300">{selectedTask.priority}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              In Phase 3, resolving this ticket will allow uploading before/after proof photos
              directly to Supabase Storage and verifying SLA turnaround.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StaffDashboard;
