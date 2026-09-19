import React from 'react';
import { Coins, Heart, Github, ExternalLink } from 'lucide-react';
import Badge from '../common/Badge';

const Footer = () => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-campus-500 to-coin-500 flex items-center justify-center text-slate-950 shadow-md">
                <Coins size={20} className="stroke-[2.5]" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Campus<span className="text-campus-400">Coins</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Empowering college campuses through decentralized student civic engagement.
              Report infrastructure defects, track maintenance resolution, and earn verifiable
              CampusCoins.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Badge variant="gold" size="sm" withDot>
                Phase 1 Active: Foundation
              </Badge>
              <Badge variant="purple" size="sm">
                Next: Phase 2 Supabase
              </Badge>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#features" className="hover:text-campus-400 transition-colors">
                  Key Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-campus-400 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-campus-400 transition-colors">
                  Our Mission
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-campus-400 transition-colors">
                  Student & Staff Portal
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Architecture & Resources */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Developer & Specs
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="text-slate-300">API Health:</span>{' '}
                <a
                  href="http://localhost:5000/api/health"
                  target="_blank"
                  rel="noreferrer"
                  className="text-campus-400 hover:underline inline-flex items-center gap-1"
                >
                  /api/health <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <span className="text-slate-500">FastAPI AI: Phase 3</span>
              </li>
              <li>
                <span className="text-slate-500">Navigation: Phase 4</span>
              </li>
              <li>
                <span className="text-slate-500">Token Ledger: Phase 5</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} CampusCoins &bull; Report. Resolve. Earn. Improve.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Built with React, Vite & Express</span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span className="text-slate-400">Dark Glassmorphism Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
