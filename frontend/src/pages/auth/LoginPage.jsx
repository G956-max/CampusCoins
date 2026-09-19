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
  Sparkles,
  Shield,
  Info,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { Card } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
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
      const result = await login({
        email: data.email,
        password: data.password,
      });

      const userRole = result?.profile?.role || result?.user?.user_metadata?.role || ROLES.STUDENT;

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

  // Demo Quick-Fill for reviewers
  const handleQuickDemo = async (role) => {
    if (role === ROLES.STUDENT) {
      setValue('email', 'alex.rivera@campus.edu');
      setValue('password', 'StudentPass123!');
      try {
        await login({ email: 'alex.rivera@campus.edu', password: 'StudentPass123!', role: ROLES.STUDENT });
        navigate('/student/dashboard');
      } catch (err) {
        setAuthError(err.message);
      }
    } else if (role === ROLES.STAFF) {
      setValue('email', 'd.vance@campus.edu');
      setValue('password', 'StaffPass123!');
      try {
        await login({ email: 'd.vance@campus.edu', password: 'StaffPass123!', role: ROLES.STAFF });
        navigate('/staff/dashboard');
      } catch (err) {
        setAuthError(err.message);
      }
    } else if (role === ROLES.ADMIN) {
      setValue('email', 'admin.office@campus.edu');
      setValue('password', 'AdminPass123!');
      try {
        await login({ email: 'admin.office@campus.edu', password: 'AdminPass123!', role: ROLES.ADMIN });
        navigate('/admin/dashboard');
      } catch (err) {
        setAuthError(err.message);
      }
    }
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) return;
    setForgotSubmitted(true);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-campus-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-md space-y-6">
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
            Welcome back
          </h2>
          <p className="text-xs text-slate-400">
            Sign in with your verified college credentials
          </p>
        </div>

        {/* Phase 2 Credentials & Demo Access Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-glass">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
            <span className="flex items-center gap-1.5 text-coin-400">
              <Sparkles size={14} /> Quick Demo Access
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {isSupabaseConfigured ? 'SUPABASE LIVE' : 'PREVIEW MODE'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickDemo(ROLES.STUDENT)}
              className="text-xs border-campus-500/40 text-campus-300 hover:bg-campus-500/10"
            >
              Student
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickDemo(ROLES.STAFF)}
              className="text-xs border-sky-500/40 text-sky-300 hover:bg-sky-500/10"
            >
              Staff
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickDemo(ROLES.ADMIN)}
              className="text-xs border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10"
            >
              Admin
            </Button>
          </div>
        </div>

        {/* Login Card */}
        <Card className="p-6 sm:p-8 border-slate-800/90 bg-slate-900/70">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
                <AlertCircle size={16} className="shrink-0 text-rose-400" />
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
                  className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-campus-500 focus:ring-campus-500/30 focus:ring-offset-0"
                  {...register('rememberMe')}
                />
                <span className="text-xs text-slate-400 hover:text-slate-300">
                  Remember me
                </span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setForgotSubmitted(false);
                  setForgotPasswordOpen(true);
                }}
                className="text-xs text-campus-400 hover:text-campus-300 font-medium hover:underline focus:outline-none"
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
          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              New to CampusCoins?{' '}
              <Link
                to="/register"
                className="text-campus-400 hover:text-campus-300 font-semibold hover:underline"
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
            <div className="w-12 h-12 rounded-full bg-campus-500/20 text-campus-400 flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <h4 className="text-sm font-bold text-slate-100">
              Recovery link sent!
            </h4>
            <p className="text-xs text-slate-400">
              If an account matches <span className="text-slate-200 font-mono">{forgotEmail}</span>,
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
