import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  AlertTriangle,
  UploadCloud,
  File,
  X,
  CheckCircle2,
  ArrowLeft,
  Send,
  AlertOctagon,
  ShieldCheck,
  Info,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LocationSelector from '../../components/complaints/LocationSelector';
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_PRIORITIES,
} from '../../constants/complaints';
import complaintApi from '../../services/complaintApi';

const formSchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(150, 'Title cannot exceed 150 characters'),
  category: z.string().min(1, 'Please select a valid category'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  description: z
    .string()
    .min(10, 'Please describe the issue in at least 10 characters')
    .max(5000, 'Description cannot exceed 5000 characters'),
  additional_notes: z.string().max(2000).optional(),
});

const ReportIssuePage = () => {
  const navigate = useNavigate();

  // Location state (cascaded)
  const [buildingId, setBuildingId] = useState('');
  const [floorId, setFloorId] = useState('');
  const [roomId, setRoomId] = useState('');

  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      category: '',
      priority: 'medium',
      description: '',
      additional_notes: '',
    },
  });

  const selectedPriority = watch('priority');

  const handleFileChange = (e) => {
    setFileError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: max 25MB
    if (file.size > 25 * 1024 * 1024) {
      setFileError('File size exceeds the 25MB overall threshold.');
      return;
    }

    // Specific MIME limits
    if (file.type.startsWith('image/') && file.size > 5 * 1024 * 1024) {
      setFileError('Images must be smaller than 5 MB.');
      return;
    }
    if (file.type === 'application/pdf' && file.size > 10 * 1024 * 1024) {
      setFileError('PDF documents must be smaller than 10 MB.');
      return;
    }

    setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileError('');
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // 1. Create Complaint Record
      const complaint = await complaintApi.createComplaint({
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        building_id: buildingId || null,
        floor_id: floorId || null,
        room_id: roomId || null,
      });

      // 2. Upload Evidence if selected
      if (selectedFile && complaint?.id) {
        try {
          await complaintApi.uploadEvidence(complaint.id, selectedFile);
        } catch (uploadErr) {
          console.warn('Evidence upload notice:', uploadErr);
        }
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        navigate('/student/complaints');
      }, 1500);
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit complaint. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <PageHeader
        title="Report a Campus Issue"
        subtitle="Submit defective infrastructure, lab issues, or facilities maintenance requests"
        badge={
          <Badge variant="gold" size="sm" withDot>
            Ticket Intake
          </Badge>
        }
        actions={
          <Link to="/student/complaints">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={16} />}>
              Back to Complaints
            </Button>
          </Link>
        }
      />

      {/* Success Notification */}
      {submitSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
          <div>
            <p className="font-bold">Complaint Submitted Successfully!</p>
            <p className="text-xs text-slate-300">
              Your ticket has been placed into the administrative triage queue. Redirecting...
            </p>
          </div>
        </div>
      )}

      {/* Form Error Banner */}
      {submitError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
          <AlertTriangle size={18} className="text-rose-400 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Overview */}
        <Card className="p-6 sm:p-7 border-slate-800/80">
          <CardHeader className="p-0 pb-5 border-b border-slate-800/60 mb-5">
            <CardTitle>1. Issue Overview</CardTitle>
            <p className="text-xs text-slate-400">
              Provide a clear title and select the relevant facility category.
            </p>
          </CardHeader>

          <div className="space-y-5">
            {/* Title */}
            <Input
              label="Complaint Title"
              placeholder="e.g. Broken Air Conditioning in CS Lab 3"
              error={errors.title?.message}
              {...register('title')}
            />

            {/* Category */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                Facility Category
              </label>
              <select
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-campus-500 transition-colors"
                {...register('category')}
              >
                <option value="">Select Category</option>
                {COMPLAINT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900">
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-xs text-rose-400 font-medium">{errors.category.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                Detailed Description
              </label>
              <textarea
                rows={4}
                placeholder="Describe the defect, when it began, and any safety hazards..."
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-campus-500 transition-colors"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-rose-400 font-medium">{errors.description.message}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Section 2: Location Selection */}
        <Card className="p-6 sm:p-7 border-slate-800/80">
          <CardHeader className="p-0 pb-5 border-b border-slate-800/60 mb-5">
            <CardTitle>2. Campus Location</CardTitle>
            <p className="text-xs text-slate-400">
              Pinpoint the building, floor, and room so technicians locate the issue quickly.
            </p>
          </CardHeader>

          <LocationSelector
            buildingId={buildingId}
            floorId={floorId}
            roomId={roomId}
            onBuildingChange={setBuildingId}
            onFloorChange={setFloorId}
            onRoomChange={setRoomId}
          />
        </Card>

        {/* Section 3: Priority Suggestion */}
        <Card className="p-6 sm:p-7 border-slate-800/80">
          <CardHeader className="p-0 pb-5 border-b border-slate-800/60 mb-5">
            <CardTitle>3. Urgency & Priority Suggestion</CardTitle>
            <p className="text-xs text-slate-400">
              Indicate how severely this defect affects safety or learning operations.
            </p>
          </CardHeader>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {COMPLAINT_PRIORITIES.map((p) => {
              const isSelected = selectedPriority === p.value;
              return (
                <label
                  key={p.value}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-campus-500/10 border-campus-500 text-slate-100 ring-1 ring-campus-500/40 shadow-sm'
                      : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    value={p.value}
                    className="sr-only"
                    {...register('priority')}
                  />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-200">{p.label}</span>
                    <Badge variant={p.variant} size="sm">
                      {p.value}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{p.description}</p>
                </label>
              );
            })}
          </div>

          {/* Informational Warning */}
          {selectedPriority === 'critical' ? (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertOctagon size={16} className="text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Critical Safety Notice:</span>
                Critical safety issues are reviewed immediately by emergency maintenance staff.
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
              <Info size={14} className="text-slate-500 shrink-0" />
              <span>Priority is evaluated as a suggestion and verified by campus administration.</span>
            </div>
          )}
        </Card>

        {/* Section 4: Evidence Upload */}
        <Card className="p-6 sm:p-7 border-slate-800/80">
          <CardHeader className="p-0 pb-5 border-b border-slate-800/60 mb-5">
            <CardTitle>4. Evidence & Photos</CardTitle>
            <p className="text-xs text-slate-400">
              Upload photos, video clips, or PDF reports of the broken component (Images ≤ 5MB, PDF ≤ 10MB, Video ≤ 25MB).
            </p>
          </CardHeader>

          {selectedFile ? (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-campus-500/20 text-campus-400 flex items-center justify-center shrink-0">
                  <File size={20} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-slate-200 truncate">{selectedFile.name}</p>
                  <p className="text-[11px] text-slate-400">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; {selectedFile.type}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                title="Remove file"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-900/30 group">
              <input
                type="file"
                className="sr-only"
                accept="image/jpeg,image/png,image/webp,application/pdf,video/mp4,video/quicktime"
                onChange={handleFileChange}
              />
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-slate-400 group-hover:text-campus-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-all">
                <UploadCloud size={24} />
              </div>
              <p className="text-xs font-semibold text-slate-200 mb-1">
                Click to browse or drop an attachment
              </p>
              <p className="text-[11px] text-slate-500">
                Supports JPG, PNG, WEBP (≤5MB), PDF (≤10MB), MP4/MOV (≤25MB)
              </p>
            </label>
          )}

          {fileError && (
            <p className="text-xs text-rose-400 font-medium mt-2">{fileError}</p>
          )}
        </Card>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to="/student/complaints">
            <Button variant="outline" size="md">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            rightIcon={<Send size={16} />}
          >
            Submit Complaint
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ReportIssuePage;
