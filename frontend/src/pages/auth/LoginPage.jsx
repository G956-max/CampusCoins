import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Coins,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';

// Zod validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

const LoginPage = () => {
  const { login, loading, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [authError, setAuthError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const onSubmit = async (data) => {
    setAuthError('');
    try {
      const emailLower = data.email?.toLowerCase().trim();
      let detectedRole = ROLES.STUDENT;
      if (emailLower.includes('staff') || emailLower.includes('vance')) detectedRole = ROLES.STAFF;
      if (emailLower.includes('admin')) detectedRole = ROLES.ADMIN;

      const result = await login({
        email: data.email,
        password: data.password,
        role: detectedRole,
      });

      const userRole = result?.profile?.role || result?.user?.user_metadata?.role || detectedRole;

      // Determine redirect path
      let targetPath = '/student/dashboard';
      if (userRole === ROLES.STAFF) targetPath = '/staff/dashboard';
      if (userRole === ROLES.ADMIN) targetPath = '/admin/dashboard';

      const destination = location.state?.from?.pathname || targetPath;
      navigate(destination, { replace: true });
    } catch (err) {
      setAuthError(err.message || 'Incorrect email or password.');
    }
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) return;
    setForgotSubmitted(true);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative bg-[#F7FAF7]">
      {/* Background soft ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#168451]/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-md space-y-6">
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
            Welcome back
          </h2>
          <p className="text-xs text-[#647168]">
            Sign in with your verified college credentials
          </p>
        </div>

        {/* Quick link to Register */}
        <div className="p-3.5 rounded-2xl bg-[#EAF6EE] border border-[#CBE7D4] flex items-center justify-between">
          <div className="text-xs text-[#168451]">
            <span className="font-bold">Don't have an account yet?</span>
            <p className="text-[11px] text-[#647168]">Sign up with your college email to start reporting issues.</p>
          </div>
          <Link to="/register">
            <Button size="sm" variant="primary" rightIcon={<ArrowRight size={14} />}>
              Sign Up
            </Button>
          </Link>
        </div>

        {/* Login Card */}
        <Card className="p-6 sm:p-8 border-[#E1E9E2] bg-white shadow-sm">
          {/* Direct new users to Register */}
          <div className="mb-5 p-3 rounded-xl bg-[#EAF6EE] border border-[#CBE7D4] text-[#168451] text-xs flex items-center justify-between gap-2">
            <span>Don't have an account yet?</span>
            <Link to="/register" className="font-bold underline hover:text-[#116B42] flex items-center gap-1 shrink-0">
              Create Account <ArrowRight size={13} />
            </Link>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {authError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-fadeIn">
                <AlertCircle size={16} className="shrink-0 text-rose-600" />
                <span>{authError}</span>
              </div>
            )}

            {/* Email Field */}
            <Input
              label="College Email"
              type="email"
              placeholder="e.g. alex.rivera@campus.edu"
              leftIcon={<Mail size={18} />}
              error={errors.email?.message}
              {...register('email')}
            />

            {/* Password Field */}
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              leftIcon={<Lock size={18} />}
              error={errors.password?.message}
              {...register('password')}
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded bg-white border-[#E1E9E2] text-[#168451] focus:ring-[#168451]/30 focus:ring-offset-0"
                  {...register('rememberMe')}
                />
                <span className="text-xs text-[#647168] hover:text-[#17211B]">
                  Remember me
                </span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setForgotSubmitted(false);
                  setForgotPasswordOpen(true);
                }}
                className="text-xs text-[#168451] hover:text-[#116B42] font-semibold hover:underline focus:outline-none"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={loading}
              rightIcon={<ArrowRight size={18} />}
            >
              Sign In
            </Button>
          </form>

          {/* Switch to Register */}
          <div className="mt-6 pt-6 border-t border-[#E1E9E2] text-center">
            <p className="text-xs text-[#647168]">
              New to CampusCoins?{' '}
              <Link
                to="/register"
                className="text-[#168451] hover:text-[#116B42] font-bold hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </Card>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        title="Reset Password"
        description="Enter your registered college email to receive a recovery link."
      >
        {forgotSubmitted ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#EAF6EE] text-[#168451] border border-[#CBE7D4] flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <h4 className="text-sm font-bold text-[#17211B]">
              Recovery link sent!
            </h4>
            <p className="text-xs text-[#647168]">
              If an account matches <span className="text-[#17211B] font-mono font-medium">{forgotEmail}</span>,
              password reset instructions will arrive shortly.
            </p>
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setForgotPasswordOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 pt-1">
            <Input
              label="College Email"
              type="email"
              placeholder="e.g. yourname@campus.edu"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              leftIcon={<Mail size={18} />}
              required
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setForgotPasswordOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Send Reset Link
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default LoginPage;
