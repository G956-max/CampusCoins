import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Info,
  Layers,
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
import api from '../../services/api';
import { supabase } from '../../config/supabase';

const formSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(150, 'Title cannot exceed 150 characters'),
  category: z.string().min(1, 'Please select a valid category'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  description: z
    .string()
    .min(20, 'Please describe the issue in at least 20 characters')
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

  // AI & Duplicate suggestions state
  const [isClassifying, setIsClassifying] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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

  const titleVal = watch('title');
  const descVal = watch('description');
  const selectedPriority = watch('priority');

  // Debounced duplicate detection
  useEffect(() => {
    if (!titleVal || titleVal.length < 8) {
      setDuplicateWarning(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.post('/api/complaints/check-duplicate', {
          title: titleVal,
          description: descVal || '',
          category: watch('category') || undefined,
        });
        const dupData = res?.data || res;
        if (dupData?.hasPossibleDuplicates) {
          setDuplicateWarning(dupData);
        } else {
          setDuplicateWarning(null);
        }
      } catch {
        // Non-blocking duplicate check
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [titleVal, descVal, watch]);

  // AI Smart Suggestion
  const handleAiSuggest = async () => {
    if (!titleVal && !descVal) return;
    setIsClassifying(true);
    setAiSuggestion(null);

    try {
      const res = await api.post('/api/complaints/ai-classify', {
        title: titleVal,
        description: descVal || '',
      });
      const aiData = res?.data || res;
      if (aiData?.category) {
        const cat = aiData.category.suggestedCategory || aiData.category;
        const pri = aiData.priority?.suggestedPriority || aiData.priority || 'medium';
        setAiSuggestion({
          category: cat,
          priority: pri,
          confidence: aiData.category.confidence || 0.9,
          explanation: aiData.category.explanation || 'Analyzed via campus ticket NLP engine',
        });
        if (cat) setValue('category', cat);
        if (pri) setValue('priority', pri);
      }
    } catch {
      // Rule-based fallback if offline
      const t = (titleVal + ' ' + descVal).toLowerCase();
      let cat = 'Electrical';
      if (t.includes('water') || t.includes('leak') || t.includes('pipe') || t.includes('tap') || t.includes('sink')) cat = 'Plumbing';
      else if (t.includes('ac') || t.includes('heat') || t.includes('cooling') || t.includes('temp') || t.includes('air')) cat = 'HVAC';
      else if (t.includes('wifi') || t.includes('internet') || t.includes('network') || t.includes('lan')) cat = 'Wi-Fi';
      else if (t.includes('chair') || t.includes('desk') || t.includes('bench') || t.includes('table')) cat = 'Furniture';

      let pri = 'medium';
      if (t.includes('hazard') || t.includes('sparks') || t.includes('fire') || t.includes('emergency')) pri = 'critical';
      else if (t.includes('flood') || t.includes('broken') || t.includes('urgent')) pri = 'high';

      setAiSuggestion({ category: cat, priority: pri, confidence: 0.85, explanation: 'Rule-based pattern matching baseline' });
      setValue('category', cat);
      setValue('priority', pri);
    } finally {
      setIsClassifying(false);
    }
  };

  const handleFileChange = (e) => {
    setFileError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      setFileError('File size exceeds 25 MB limit.');
      return;
    }
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
      let complaint = null;
      const trackingCode = `CC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // 1. Direct Supabase Insert First (Authenticated client ensures immediate DB persistence)
      if (supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            let safeBuildingId = buildingId || null;
            let safeFloorId = floorId || null;
            let safeRoomId = roomId || null;

            // Verify foreign key integrity before direct insert
            if (safeFloorId) {
              const { data: flr } = await supabase.from('floors').select('id').eq('id', safeFloorId).maybeSingle();
              if (!flr) safeFloorId = null;
            }
            if (safeRoomId) {
              const { data: rm } = await supabase.from('rooms').select('id').eq('id', safeRoomId).maybeSingle();
              if (!rm) safeRoomId = null;
            }
            if (safeBuildingId) {
              const { data: bld } = await supabase.from('buildings').select('id').eq('id', safeBuildingId).maybeSingle();
              if (!bld) safeBuildingId = null;
            }

            const { data: directData, error: directErr } = await supabase
              .from('complaints')
              .insert({
                student_id: user.id,
                tracking_code: trackingCode,
                title: data.title,
                description: data.description,
                category: data.category,
                priority: data.priority,
                status: 'submitted',
                building_id: safeBuildingId,
                floor_id: safeFloorId,
                room_id: safeRoomId,
              })
              .select()
              .single();

            if (directErr) {
              console.warn('Direct Supabase insert notice:', directErr);
            } else if (directData) {
              complaint = directData;
              // Add initial timeline update in Supabase
              await supabase.from('complaint_updates').insert({
                complaint_id: directData.id,
                updated_by: user.id,
                status: 'submitted',
                comment: 'Complaint created and submitted for review.',
              }).catch(() => {});
            }
          }
        } catch (supaErr) {
          console.warn('Direct Supabase insert exception:', supaErr);
        }
      }

      // 2. If direct Supabase insert was not completed, use backend API
      if (!complaint) {
        const res = await complaintApi.createComplaint({
          title: data.title,
          description: data.description,
          category: data.category,
          priority: data.priority,
          building_id: buildingId || null,
          floor_id: floorId || null,
          room_id: roomId || null,
        });
        complaint = res?.data || res;
      }

      // 3. Upload evidence if attached
      if (selectedFile && complaint?.id) {
        let uploaded = false;
        try {
          await complaintApi.uploadEvidence(complaint.id, selectedFile);
          uploaded = true;
        } catch (uploadErr) {
          console.warn('Backend API evidence upload notice:', uploadErr);
        }

        // Direct Supabase fallback for evidence storage and database
        if (!uploaded && supabase) {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            const currentUserId = user?.id || complaint.student_id;
            let fileUrl = '';

            try {
              const sanitizedName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
              const filePath = `${complaint.id}/${Date.now()}_${sanitizedName}`;
              const { error: storageErr } = await supabase.storage.from('complaints').upload(filePath, selectedFile, {
                contentType: selectedFile.type,
                upsert: true,
              });
              if (!storageErr) {
                const { data: pubData } = supabase.storage.from('complaints').getPublicUrl(filePath);
                fileUrl = pubData?.publicUrl || '';
              }
            } catch (sErr) {
              console.warn('Supabase storage upload notice:', sErr);
            }

            if (!fileUrl && selectedFile.type.startsWith('image/')) {
              fileUrl = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = () => resolve('');
                reader.readAsDataURL(selectedFile);
              });
            }

            if (fileUrl && currentUserId) {
              await supabase.from('complaint_evidence').insert({
                complaint_id: complaint.id,
                file_url: fileUrl,
                file_type: selectedFile.type,
                file_name: selectedFile.name,
                uploaded_by: currentUserId,
              });
            }
          } catch (supaEvidenceErr) {
            console.warn('Direct Supabase evidence fallback notice:', supaEvidenceErr);
          }
        }
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        navigate('/student/complaints');
      }, 1500);
    } catch (err) {
      console.error('Submit error:', err);
      setSubmitError(err.message || 'Failed to submit complaint. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <PageHeader
        title="Report a Campus Defect"
        subtitle="Submit defective infrastructure, lab maintenance, or facility requests to earn CampusCoins"
        badge={
          <Badge variant="success" size="sm" withDot>
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
        <div className="p-4 rounded-xl bg-[#EAF6EE] border border-[#CBE7D4] text-[#168451] text-sm flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 size={20} className="shrink-0" />
          <div>
            <p className="font-bold">Complaint Submitted Successfully!</p>
            <p className="text-xs text-[#647168]">
              Your ticket has been placed into the administrative triage queue. Redirecting...
            </p>
          </div>
        </div>
      )}

      {/* Form Error Banner */}
      {submitError && (
        <div className="p-4 rounded-xl bg-[#FDF2F2] border border-[#F8D2D2] text-[#C43D3D] text-xs flex items-center gap-2.5 animate-fadeIn">
          <AlertTriangle size={18} className="shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Smart Duplicate Advisory Banner */}
      {duplicateWarning && (
        <div className="p-4 rounded-xl bg-[#FEF9EE] border border-[#F8E7C5] text-[#17211B] text-xs space-y-1.5 animate-fadeIn">
          <div className="flex items-center gap-2 font-bold text-[#B7791F]">
            <Info size={16} />
            <span>Similar Issue Already Reported On Campus</span>
          </div>
          <p className="text-xs text-[#647168] leading-relaxed">
            A complaint with similar description was previously logged (
            <span className="font-semibold text-[#17211B]">
              {duplicateWarning.topMatch?.title || 'Existing ticket'}
            </span>
            ). You can still submit this report if it represents a separate incident or recurring defect.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Overview */}
        <Card className="p-6 sm:p-7 border-[#E1E9E2]">
          <CardHeader className="p-0 pb-4 border-b border-[#E1E9E2] mb-5 flex-row items-center justify-between">
            <div>
              <CardTitle>1. Issue Overview</CardTitle>
              <p className="text-xs text-[#647168]">
                Provide a clear title and describe the defective equipment or infrastructure.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Sparkles size={14} className="text-[#168451]" />}
              onClick={handleAiSuggest}
              isLoading={isClassifying}
              disabled={!titleVal && !descVal}
            >
              AI Auto-Classify
            </Button>
          </CardHeader>

          {/* AI Suggestion Feedback */}
          {aiSuggestion && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#EAF6EE] border border-[#CBE7D4] text-xs flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#168451]" />
                <span className="text-[#17211B]">
                  Suggested: <strong className="text-[#168451]">{aiSuggestion.category}</strong> • Priority: <strong className="capitalize">{aiSuggestion.priority}</strong>
                </span>
              </div>
              <span className="text-[11px] text-[#647168]">
                {Math.round(aiSuggestion.confidence * 100)}% Confidence
              </span>
            </div>
          )}

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
              <label className="block text-xs font-semibold tracking-wide text-[#17211B]">
                Facility Category
              </label>
              <select
                className="w-full bg-white border border-[#E1E9E2] rounded-xl px-3.5 py-2.5 text-sm text-[#17211B] focus:outline-none focus:border-[#168451] focus:ring-2 focus:ring-[#168451]/20 transition-colors shadow-sm"
                {...register('category')}
              >
                <option value="">Select Category</option>
                {COMPLAINT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-xs text-[#C43D3D] font-medium">{errors.category.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold tracking-wide text-[#17211B]">
                Detailed Description (Min. 20 chars)
              </label>
              <textarea
                rows={4}
                placeholder="Describe the defect, when it began, room temperature, sounds, or safety risks..."
                className="w-full bg-white border border-[#E1E9E2] rounded-xl p-3.5 text-sm text-[#17211B] placeholder-[#647168]/50 focus:outline-none focus:border-[#168451] focus:ring-2 focus:ring-[#168451]/20 transition-colors shadow-sm"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-[#C43D3D] font-medium">{errors.description.message}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Section 2: Location Selection */}
        <Card className="p-6 sm:p-7 border-[#E1E9E2]">
          <CardHeader className="p-0 pb-4 border-b border-[#E1E9E2] mb-5">
            <CardTitle>2. Campus Location Hierarchy</CardTitle>
            <p className="text-xs text-[#647168]">
              Pinpoint the building, floor, and room so maintenance technicians locate the issue quickly.
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

        {/* Section 3: Priority */}
        <Card className="p-6 sm:p-7 border-[#E1E9E2]">
          <CardHeader className="p-0 pb-4 border-b border-[#E1E9E2] mb-5">
            <CardTitle>3. Urgency & Severity</CardTitle>
            <p className="text-xs text-[#647168]">
              Indicate how severely this defect affects safety, classes, or campus operations.
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
                      ? 'bg-[#EAF6EE] border-[#168451] text-[#17211B] ring-1 ring-[#168451]'
                      : 'bg-white border-[#E1E9E2] text-[#647168] hover:border-[#168451]/50'
                  }`}
                >
                  <input
                    type="radio"
                    value={p.value}
                    className="sr-only"
                    {...register('priority')}
                  />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#17211B] capitalize">{p.label}</span>
                    <Badge variant={p.variant} size="sm">
                      {p.value}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-[#647168] leading-snug">{p.description}</p>
                </label>
              );
            })}
          </div>

          {selectedPriority === 'critical' ? (
            <div className="p-3.5 rounded-xl bg-[#FDF2F2] border border-[#F8D2D2] text-[#C43D3D] text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertOctagon size={16} className="shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Critical Safety Notice:</span>
                Critical safety issues are flagged for immediate emergency maintenance response.
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-[#F7FAF7] border border-[#E1E9E2] text-[#647168] text-xs flex items-center gap-2">
              <Info size={14} className="shrink-0" />
              <span>Priority is evaluated as a suggestion and verified by campus administration.</span>
            </div>
          )}
        </Card>

        {/* Section 4: Evidence Upload */}
        <Card className="p-6 sm:p-7 border-[#E1E9E2]">
          <CardHeader className="p-0 pb-4 border-b border-[#E1E9E2] mb-5">
            <CardTitle>4. Evidence & Photos</CardTitle>
            <p className="text-xs text-[#647168]">
              Attach clear photographic or video proof of the broken facility (Images ≤ 5MB, PDF ≤ 10MB, Video ≤ 25MB).
            </p>
          </CardHeader>

          {selectedFile ? (
            <div className="p-4 rounded-xl bg-[#F7FAF7] border border-[#E1E9E2] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-[#EAF6EE] text-[#168451] flex items-center justify-center shrink-0 border border-[#CBE7D4]">
                  <File size={20} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-[#17211B] truncate">{selectedFile.name}</p>
                  <p className="text-[11px] text-[#647168]">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; {selectedFile.type}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="p-1.5 rounded-lg text-[#647168] hover:text-[#C43D3D] hover:bg-[#FDF2F2] transition-colors"
                title="Remove file"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-[#E1E9E2] hover:border-[#168451] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#F7FAF7]/60 group">
              <input
                type="file"
                className="sr-only"
                accept="image/jpeg,image/png,image/webp,application/pdf,video/mp4,video/quicktime"
                onChange={handleFileChange}
              />
              <div className="w-12 h-12 rounded-2xl bg-[#EAF6EE] border border-[#CBE7D4] text-[#168451] group-hover:scale-105 flex items-center justify-center mb-3 transition-all">
                <UploadCloud size={24} />
              </div>
              <p className="text-xs font-semibold text-[#17211B] mb-1">
                Click to browse or drop photographic evidence
              </p>
              <p className="text-[11px] text-[#647168]">
                Supports JPG, PNG, WEBP (≤5MB), PDF (≤10MB), MP4/MOV (≤25MB)
              </p>
            </label>
          )}

          {fileError && (
            <p className="text-xs text-[#C43D3D] font-medium mt-2">{fileError}</p>
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
