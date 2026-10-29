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
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
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
  const { user, profile, wallet, role, updateProfile } = useAuth();
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
    'Computer Science and Engineering';

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Header with back action */}
      <PageHeader
        title="Account Profile"
        subtitle="Manage your personal information, college affiliation, and campus role"
        badge={
          <Badge
            variant={ROLE_BADGE_VARIANTS[role] || 'success'}
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
        <div className="p-4 rounded-xl bg-[#EAF6EE] border border-[#CBE7D4] text-[#168451] text-xs flex items-center gap-2.5 animate-fadeIn font-bold shadow-xs">
          <CheckCircle2 size={18} className="text-[#168451] shrink-0" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-fadeIn font-semibold">
          <AlertCircle size={18} className="text-rose-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <Card className="border-[#E1E9E2] bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8 border-b border-[#E1E9E2]">
          {/* Avatar */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-3xl bg-[#EAF6EE] border-2 border-[#168451] p-1 shadow-xs flex items-center justify-center">
              <div className="w-full h-full rounded-[20px] bg-white flex items-center justify-center text-3xl font-black text-[#168451] overflow-hidden">
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
              <div className="absolute inset-0 rounded-3xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <Camera size={20} className="text-white" />
              </div>
            )}
          </div>

          {/* User Details */}
          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-2xl font-black text-[#17211B] tracking-tight">
                {profile?.full_name || profile?.name || 'Campus Member'}
              </h2>
              <Badge
                variant={ROLE_BADGE_VARIANTS[role] || 'success'}
                size="sm"
                withDot
              >
                {ROLE_LABELS[role] || 'Student'}
              </Badge>
            </div>

            <p className="text-xs text-[#647168] font-mono">
              {profile?.email || user?.email || 'user@campus.edu'}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-[#17211B]">
              <div className="flex items-center gap-1.5">
                <Building2 size={14} className="text-[#168451]" />
                <span className="font-semibold">{departmentName}</span>
              </div>
              {role === ROLES.STUDENT && (
                <div className="flex items-center gap-1.5">
                  <Hash size={14} className="text-[#647168]" />
                  <span>ID: {profile?.student_id || 'STU-2024-8842'}</span>
                </div>
              )}
              {role === ROLES.STAFF && (
                <div className="flex items-center gap-1.5">
                  <Shield size={14} className="text-sky-700" />
                  <span>Staff ID: {profile?.staff_id || 'STF-402'}</span>
                </div>
              )}
              {role === ROLES.STUDENT && (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF6EE] text-[#168451] border border-[#CBE7D4] font-bold">
                  <Coins size={12} className="text-[#168451]" />
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
              {/* Full Name */}
              <Input
                label="Full Name"
                disabled={!isEditing}
                error={errors.full_name?.message}
                {...register('full_name')}
              />

              {/* Email Address */}
              <Input
                label="College Email (Immutable)"
                value={profile?.email || user?.email || ''}
                disabled
                helperText="Email cannot be changed after registration"
                leftIcon={<Mail size={16} />}
              />

              {/* Department */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold tracking-wider text-[#17211B] uppercase">
                  Academic Department
                </label>
                <select
                  disabled={!isEditing}
                  className="w-full bg-white border border-[#E1E9E2] rounded-xl px-3.5 py-2.5 text-sm text-[#17211B] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:border-[#168451]"
                  {...register('department_id')}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone */}
              <Input
                label="Phone Contact"
                placeholder="+1 (555) 000-0000"
                disabled={!isEditing}
                leftIcon={<Phone size={16} />}
                error={errors.phone?.message}
                {...register('phone')}
              />

              {/* Year */}
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

              {/* Section */}
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

              {/* Profile Image URL */}
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

              {/* Immutable Security Notice */}
              <div className="md:col-span-2 p-3.5 rounded-2xl bg-[#EAF6EE] border border-[#CBE7D4] flex items-start gap-2.5 text-xs text-[#17211B]">
                <Shield size={16} className="text-[#168451] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#168451] block">Security Policy:</span>
                  User role (<span className="text-[#168451] uppercase font-mono font-bold">{role}</span>), account UUID,
                  and verified college email are cryptographically locked and can only be altered by a campus system administrator.
                </div>
              </div>
            </div>

            {/* Save Button Bar */}
            {isEditing && (
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E1E9E2]">
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
