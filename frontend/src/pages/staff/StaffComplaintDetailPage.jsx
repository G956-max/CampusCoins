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
      if (resolveEvidenceFile) {
        await complaintApi.uploadStaffEvidence(id, resolveEvidenceFile);
      }
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
      <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-8 w-48 bg-slate-200 rounded-lg" />
        <div className="h-32 bg-white rounded-2xl border border-[#E1E9E2]" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-white rounded-2xl border border-[#E1E9E2]" />
          <div className="h-96 bg-white rounded-2xl border border-[#E1E9E2]" />
        </div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="p-8 text-center rounded-2xl bg-white border border-[#E1E9E2] space-y-4 max-w-xl mx-auto shadow-xs">
        <AlertTriangle size={36} className="text-rose-600 mx-auto" />
        <h2 className="text-lg font-bold text-[#17211B]">Unable to Load Work Order</h2>
        <p className="text-sm text-[#647168]">{error}</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/staff/complaints')}>
          Back to Work Orders
        </Button>
      </div>
    );
  }

  const isAssigned = complaint.status === COMPLAINT_STATUSES.ASSIGNED;
  const isInProgress = complaint.status === COMPLAINT_STATUSES.IN_PROGRESS;
  const isResolved = complaint.status === COMPLAINT_STATUSES.RESOLVED;
  const isVerified = complaint.status === COMPLAINT_STATUSES.VERIFIED;
  const isReopened = complaint.status === COMPLAINT_STATUSES.REOPENED;

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/staff/complaints')}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#647168] hover:text-[#168451] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Work Orders
        </button>

        <div className="flex items-center gap-2 text-xs text-[#647168]">
          <span>Tracking Code:</span>
          <span className="font-mono font-bold text-[#168451] bg-[#EAF6EE] border border-[#CBE7D4] px-2.5 py-1 rounded-lg">
            {complaint.tracking_code || complaint.id?.slice(0, 8)}
          </span>
        </div>
      </div>

      {/* Action Toolbar Header for Staff */}
      <div className="p-5 rounded-2xl bg-white border border-[#E1E9E2] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-[#17211B]">Maintenance Service Actions</h2>
          <p className="text-xs text-[#647168]">
            Perform technician lifecycle transitions and log updates for students & administration.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isAssigned && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Wrench size={14} />}
              onClick={handleStartWork}
              disabled={actionLoading}
            >
              Start Work Order
            </Button>
          )}

          {(isInProgress || isReopened) && (
            <>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<MessageSquare size={14} />}
                onClick={() => setUpdateModalOpen(true)}
                disabled={actionLoading}
              >
                Post Progress Note
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<CheckCircle2 size={14} />}
                onClick={() => setResolveModalOpen(true)}
                disabled={actionLoading}
              >
                Mark Resolved
              </Button>
            </>
          )}

          {isResolved && (
            <Badge variant="warning" size="md">
              Awaiting Student Verification
            </Badge>
          )}

          {isVerified && (
            <Badge variant="success" size="md">
              Closed & Verified
            </Badge>
          )}
        </div>
      </div>

      {/* Main Grid: Work Order Details + Meta Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Complaint Details, Evidence, Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white border-[#E1E9E2] shadow-xs">
            <CardHeader className="border-b border-[#E1E9E2] pb-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-[#17211B] bg-[#F7FAF7] border border-[#E1E9E2] px-2.5 py-0.5 rounded">
                    {complaint.category}
                  </span>
                  <PriorityBadge priority={complaint.priority} />
                  <ComplaintStatusBadge status={complaint.status} />
                </div>
                <CardTitle className="text-xl text-[#17211B] font-bold">
                  {complaint.title}
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="pt-5 space-y-6">
              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-[#647168] uppercase tracking-wider mb-2">
                  Issue Description
                </h4>
                <p className="text-sm text-[#17211B] leading-relaxed whitespace-pre-line bg-[#F7FAF7] p-4 rounded-xl border border-[#E1E9E2]">
                  {complaint.description}
                </p>
              </div>

              {/* Location Summary */}
              <div>
                <h4 className="text-xs font-bold text-[#647168] uppercase tracking-wider mb-2">
                  Location Specified
                </h4>
                <div className="flex items-center gap-2.5 text-xs text-[#17211B] p-3 rounded-xl bg-[#F7FAF7] border border-[#E1E9E2]">
                  <MapPin size={16} className="text-[#168451] shrink-0" />
                  <span>{getLocationString(complaint)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evidence Attachments Card */}
          <Card className="bg-white border-[#E1E9E2] shadow-xs">
            <CardHeader className="border-b border-[#E1E9E2] pb-4">
              <CardTitle className="text-base text-[#17211B]">
                Student Submitted Evidence
              </CardTitle>
              <p className="text-xs text-[#647168] mt-0.5">
                Inspect reported photos and files before beginning repair work
              </p>
            </CardHeader>
            <CardContent className="pt-5">
              <EvidenceGallery evidence={complaint.evidence || []} />
            </CardContent>
          </Card>

          {/* Lifecycle & Progress Timeline */}
          <Card className="bg-white border-[#E1E9E2] shadow-xs">
            <CardHeader className="border-b border-[#E1E9E2] pb-4">
              <CardTitle className="text-base text-[#17211B]">
                Work Order History & Timeline
              </CardTitle>
              <p className="text-xs text-[#647168] mt-0.5">
                Lifecycle events and logged status transitions
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <ComplaintTimeline updates={complaint.updates || []} />
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Reporter Details Card */}
          <Card className="bg-white border-[#E1E9E2] shadow-xs">
            <CardHeader className="border-b border-[#E1E9E2] pb-3">
              <CardTitle className="text-sm font-bold text-[#17211B]">
                Student Reporter Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#E1E9E2]">
                <span className="text-[#647168]">Full Name</span>
                <span className="font-bold text-[#17211B]">
                  {complaint.student?.full_name || 'Student Contributor'}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[#E1E9E2]">
                <span className="text-[#647168]">College Email</span>
                <span className="text-[#17211B] font-mono">
                  {complaint.student?.email || 'Confidential Student Account'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#647168]">Submitted At</span>
                <span className="text-[#17211B] font-medium">{formatDate(complaint.created_at)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Information */}
          <Card className="bg-white border-[#E1E9E2] shadow-xs">
            <CardHeader className="border-b border-[#E1E9E2] pb-3">
              <CardTitle className="text-sm font-bold text-[#17211B]">
                Ticket Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#E1E9E2]">
                <span className="text-[#647168]">Priority</span>
                <PriorityBadge priority={complaint.priority} size="sm" />
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[#E1E9E2]">
                <span className="text-[#647168]">Department Category</span>
                <span className="font-bold text-[#17211B]">{complaint.category}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[#E1E9E2]">
                <span className="text-[#647168]">SLA Deadline</span>
                <span className="text-[#168451] font-bold">Standard SLA</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#647168]">Status</span>
                <ComplaintStatusBadge status={complaint.status} size="sm" />
              </div>
            </CardContent>
          </Card>

          {/* SLA Commitment */}
          <div className="p-4 rounded-2xl bg-[#EAF6EE] border border-[#CBE7D4] space-y-2">
            <h4 className="text-xs font-bold text-[#168451]">Campus Maintenance Standard</h4>
            <p className="text-xs text-[#647168] leading-relaxed">
              Assigned technicians should acknowledge dispatches within 2 hours and attach clear
              resolution proof when marking tickets resolved.
            </p>
          </div>
        </div>
      </div>

      {/* Progress Note Modal */}
      <Modal
        isOpen={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        title="Post Maintenance Progress Note"
        description="Share an update on the repair status, ordered parts, or expected resolution time."
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
              Submit Note
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#17211B] mb-1.5">
              Technician Note <span className="text-[#168451]">*</span>
            </label>
            <textarea
              rows={4}
              value={updateComment}
              onChange={(e) => setUpdateComment(e.target.value)}
              placeholder="e.g. Inspected faulty switchboard; replacing relay component tomorrow morning..."
              className="w-full px-3 py-2 bg-white border border-[#E1E9E2] rounded-xl text-xs text-[#17211B] placeholder-[#647168] focus:outline-none focus:border-[#168451]"
            />
            {updateError && <p className="text-xs text-rose-600 mt-1">{updateError}</p>}
          </div>
        </form>
      </Modal>

      {/* Resolve Complaint Modal */}
      <Modal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title="Mark Work Order as Resolved"
        description="Provide resolution details and optional photo proof. The student will be prompted to verify."
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
            >
              Complete & Resolve
            </Button>
          </div>
        }
      >
        <form onSubmit={handleResolve} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#17211B] mb-1.5">
              Resolution Summary <span className="text-[#168451]">*</span>
            </label>
            <textarea
              rows={4}
              value={resolveComment}
              onChange={(e) => setResolveComment(e.target.value)}
              placeholder="Describe work completed (e.g. 'Replaced condenser unit and verified temperature at 21C')..."
              className="w-full px-3 py-2 bg-white border border-[#E1E9E2] rounded-xl text-xs text-[#17211B] placeholder-[#647168] focus:outline-none focus:border-[#168451]"
            />
            {resolveError && <p className="text-xs text-rose-600 mt-1">{resolveError}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17211B] mb-1.5">
              Upload Proof of Resolution (Optional photo)
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setResolveEvidenceFile(e.target.files[0])}
              className="w-full px-3 py-2 bg-white border border-[#E1E9E2] rounded-xl text-xs text-[#17211B] file:mr-3 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:bg-[#EAF6EE] file:text-[#168451] file:font-semibold"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StaffComplaintDetailPage;
