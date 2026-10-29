import React from 'react';
import { RefreshCw } from 'lucide-react';
import useHealthCheck from '../../hooks/useHealthCheck';
import { cn } from '../../utils/cn';

const BackendStatusBadge = ({ className, compact = false }) => {
  const { isOnline, latencyMs, loading, refetch } = useHealthCheck();

  if (compact) {
    return (
      <button
        type="button"
        onClick={refetch}
        title={`Backend: ${isOnline ? `Online (${latencyMs}ms)` : 'Offline'} - Click to refresh`}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer',
          isOnline
            ? 'bg-[#EAF6EE] text-[#168451] border-[#CBE7D4] hover:bg-[#CBE7D4]'
            : 'bg-[#FDF2F2] text-[#C43D3D] border-[#F8D2D2] hover:bg-[#F8D2D2]',
          className
        )}
      >
        <span
          className={cn(
            'w-2 h-2 rounded-full',
            isOnline ? 'bg-[#168451] animate-pulse' : 'bg-[#C43D3D]'
          )}
        />
        <span>{isOnline ? `API: ${latencyMs}ms` : 'API Offline'}</span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
        isOnline
          ? 'bg-[#EAF6EE] text-[#168451] border-[#CBE7D4]'
          : 'bg-[#FDF2F2] text-[#C43D3D] border-[#F8D2D2]',
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            'w-2 h-2 rounded-full shrink-0',
            isOnline ? 'bg-[#168451] animate-pulse' : 'bg-[#C43D3D]'
          )}
        />
        <span className="font-semibold">
          {loading ? 'Checking API...' : isOnline ? 'API Online' : 'API Offline'}
        </span>
      </div>

      {isOnline && latencyMs !== null && (
        <span className="text-[10px] text-[#168451] bg-white px-1.5 py-0.5 rounded border border-[#CBE7D4]">
          {latencyMs}ms
        </span>
      )}

      <button
        type="button"
        onClick={refetch}
        className="text-[#647168] hover:text-[#17211B] transition-colors p-0.5 ml-0.5 focus:outline-none cursor-pointer"
        title="Check health again"
      >
        <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
      </button>
    </div>
  );
};

export default BackendStatusBadge;
