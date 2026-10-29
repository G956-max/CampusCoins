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
  GraduationCap,
  Briefcase,
  AlertCircle,
  Info,
  CheckCircle2,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';

// Zod validation schema for registration
const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Full name is required')
      .min(2, 'Full name must be at least 2 characters')
      .max(60, 'Full name is too long'),
    collegeEmail: z
      .string()
      .min(1, 'College email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must contain at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    role: z.enum([ROLES.STUDENT, ROLES.STAFF], {
      errorMap: () => ({ message: 'Role must be Student or Staff' }),
    }),
    agreeTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the campus platform honor code' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ['confirmPassword'],
  });

const RegisterPage = () => {
  const { register: registerAuth, loading } = useAuth();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState('');
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

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
      const result = await registerAuth({
        fullName: data.fullName,
        collegeEmail: data.collegeEmail,
        password: data.password,
        role: data.role,
      });

      if (result.emailConfirmationRequired) {
        setRegisteredEmail(data.collegeEmail);
        setEmailConfirmationRequired(true);
      } else {
        if (data.role === ROLES.STAFF) {
          navigate('/staff/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      }
    } catch (err) {
      setAuthError(err.message || 'Registration failed. Please check your details.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative bg-[#F7FAF7]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#168451]/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 group mb-2">
            <div className="w-11 h-11 rounded-2xl bg-[#168451] flex items-center justify-center text-white shadow-sm">
              <Coins size={22} className="stroke-[2.5]" />
            </div>
            <span className="text-2xl font-black text-[#17211B] tracking-tight">
              Campus<span className="text-[#168451]">Coins</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-[#17211B]">
            Create Your Account
          </h2>
          <p className="text-xs text-[#647168]">
            Join the campus civic platform and start earning CampusCoins
          </p>
        </div>

        {/* Email Confirmation Notice Screen */}
        {emailConfirmationRequired ? (
          <Card className="p-8 border-[#E1E9E2] bg-white text-center space-y-4 shadow-sm animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-[#EAF6EE] text-[#168451] border border-[#CBE7D4] flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-lg font-bold text-[#17211B]">
              Registration successful!
            </h3>
            <p className="text-sm text-[#647168] leading-relaxed max-w-md mx-auto">
              Please verify your college email before logging in.
            </p>
            <p className="text-xs text-[#17211B] font-mono bg-[#F7FAF7] p-3 rounded-xl border border-[#E1E9E2]">
              Verification sent to: <span className="text-[#168451] font-semibold">{registeredEmail}</span>
            </p>
            <div className="pt-2">
              <Link to="/login">
                <Button variant="primary" size="md" rightIcon={<ArrowRight size={16} />}>
                  Proceed to Login
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          /* Register Card */
          <Card className="p-6 sm:p-8 border-[#E1E9E2] bg-white shadow-sm">
            {/* Quick banner for existing accounts */}
            <div className="mb-5 p-3 rounded-xl bg-[#F7FAF7] border border-[#E1E9E2] text-[#647168] text-xs flex items-center justify-between gap-2">
              <span>Already registered?</span>
              <Link to="/login" className="font-bold text-[#168451] underline hover:text-[#116B42] flex items-center gap-1 shrink-0">
                Sign In to Account <ArrowRight size={13} />
              </Link>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {authError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-fadeIn">
                  <AlertCircle size={16} className="shrink-0 text-rose-600" />
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
                helperText="Enter your official college or university email"
                {...register('collegeEmail')}
              />

              {/* Role Selection (Student vs Staff Only) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold tracking-wider text-[#17211B] uppercase">
                  Account Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedRole === ROLES.STUDENT
                        ? 'bg-[#EAF6EE] border-[#168451] text-[#17211B] shadow-xs'
                        : 'bg-white border-[#E1E9E2] text-[#647168] hover:border-[#168451]/40'
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
                          ? 'text-[#168451]'
                          : 'text-[#647168]'
                      }
                    />
                    <div className="text-left">
                      <p className="text-xs font-bold text-[#17211B]">Student</p>
                      <p className="text-[10px] text-[#647168]">Report & Earn</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedRole === ROLES.STAFF
                        ? 'bg-sky-50 border-sky-600 text-sky-900 shadow-xs'
                        : 'bg-white border-[#E1E9E2] text-[#647168] hover:border-sky-300'
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
                          ? 'text-sky-600'
                          : 'text-[#647168]'
                      }
                    />
                    <div className="text-left">
                      <p className="text-xs font-bold text-[#17211B]">Staff</p>
                      <p className="text-[10px] text-[#647168]">Department Ops</p>
                    </div>
                  </label>
                </div>
                {errors.role && (
                  <p className="text-xs text-rose-600 font-medium">
                    {errors.role.message}
                  </p>
                )}
              </div>

              {/* Admin Registration Notice */}
              <div className="p-3 rounded-xl bg-[#F7FAF7] border border-[#E1E9E2] text-[11px] text-[#647168] flex items-start gap-2">
                <Info size={14} className="text-[#168451] mt-0.5 shrink-0" />
                <span>
                  Admin accounts must not be publicly registered. Administrator access is restricted
                  and provisioned strictly via Supabase / Campus Administration.
                </span>
              </div>

              {/* Password */}
              <Input
                label="Password"
                type="password"
                placeholder="Minimum 8 characters"
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

              {/* Honor Code & Terms */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="mt-0.5 w-4 h-4 rounded bg-white border-[#E1E9E2] text-[#168451] focus:ring-[#168451]/30"
                    {...register('agreeTerms')}
                  />
                  <span className="text-xs text-[#647168] leading-snug">
                    I agree to report genuine campus issues and adhere to the{' '}
                    <span className="text-[#168451] font-semibold hover:underline">Honor Code</span>.
                  </span>
                </label>
                {errors.agreeTerms && (
                  <p className="text-xs text-rose-600 font-medium mt-1">
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
            <div className="mt-6 pt-6 border-t border-[#E1E9E2] text-center">
              <p className="text-xs text-[#647168]">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-[#168451] hover:text-[#116B42] font-bold hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
