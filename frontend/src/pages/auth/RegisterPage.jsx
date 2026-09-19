import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Coins,
  User,
  Mail,
  Lock,
  ArrowRight,
  ShieldAlert,
  GraduationCap,
  Briefcase,
  AlertCircle,
  Info,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { Card } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';

// Zod validation schema for registration
const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(50, 'Full name is too long'),
    collegeEmail: z
      .string()
      .min(1, 'College email is required')
      .email('Please enter a valid email address')
      .refine(
        (val) =>
          val.endsWith('.edu') ||
          val.includes('campus') ||
          val.includes('univ') ||
          val.includes('@'),
        'Please use your official college domain email if available'
      ),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    role: z.enum([ROLES.STUDENT, ROLES.STAFF], {
      errorMap: () => ({ message: 'Please select a valid role' }),
    }),
    agreeTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept campus platform terms' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const RegisterPage = () => {
  const { register: registerAuth, loading } = useAuth();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      collegeEmail: '',
      password: '',
      confirmPassword: '',
      role: ROLES.STUDENT,
      agreeTerms: false,
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setAuthError('');
    try {
      const user = await registerAuth({
        fullName: data.fullName,
        collegeEmail: data.collegeEmail,
        role: data.role,
      });

      if (user.role === ROLES.STAFF) {
        navigate('/staff/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setAuthError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-campus-500 to-coin-500 flex items-center justify-center text-slate-950 shadow-md">
              <Coins size={22} className="stroke-[2.5]" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">
              Campus<span className="text-campus-400">Coins</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Create Your Account
          </h2>
          <p className="text-xs text-slate-400">
            Join the campus improvement community and start earning tokens
          </p>
        </div>

        {/* Register Card */}
        <Card className="p-6 sm:p-8 border-slate-800/90 bg-slate-900/70">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Full Name */}
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. Alex Rivera"
              leftIcon={<User size={18} />}
              error={errors.fullName?.message}
              {...register('fullName')}
            />

            {/* College Email */}
            <Input
              label="College Email"
              type="email"
              placeholder="e.g. alex.rivera@campus.edu"
              leftIcon={<Mail size={18} />}
              error={errors.collegeEmail?.message}
              helperText="Requires your institutional or campus email address"
              {...register('collegeEmail')}
            />

            {/* Role Selection (Student vs Staff Only) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                Account Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedRole === ROLES.STUDENT
                      ? 'bg-campus-500/10 border-campus-500/50 text-slate-100 ring-1 ring-campus-500/30'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    value={ROLES.STUDENT}
                    className="sr-only"
                    {...register('role')}
                  />
                  <GraduationCap
                    size={20}
                    className={
                      selectedRole === ROLES.STUDENT
                        ? 'text-campus-400'
                        : 'text-slate-500'
                    }
                  />
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-200">Student</p>
                    <p className="text-[10px] text-slate-400">Report & Earn</p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedRole === ROLES.STAFF
                      ? 'bg-sky-500/10 border-sky-500/50 text-slate-100 ring-1 ring-sky-500/30'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    value={ROLES.STAFF}
                    className="sr-only"
                    {...register('role')}
                  />
                  <Briefcase
                    size={20}
                    className={
                      selectedRole === ROLES.STAFF
                        ? 'text-sky-400'
                        : 'text-slate-500'
                    }
                  />
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-200">Staff</p>
                    <p className="text-[10px] text-slate-400">Department Ops</p>
                  </div>
                </label>
              </div>
              {errors.role && (
                <p className="text-xs text-rose-400 font-medium">
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Note regarding Admin registration policy */}
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <Info size={14} className="text-slate-500 mt-0.5 shrink-0" />
              <span>
                Note: <strong>Campus Administrator</strong> accounts cannot be registered publicly
                and are provisioned strictly via campus enterprise invitations.
              </span>
            </div>

            {/* Password */}
            <Input
              label="Password"
              type="password"
              placeholder="Minimum 6 characters, 1 uppercase & 1 number"
              leftIcon={<Lock size={18} />}
              error={errors.password?.message}
              {...register('password')}
            />

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              leftIcon={<Lock size={18} />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            {/* Terms and conditions checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 rounded bg-slate-800 border-slate-700 text-campus-500 focus:ring-campus-500/30"
                  {...register('agreeTerms')}
                />
                <span className="text-xs text-slate-400 leading-snug">
                  I agree to report genuine campus issues responsibly and adhere to the{' '}
                  <span className="text-campus-400 hover:underline">Honor Code</span>.
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="text-xs text-rose-400 font-medium mt-1">
                  {errors.agreeTerms.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-3"
              isLoading={loading}
              rightIcon={<ArrowRight size={18} />}
            >
              Complete Registration
            </Button>
          </form>

          {/* Switch to Login */}
          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-campus-400 hover:text-campus-300 font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
