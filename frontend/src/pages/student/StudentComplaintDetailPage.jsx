import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  XCircle,
  Upload,
  UserCheck,
  ShieldAlert,
  Send,
  Sparkles,
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

const StudentComplaintDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Verification & Reopen modal state
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [reopenError, setReopenError] = useState('');

  // Additional evidence upload state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  const fetchComplaintDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await complaintApi.getComplaintDetails(id);
      setComplaint(res.data);
    } catch (err) {
      console.error('Failed to load complaint details:', err);
      setError(
        err.response?.status === 404
          ? 'Complaint not found or you do not have permission to view it.'
          : err.response?.data?.message || 'Failed to load complaint.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchComplaintDetails();
  }, [id]);

  // Handle Verify Resolution
  const handleVerify = async () => {
    if (!window.confirm('Confirm that this issue has been resolved to your satisfaction?')) return;
    setActionLoading(true);
    try {
      await complaintApi.verifyResolution(id);
      await fetchComplaintDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to verify resolution.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reopen Complaint
  const handleReopen = async (e) => {
    e.preventDefault();
    if (!reopenReason.trim() || reopenReason.trim().length < 5) {
      setReopenError('Please provide a detailed reason (at least 5 characters) explaining why the issue is not fixed.');
      return;
    }
    setActionLoading(true);
    setReopenError('');
    try {
      await complaintApi.reopenComplaint(id, reopenReason.trim());
      setReopenModalOpen(false);
      setReopenReason('');
      await fetchComplaintDetails();
    } catch (err) {
      setReopenError(err.response?.data?.message || 'Failed to reopen complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Upload Extra Evidence
  const handleUploadEvidence = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please choose a file to upload.');
      return;
    }
    setActionLoading(true);
    setUploadError('');
    try {
      await complaintApi.uploadEvidence(id, uploadFile);
      setUploadSuccess('Evidence uploaded successfully.');
      setUploadFile(null);
      setTimeout(() => {
        setUploadModalOpen(false);
        setUploadSuccess('');
      }, 1000);
      await fetchComplaintDetails();
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload evidence.');
    } finally {
      setActionLoading(false);
    }
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

  const getLocationString = (c) => {
    if (!c) return '—';
    if (c.general_location) return c.general_location;
    const parts = [];
    if (c.building?.name) parts.push(c.building.name);
    if (c.floor?.name) parts.push(c.floor.name);
    if (c.room?.room_number) parts.push(`Room ${c.room.room_number}`);
    return parts.length > 0 ? parts.join(' • ') : 'Campus Premises';
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
        <h2 className="text-lg font-semibold text-white">Unable to Load Complaint</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">{error}</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/student/complaints')}>
          Back to My Complaints
        </Button>
      </div>
    );
  }

  const isResolved = complaint.status === COMPLAINT_STATUSES.RESOLVED;
  const isRejected = complaint.status === COMPLAINT_STATUSES.REJECTED;
  const isVerified = complaint.status === COMPLAINT_STATUSES.VERIFIED;
  const isReopened = complaint.status === COMPLAINT_STATUSES.REOPENED;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back Button & Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/student/complaints')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Back to My Complaints
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Tracking Code:</span>
          <span className="font-mono font-bold text-campus-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
            {complaint.tracking_code || complaint.id?.slice(0, 8)}
          </span>
        </div>
      </div>

      {/* Verification Alert Banner (Action Required) */}
      {isResolved && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border-2 border-emerald-500/60 shadow-lg shadow-emerald-500/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 size={20} />
                </span>
                <h3 className="text-base font-bold text-white">
                  Technician Marked This Issue as Resolved
                </h3>
              </div>
              <p className="text-xs text-emerald-200/80 pl-8">
                Has the issue been resolved to your satisfaction? Your confirmation closes this complaint ticket.
              </p>
            </div>

            <div className="flex items-center gap-3 sm:self-center pl-8 sm:pl-0">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<CheckCircle2 size={16} />}
                onClick={handleVerify}
                disabled={actionLoading}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
              >
                Yes, Issue Resolved
              </Button>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<RotateCcw size={16} />}
                onClick={() => setReopenModalOpen(true)}
                disabled={actionLoading}
              >
                No, Issue Still Exists
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Notice Banner */}
      {isRejected && (
        <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-800/80 space-y-2">
          <div className="flex items-center gap-2 text-rose-300 font-semibold text-sm">
            <XCircle size={18} />
            <span>Complaint Rejected by Administration</span>
          </div>
          <div className="text-xs text-rose-200/90 pl-6 space-y-1">
            <p className="font-semibold text-rose-300">Reason for rejection:</p>
            <p className="p-3 rounded-xl bg-slate-950/60 border border-rose-900/60 italic">
              "{complaint.rejection_reason || 'No detailed reason provided.'}"
            </p>
          </div>
        </div>
      )}

      {/* Reopened Notice Banner */}
      {isReopened && (
        <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-800/80 space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
            <RotateCcw size={18} />
            <span>Complaint Reopened by Student</span>
          </div>
          <div className="text-xs text-amber-200/90 pl-6 space-y-1">
            <p className="font-semibold text-amber-300">Student feedback note:</p>
            <p className="p-3 rounded-xl bg-slate-950/60 border border-amber-900/60 italic">
              "{complaint.reopen_reason || 'Issue reported as still persisting.'}"
            </p>
          </div>
        </div>
      )}

      {/* Verified Banner */}
      {isVerified && (
        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/60 flex items-center gap-3 text-emerald-300 text-xs">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>
            <strong>Resolution Confirmed & Closed:</strong> You verified that this issue was satisfactorily repaired.
          </span>
        </div>
      )}

      {/* Main Grid: Details + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Complaint Details, Evidence, Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Complaint Overview Card */}
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
                  Detailed Description
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
                  {complaint.description}
                </p>
              </div>

              {/* Location Summary */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Location Specified
                </h4>
                <div className="flex items-center gap-2.5 text-xs text-slate-300 p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                  <MapPin size={16} className="text-campus-400 shrink-0" />
                  <span>{getLocationString(complaint)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evidence Attachments Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <CardTitle className="text-base text-white">
                  Media & Evidence Attachments
                </CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">
                  Photos and documents submitted with this complaint
                </p>
              </div>

              {!isVerified && !isRejected && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Upload size={14} />}
                  onClick={() => setUploadModalOpen(true)}
                >
                  Add Evidence
                </Button>
              )}
            </CardHeader>

            <CardContent className="pt-5">
              <EvidenceGallery evidence={complaint.evidence || []} />
            </CardContent>
          </Card>

          {/* Chronological Lifecycle Timeline */}
          <Card>
            <CardHeader className="border-b border-slate-800 pb-4">
              <CardTitle className="text-base text-white">
                Complaint Lifecycle & Audit History
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Transparent step-by-step progress from submission to resolution
              </p>
            </CardHeader>

            <CardContent className="pt-6">
              <ComplaintTimeline updates={complaint.updates || []} />
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar: Meta Information */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <Card>
            <CardHeader className="border-b border-slate-800 pb-3">
              <CardTitle className="text-sm font-semibold text-white">
                Ticket Information
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
                <span className="text-slate-400">Submitted On</span>
                <span className="text-slate-200">{formatDate(complaint.created_at)}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="text-slate-400">Last Updated</span>
                <span className="text-slate-200">{formatDate(complaint.updated_at)}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="text-slate-400">Category</span>
                <span className="font-medium text-slate-200">{complaint.category}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="text-slate-400">Current Status</span>
                <ComplaintStatusBadge status={complaint.status} size="sm" />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Assigned Technician</span>
                <span className="font-medium text-slate-200">
                  {complaint.assigned_staff?.full_name ||
                    (complaint.assigned_to ? 'Technician Assigned' : 'Unassigned')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Need Help Card */}
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
            <h4 className="text-xs font-semibold text-white">CampusCoins SLA Commitment</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standard campus maintenance tickets are reviewed within 24 hours. Critical issues
              are escalated immediately to emergency facility technicians.
            </p>
          </div>
        </div>
      </div>

      {/* Reopen Modal */}
      <Modal
        isOpen={reopenModalOpen}
        onClose={() => setReopenModalOpen(false)}
        title="Reopen Complaint"
        description="Explain why the problem still persists so the technician can address it."
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReopenModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleReopen}
              loading={actionLoading}
              leftIcon={<RotateCcw size={14} />}
            >
              Reopen Ticket
            </Button>
          </div>
        }
      >
        <form onSubmit={handleReopen} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Reason for Reopening <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={4}
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="Describe why the issue is not fixed (e.g. 'Water is still leaking after the valve was replaced')..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
            {reopenError && <p className="text-xs text-rose-400 mt-1">{reopenError}</p>}
          </div>
        </form>
      </Modal>

      {/* Upload Extra Evidence Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Add Supporting Evidence"
        description="Upload additional photos or documents to assist technicians."
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUploadModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleUploadEvidence}
              loading={actionLoading}
              leftIcon={<Upload size={14} />}
            >
              Upload Attachment
            </Button>
          </div>
        }
      >
        <form onSubmit={handleUploadEvidence} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Choose File (Images up to 5MB, PDF up to 10MB)
            </label>
            <input
              type="file"
              accept="image/*,.pdf,video/mp4"
              onChange={(e) => setUploadFile(e.target.files[0])}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 file:mr-3 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:bg-slate-800 file:text-slate-200"
            />
            {uploadError && <p className="text-xs text-rose-400 mt-1">{uploadError}</p>}
            {uploadSuccess && <p className="text-xs text-emerald-400 mt-1">{uploadSuccess}</p>}
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentComplaintDetailPage;
