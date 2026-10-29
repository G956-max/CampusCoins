import React from 'react';
import { Coins, Heart } from 'lucide-react';
import Badge from '../common/Badge';

const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-[#E1E9E2] text-[#647168] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#168451] flex items-center justify-center text-white shadow-xs">
                <Coins size={18} className="stroke-[2.5]" />
              </div>
              <span className="text-lg font-bold text-[#17211B] tracking-tight">
                Campus<span className="text-[#168451]">Coins</span>
              </span>
            </div>
            <p className="text-sm text-[#647168] max-w-md leading-relaxed">
              Empowering campus infrastructure maintenance through student civic engagement.
              Report defects, track department resolution, and earn verifiable CampusCoin rewards.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Badge variant="success" size="sm" withDot>
                Enterprise Campus SaaS
              </Badge>
              <Badge variant="default" size="sm">
                Real-Time Maintenance SLA
              </Badge>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-[#17211B] uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/#features" className="hover:text-[#168451] transition-colors">
                  Key Features
                </a>
              </li>
              <li>
                <a href="/#how-it-works" className="hover:text-[#168451] transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="/#about" className="hover:text-[#168451] transition-colors">
                  Civic Mission
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-[#168451] transition-colors">
                  Campus Login
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Modules */}
          <div>
            <h4 className="text-xs font-semibold text-[#17211B] uppercase tracking-wider mb-3">
              Features
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-[#647168]">Coin Transaction Ledger</span>
              </li>
              <li>
                <span className="text-[#647168]">Single-Use QR Vouchers</span>
              </li>
              <li>
                <span className="text-[#647168]">Interactive Campus Map</span>
              </li>
              <li>
                <span className="text-[#647168]">Smart Duplicate Detection</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-[#E1E9E2] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#647168]">
          <p>&copy; {new Date().getFullYear()} CampusCoins Infrastructure Initiative. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for civic impact and campus improvement
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
