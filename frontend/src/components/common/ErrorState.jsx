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
        'flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-[#F8D2D2] bg-[#FDF2F2]',
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-white border border-[#F8D2D2] flex items-center justify-center text-[#C43D3D] shadow-sm mb-4">
        <AlertTriangle size={24} />
      </div>
      <h4 className="text-sm font-semibold text-[#C43D3D] mb-1">{title}</h4>
      <p className="text-xs text-[#647168] max-w-sm mb-5 leading-relaxed">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw size={14} />}
          className="border-[#C43D3D]/30 text-[#C43D3D] hover:bg-white"
        >
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
