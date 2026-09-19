import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  Hash,
  Shield,
  Coins,
  Camera,
  Save,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useAuth } from '../../context/AuthContext';
import { ROLES, ROLE_LABELS, ROLE_BADGE_VARIANTS } from '../../constants/roles';
import { supabase, isSupabaseConfigured } from '../../config/supabase';

// Schema for editable profile fields only
const profileSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().max(20, 'Phone number too long').optional().or(z.literal('')),
  year: z.string().max(20, 'Year is too long').optional().or(z.literal('')),
  section: z.string().max(10, 'Section is too long').optional().or(z.literal('')),
  profile_image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  department_id: z.string().optional().or(z.literal('')),
});

const ProfilePage = () => {
  const { user, profile, wallet, role, updateProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [departments, setDepartments] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch departments for department selector
  useEffect(() => {
    const fetchDepartments = async () => {
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase
            .from('departments')
            .select('id, name, code')
            .eq('is_active', true)
            .order('name');
          if (!error && data) {
            setDepartments(data);
          }
        } catch (err) {
          console.warn('[Profile] Department fetch notice:', err);
        }
      } else {
        // Fallback departments
        setDepartments([
          { id: 'dept-1', name: 'Computer Science and Engineering', code: 'CSE' },
          { id: 'dept-2', name: 'Artificial Intelligence and Machine Learning', code: 'AIML' },
          { id: 'dept-3', name: 'Information Technology', code: 'IT' },
          { id: 'dept-4', name: 'Electronics and Communication Engineering', code: 'ECE' },
          { id: 'dept-5', name: 'Electrical and Electronics Engineering', code: 'EEE' },
          { id: 'dept-6', name: 'Mechanical Engineering', code: 'ME' },
          { id: 'dept-7', name: 'Civil Engineering', code: 'CE' },
          { id: 'dept-8', name: 'Administration', code: 'ADM' },
          { id: 'dept-9', name: 'Maintenance & Facilities', code: 'MNT' },
        ]);
      }
    };

    fetchDepartments();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || profile?.name || '',
      phone: profile?.phone || '',
      year: profile?.year || 'Year 3',
      section: profile?.section || 'A',
      profile_image_url: profile?.profile_image_url || '',
      department_id: profile?.department_id || '',
    },
  });

  // Keep form updated when profile loads
  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name || profile.name || '',
        phone: profile.phone || '',
        year: profile.year || (role === ROLES.STUDENT ? 'Year 3' : ''),
        section: profile.section || (role === ROLES.STUDENT ? 'A' : ''),
        profile_image_url: profile.profile_image_url || '',
        department_id: profile.department_id || '',
      });
    }
  }, [profile, role, reset]);

  const onSubmit = async (data) => {
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      await updateProfile(data);
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setSaveError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getDashboardPath = () => {
    if (role === ROLES.STAFF) return '/staff/dashboard';
    if (role === ROLES.ADMIN) return '/admin/dashboard';
    return '/student/dashboard';
  };

  const departmentName =
    profile?.department?.name ||
    departments.find((d) => d.id === profile?.department_id)?.name ||
    'General Campus';

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Header with back action */}
      <PageHeader
        title="Account Profile"
        subtitle="Manage your personal information, college affiliation, and campus role"
        badge={
          <Badge
            variant={ROLE_BADGE_VARIANTS[role] || 'default'}
            size="sm"
            withDot
          >
            {ROLE_LABELS[role] || 'Campus User'}
          </Badge>
        }
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft size={16} />}
              onClick={() => navigate(getDashboardPath())}
            >
              Back to Dashboard
            </Button>
            {!isEditing ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setSaveError('');
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        }
      />

      {/* Alert Notices */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span className="font-semibold">Profile updated successfully!</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle size={18} className="text-rose-400 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <Card className="border-slate-800/80 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8 border-b border-slate-800/80">
          {/* Avatar */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-campus-500 to-coin-500 p-1 shadow-lg shadow-campus-500/20">
              <div className="w-full h-full rounded-[22px] bg-slate-900 flex items-center justify-center text-3xl font-extrabold text-slate-100 overflow-hidden">
                {profile?.profile_image_url ? (
                  <img
                    src={profile.profile_image_url}
                    alt={profile.full_name || 'User avatar'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>
                    {(profile?.full_name || profile?.name || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            {isEditing && (
              <div className="absolute inset-0 rounded-3xl bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <Camera size={20} className="text-white" />
              </div>
            )}
          </div>

          {/* User Details */}
          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-2xl font-black text-white tracking-tight">
                {profile?.full_name || profile?.name || 'Campus Member'}
              </h2>
              <Badge
                variant={ROLE_BADGE_VARIANTS[role] || 'default'}
                size="sm"
                withDot
              >
                {ROLE_LABELS[role] || 'Student'}
              </Badge>
            </div>

            <p className="text-xs text-slate-400 font-mono">
              {profile?.email || user?.email || 'user@campus.edu'}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <Building2 size={14} className="text-slate-500" />
                <span>{departmentName}</span>
              </div>
              {role === ROLES.STUDENT && (
                <div className="flex items-center gap-1.5">
                  <Hash size={14} className="text-slate-500" />
                  <span>ID: {profile?.student_id || 'STU-2024-8842'}</span>
                </div>
              )}
              {role === ROLES.STAFF && (
                <div className="flex items-center gap-1.5">
                  <Shield size={14} className="text-slate-500" />
                  <span>Staff ID: {profile?.staff_id || 'STF-402'}</span>
                </div>
              )}
              {role === ROLES.STUDENT && (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold">
                  <Coins size={12} className="text-coin-400" />
                  <span>{wallet?.balance ?? 0} Coins</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit / View Form */}
        <div className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name (Safe Editable) */}
              <Input
                label="Full Name"
                disabled={!isEditing}
                error={errors.full_name?.message}
                {...register('full_name')}
              />

              {/* Email Address (Immutable Security Field) */}
              <Input
                label="College Email (Immutable)"
                value={profile?.email || user?.email || ''}
                disabled
                helperText="Email cannot be changed after registration"
                leftIcon={<Mail size={16} />}
              />

              {/* Department (Safe Editable from available list) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                  Academic Department
                </label>
                <select
                  disabled={!isEditing}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:border-campus-500"
                  {...register('department_id')}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id} className="bg-slate-900">
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone (Safe Editable) */}
              <Input
                label="Phone Contact"
                placeholder="+1 (555) 000-0000"
                disabled={!isEditing}
                leftIcon={<Phone size={16} />}
                error={errors.phone?.message}
                {...register('phone')}
              />

              {/* Year (Safe Editable for students) */}
              {role === ROLES.STUDENT && (
                <Input
                  label="Academic Year"
                  placeholder="e.g. Year 1, Year 2, Year 3, Year 4"
                  disabled={!isEditing}
                  leftIcon={<Calendar size={16} />}
                  error={errors.year?.message}
                  {...register('year')}
                />
              )}

              {/* Section (Safe Editable for students) */}
              {role === ROLES.STUDENT && (
                <Input
                  label="Class Section"
                  placeholder="e.g. Section A"
                  disabled={!isEditing}
                  leftIcon={<Hash size={16} />}
                  error={errors.section?.message}
                  {...register('section')}
                />
              )}

              {/* Profile Image URL (Safe Editable) */}
              <div className="md:col-span-2">
                <Input
                  label="Profile Image URL"
                  placeholder="https://images.unsplash.com/..."
                  disabled={!isEditing}
                  error={errors.profile_image_url?.message}
                  helperText="Provide a public HTTPS image URL for your profile picture"
                  {...register('profile_image_url')}
                />
              </div>

              {/* Immutable System Fields Notice */}
              <div className="md:col-span-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
                <Shield size={16} className="text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-300 block">Security Policy:</span>
                  User role (<span className="text-campus-400 uppercase font-mono">{role}</span>), account UUID,
                  and verified college email are cryptographically locked and can only be altered by a campus system administrator.
                </div>
              </div>
            </div>

            {/* Save Button Bar */}
            {isEditing && (
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSaving}
                  leftIcon={<Save size={16} />}
                >
                  Save Profile Changes
                </Button>
              </div>
            )}
          </form>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;
