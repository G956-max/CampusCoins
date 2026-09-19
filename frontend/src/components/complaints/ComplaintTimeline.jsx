import React from 'react';
import {
  CheckCircle2,
  Clock,
  UserCheck,
  Wrench,
  AlertTriangle,
  XCircle,
  FileText,
  RotateCcw,
} from 'lucide-react';
import ComplaintStatusBadge from './ComplaintStatusBadge';
import { STATUS_CONFIG } from '../../constants/complaints';
import { cn } from '../../utils/cn';

const statusIcons = {
  submitted: FileText,
  under_review: Clock,
  assigned: UserCheck,
  in_progress: Wrench,
  resolved: CheckCircle2,
  verified: CheckCircle2,
  reopened: RotateCcw,
  rejected: XCircle,
};

const formatDate = (isoString) => {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
};

const ComplaintTimeline = ({ updates = [], className }) => {
  if (!updates || updates.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 rounded-xl bg-slate-900/40 border border-slate-800/80">
        No lifecycle updates recorded yet.
      </div>
    );
  }

  // Ensure chronological order
  const sortedUpdates = [...updates].sort(
    (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0)
  );

  return (
    <div className={cn('relative pl-6 space-y-6', className)}>
      {/* Vertical Connecting Line */}
      <div className="absolute top-3 bottom-3 left-2.5 w-0.5 bg-slate-800 -translate-x-1/2" />

      {sortedUpdates.map((update, idx) => {
        const Icon = statusIcons[update.status] || FileText;
        const config = STATUS_CONFIG[update.status] || {
          label: update.status,
          variant: 'default',
        };

        const isLatest = idx === sortedUpdates.length - 1;

        return (
          <div key={update.id || idx} className="relative group">
            {/* Timeline Node Icon */}
            <div
              className={cn(
                'absolute -left-6 top-0.5 w-5 h-5 rounded-full border flex items-center justify-center -translate-x-1/2 transition-colors',
                isLatest
                  ? 'bg-campus-500 border-campus-400 text-slate-950 shadow-md shadow-campus-500/30'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
            </div>

            {/* Event Card */}
            <div className="rounded-xl p-3.5 bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-all space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ComplaintStatusBadge status={update.status} size="sm" />
                  {update.updater && (
                    <span className="text-xs font-semibold text-slate-300">
                      by {update.updater.full_name || update.updater.role}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {formatDate(update.created_at)}
                </span>
              </div>

              {update.comment && (
                <p className="text-xs text-slate-300 leading-relaxed pt-0.5">
                  {update.comment}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ComplaintTimeline;
