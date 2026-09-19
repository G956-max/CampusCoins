import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Coins,
  ArrowRight,
  ShieldCheck,
  Zap,
  MapPin,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Clock,
  Sparkles,
  Users,
  Compass,
  Award,
  Activity,
  Layers,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import Modal from '../../components/common/Modal';

const LandingPage = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });

  const openPreview = (title, message) => {
    setModalContent({ title, message });
    setModalOpen(true);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-campus-500/10 via-brand-500/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-2/3 right-10 w-[450px] h-[450px] bg-coin-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* ========================================================
          HERO SECTION
          ======================================================== */}
      <section id="home" className="pt-12 pb-20 lg:pt-20 lg:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Hero Text & Actions */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/60 shadow-inner">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-campus-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-campus-500" />
              </span>
              <span className="text-xs font-semibold tracking-wide text-slate-300">
                Phase 1 Foundation Live &bull; Next-Gen Campus Platform
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Make Your Campus Better.{' '}
              <span className="gradient-text-coins">Earn While You Contribute.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Report campus issues, track resolutions, earn CampusCoins, and discover your
              campus with ease.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link to="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="primary"
                  className="w-full sm:w-auto shadow-glass-glow"
                  rightIcon={<ArrowRight size={18} />}
                >
                  Get Started
                </Button>
              </Link>

              <a href="#features" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-slate-700 hover:border-slate-500"
                  leftIcon={<Compass size={18} className="text-campus-400" />}
                >
                  Explore Campus
                </Button>
              </a>
            </div>

            {/* Micro stats / Trust badges */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0 text-left">
              <div>
                <p className="text-2xl font-black text-slate-100">100%</p>
                <p className="text-xs text-slate-400">Transparent SLA</p>
              </div>
              <div>
                <p className="text-2xl font-black text-coin-400">Verifiable</p>
                <p className="text-xs text-slate-400">CampusCoins Ledger</p>
              </div>
              <div>
                <p className="text-2xl font-black text-campus-400">Role-Based</p>
                <p className="text-xs text-slate-400">Student & Staff Portals</p>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Dashboard-Style Mockup (CSS + Lucide Icons) */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-lg rounded-3xl p-1 bg-gradient-to-b from-slate-700/40 via-slate-800/20 to-campus-500/20 shadow-2xl backdrop-blur-xl">
              <div className="rounded-[22px] bg-slate-950/90 p-5 sm:p-6 border border-slate-800/80 space-y-4">
                {/* Mockup Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-[11px] font-mono text-slate-400 ml-2">
                      portal.campuscoins.edu
                    </span>
                  </div>
                  <Badge variant="gold" size="sm" withDot>
                    Live Demo Feed
                  </Badge>
                </div>

                {/* Mockup Metric Banner */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-medium text-slate-400">CampusCoins</p>
                      <p className="text-xl font-bold text-amber-300">480 CC</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Coins size={18} />
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-medium text-slate-400">Resolution Rate</p>
                      <p className="text-xl font-bold text-campus-400">92.4%</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-campus-500/10 border border-campus-500/30 flex items-center justify-center text-campus-400">
                      <TrendingUp size={18} />
                    </div>
                  </div>
                </div>

                {/* Mockup Issue Item 1 */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3 hover:border-slate-700 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-campus-500/20 text-campus-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-100 truncate">
                        Water Dispenser Fixed &bull; Library Hall
                      </p>
                      <span className="text-[10px] text-campus-400 font-mono font-bold shrink-0">
                        +35 Coins
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Verified by Department of Facilities
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="success" size="sm">
                        Resolved
                      </Badge>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Turnaround: 4h 12m
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mockup Issue Item 2 */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3 hover:border-slate-700 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Clock size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-100 truncate">
                        HVAC Unit Inspection &bull; CS Lab 3
                      </p>
                      <span className="text-[10px] text-amber-400 font-mono font-bold shrink-0">
                        In Progress
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Dispatched technician: David Vance
                    </p>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-amber-400 h-full w-2/3 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Live Activity Toast in Mockup */}
                <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-indigo-300">
                    <Sparkles size={14} className="text-indigo-400" />
                    <span>Campus Map & Navigation</span>
                  </div>
                  <span className="text-[10px] text-indigo-400 font-mono bg-indigo-500/20 px-2 py-0.5 rounded">
                    Phase 4 Ready
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          HOW IT WORKS (4 STEPS: Report -> Resolve -> Earn -> Improve)
          ======================================================== */}
      <section id="how-it-works" className="py-20 bg-slate-950/60 border-y border-slate-900 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <Badge variant="purple" size="md">
              The 4-Step Cycle
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Report. Resolve. Earn. Improve.
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              CampusCoins transforms campus maintenance from a frustrating grievance into an
              incentivized collaborative effort.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <Card hover className="p-6 relative group">
              <div className="text-5xl font-black text-slate-800 group-hover:text-slate-700/80 transition-colors mb-4 font-mono">
                01
              </div>
              <div className="w-12 h-12 rounded-2xl bg-campus-500/10 border border-campus-500/30 text-campus-400 flex items-center justify-center mb-4">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-2">1. Report</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Notice a broken projector, leaking tap, or AC malfunction? Snap a photo, pick the
                location, and submit in 15 seconds.
              </p>
            </Card>

            {/* Step 2 */}
            <Card hover className="p-6 relative group">
              <div className="text-5xl font-black text-slate-800 group-hover:text-slate-700/80 transition-colors mb-4 font-mono">
                02
              </div>
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center mb-4">
                <Activity size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-2">2. Resolve</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Campus maintenance departments receive triaged tickets with SLA timers, assigning
                skilled technicians immediately.
              </p>
            </Card>

            {/* Step 3 */}
            <Card hover className="p-6 relative group">
              <div className="text-5xl font-black text-slate-800 group-hover:text-slate-700/80 transition-colors mb-4 font-mono">
                03
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
                <Coins size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-2">3. Earn</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Once the resolution is verified, CampusCoins are credited to your student wallet for
                valuable campus benefits.
              </p>
            </Card>

            {/* Step 4 */}
            <Card hover className="p-6 relative group">
              <div className="text-5xl font-black text-slate-800 group-hover:text-slate-700/80 transition-colors mb-4 font-mono">
                04
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-4">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-2">4. Improve</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                College authorities access analytics to prevent repeat breakdowns and allocate
                budgets with data-driven clarity.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ========================================================
          KEY FEATURES
          ======================================================== */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <Badge variant="success" size="md">
            Built For Higher Education
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Features Tailored For Student Life
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            A comprehensive ecosystem designed from the ground up to keep your campus running
            smoothly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card hover className="p-6 border-slate-800/80">
            <div className="w-12 h-12 rounded-2xl bg-campus-500/10 border border-campus-500/30 text-campus-400 flex items-center justify-center mb-5">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">
              Role-Based Access Control
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Dedicated interfaces for Students, Staff/Technicians, and Campus Administrators with
              strict privacy and role segmentation.
            </p>
          </Card>

          <Card hover className="p-6 border-slate-800/80">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-5">
              <Award size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">
              Gamified CampusCoins Ledger
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Earn tokens for reporting genuine problems, confirming repairs, and participating in
              campus improvement drives.
            </p>
          </Card>

          <Card hover className="p-6 border-slate-800/80">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-5">
              <Compass size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">
              Interactive Navigation (Phase 4)
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Find auditoriums, departments, labs, and reported maintenance sites with turn-by-turn
              campus pathfinding.
            </p>
          </Card>
        </div>
      </section>

      {/* ========================================================
          ABOUT & CTA
          ======================================================== */}
      <section id="about" className="py-20 bg-slate-950/80 border-t border-slate-900 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="gold" size="md">
            Our Mission
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to Build a Better Campus Together?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            CampusCoins is not just a ticketing software—it's an interactive culture of
            stewardship. Join students and faculty in transforming your university today.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight size={18} />}>
                Join CampusCoins
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">
                Login with College Email
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Preview Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalContent.title}
        description="Feature Roadmap Preview"
        footer={
          <Button variant="primary" size="sm" onClick={() => setModalOpen(false)}>
            Got it
          </Button>
        }
      >
        <div className="space-y-3 text-sm text-slate-300">
          <p>{modalContent.message}</p>
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-400">
            Note: This feature is part of upcoming Phase releases as outlined in{' '}
            <code className="text-campus-400">docs/architecture.md</code>.
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LandingPage;
