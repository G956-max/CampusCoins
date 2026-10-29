import React from 'react';
import { cn } from '../../utils/cn';

export const Card = ({
  children,
  className,
  hover = false,
  gradient = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl bg-white border border-[#E1E9E2] shadow-sm overflow-hidden text-[#17211B]',
        hover && 'transition-all duration-200 hover:border-[#168451] hover:shadow-md hover:-translate-y-0.5',
        gradient && 'relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#168451]/5 before:via-transparent before:to-[#EAF6EE]/30 before:pointer-events-none',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className, ...props }) => {
  return (
    <div
      className={cn('p-5 pb-3 border-b border-[#E1E9E2] flex flex-col gap-1', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className, ...props }) => {
  return (
    <h3
      className={cn('text-base font-semibold text-[#17211B] tracking-tight flex items-center gap-2', className)}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription = ({ children, className, ...props }) => {
  return (
    <p
      className={cn('text-xs text-[#647168] font-normal leading-relaxed', className)}
      {...props}
    >
      {children}
    </p>
  );
};

export const CardContent = ({ children, className, ...props }) => {
  return (
    <div className={cn('p-5', className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className, ...props }) => {
  return (
    <div
      className={cn('p-4 pt-3 border-t border-[#E1E9E2] flex items-center justify-between bg-[#F7FAF7]/80', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
