import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  UserCheck,
  User,
  MapPin,
  RefreshCw,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  X,
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
import { COMPLAINT_STATUSES } from '../../constants/complaints';

// Default campus building incharges list
const CAMPUS_INCHARGES = [
  { id: 'b8000000-0000-0000-0000-000000000002', name: 'David Vance', department: 'Campus Facilities & Main Complex', role: 'Facilities Incharge' },
  { id: 'b8000000-0000-0000-0000-000000000004', name: 'S. Kumar', department: 'Electrical & Power Infrastructure', role: 'Electrical Incharge' },
  { id: 'b8000000-0000-0000-0000-000000000005', name: 'M. Ramesh', department: 'Civil, Plumbing & Water Works', role: 'Civil Works Incharge' },
  { id: 'b8000000-0000-0000-0000-000000000006', name: 'K. Priya', department: 'Computer Science Labs & IT Center', role: 'IT Labs Incharge' },
  { id: 'b8000000-0000-0000-0000-000000000007', name: 'Estate Office', department: 'General Campus Maintenance Desk', role: 'Campus Estate Incharge' },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState('all'); // 'all' | 'needs_assignment' | 'in_progress' | 'staff_completed' | 'verified'

  // Incharge Assignment Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Evidence Preview Modal State
  const [previewImage, setPreviewImage] = useState(null);

  // Load All Campus Complaints
  const loadComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      let list = [];

      // 1. Try Backend API
      try {
        const res = await complaintApi.getAllComplaints({ limit: 100 });
        const data = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
        if (data.length > 0) list = data;
      } catch (apiErr) {
        console.warn('Backend API getAllComplaints notice:', apiErr);
      }

      // 2. Direct Supabase Query (Robust fallback)
      if (list.length === 0 && supabase) {
        try {
          const { data: supaComplaints, error: supaErr } = await supabase
            .from('complaints')
            .select(`
              *,
              building:buildings(name, code),
              floor:floors(floor_name),
              room:rooms(room_number),
              student:profiles!student_id(full_name, email, student_id)
            `)
            .order('created_at', { ascending: false });

          if (!supaErr && supaComplaints) {
            // Also fetch evidence for complaints
            const complaintIds = supaComplaints.map((c) => c.id);
            let evidenceMap = {};
            if (complaintIds.length > 0) {
              const { data: evList } = await supabase
                .from('complaint_evidence')
                .select('*')
                .in('complaint_id', complaintIds);
              if (evList) {
                evList.forEach((ev) => {
                  if (!evidenceMap[ev.complaint_id]) evidenceMap[ev.complaint_id] = [];
                  evidenceMap[ev.complaint_id].push(ev);
                });
              }
            }

            list = supaComplaints.map((c) => ({
              ...c,
              evidence: evidenceMap[c.id] || [],
            }));
          } else {
            // Simple fallback without joins
            const { data: simpleData } = await supabase
              .from('complaints')
              .select('*')
              .order('created_at', { ascending: false });
            if (simpleData) list = simpleData;
          }
        } catch (supaCatch) {
          console.warn('Direct Supabase fetch catch:', supaCatch);
        }
      }

      setComplaints(list);
    } catch (err) {
      console.error('Failed to load complaints:', err);
      setError('Failed to load campus complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  // Filter complaints based on active Tab and Search
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      // Tab filter
      if (statusTab === 'needs_assignment') {
        if (!['submitted', 'under_review'].includes(c.status) || c.assigned_staff_id) return false;
      } else if (statusTab === 'in_progress') {
        if (!['assigned', 'in_progress'].includes(c.status)) return false;
      } else if (statusTab === 'staff_completed') {
        if (c.status !== 'resolved') return false;
      } else if (statusTab === 'verified') {
        if (!['verified', 'closed'].includes(c.status)) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = c.title?.toLowerCase().includes(q);
        const matchCode = c.tracking_code?.toLowerCase().includes(q);
        const matchCat = c.category?.toLowerCase().includes(q);
        const matchDesc = c.description?.toLowerCase().includes(q);
        const matchStudent = c.student?.full_name?.toLowerCase().includes(q) || c.student?.email?.toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchCat && !matchDesc && !matchStudent) return false;
      }

      return true;
    });
  }, [complaints, statusTab, searchQuery]);

  // Statistics
  const counts = useMemo(() => {
    const total = complaints.length;
    const needsAssignment = complaints.filter(
      (c) => ['submitted', 'under_review'].includes(c.status) || (!c.assigned_staff_id && c.status === 'submitted')
    ).length;
    const inProgress = complaints.filter((c) => ['assigned', 'in_progress'].includes(c.status)).length;
    const staffCompleted = complaints.filter((c) => c.status === 'resolved').length;
    const verified = complaints.filter((c) => ['verified', 'closed'].includes(c.status)).length;

    return { total, needsAssignment, inProgress, staffCompleted, verified };
  }, [complaints]);

  // Open Assign Incharge Modal
  const openAssignModal = (complaint) => {
    setSelectedTicket(complaint);
    setSelectedStaffId(complaint.assigned_staff_id || CAMPUS_INCHARGES[0].id);
    setAssignNotes('');
    setAssignModalOpen(true);
  };

  // Confirm Assign Incharge
  const handleAssignIncharge = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !selectedStaffId) return;

    setActionLoading(true);
    const chosenIncharge = CAMPUS_INCHARGES.find((s) => s.id === selectedStaffId);
    const inchargeName = chosenIncharge ? `${chosenIncharge.name} (${chosenIncharge.role})` : 'Building Incharge';

    try {
      // 1. Try Backend API
      try {
        await complaintApi.assignStaff(selectedTicket.id, selectedStaffId, assignNotes);
      } catch (apiErr) {
        console.warn('Backend API assign notice:', apiErr);
      }

      // 2. Direct Supabase Update
      if (supabase) {
        await supabase
          .from('complaints')
          .update({
            assigned_staff_id: selectedStaffId,
            status: 'assigned',
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedTicket.id);

        await supabase.from('complaint_updates').insert({
          complaint_id: selectedTicket.id,
          updated_by: user?.id || '64b5f97d-32ea-4355-ae19-88dfa65e0702',
          status: 'assigned',
          comment: `Admin assigned ticket to ${inchargeName}. ${assignNotes ? `Notes: ${assignNotes}` : ''}`.trim(),
        });
      }

      setAssignModalOpen(false);
      setSelectedTicket(null);
      await loadComplaints();
    } catch (err) {
      alert('Error assigning building incharge: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Mark Complaint Verified & Closed (Admin Final Sign-Off)
  const handleVerifyAndClose = async (complaint) => {
    if (!window.confirm(`Verify and close ticket "${complaint.title}" (${complaint.tracking_code})?`)) return;

    setActionLoading(true);
    try {
      // 1. Try backend API
      try {
        await complaintApi.verifyComplaint(complaint.id);
      } catch (apiErr) {
        console.warn('Backend API verify notice:', apiErr);
      }

      // 2. Direct Supabase Update
      if (supabase) {
        await supabase
          .from('complaints')
          .update({
            status: 'verified',
            resolved_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', complaint.id);

        await supabase.from('complaint_updates').insert({
          complaint_id: complaint.id,
          updated_by: user?.id || '64b5f97d-32ea-4355-ae19-88dfa65e0702',
          status: 'verified',
          comment: 'Campus Administrator verified defect resolution. Complaint marked as completed and closed.',
        });
      }

      await loadComplaints();
    } catch (err) {
      alert('Error closing ticket: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getInchargeLabel = (staffId) => {
    if (!staffId) return null;
    const found = CAMPUS_INCHARGES.find((s) => s.id === staffId);
    return found ? `${found.name} (${found.role})` : 'Assigned Technician';
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Campus Complaint Management"
        subtitle="Review student defect reports, assign building incharges, and verify completed maintenance work."
        badge={
          <Badge variant="success" size="sm" withDot>
            Admin Command Center
          </Badge>
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
            onClick={loadComplaints}
            disabled={loading}
          >
            Refresh Tickets
          </Button>
        }
      />

      {/* KPI METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          title="Total Reports"
          value={counts.total}
          subtitle="All campus complaints"
          icon={FileText}
          color="indigo"
        />
        <MetricCard
          title="Needs Incharge"
          value={counts.needsAssignment}
          subtitle="Awaiting staff assignment"
          icon={AlertCircle}
          color="rose"
        />
        <MetricCard
          title="In Progress"
          value={counts.inProgress}
          subtitle="Under repair by staff"
          icon={Clock}
          color="amber"
        />
        <MetricCard
          title="Staff Completed"
          value={counts.staffCompleted}
          subtitle="Needs Admin Sign-Off"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* MAIN COMPLAINTS WORKSPACE */}
      <Card className="border-[#E1E9E2] bg-white shadow-xs overflow-hidden">
        {/* Navigation Filter Tabs */}
        <div className="border-b border-[#E1E9E2] px-4 pt-3 pb-2 flex flex-wrap items-center justify-between gap-3 bg-[#F7FAF7]/60">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setStatusTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusTab === 'all'
                  ? 'bg-[#168451] text-white shadow-xs'
                  : 'text-[#647168] hover:text-[#17211B] hover:bg-white'
              }`}
            >
              All Tickets ({counts.total})
            </button>

            <button
              type="button"
              onClick={() => setStatusTab('needs_assignment')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                statusTab === 'needs_assignment'
                  ? 'bg-[#C43D3D] text-white shadow-xs'
                  : 'text-[#647168] hover:text-[#C43D3D] hover:bg-white'
              }`}
            >
              <AlertCircle size={13} />
              Needs Assignment ({counts.needsAssignment})
            </button>

            <button
              type="button"
              onClick={() => setStatusTab('in_progress')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                statusTab === 'in_progress'
                  ? 'bg-[#1E6091] text-white shadow-xs'
                  : 'text-[#647168] hover:text-[#1E6091] hover:bg-white'
              }`}
            >
              <Clock size={13} />
              In Progress ({counts.inProgress})
            </button>

            <button
              type="button"
              onClick={() => setStatusTab('staff_completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                statusTab === 'staff_completed'
                  ? 'bg-[#168451] text-white shadow-xs'
                  : 'text-[#647168] hover:text-[#168451] hover:bg-white'
              }`}
            >
              <CheckCircle2 size={13} />
              Staff Completed ({counts.staffCompleted})
              {counts.staffCompleted > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setStatusTab('verified')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusTab === 'verified'
                  ? 'bg-[#17211B] text-white shadow-xs'
                  : 'text-[#647168] hover:text-[#17211B] hover:bg-white'
              }`}
            >
              Verified & Closed ({counts.verified})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#647168]" />
            <input
              type="text"
              placeholder="Search code, title, student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#E1E9E2] rounded-xl text-xs text-[#17211B] focus:outline-hidden focus:border-[#168451]"
            />
          </div>
        </div>

        {/* Complaints List / Table */}
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="py-16 text-center text-xs text-[#647168]">
              <RefreshCw size={22} className="animate-spin mx-auto text-[#168451] mb-2" />
              Loading campus complaints...
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#647168] bg-[#F7FAF7] rounded-2xl border border-dashed border-[#E1E9E2]">
              <FileText size={32} className="mx-auto text-[#A4B3A8] mb-2" />
              <p className="font-semibold text-sm text-[#17211B]">No complaints found in this view</p>
              <p className="text-[11px] text-[#647168] mt-1">
                {statusTab === 'needs_assignment'
                  ? 'All submitted complaints currently have an assigned incharge.'
                  : statusTab === 'staff_completed'
                  ? 'No completed tasks awaiting admin verification right now.'
                  : 'New student complaints will appear here as soon as they are submitted.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredComplaints.map((item) => {
                const evidenceList = item.evidence || [];
                const firstEvidence = evidenceList[0];
                const inchargeName = getInchargeLabel(item.assigned_staff_id);

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-white border border-[#E1E9E2] hover:border-[#168451]/50 shadow-2xs hover:shadow-xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    {/* Left: Info & Details */}
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      {/* Evidence Photo Thumbnail if exists */}
                      {firstEvidence?.file_url ? (
                        <div
                          onClick={() => setPreviewImage(firstEvidence.file_url)}
                          className="w-16 h-16 rounded-xl overflow-hidden bg-[#F7FAF7] border border-[#E1E9E2] shrink-0 cursor-pointer group/img relative"
                          title="Click to preview evidence photo"
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
                        {/* Tags Row */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-[#168451] bg-[#EAF6EE] px-2 py-0.5 rounded-md">
                            {item.tracking_code || 'CC-TICKET'}
                          </span>
                          <ComplaintStatusBadge status={item.status} />
                          <PriorityBadge priority={item.priority || 'medium'} />
                          <span className="text-[11px] font-medium text-[#647168] bg-[#F7FAF7] border border-[#E1E9E2] px-2 py-0.5 rounded-md">
                            {item.category || 'Facility'}
                          </span>
                        </div>

                        {/* Complaint Title */}
                        <h4 className="text-sm font-bold text-[#17211B] truncate">
                          {item.title}
                        </h4>

                        {/* Location */}
                        <div className="flex items-center gap-1.5 text-xs text-[#647168]">
                          <MapPin size={13} className="text-[#168451] shrink-0" />
                          <span className="truncate">
                            {item.general_location ||
                              [item.building?.name, item.floor?.floor_name, item.room?.room_number]
                                .filter(Boolean)
                                .join(' • ') ||
                              'Campus Location'}
                          </span>
                        </div>

                        {/* Student Details & Date */}
                        <div className="text-[11px] text-[#647168] flex flex-wrap items-center gap-2 pt-0.5">
                          <span>
                            Reported by: <b className="text-[#17211B]">{item.student?.full_name || 'Student'}</b>
                          </span>
                          <span>&bull;</span>
                          <span>
                            {new Date(item.created_at || Date.now()).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Current Assignment Status */}
                    <div className="lg:w-64 shrink-0 p-3 rounded-xl bg-[#F7FAF7] border border-[#E1E9E2] text-xs">
                      <p className="text-[10px] font-semibold text-[#647168] uppercase tracking-wider mb-1">
                        Building Incharge
                      </p>
                      {item.assigned_staff_id ? (
                        <div className="flex items-center gap-1.5 text-[#17211B] font-semibold">
                          <UserCheck size={14} className="text-[#168451] shrink-0" />
                          <span className="truncate">{inchargeName}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[#C43D3D] font-medium">
                          <AlertTriangle size={14} className="shrink-0" />
                          <span>Not Assigned Yet</span>
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Action 1: If Needs Assignment */}
                      {(!item.assigned_staff_id || ['submitted', 'under_review'].includes(item.status)) && (
                        <Button
                          size="sm"
                          variant="primary"
                          leftIcon={<UserCheck size={14} />}
                          onClick={() => openAssignModal(item)}
                        >
                          Assign Incharge
                        </Button>
                      )}

                      {/* Action 2: If Staff Completed (status === 'resolved') -> Admin Marks Verified / Closed */}
                      {item.status === 'resolved' && (
                        <Button
                          size="sm"
                          variant="success"
                          leftIcon={<ShieldCheck size={14} />}
                          onClick={() => handleVerifyAndClose(item)}
                          loading={actionLoading}
                        >
                          Verify & Close Ticket
                        </Button>
                      )}

                      {/* Action 3: Reassign if already assigned */}
                      {item.assigned_staff_id && ['assigned', 'in_progress'].includes(item.status) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openAssignModal(item)}
                        >
                          Reassign
                        </Button>
                      )}

                      {/* View Details Page */}
                      <Link to={`/admin/complaints/${item.id}`}>
                        <Button size="sm" variant="ghost" className="p-2" title="View Full Ticket Details">
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

      {/* ASSIGN BUILDING INCHARGE MODAL */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Building Incharge"
        description={`Select the campus staff or facility incharge for ticket: ${selectedTicket?.tracking_code || ''}`}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAssignModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAssignIncharge}
              loading={actionLoading}
              leftIcon={<UserCheck size={14} />}
            >
              Confirm Assignment
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAssignIncharge} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#17211B] mb-1.5">
              Select Incharge / Technician
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {CAMPUS_INCHARGES.map((staff) => (
                <label
                  key={staff.id}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedStaffId === staff.id
                      ? 'bg-[#EAF6EE] border-[#168451] shadow-xs'
                      : 'bg-white border-[#E1E9E2] hover:bg-[#F7FAF7]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="incharge"
                      value={staff.id}
                      checked={selectedStaffId === staff.id}
                      onChange={() => setSelectedStaffId(staff.id)}
                      className="text-[#168451] focus:ring-[#168451]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#17211B]">{staff.name}</p>
                      <p className="text-[11px] text-[#647168]">{staff.department}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold bg-white border border-[#E1E9E2] px-2 py-0.5 rounded text-[#168451]">
                    {staff.role}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17211B] mb-1.5">
              Admin Instructions / Priority Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={assignNotes}
              onChange={(e) => setAssignNotes(e.target.value)}
              placeholder="e.g. Please inspect ground floor water pipe before 2 PM today."
              className="w-full px-3 py-2 bg-white border border-[#E1E9E2] rounded-xl text-xs text-[#17211B] focus:outline-hidden focus:border-[#168451]"
            />
          </div>
        </form>
      </Modal>

      {/* FULL EVIDENCE IMAGE PREVIEW MODAL */}
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

export default AdminDashboard;
