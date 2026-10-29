import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Coins,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Clock,
  Sparkles,
  Compass,
  Award,
  Activity,
  AlertCircle,
  Building,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import Modal from '../../components/common/Modal';

const LandingPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });

  const openPreview = (title, message) => {
    setModalContent({ title, message });
    setModalOpen(true);
  };

  return (
    <div className="relative overflow-hidden bg-[#F7FAF7] min-h-screen">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-[#168451]/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-2/3 right-10 w-[450px] h-[450px] bg-[#168451]/3 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* ========================================================
          HERO SECTION
          ======================================================== */}
      <section id="home" className="pt-12 pb-20 lg:pt-20 lg:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Hero Text & Actions */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#CBE7D4] shadow-xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#168451] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#168451]" />
              </span>
              <span className="text-xs font-bold tracking-wide text-[#168451]">
                Campus Civic Platform &bull; Live & Secure
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#17211B] leading-[1.1]">
              Make Your Campus Better.{' '}
              <span className="text-[#168451]">Earn While You Contribute.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#647168] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Report campus defects, track maintenance transparently, earn verified CampusCoins, and redeem exciting student rewards.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link to="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="primary"
                  className="w-full sm:w-auto shadow-xs"
                  rightIcon={<ArrowRight size={18} />}
                >
                  Get Started Free
                </Button>
              </Link>

              <Link to="/campus-map" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                  leftIcon={<Compass size={18} className="text-[#168451]" />}
                >
                  Interactive Campus Map
                </Button>
              </Link>
            </div>

            {/* Micro stats / Trust badges */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-[#E1E9E2] max-w-lg mx-auto lg:mx-0 text-left">
              <div>
                <p className="text-2xl font-black text-[#17211B]">100%</p>
                <p className="text-xs text-[#647168]">SLA Transparency</p>
              </div>
              <div>
                <p className="text-2xl font-black text-[#168451]">Atomic</p>
                <p className="text-xs text-[#647168]">Coin Ledger</p>
              </div>
              <div>
                <p className="text-2xl font-black text-[#17211B]">Role-Based</p>
                <p className="text-xs text-[#647168]">Student & Staff Portals</p>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Dashboard-Style Mockup (Clean SaaS Card) */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-lg rounded-3xl p-1 bg-gradient-to-b from-white via-white to-[#EAF6EE] shadow-lg border border-[#CBE7D4]">
              <div className="rounded-[22px] bg-white p-5 sm:p-6 border border-[#E1E9E2] space-y-4">
                {/* Mockup Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#E1E9E2]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-[11px] font-mono text-[#647168] ml-2">
                      portal.campuscoins.edu
                    </span>
                  </div>
                  <Badge variant="success" size="sm" withDot>
                    Live Campus Feed
                  </Badge>
                </div>

                {/* Mockup Metric Banner */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-[#EAF6EE] border border-[#CBE7D4] flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-[#168451]">Student Wallet</p>
                      <p className="text-xl font-black text-[#17211B]">480 Coins</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-white border border-[#CBE7D4] flex items-center justify-center text-[#168451] shadow-xs">
                      <Coins size={18} />
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#F7FAF7] border border-[#E1E9E2] flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-medium text-[#647168]">SLA Resolution</p>
                      <p className="text-xl font-black text-[#168451]">94.2%</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-white border border-[#E1E9E2] flex items-center justify-center text-[#168451] shadow-xs">
                      <TrendingUp size={18} />
                    </div>
                  </div>
                </div>

                {/* Mockup Issue Item 1 */}
                <div className="p-3.5 rounded-xl bg-[#F7FAF7] border border-[#E1E9E2] flex items-start gap-3 hover:border-[#168451]/50 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-[#EAF6EE] text-[#168451] border border-[#CBE7D4] flex items-center justify-center shrink-0">
                    <CheckCircle2 size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-[#17211B] truncate">
                        Water Dispenser Fixed &bull; Library Hall
                      </p>
                      <span className="text-[10px] text-[#168451] font-mono font-bold shrink-0 bg-[#EAF6EE] px-1.5 py-0.5 rounded">
                        +35 Coins
                      </span>
                    </div>
                    <p className="text-[11px] text-[#647168] mt-0.5">
                      Verified by Department of Facilities
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="success" size="sm">
                        Resolved
                      </Badge>
                      <span className="text-[10px] text-[#647168] font-mono">
                        Turnaround: 4h 12m
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mockup Issue Item 2 */}
                <div className="p-3.5 rounded-xl bg-[#F7FAF7] border border-[#E1E9E2] flex items-start gap-3 hover:border-[#168451]/50 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                    <Clock size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-[#17211B] truncate">
                        HVAC Unit Inspection &bull; CS Lab 3
                      </p>
                      <span className="text-[10px] text-amber-700 font-mono font-bold shrink-0 bg-amber-50 px-1.5 py-0.5 rounded">
                        In Progress
                      </span>
                    </div>
                    <p className="text-[11px] text-[#647168] mt-0.5">
                      Technician dispatched &bull; David Vance
                    </p>
                    <div className="w-full bg-[#E1E9E2] h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-[#168451] h-full w-2/3 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Live Activity Toast in Mockup */}
                <div className="p-3 rounded-xl bg-[#EAF6EE] border border-[#CBE7D4] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[#168451] font-semibold">
                    <Sparkles size={15} />
                    <span>Interactive Map & Step-Free Routes</span>
                  </div>
                  <span className="text-[10px] text-[#168451] font-mono bg-white px-2 py-0.5 rounded border border-[#CBE7D4] font-bold">
                    Active
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
      <section id="how-it-works" className="py-20 bg-white border-y border-[#E1E9E2] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <Badge variant="success" size="md">
              The 4-Step Cycle
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17211B] tracking-tight">
              Report. Resolve. Earn. Improve.
            </h2>
            <p className="text-sm sm:text-base text-[#647168]">
              CampusCoins transforms campus maintenance from a frustrating grievance into an
              incentivized, collaborative community effort.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <Card hover className="p-6 relative group bg-white border-[#E1E9E2]">
              <div className="text-4xl font-black text-[#CBE7D4] group-hover:text-[#168451] transition-colors mb-4 font-mono">
                01
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#EAF6EE] border border-[#CBE7D4] text-[#168451] flex items-center justify-center mb-4 shadow-xs">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-base font-bold text-[#17211B] mb-2">1. Report</h3>
              <p className="text-xs text-[#647168] leading-relaxed">
                Notice a broken projector, leaking tap, or AC fault? Snap a photo, pick the
                building, and submit in seconds with auto AI duplicate detection.
              </p>
            </Card>

            {/* Step 2 */}
            <Card hover className="p-6 relative group bg-white border-[#E1E9E2]">
              <div className="text-4xl font-black text-sky-200 group-hover:text-sky-600 transition-colors mb-4 font-mono">
                02
              </div>
              <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center mb-4 shadow-xs">
                <Activity size={24} />
              </div>
              <h3 className="text-base font-bold text-[#17211B] mb-2">2. Resolve</h3>
              <p className="text-xs text-[#647168] leading-relaxed">
                Campus maintenance receives tickets with SLA timers, auto priority ranking, and
                technicians update notes and resolution evidence.
              </p>
            </Card>

            {/* Step 3 */}
            <Card hover className="p-6 relative group bg-white border-[#E1E9E2]">
              <div className="text-4xl font-black text-[#CBE7D4] group-hover:text-[#168451] transition-colors mb-4 font-mono">
                03
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#EAF6EE] border border-[#CBE7D4] text-[#168451] flex items-center justify-center mb-4 shadow-xs">
                <Coins size={24} />
              </div>
              <h3 className="text-base font-bold text-[#17211B] mb-2">3. Earn</h3>
              <p className="text-xs text-[#647168] leading-relaxed">
                Once resolution is verified, CampusCoins are atomically credited to your persistent
                ledger for store vouchers and perks.
              </p>
            </Card>

            {/* Step 4 */}
            <Card hover className="p-6 relative group bg-white border-[#E1E9E2]">
              <div className="text-4xl font-black text-indigo-200 group-hover:text-indigo-600 transition-colors mb-4 font-mono">
                04
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center mb-4 shadow-xs">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-base font-bold text-[#17211B] mb-2">4. Improve</h3>
              <p className="text-xs text-[#647168] leading-relaxed">
                Administrators use real database analytics and SLA trends to allocate repair
                budgets and eliminate recurring breakdowns.
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
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17211B] tracking-tight">
            Features Tailored For Student Life
          </h2>
          <p className="text-sm sm:text-base text-[#647168]">
            A complete ecosystem designed from the ground up to keep your campus running smoothly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card hover className="p-6 border-[#E1E9E2] bg-white shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF6EE] border border-[#CBE7D4] text-[#168451] flex items-center justify-center mb-5">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#17211B] mb-2">
              Role-Based Access Control
            </h3>
            <p className="text-xs sm:text-sm text-[#647168] leading-relaxed">
              Dedicated, secure portals for Students, Maintenance Staff, and Campus Administrators
              with server-side token authorization and database RLS.
            </p>
          </Card>

          <Card hover className="p-6 border-[#E1E9E2] bg-white shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF6EE] border border-[#CBE7D4] text-[#168451] flex items-center justify-center mb-5">
              <Award size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#17211B] mb-2">
              Verifiable Coin Economy
            </h3>
            <p className="text-xs sm:text-sm text-[#647168] leading-relaxed">
              Atomic coin ledger, completed mission validation, and single-use QR vouchers with
              real-time staff verification to eliminate fraud.
            </p>
          </Card>

          <Card hover className="p-6 border-[#E1E9E2] bg-white shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF6EE] border border-[#CBE7D4] text-[#168451] flex items-center justify-center mb-5">
              <Compass size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#17211B] mb-2">
              Interactive Campus Map
            </h3>
            <p className="text-xs sm:text-sm text-[#647168] leading-relaxed">
              Locate campus buildings, view active maintenance markers, and find shortest routes
              between campus points with accessible step-free pathfinding.
            </p>
          </Card>
        </div>
      </section>

      {/* ========================================================
          ABOUT & CTA
          ======================================================== */}
      <section id="about" className="py-20 bg-white border-t border-[#E1E9E2] px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="success" size="md">
            Our Mission
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17211B] tracking-tight">
            Ready to Build a Better Campus Together?
          </h2>
          <p className="text-sm sm:text-base text-[#647168] leading-relaxed">
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
    </div>
  );
};

export default LandingPage;
