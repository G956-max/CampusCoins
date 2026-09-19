import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import useHealthCheck from '../../hooks/useHealthCheck';
import { cn } from '../../utils/cn';

const BackendStatusBadge = ({ className, compact = false }) => {
  const { isOnline, latencyMs, message, loading, refetch } = useHealthCheck();

  if (compact) {
    return (
      <button
        type="button"
        onClick={refetch}
        title={`Backend: ${isOnline ? `Online (${latencyMs}ms)` : 'Offline'} - Click to refresh`}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer',
          isOnline
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
            : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20',
          className
        )}
      >
        <span
          className={cn(
            'w-2 h-2 rounded-full',
            isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
          )}
        />
        <span>{isOnline ? `API: ${latencyMs}ms` : 'API Offline'}</span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md transition-all',
        isOnline
          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 shadow-sm shadow-emerald-500/10'
          : 'bg-rose-950/40 text-rose-300 border-rose-500/30',
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            'w-2 h-2 rounded-full shrink-0',
            isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
          )}
        />
        <span className="font-semibold">
          {loading ? 'Checking API...' : isOnline ? 'API Online' : 'API Offline'}
        </span>
      </div>

      {isOnline && latencyMs !== null && (
        <span className="text-[10px] text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.5 rounded">
          {latencyMs}ms
        </span>
      )}

      <button
        type="button"
        onClick={refetch}
        className="text-slate-400 hover:text-slate-200 transition-colors p-0.5 ml-0.5 focus:outline-none"
        title="Check health again"
      >
        <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
      </button>
    </div>
  );
};

export default BackendStatusBadge;
