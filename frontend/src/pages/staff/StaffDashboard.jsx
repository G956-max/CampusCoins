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
import { MOCK_STAFF_DATA } from '../../constants/mockData';
import { useAuth } from '../../context/AuthContext';

const StaffDashboard = () => {
  const { user, profile } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Pulling from mock data structured for Phase 3 ticket lifecycle
  const { metrics, assignedTasks } = MOCK_STAFF_DATA;

  const displayName = profile?.full_name || profile?.name || user?.email?.split('@')[0] || 'David Vance';
  const departmentName = profile?.department?.name || 'Campus Facilities & Maintenance';

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header with real staff profile info */}
      <PageHeader
        title="Department Operations Console"
        subtitle={`Welcome, ${displayName} • ${departmentName} • ${profile?.email || user?.email || 'staff@campus.edu'}`}
        badge={
          <Badge variant="info" size="sm" withDot>
            Staff Portal (Phase 2)
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="warning" size="sm">
              2 Urgent SLAs
            </Badge>
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
              Campus complaints prioritized by urgency and SLA expiration
            </p>
          </div>
          <Badge variant="purple" size="sm">
            Phase 3 Ticket Dispatch
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-slate-800/60">
            {assignedTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {task.id}
                    </span>
                    <Badge variant={task.priorityVariant} size="sm">
                      {task.priority} Priority
                    </Badge>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Timer size={12} className="text-amber-400" />
                      SLA: {task.timeRemaining}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-200">
                    {task.title}
                  </h4>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-slate-500" />
                      {task.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <User size={12} className="text-slate-500" />
                      Reported by: {task.reportedBy}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 sm:pt-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTaskClick(task)}
                  >
                    Details
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleTaskClick(task)}
                    leftIcon={<CheckSquare size={14} />}
                  >
                    Mark Resolved
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
