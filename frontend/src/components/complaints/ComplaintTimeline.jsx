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
      <div className="p-6 text-center text-xs text-[#647168] rounded-xl bg-[#F7FAF7] border border-[#E1E9E2]">
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
      <div className="absolute top-3 bottom-3 left-2.5 w-0.5 bg-[#E1E9E2] -translate-x-1/2" />

      {sortedUpdates.map((update, idx) => {
        const Icon = statusIcons[update.status] || FileText;
        const isLatest = idx === sortedUpdates.length - 1;

        return (
          <div key={update.id || idx} className="relative group">
            {/* Timeline Node Icon */}
            <div
              className={cn(
                'absolute -left-6 top-1 w-5 h-5 rounded-full border flex items-center justify-center -translate-x-1/2 transition-colors',
                isLatest
                  ? 'bg-[#168451] border-[#168451] text-white shadow-xs'
                  : 'bg-white border-[#CBE7D4] text-[#168451]'
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
            </div>

            {/* Event Card */}
            <div className="rounded-xl p-3.5 bg-white border border-[#E1E9E2] hover:border-[#168451]/40 shadow-xs transition-all space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ComplaintStatusBadge status={update.status} size="sm" />
                  {update.updater && (
                    <span className="text-xs font-semibold text-[#17211B]">
                      by {update.updater.full_name || update.updater.role}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#647168] font-mono">
                  {formatDate(update.created_at)}
                </span>
              </div>

              {update.comment && (
                <p className="text-xs text-[#647168] leading-relaxed pl-1 pt-1 border-t border-[#F7FAF7]">
                  "{update.comment}"
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
