import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  XCircle,
  Upload,
} from 'lucide-react';
import Button from '../../components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import ComplaintStatusBadge from '../../components/complaints/ComplaintStatusBadge';
import PriorityBadge from '../../components/complaints/PriorityBadge';
import EvidenceGallery from '../../components/complaints/EvidenceGallery';
import ComplaintTimeline from '../../components/complaints/ComplaintTimeline';
import complaintApi from '../../services/complaintApi';
import { COMPLAINT_STATUSES } from '../../constants/complaints';
import { supabase } from '../../config/supabase';

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
      let complaintData = null;
      try {
        const res = await complaintApi.getComplaintDetails(id);
        complaintData = res?.data || res;
      } catch (apiErr) {
        console.warn('Backend API get complaint details notice:', apiErr);
      }

      // Direct Supabase fallback
      if (!complaintData && supabase) {
        const { data: directData } = await supabase
          .from('complaints')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (directData) complaintData = directData;
      }

      // Ensure evidence, updates, and location relations are loaded
      if (complaintData && supabase) {
        if (!complaintData.evidence || complaintData.evidence.length === 0) {
          const { data: evData } = await supabase
            .from('complaint_evidence')
            .select('*')
            .eq('complaint_id', id)
            .order('created_at', { ascending: false });
          if (evData && evData.length > 0) {
            complaintData.evidence = evData;
          }
        }

        if (!complaintData.updates || complaintData.updates.length === 0) {
          const { data: upData } = await supabase
            .from('complaint_updates')
            .select('*')
            .eq('complaint_id', id)
            .order('created_at', { ascending: true });
          if (upData && upData.length > 0) {
            complaintData.updates = upData;
          }
        }

        if (!complaintData.building && complaintData.building_id) {
          const { data: bld } = await supabase.from('buildings').select('*').eq('id', complaintData.building_id).maybeSingle();
          if (bld) complaintData.building = bld;
        }
        if (!complaintData.floor && complaintData.floor_id) {
          const { data: flr } = await supabase.from('floors').select('*').eq('id', complaintData.floor_id).maybeSingle();
          if (flr) complaintData.floor = flr;
        }
        if (!complaintData.room && complaintData.room_id) {
          const { data: rm } = await supabase.from('rooms').select('*').eq('id', complaintData.room_id).maybeSingle();
          if (rm) complaintData.room = rm;
        }
      }

      if (!complaintData) {
        throw new Error('Complaint not found or you do not have permission to view it.');
      }

      setComplaint(complaintData);
    } catch (err) {
      console.error('Failed to load complaint details:', err);
      setError(
        err.response?.status === 404
          ? 'Complaint not found or you do not have permission to view it.'
          : err.response?.data?.message || err.message || 'Failed to load complaint.'
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
      let uploaded = false;
      try {
        await complaintApi.uploadEvidence(id, uploadFile);
        uploaded = true;
      } catch (apiErr) {
        console.warn('Backend API upload evidence notice:', apiErr);
      }

      // Direct Supabase fallback
      if (!uploaded && supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        let fileUrl = '';
        try {
          const sanitizedName = uploadFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const filePath = `${id}/${Date.now()}_${sanitizedName}`;
          const { error: storageErr } = await supabase.storage.from('complaints').upload(filePath, uploadFile, {
            contentType: uploadFile.type,
            upsert: true,
          });
          if (!storageErr) {
            const { data: pubData } = supabase.storage.from('complaints').getPublicUrl(filePath);
            fileUrl = pubData?.publicUrl || '';
          }
        } catch (stErr) {
          console.warn('Storage upload notice:', stErr);
        }

        if (!fileUrl && uploadFile.type.startsWith('image/')) {
          fileUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target.result);
            reader.onerror = () => resolve('');
            reader.readAsDataURL(uploadFile);
          });
        }

        const currentUserId = user?.id || complaint?.student_id;
        if (fileUrl && currentUserId) {
          const { error: insErr } = await supabase.from('complaint_evidence').insert({
            complaint_id: id,
            file_url: fileUrl,
            file_type: uploadFile.type,
            file_name: uploadFile.name,
            uploaded_by: currentUserId,
          });
          if (insErr) throw insErr;
          uploaded = true;
        }
      }

      setUploadSuccess('Evidence uploaded successfully.');
      setUploadFile(null);
      setTimeout(() => {
        setUploadModalOpen(false);
        setUploadSuccess('');
      }, 1000);
      await fetchComplaintDetails();
    } catch (err) {
      setUploadError(err.message || 'Failed to upload evidence.');
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
        <h2 className="text-lg font-bold text-[#17211B]">Unable to Load Complaint</h2>
        <p className="text-sm text-[#647168]">{error}</p>
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
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
      {/* Back Button & Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/student/complaints')}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#647168] hover:text-[#168451] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to My Complaints
        </button>

        <div className="flex items-center gap-2 text-xs text-[#647168]">
          <span>Tracking Code:</span>
          <span className="font-mono font-bold text-[#168451] bg-[#EAF6EE] border border-[#CBE7D4] px-2.5 py-1 rounded-lg">
            {complaint.tracking_code || complaint.id?.slice(0, 8)}
          </span>
        </div>
      </div>

      {/* Verification Alert Banner (Action Required) */}
      {isResolved && (
        <div className="p-6 rounded-2xl bg-[#EAF6EE] border-2 border-[#168451] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-white text-[#168451] border border-[#CBE7D4]">
                  <CheckCircle2 size={20} />
                </span>
                <h3 className="text-base font-bold text-[#17211B]">
                  Technician Marked This Issue as Resolved
                </h3>
              </div>
              <p className="text-xs text-[#647168] pl-8">
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
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
            <XCircle size={18} />
            <span>Complaint Rejected by Administration</span>
          </div>
          <div className="text-xs text-rose-700 pl-6 space-y-1">
            <p className="font-semibold text-rose-800">Reason for rejection:</p>
            <p className="p-3 rounded-xl bg-white border border-rose-200 italic text-rose-900">
              "{complaint.rejection_reason || 'No detailed reason provided.'}"
            </p>
          </div>
        </div>
      )}

      {/* Reopened Notice Banner */}
      {isReopened && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
            <RotateCcw size={18} />
            <span>Complaint Reopened by Student</span>
          </div>
          <div className="text-xs text-amber-700 pl-6 space-y-1">
            <p className="font-semibold text-amber-800">Student feedback note:</p>
            <p className="p-3 rounded-xl bg-white border border-amber-200 italic text-amber-900">
              "{complaint.reopen_reason || 'Issue reported as still persisting.'}"
            </p>
          </div>
        </div>
      )}

      {/* Verified Banner */}
      {isVerified && (
        <div className="p-4 rounded-2xl bg-[#EAF6EE] border border-[#CBE7D4] flex items-center gap-3 text-[#168451] text-xs">
          <CheckCircle2 size={18} className="text-[#168451] shrink-0" />
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
                  Detailed Description
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
            <CardHeader className="flex flex-row items-center justify-between border-b border-[#E1E9E2] pb-4">
              <div>
                <CardTitle className="text-base text-[#17211B]">
                  Media & Evidence Attachments
                </CardTitle>
                <p className="text-xs text-[#647168] mt-0.5">
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
          <Card className="bg-white border-[#E1E9E2] shadow-xs">
            <CardHeader className="border-b border-[#E1E9E2] pb-4">
              <CardTitle className="text-base text-[#17211B]">
                Complaint Lifecycle & Audit History
              </CardTitle>
              <p className="text-xs text-[#647168] mt-0.5">
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
          <Card className="bg-white border-[#E1E9E2] shadow-xs">
            <CardHeader className="border-b border-[#E1E9E2] pb-3">
              <CardTitle className="text-sm font-bold text-[#17211B]">
                Ticket Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#E1E9E2]">
                <span className="text-[#647168]">Tracking Code</span>
                <span className="font-mono font-bold text-[#17211B]">
                  {complaint.tracking_code || complaint.id?.slice(0, 8)}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-[#E1E9E2]">
                <span className="text-[#647168]">Submitted On</span>
                <span className="text-[#17211B] font-medium">{formatDate(complaint.created_at)}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-[#E1E9E2]">
                <span className="text-[#647168]">Last Updated</span>
                <span className="text-[#17211B] font-medium">{formatDate(complaint.updated_at)}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-[#E1E9E2]">
                <span className="text-[#647168]">Category</span>
                <span className="font-bold text-[#17211B]">{complaint.category}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-[#E1E9E2]">
                <span className="text-[#647168]">Current Status</span>
                <ComplaintStatusBadge status={complaint.status} size="sm" />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#647168]">Assigned Technician</span>
                <span className="font-bold text-[#17211B]">
                  {complaint.assigned_staff?.full_name ||
                    (complaint.assigned_to ? 'Technician Assigned' : 'Unassigned')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* SLA Commitment Card */}
          <div className="p-4 rounded-2xl bg-[#EAF6EE] border border-[#CBE7D4] space-y-2">
            <h4 className="text-xs font-bold text-[#168451]">CampusCoins SLA Commitment</h4>
            <p className="text-xs text-[#647168] leading-relaxed">
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
            <label className="block text-xs font-bold text-[#17211B] mb-1.5">
              Reason for Reopening <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="Describe why the issue is not fixed (e.g. 'Water is still leaking after the valve was replaced')..."
              className="w-full px-3 py-2 bg-white border border-[#E1E9E2] rounded-xl text-xs text-[#17211B] placeholder-[#647168] focus:outline-none focus:border-rose-500"
            />
            {reopenError && <p className="text-xs text-rose-600 mt-1">{reopenError}</p>}
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
            <label className="block text-xs font-bold text-[#17211B] mb-1.5">
              Choose File (Images up to 5MB, PDF up to 10MB)
            </label>
            <input
              type="file"
              accept="image/*,.pdf,video/mp4"
              onChange={(e) => setUploadFile(e.target.files[0])}
              className="w-full px-3 py-2 bg-white border border-[#E1E9E2] rounded-xl text-xs text-[#17211B] file:mr-3 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:bg-[#EAF6EE] file:text-[#168451] file:font-semibold"
            />
            {uploadError && <p className="text-xs text-rose-600 mt-1">{uploadError}</p>}
            {uploadSuccess && <p className="text-xs text-[#168451] font-semibold mt-1">{uploadSuccess}</p>}
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentComplaintDetailPage;
