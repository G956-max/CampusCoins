import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  UserCheck,
  XCircle,
  User,
  Coins,
} from 'lucide-react';
import Button from '../../components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import ComplaintStatusBadge from '../../components/complaints/ComplaintStatusBadge';
import PriorityBadge from '../../components/complaints/PriorityBadge';
import EvidenceGallery from '../../components/complaints/EvidenceGallery';
import ComplaintTimeline from '../../components/complaints/ComplaintTimeline';
import complaintApi from '../../services/complaintApi';
import { adminVerifyComplaint, adminMarkSpam, adminMarkFake } from '../../services/gamificationApi';
import { COMPLAINT_PRIORITIES, COMPLAINT_STATUSES } from '../../constants/complaints';

const AdminComplaintDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [assignError, setAssignError] = useState('');

  // Gamification Modals & State
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [isUsefulEvidence, setIsUsefulEvidence] = useState(true);
  const [isHighImpact, setIsHighImpact] = useState(false);
  const [verifyFeedback, setVerifyFeedback] = useState(null);

  const fetchComplaintDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const [complaintRes, staffRes] = await Promise.all([
        complaintApi.getAdminComplaintDetails(id),
        complaintApi.getStaffList(),
      ]);
      setComplaint(complaintRes.data);
      setStaffList(staffRes.data || []);
    } catch (err) {
      console.error('Failed to load admin complaint details:', err);
      setError(err.response?.data?.message || 'Failed to load complaint.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchComplaintDetails();
  }, [id]);

  // Action: Mark Under Review
  const handleReview = async () => {
    setActionLoading(true);
    try {
      await complaintApi.reviewComplaint(id);
      await fetchComplaintDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to advance to Under Review.');
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Reject Complaint
  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim() || rejectionReason.trim().length < 5) {
      setRejectError('Please provide a mandatory reason for rejection (at least 5 characters).');
      return;
    }
    setActionLoading(true);
    setRejectError('');
    try {
      await complaintApi.rejectComplaint(id, rejectionReason.trim());
      setRejectModalOpen(false);
      setRejectionReason('');
      await fetchComplaintDetails();
    } catch (err) {
      setRejectError(err.response?.data?.message || 'Failed to reject complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Assign Staff
  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedStaffId) {
      setAssignError('Please select a technician from the staff list.');
      return;
    }
    setActionLoading(true);
    setAssignError('');
    try {
      await complaintApi.assignStaff(id, selectedStaffId, assignNotes.trim());
      setAssignModalOpen(false);
      setSelectedStaffId('');
      setAssignNotes('');
      await fetchComplaintDetails();
    } catch (err) {
      setAssignError(err.response?.data?.message || 'Failed to assign staff.');
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Change Priority
  const handlePriorityChange = async (newPriority) => {
    if (newPriority === complaint?.priority) return;
    setActionLoading(true);
    try {
      await complaintApi.updatePriority(id, newPriority);
      await fetchComplaintDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update priority.');
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Explicitly Verify Complaint & Award Coins
  const handleVerifyComplaint = async () => {
    setActionLoading(true);
    try {
      await adminVerifyComplaint(id, {
        is_useful_evidence: isUsefulEvidence,
        is_high_impact: isHighImpact,
      });
      setVerifyModalOpen(false);
      setVerifyFeedback('Complaint verified! Rewards evaluated and coins credited.');
      await fetchComplaintDetails();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to verify complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Mark as Spam
  const handleMarkSpam = async () => {
    if (!window.confirm('Mark this complaint as SPAM? -30 CampusCoins penalty will be deducted from the student.')) return;
    setActionLoading(true);
    try {
      await adminMarkSpam(id);
      await fetchComplaintDetails();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to apply spam penalty.');
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Mark as Fake Report
  const handleMarkFake = async () => {
    if (!window.confirm('Mark this complaint as FAKE REPORT? -50 CampusCoins penalty will be deducted from the student.')) return;
    setActionLoading(true);
    try {
      await adminMarkFake(id);
      await fetchComplaintDetails();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to apply fake report penalty.');
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
    return parts.length > 0 ? parts.join(' • ') : 'Campus Premises';
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
        <h2 className="text-lg font-bold text-[#17211B]">Complaint Not Found</h2>
        <p className="text-sm text-[#647168]">{error}</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/complaints')}>
          Back to All Complaints
        </Button>
      </div>
    );
  }

  const isSubmitted = complaint.status === COMPLAINT_STATUSES.SUBMITTED;
  const isUnderReview = complaint.status === COMPLAINT_STATUSES.UNDER_REVIEW;
  const isAssigned = complaint.status === COMPLAINT_STATUSES.ASSIGNED;
  const isInProgress = complaint.status === COMPLAINT_STATUSES.IN_PROGRESS;
  const isResolved = complaint.status === COMPLAINT_STATUSES.RESOLVED;
  const isVerified = complaint.status === COMPLAINT_STATUSES.VERIFIED;
  const isRejected = complaint.status === COMPLAINT_STATUSES.REJECTED;
  const isReopened = complaint.status === COMPLAINT_STATUSES.REOPENED;

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
      {/* Back button & Tracking */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/complaints')}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#647168] hover:text-[#168451] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to All Complaints
        </button>

        <div className="flex items-center gap-2 text-xs text-[#647168]">
          <span>Tracking Code:</span>
          <span className="font-mono font-bold text-[#168451] bg-[#EAF6EE] border border-[#CBE7D4] px-2.5 py-1 rounded-lg">
            {complaint.tracking_code || complaint.id?.slice(0, 8)}
          </span>
        </div>
      </div>

      {/* Admin Action Control Banner */}
      <div className="p-6 rounded-2xl bg-white border border-[#E1E9E2] shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#168451] uppercase tracking-wider block">
              Administrative Triage & Operations
            </span>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <h3 className="text-lg font-black text-[#17211B]">
                Ticket Action Console
              </h3>
              <ComplaintStatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
            </div>
            <p className="text-xs text-[#647168] mt-1 max-w-2xl">
              {isSubmitted && 'Newly submitted complaint. Begin review or reject if invalid.'}
              {isUnderReview && 'Complaint actively under review. Assign to a departmental technician or reject.'}
              {isAssigned && 'Assigned to technician. Awaiting technician to start work.'}
              {isInProgress && 'Technician is actively servicing this complaint.'}
              {isResolved && 'Technician marked as resolved. Awaiting student verification.'}
              {isVerified && 'Complaint verified and closed. All lifecycle milestones complete.'}
              {isRejected && 'Complaint was rejected. Student was notified of the reason.'}
              {isReopened && 'Student reopened ticket reporting persistent issue. Reassignment available.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Priority Selector */}
            <div className="flex items-center gap-1.5 bg-[#F7FAF7] border border-[#E1E9E2] rounded-xl px-2.5 py-1.5">
              <span className="text-[11px] text-[#647168] font-bold">Priority:</span>
              <select
                value={complaint.priority}
                onChange={(e) => handlePriorityChange(e.target.value)}
                disabled={actionLoading}
                className="bg-transparent text-xs font-bold text-[#17211B] focus:outline-none cursor-pointer"
              >
                {COMPLAINT_PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Review (submitted -> under_review) */}
            {isSubmitted && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Clock size={14} />}
                onClick={handleReview}
                loading={actionLoading}
              >
                Mark Under Review
              </Button>
            )}

            {/* Verify & Award Coins */}
            {(isSubmitted || isUnderReview) && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Coins size={14} className="text-white" />}
                onClick={() => setVerifyModalOpen(true)}
                disabled={actionLoading}
              >
                Verify & Award Coins
              </Button>
            )}

            {/* Anti-Abuse Penalty Actions */}
            {(isSubmitted || isUnderReview) && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkSpam}
                  disabled={actionLoading}
                  className="text-rose-700 border-rose-200 hover:bg-rose-50 text-xs"
                >
                  Spam (-30 CC)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkFake}
                  disabled={actionLoading}
                  className="text-rose-700 border-rose-200 hover:bg-rose-50 text-xs"
                >
                  Fake (-50 CC)
                </Button>
              </>
            )}

            {/* Reject Button */}
            {(isSubmitted || isUnderReview) && (
              <Button
                variant="danger"
                size="sm"
                leftIcon={<XCircle size={14} />}
                onClick={() => setRejectModalOpen(true)}
                disabled={actionLoading}
              >
                Reject Complaint
              </Button>
            )}

            {/* Assign / Reassign Staff */}
            {(isSubmitted || isUnderReview || isAssigned || isInProgress || isReopened) && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<UserCheck size={14} />}
                onClick={() => setAssignModalOpen(true)}
                disabled={actionLoading}
              >
                {complaint.assigned_to ? 'Reassign Staff' : 'Assign Technician'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Rejection Alert Banner */}
      {isRejected && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
            <XCircle size={18} />
            <span>Complaint Marked as Rejected</span>
          </div>
          <div className="text-xs text-rose-700 pl-6 space-y-1">
            <p className="font-semibold text-rose-800">Recorded Rejection Reason:</p>
            <p className="p-3 rounded-xl bg-white border border-rose-200 italic text-rose-900">
              "{complaint.rejection_reason || 'No detailed reason specified.'}"
            </p>
          </div>
        </div>
      )}

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
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
              <div>
                <h4 className="text-xs font-bold text-[#647168] uppercase tracking-wider mb-2">
                  Reported Issue Description
                </h4>
                <p className="text-sm text-[#17211B] leading-relaxed whitespace-pre-line bg-[#F7FAF7] p-4 rounded-xl border border-[#E1E9E2]">
                  {complaint.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#647168] uppercase tracking-wider mb-2">
                  Campus Location
                </h4>
                <div className="flex items-center gap-2.5 text-xs text-[#17211B] p-3.5 rounded-xl bg-[#F7FAF7] border border-[#E1E9E2]">
                  <MapPin size={16} className="text-[#168451] shrink-0" />
                  <span className="font-bold">{getLocationString(complaint)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evidence Attachments */}
          <Card className="bg-white border-[#E1E9E2] shadow-xs">
            <CardHeader className="border-b border-[#E1E9E2] pb-4">
              <CardTitle className="text-base text-[#17211B]">Media & Evidence Files</CardTitle>
              <p className="text-xs text-[#647168] mt-0.5">
                Attachments submitted by student or maintenance personnel
              </p>
            </CardHeader>
            <CardContent className="pt-5">
              <EvidenceGallery evidence={complaint.evidence || []} />
            </CardContent>
          </Card>

          {/* Chronological Audit Trail */}
          <Card className="bg-white border-[#E1E9E2] shadow-xs">
            <CardHeader className="border-b border-[#E1E9E2] pb-4">
              <CardTitle className="text-base text-[#17211B]">Administrative Audit Trail</CardTitle>
              <p className="text-xs text-[#647168] mt-0.5">
                Complete event log of transitions, timestamps, and technician updates
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <ComplaintTimeline updates={complaint.updates || []} />
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Student Info */}
          <Card className="bg-white border-[#E1E9E2] shadow-xs">
            <CardHeader className="border-b border-[#E1E9E2] pb-3">
              <CardTitle className="text-sm font-bold text-[#17211B]">
                Student Reporter
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#EAF6EE] text-[#168451] border border-[#CBE7D4] flex items-center justify-center font-bold">
                  <User size={14} />
                </div>
                <div>
                  <div className="font-bold text-[#17211B]">
                    {complaint.student?.full_name || 'Student Reporter'}
                  </div>
                  <div className="text-[#647168]">
                    {complaint.student?.email || 'student@campus.edu'}
                  </div>
                  {complaint.student?.department?.name && (
                    <div className="text-[11px] text-[#168451] mt-0.5 font-semibold">
                      {complaint.student.department.name}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Technician */}
          <Card className="bg-white border-[#E1E9E2] shadow-xs">
            <CardHeader className="border-b border-[#E1E9E2] pb-3 flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-[#17211B]">
                Assigned Technician
              </CardTitle>
              {complaint.assigned_to && (
                <button
                  onClick={() => setAssignModalOpen(true)}
                  className="text-[11px] font-bold text-[#168451] hover:underline"
                >
                  Change
                </button>
              )}
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              {complaint.assigned_staff ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 flex items-center justify-center font-bold">
                    <UserCheck size={14} />
                  </div>
                  <div>
                    <div className="font-bold text-[#17211B]">
                      {complaint.assigned_staff.full_name}
                    </div>
                    <div className="text-[#647168]">
                      {complaint.assigned_staff.email}
                    </div>
                    {complaint.assigned_staff.department?.name && (
                      <div className="text-[11px] text-sky-700 mt-0.5 font-semibold">
                        {complaint.assigned_staff.department.name}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#F7FAF7] border border-[#E1E9E2] text-center space-y-2">
                  <span className="text-amber-700 block font-bold">Currently Unassigned</span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setAssignModalOpen(true)}
                    className="w-full"
                  >
                    Assign Technician Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ticket Metadata */}
          <Card className="bg-white border-[#E1E9E2] shadow-xs">
            <CardHeader className="border-b border-[#E1E9E2] pb-3">
              <CardTitle className="text-sm font-bold text-[#17211B]">
                Ticket Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#E1E9E2]">
                <span className="text-[#647168]">Tracking Code</span>
                <span className="font-mono font-bold text-[#17211B]">
                  {complaint.tracking_code || complaint.id?.slice(0, 8)}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[#E1E9E2]">
                <span className="text-[#647168]">Status</span>
                <ComplaintStatusBadge status={complaint.status} size="sm" />
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[#E1E9E2]">
                <span className="text-[#647168]">Submitted</span>
                <span className="text-[#17211B] font-medium">{formatDate(complaint.created_at)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#647168]">Last Modified</span>
                <span className="text-[#17211B] font-medium">{formatDate(complaint.updated_at)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Complaint"
        description="Provide a clear explanation for rejecting this complaint. This reason is visible to the student."
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleReject}
              loading={actionLoading}
              leftIcon={<XCircle size={14} />}
            >
              Confirm Rejection
            </Button>
          </div>
        }
      >
        <form onSubmit={handleReject} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#17211B] mb-1.5">
              Rejection Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. 'Duplicate report already in progress under ticket CC-2026-0042', or 'Requires central departmental requisition rather than campus maintenance.'"
              className="w-full px-3 py-2 bg-white border border-[#E1E9E2] rounded-xl text-xs text-[#17211B] placeholder-[#647168] focus:outline-none focus:border-rose-500"
            />
            {rejectError && <p className="text-xs text-rose-600 mt-1">{rejectError}</p>}
          </div>
        </form>
      </Modal>

      {/* Assign Staff Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Staff Technician"
        description="Select a qualified staff member or technician to service this complaint."
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
              onClick={handleAssign}
              loading={actionLoading}
              leftIcon={<UserCheck size={14} />}
            >
              Confirm Assignment
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#17211B] mb-1.5">
              Select Technician / Staff <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E1E9E2] rounded-xl text-xs text-[#17211B] focus:outline-none focus:border-[#168451]"
            >
              <option value="">-- Choose a staff member --</option>
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.full_name} ({staff.email}){' '}
                  {staff.department?.name ? `• ${staff.department.name}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17211B] mb-1.5">
              Internal Dispatch Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={assignNotes}
              onChange={(e) => setAssignNotes(e.target.value)}
              placeholder="e.g. 'Priority assignment for second floor electrical panel; key available at security desk.'"
              className="w-full px-3 py-2 bg-white border border-[#E1E9E2] rounded-xl text-xs text-[#17211B] placeholder-[#647168] focus:outline-none focus:border-[#168451]"
            />
          </div>

          {assignError && <p className="text-xs text-rose-600 mt-1">{assignError}</p>}
        </form>
      </Modal>

      {/* Verify & Award Modal */}
      <Modal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        title="Verify Complaint & Award CampusCoins"
        description="Verify legitimate student contribution and evaluate bonus rewards."
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setVerifyModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={actionLoading}
              onClick={handleVerifyComplaint}
            >
              Confirm Verification & Award
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs text-[#17211B]">
          <div className="p-3.5 rounded-xl bg-[#EAF6EE] border border-[#CBE7D4] text-[#168451] space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Coins size={14} />
              <span>Base Valid Complaint Reward: +20 CampusCoins</span>
            </div>
            <p className="text-[11px] text-[#168451]/80">
              Guaranteed server-side atomic award to the student's wallet upon verification.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-white border border-[#E1E9E2] hover:bg-[#F7FAF7]">
              <input
                type="checkbox"
                checked={isUsefulEvidence}
                onChange={(e) => setIsUsefulEvidence(e.target.checked)}
                className="rounded bg-white border-[#E1E9E2] text-[#168451] focus:ring-0"
              />
              <div>
                <span className="font-bold text-[#17211B] block">Useful Photographic/Video Evidence</span>
                <span className="text-[11px] text-[#647168]">Awards +10 CC & advances Evidence Expert badge</span>
              </div>
            </label>

            <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-white border border-[#E1E9E2] hover:bg-[#F7FAF7]">
              <input
                type="checkbox"
                checked={isHighImpact}
                onChange={(e) => setIsHighImpact(e.target.checked)}
                className="rounded bg-white border-[#E1E9E2] text-[#168451] focus:ring-0"
              />
              <div>
                <span className="font-bold text-[#17211B] block">High-Impact Campus Defect</span>
                <span className="text-[11px] text-[#647168]">Awards +30 CC for hazardous/urgent campus issues</span>
              </div>
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminComplaintDetailPage;
