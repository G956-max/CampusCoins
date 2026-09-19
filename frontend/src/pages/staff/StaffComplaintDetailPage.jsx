import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  FileText,
  Upload,
  Send,
  MessageSquare,
  Sparkles,
  User,
  ShieldCheck,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import ComplaintStatusBadge from '../../components/complaints/ComplaintStatusBadge';
import PriorityBadge from '../../components/complaints/PriorityBadge';
import EvidenceGallery from '../../components/complaints/EvidenceGallery';
import ComplaintTimeline from '../../components/complaints/ComplaintTimeline';
import complaintApi from '../../services/complaintApi';
import { COMPLAINT_STATUSES } from '../../constants/complaints';

const StaffComplaintDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal States
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateComment, setUpdateComment] = useState('');
  const [updateError, setUpdateError] = useState('');

  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolveComment, setResolveComment] = useState('');
  const [resolveEvidenceFile, setResolveEvidenceFile] = useState(null);
  const [resolveError, setResolveError] = useState('');

  const fetchComplaintDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await complaintApi.getStaffComplaintDetails(id);
      setComplaint(res.data);
    } catch (err) {
      console.error('Failed to load complaint:', err);
      setError(
        err.response?.status === 404
          ? 'Work order not found or not assigned to your account.'
          : err.response?.data?.message || 'Failed to load ticket.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchComplaintDetails();
  }, [id]);

  // Action: Start Work
  const handleStartWork = async () => {
    setActionLoading(true);
    try {
      await complaintApi.startWork(id);
      await fetchComplaintDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status to In Progress.');
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Add Progress Update
  const handleAddUpdate = async (e) => {
    e.preventDefault();
    if (!updateComment.trim()) {
      setUpdateError('Please enter an update note or comment.');
      return;
    }
    setActionLoading(true);
    setUpdateError('');
    try {
      await complaintApi.addProgressUpdate(id, updateComment.trim());
      setUpdateModalOpen(false);
      setUpdateComment('');
      await fetchComplaintDetails();
    } catch (err) {
      setUpdateError(err.response?.data?.message || 'Failed to post update.');
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Resolve Complaint
  const handleResolve = async (e) => {
    e.preventDefault();
    if (!resolveComment.trim() || resolveComment.trim().length < 5) {
      setResolveError('Please provide a detailed resolution comment (at least 5 characters).');
      return;
    }

    setActionLoading(true);
    setResolveError('');
    try {
      // 1. If file attached, upload resolution proof
      if (resolveEvidenceFile) {
        await complaintApi.uploadStaffEvidence(id, resolveEvidenceFile);
      }
      // 2. Mark resolved
      await complaintApi.resolveComplaint(id, resolveComment.trim());
      setResolveModalOpen(false);
      setResolveComment('');
      setResolveEvidenceFile(null);
      await fetchComplaintDetails();
    } catch (err) {
      setResolveError(err.response?.data?.message || 'Failed to mark ticket resolved.');
    } finally {
      setActionLoading(false);
    }
  };

  const getLocationString = (c) => {
    if (!c) return '—';
    if (c.general_location) return c.general_location;
    const parts = [];
    if (c.building?.name) parts.push(c.building.name);
    if (c.floor?.name) parts.push(c.floor.name);
    if (c.room?.room_number) parts.push(`Room ${c.room.room_number}`);
    return parts.length > 0 ? parts.join(' • ') : 'Campus Location';
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-800 rounded-lg" />
        <div className="h-32 bg-slate-900 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-900 rounded-2xl" />
          <div className="h-96 bg-slate-900 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
        <AlertTriangle size={36} className="text-rose-400 mx-auto" />
        <h2 className="text-lg font-semibold text-white">Work Order Not Accessible</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">{error}</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/staff/complaints')}>
          Back to Assigned Work Orders
        </Button>
      </div>
    );
  }

  const isAssigned = complaint.status === COMPLAINT_STATUSES.ASSIGNED;
  const isInProgress = complaint.status === COMPLAINT_STATUSES.IN_PROGRESS;
  const isReopened = complaint.status === COMPLAINT_STATUSES.REOPENED;
  const isResolved = complaint.status === COMPLAINT_STATUSES.RESOLVED;
  const isVerified = complaint.status === COMPLAINT_STATUSES.VERIFIED;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/staff/complaints')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Work Orders
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Tracking Code:</span>
          <span className="font-mono font-bold text-sky-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
            {complaint.tracking_code || complaint.id?.slice(0, 8)}
          </span>
        </div>
      </div>

      {/* Staff Action Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider block">
              Technician Workflow Control
            </span>
            <h3 className="text-lg font-bold text-white mt-1">
              Current Ticket Status:{' '}
              <span className="text-sky-300 font-semibold uppercase">{complaint.status}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              {isAssigned && 'Ticket dispatched to you. Click "Start Work" when arriving at the location.'}
              {isInProgress && 'Work is active. Post incremental updates or mark resolved once finished.'}
              {isReopened && 'Student indicated the issue remains unresolved. Review comments and resume work.'}
              {isResolved && 'You have marked this ticket as resolved. Awaiting student verification.'}
              {isVerified && 'Resolution confirmed and closed by student. Excellent work!'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Start Work Button */}
            {(isAssigned || isReopened) && (
              <Button
                variant="primary"
                size="md"
                leftIcon={<Wrench size={16} />}
                onClick={handleStartWork}
                loading={actionLoading}
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold"
              >
                {isReopened ? 'Resume Work' : 'Start Work'}
              </Button>
            )}

            {/* In Progress Action Buttons */}
            {isInProgress && (
              <>
                <Button
                  variant="outline"
                  size="md"
                  leftIcon={<MessageSquare size={16} />}
                  onClick={() => setUpdateModalOpen(true)}
                  disabled={actionLoading}
                >
                  Add Progress Note
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<CheckCircle2 size={16} />}
                  onClick={() => setResolveModalOpen(true)}
                  disabled={actionLoading}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                >
                  Mark as Resolved
                </Button>
              </>
            )}

            {/* Resolved Status Chip */}
            {isResolved && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <Clock size={16} />
                <span>Awaiting Student Verification</span>
              </div>
            )}

            {isVerified && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                <CheckCircle2 size={16} />
                <span>Verified & Closed</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Complaint Details, Evidence, Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Card */}
          <Card>
            <CardHeader className="border-b border-slate-800 pb-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded">
                    {complaint.category}
                  </span>
                  <PriorityBadge priority={complaint.priority} />
                  <ComplaintStatusBadge status={complaint.status} />
                </div>
                <CardTitle className="text-xl text-white font-bold">
                  {complaint.title}
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="pt-5 space-y-6">
              {/* Description */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Issue Description
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
                  {complaint.description}
                </p>
              </div>

              {/* Location */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Physical Location
                </h4>
                <div className="flex items-center gap-2.5 text-xs text-slate-300 p-3.5 rounded-xl bg-slate-950/40 border border-slate-800">
                  <MapPin size={16} className="text-sky-400 shrink-0" />
                  <span className="font-semibold">{getLocationString(complaint)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evidence Attachments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <CardTitle className="text-base text-white">Evidence & Media</CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visual proof uploaded by student or staff
                </p>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <EvidenceGallery evidence={complaint.evidence || []} />
            </CardContent>
          </Card>

          {/* Audit Timeline */}
          <Card>
            <CardHeader className="border-b border-slate-800 pb-4">
              <CardTitle className="text-base text-white">Full Work History</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit trail of changes, status advancements, and technician remarks
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <ComplaintTimeline updates={complaint.updates || []} />
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar: Meta and Student Info */}
        <div className="space-y-6">
          {/* Student Info Card */}
          <Card>
            <CardHeader className="border-b border-slate-800 pb-3">
              <CardTitle className="text-sm font-semibold text-white">
                Student Contact Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                  <User size={14} />
                </div>
                <div>
                  <div className="font-semibold text-slate-200">
                    {complaint.student?.full_name || 'Alex Rivera (Student)'}
                  </div>
                  <div className="text-slate-400">
                    {complaint.student?.email || 'student@campus.edu'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Metadata Card */}
          <Card>
            <CardHeader className="border-b border-slate-800 pb-3">
              <CardTitle className="text-sm font-semibold text-white">
                Work Order Info
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="text-slate-400">Tracking Code</span>
                <span className="font-mono font-semibold text-slate-200">
                  {complaint.tracking_code || complaint.id?.slice(0, 8)}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="text-slate-400">Assigned To</span>
                <span className="font-medium text-slate-200">
                  {complaint.assigned_staff?.full_name || 'You'}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="text-slate-400">Priority Level</span>
                <PriorityBadge priority={complaint.priority} size="sm" />
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="text-slate-400">Created At</span>
                <span className="text-slate-200">{formatDate(complaint.created_at)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Last Action</span>
                <span className="text-slate-200">{formatDate(complaint.updated_at)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Progress Update Modal */}
      <Modal
        isOpen={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        title="Post Progress Note"
        description="Add a log entry to update administrators and student on repair progress."
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUpdateModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddUpdate}
              loading={actionLoading}
              leftIcon={<Send size={14} />}
            >
              Post Note
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Progress Details <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={4}
              value={updateComment}
              onChange={(e) => setUpdateComment(e.target.value)}
              placeholder="e.g. 'Inspected the AC unit; awaiting replacement capacitor from inventory.'"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            {updateError && <p className="text-xs text-rose-400 mt-1">{updateError}</p>}
          </div>
        </form>
      </Modal>

      {/* Mark Resolved Modal */}
      <Modal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title="Mark Work Order as Resolved"
        description="Provide a resolution summary and optionally upload before/after proof."
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setResolveModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleResolve}
              loading={actionLoading}
              leftIcon={<CheckCircle2 size={14} />}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
            >
              Complete & Resolve
            </Button>
          </div>
        }
      >
        <form onSubmit={handleResolve} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Resolution Summary <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              value={resolveComment}
              onChange={(e) => setResolveComment(e.target.value)}
              placeholder="e.g. 'Replaced faulty water valve and tested water pressure. Normal flow restored.'"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Attach Repair Proof (Optional photo/document)
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setResolveEvidenceFile(e.target.files[0])}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 file:mr-3 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:bg-slate-800 file:text-slate-200"
            />
          </div>

          {resolveError && <p className="text-xs text-rose-400 mt-1">{resolveError}</p>}
        </form>
      </Modal>
    </div>
  );
};

export default StaffComplaintDetailPage;
