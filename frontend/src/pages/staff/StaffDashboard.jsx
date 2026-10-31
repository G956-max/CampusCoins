import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  RefreshCw,
  Search,
  Eye,
  Wrench,
  CheckSquare,
  FileText,
  ExternalLink,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import MetricCard from '../../components/dashboard/MetricCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ComplaintStatusBadge from '../../components/complaints/ComplaintStatusBadge';
import PriorityBadge from '../../components/complaints/PriorityBadge';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabase';
import complaintApi from '../../services/complaintApi';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'assigned' | 'in_progress' | 'completed'

  // Mark Completed Modal State
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [resolutionComment, setResolutionComment] = useState('');
  const [completionFile, setCompletionFile] = useState(null);
  const [completionFilePreview, setCompletionFilePreview] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Evidence Preview Modal State
  const [previewImage, setPreviewImage] = useState(null);

  const staffId = user?.id || 'b8000000-0000-0000-0000-000000000002';
  const staffName = profile?.full_name || profile?.name || 'David Vance (Building Incharge)';

  // Load Assigned Tasks
  const loadAssignedTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      let list = [];

      // 1. Try backend API
      try {
        const res = await complaintApi.getStaffComplaints({ limit: 100 });
        const data = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
        if (data.length > 0) list = data;
      } catch (apiErr) {
        console.warn('Backend API getStaffComplaints notice:', apiErr);
      }

      // 2. Direct Supabase Query (Fetch tickets assigned to this staff or general assigned)
      if (list.length === 0 && supabase) {
        try {
          const { data: supaTasks, error: supaErr } = await supabase
            .from('complaints')
            .select(`
              *,
              building:buildings(name, code),
              floor:floors(floor_name),
              room:rooms(room_number),
              student:profiles!student_id(full_name, email)
            `)
            .or(`assigned_staff_id.eq.${staffId},status.in.(assigned,in_progress,resolved)`)
            .order('created_at', { ascending: false });

          if (!supaErr && supaTasks) {
            // Also fetch evidence
            const taskIds = supaTasks.map((t) => t.id);
            let evidenceMap = {};
            if (taskIds.length > 0) {
              const { data: evList } = await supabase
                .from('complaint_evidence')
                .select('*')
                .in('complaint_id', taskIds);
              if (evList) {
                evList.forEach((ev) => {
                  if (!evidenceMap[ev.complaint_id]) evidenceMap[ev.complaint_id] = [];
                  evidenceMap[ev.complaint_id].push(ev);
                });
              }
            }

            list = supaTasks.map((t) => ({
              ...t,
              evidence: evidenceMap[t.id] || [],
            }));
          }
        } catch (supaCatch) {
          console.warn('Direct Supabase fetch catch:', supaCatch);
        }
      }

      setTasks(list);
    } catch (err) {
      console.error('Failed to load assigned tasks:', err);
      setError('Failed to load assigned tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignedTasks();
  }, []);

  // Filter Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Tab filter
      if (activeTab === 'assigned' && t.status !== 'assigned') return false;
      if (activeTab === 'in_progress' && t.status !== 'in_progress') return false;
      if (activeTab === 'completed' && !['resolved', 'verified', 'closed'].includes(t.status)) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title?.toLowerCase().includes(q);
        const matchCode = t.tracking_code?.toLowerCase().includes(q);
        const matchDesc = t.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchDesc) return false;
      }

      return true;
    });
  }, [tasks, activeTab, searchQuery]);

  // Statistics
  const counts = useMemo(() => {
    const total = tasks.length;
    const assigned = tasks.filter((t) => t.status === 'assigned').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const completed = tasks.filter((t) => ['resolved', 'verified', 'closed'].includes(t.status)).length;

    return { total, assigned, inProgress, completed };
  }, [tasks]);

  // Action: Start Work (Mark In Progress)
  const handleStartWork = async (task) => {
    setActionLoading(true);
    try {
      // 1. Try Backend API
      try {
        await complaintApi.startWork(task.id);
      } catch (apiErr) {
        console.warn('Backend API startWork notice:', apiErr);
      }

      // 2. Direct Supabase Update
      if (supabase) {
        await supabase
          .from('complaints')
          .update({
            status: 'in_progress',
            assigned_staff_id: staffId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', task.id);

        await supabase.from('complaint_updates').insert({
          complaint_id: task.id,
          updated_by: staffId,
          status: 'in_progress',
          comment: `Staff member (${staffName}) started maintenance work on-site.`,
        });
      }

      await loadAssignedTasks();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Open Mark Completed Modal
  const openCompleteModal = (task) => {
    setSelectedTask(task);
    setResolutionComment('Issue repaired and verified on-site. Ready for administrator sign-off.');
    setCompletionFile(null);
    setCompletionFilePreview('');
    setCompleteModalOpen(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompletionFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setCompletionFilePreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setCompletionFilePreview('');
    }
  };

  // Action: Mark as Completed (Mark Resolved + Upload Proof Photo)
  const handleCompleteTask = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;

    setActionLoading(true);
    try {
      let fileUrl = '';

      // Upload resolution proof photo if selected
      if (completionFile && supabase) {
        try {
          const sanitizedName = completionFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const filePath = `${selectedTask.id}/resolution_${Date.now()}_${sanitizedName}`;
          const { error: storageErr } = await supabase.storage.from('complaints').upload(filePath, completionFile, {
            contentType: completionFile.type,
            upsert: true,
          });
          if (!storageErr) {
            fileUrl = supabase.storage.from('complaints').getPublicUrl(filePath).data?.publicUrl || '';
          }
        } catch (stErr) {
          console.warn('Storage upload notice:', stErr);
        }

        if (!fileUrl && completionFile.type.startsWith('image/')) {
          fileUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target.result);
            reader.onerror = () => resolve('');
            reader.readAsDataURL(completionFile);
          });
        }

        if (fileUrl) {
          await supabase.from('complaint_evidence').insert({
            complaint_id: selectedTask.id,
            file_url: fileUrl,
            file_type: completionFile.type,
            file_name: completionFile.name,
            uploaded_by: staffId,
            evidence_type: 'resolution',
          });
        }
      }

      // 1. Try Backend API
      try {
        await complaintApi.resolveComplaint(selectedTask.id, resolutionComment);
      } catch (apiErr) {
        console.warn('Backend API resolveComplaint notice:', apiErr);
      }

      // 2. Direct Supabase Update
      if (supabase) {
        await supabase
          .from('complaints')
          .update({
            status: 'resolved',
            resolution_comment: resolutionComment,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedTask.id);

        await supabase.from('complaint_updates').insert({
          complaint_id: selectedTask.id,
          updated_by: staffId,
          status: 'resolved',
          comment: `Building Incharge (${staffName}) marked task as completed with photo evidence. Remark: ${resolutionComment}`,
        });
      }

      setCompleteModalOpen(false);
      setSelectedTask(null);
      setCompletionFile(null);
      setCompletionFilePreview('');
      await loadAssignedTasks();
    } catch (err) {
      alert('Error completing task: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title="My Assigned Maintenance Tasks"
        subtitle={`Welcome, ${staffName} • Track issues assigned to you by Admin, start work, and mark them completed.`}
        badge={
          <Badge variant="success" size="sm" withDot>
            Building Incharge Console
          </Badge>
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
            onClick={loadAssignedTasks}
            disabled={loading}
          >
            Refresh Tasks
          </Button>
        }
      />

      {/* METRIC COUNTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Assigned to Me"
          value={counts.assigned}
          subtitle="New tasks awaiting start"
          icon={ClipboardList}
          color="indigo"
        />
        <MetricCard
          title="In Progress"
          value={counts.inProgress}
          subtitle="Currently working on-site"
          icon={Clock}
          color="amber"
        />
        <MetricCard
          title="Completed / Solved"
          value={counts.completed}
          subtitle="Awaiting admin final sign-off"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* WORK ORDERS LIST */}
      <Card className="border-[#E1E9E2] bg-white shadow-xs overflow-hidden">
        {/* Filter Bar */}
        <div className="border-b border-[#E1E9E2] px-4 pt-3 pb-2 flex flex-wrap items-center justify-between gap-3 bg-[#F7FAF7]/60">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-[#168451] text-white shadow-xs'
                  : 'text-[#647168] hover:text-[#17211B] hover:bg-white'
              }`}
            >
              All Assigned ({counts.total})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('assigned')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'assigned'
                  ? 'bg-[#C43D3D] text-white shadow-xs'
                  : 'text-[#647168] hover:text-[#C43D3D] hover:bg-white'
              }`}
            >
              <ClipboardList size={13} />
              To Start ({counts.assigned})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('in_progress')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'in_progress'
                  ? 'bg-[#1E6091] text-white shadow-xs'
                  : 'text-[#647168] hover:text-[#1E6091] hover:bg-white'
              }`}
            >
              <Clock size={13} />
              In Progress ({counts.inProgress})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'completed'
                  ? 'bg-[#168451] text-white shadow-xs'
                  : 'text-[#647168] hover:text-[#168451] hover:bg-white'
              }`}
            >
              <CheckCircle2 size={13} />
              Completed ({counts.completed})
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#647168]" />
            <input
              type="text"
              placeholder="Search code or issue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#E1E9E2] rounded-xl text-xs text-[#17211B] focus:outline-hidden focus:border-[#168451]"
            />
          </div>
        </div>

        {/* Task Cards */}
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="py-16 text-center text-xs text-[#647168]">
              <RefreshCw size={22} className="animate-spin mx-auto text-[#168451] mb-2" />
              Loading assigned tasks...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#647168] bg-[#F7FAF7] rounded-2xl border border-dashed border-[#E1E9E2]">
              <ClipboardList size={32} className="mx-auto text-[#A4B3A8] mb-2" />
              <p className="font-semibold text-sm text-[#17211B]">No work orders in this view</p>
              <p className="text-[11px] text-[#647168] mt-1">
                {activeTab === 'assigned'
                  ? 'You have started all assigned maintenance tickets.'
                  : 'Tasks assigned to you by Admin will appear here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => {
                const evidenceList = task.evidence || [];
                const firstEvidence = evidenceList[0];

                return (
                  <div
                    key={task.id}
                    className="p-4 rounded-2xl bg-white border border-[#E1E9E2] hover:border-[#168451]/50 shadow-2xs hover:shadow-xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    {/* Left: Info */}
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      {/* Photo Thumbnail */}
                      {firstEvidence?.file_url ? (
                        <div
                          onClick={() => setPreviewImage(firstEvidence.file_url)}
                          className="w-16 h-16 rounded-xl overflow-hidden bg-[#F7FAF7] border border-[#E1E9E2] shrink-0 cursor-pointer group/img relative"
                          title="Click to preview evidence"
                        >
                          <img
                            src={firstEvidence.file_url}
                            alt="Evidence"
                            className="w-full h-full object-cover group-hover/img:scale-110 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-white">
                            <Eye size={16} />
                          </div>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-[#F7FAF7] border border-[#E1E9E2] shrink-0 flex flex-col items-center justify-center text-[#A4B3A8]">
                          <FileText size={20} />
                          <span className="text-[9px] mt-0.5">No Photo</span>
                        </div>
                      )}

                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-[#168451] bg-[#EAF6EE] px-2 py-0.5 rounded-md">
                            {task.tracking_code || 'CC-TICKET'}
                          </span>
                          <ComplaintStatusBadge status={task.status} />
                          <PriorityBadge priority={task.priority || 'medium'} />
                          <span className="text-[11px] font-medium text-[#647168] bg-[#F7FAF7] border border-[#E1E9E2] px-2 py-0.5 rounded-md">
                            {task.category || 'Maintenance'}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-[#17211B] truncate">
                          {task.title}
                        </h4>

                        <div className="flex items-center gap-1.5 text-xs text-[#647168]">
                          <MapPin size={13} className="text-[#168451] shrink-0" />
                          <span className="truncate">
                            {task.general_location ||
                              [task.building?.name, task.floor?.floor_name, task.room?.room_number]
                                .filter(Boolean)
                                .join(' • ') ||
                              'Campus Location'}
                          </span>
                        </div>

                        <p className="text-xs text-[#647168] line-clamp-1 pt-0.5">
                          {task.description}
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Action 1: If assigned, Start Work */}
                      {task.status === 'assigned' && (
                        <Button
                          size="sm"
                          variant="primary"
                          leftIcon={<Wrench size={14} />}
                          onClick={() => handleStartWork(task)}
                          loading={actionLoading}
                        >
                          Start Work
                        </Button>
                      )}

                      {/* Action 2: If in_progress, Mark as Completed */}
                      {task.status === 'in_progress' && (
                        <Button
                          size="sm"
                          variant="success"
                          leftIcon={<CheckSquare size={14} />}
                          onClick={() => openCompleteModal(task)}
                          loading={actionLoading}
                        >
                          Mark Completed
                        </Button>
                      )}

                      {/* Status indicator if resolved or verified */}
                      {task.status === 'resolved' && (
                        <span className="text-xs font-bold text-[#168451] bg-[#EAF6EE] px-3 py-1.5 rounded-xl border border-[#CBE7D4] flex items-center gap-1.5">
                          <CheckCircle2 size={14} />
                          Completed • Awaiting Admin Sign-Off
                        </span>
                      )}

                      {['verified', 'closed'].includes(task.status) && (
                        <span className="text-xs font-bold text-[#17211B] bg-[#F7FAF7] px-3 py-1.5 rounded-xl border border-[#E1E9E2] flex items-center gap-1.5">
                          <CheckCircle2 size={14} className="text-[#168451]" />
                          Verified & Closed
                        </span>
                      )}

                      <Link to={`/staff/complaints/${task.id}`}>
                        <Button size="sm" variant="ghost" className="p-2" title="View Full Details">
                          <ExternalLink size={15} />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* MARK AS COMPLETED MODAL */}
      <Modal
        isOpen={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        title="Mark Task as Completed"
        description={`Record completion details for ticket ${selectedTask?.tracking_code || ''} so Admin can verify & close.`}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCompleteModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              size="sm"
              onClick={handleCompleteTask}
              loading={actionLoading}
              leftIcon={<CheckCircle2 size={14} />}
            >
              Confirm Completed
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCompleteTask} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#17211B] mb-1.5">
              Work Completion Remark / Technician Notes
            </label>
            <textarea
              rows={3}
              value={resolutionComment}
              onChange={(e) => setResolutionComment(e.target.value)}
              placeholder="Describe what was repaired or replaced..."
              className="w-full px-3 py-2 bg-white border border-[#E1E9E2] rounded-xl text-xs text-[#17211B] focus:outline-hidden focus:border-[#168451]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17211B] mb-1.5">
              Resolution Proof Evidence Photo (Optional but Recommended)
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="w-full px-3 py-2 bg-white border border-[#E1E9E2] rounded-xl text-xs text-[#17211B] file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:bg-[#EAF6EE] file:text-[#168451] file:font-semibold cursor-pointer"
            />
            {completionFilePreview && (
              <div className="mt-2 relative w-28 h-28 rounded-xl overflow-hidden border border-[#168451] bg-[#F7FAF7]">
                <img src={completionFilePreview} alt="Resolution proof preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setCompletionFile(null);
                    setCompletionFilePreview('');
                  }}
                  className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full text-[10px]"
                  title="Remove image"
                >
                  ✕
                </button>
              </div>
            )}
            <p className="text-[11px] text-[#647168] mt-1">
              Upload a photo showing the completed repair so the Administrator can verify and close the ticket.
            </p>
          </div>
        </form>
      </Modal>

      {/* EVIDENCE PREVIEW MODAL */}
      <Modal
        isOpen={Boolean(previewImage)}
        onClose={() => setPreviewImage(null)}
        title="Evidence Attachment"
        maxWidth="max-w-2xl"
        footer={
          <Button variant="primary" size="sm" onClick={() => setPreviewImage(null)}>
            Close
          </Button>
        }
      >
        {previewImage && (
          <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center max-h-[70vh]">
            <img src={previewImage} alt="Defect Evidence" className="max-h-[70vh] object-contain" />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StaffDashboard;
