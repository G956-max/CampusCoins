import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from './Button';

const ErrorState = ({
  title = 'Something went wrong',
  message = 'We encountered an error while loading this content. Please try again.',
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-rose-900/40 bg-rose-950/20',
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-900/30 border border-rose-700/50 flex items-center justify-center text-rose-400 mb-4">
        <AlertTriangle size={24} />
      </div>
      <h4 className="text-sm font-semibold text-rose-200 mb-1">{title}</h4>
      <p className="text-xs text-slate-300 max-w-sm mb-5 leading-relaxed">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw size={14} />}
          className="border-rose-800 text-rose-200 hover:bg-rose-900/30"
        >
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
