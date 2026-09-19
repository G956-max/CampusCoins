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
        'rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-glass overflow-hidden',
        hover && 'transition-all duration-250 hover:border-slate-700/80 hover:bg-slate-900/80 hover:shadow-lg hover:-translate-y-0.5',
        gradient && 'relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-campus-500/5 before:via-transparent before:to-brand-500/5 before:pointer-events-none',
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
      className={cn('p-5 pb-3 border-b border-slate-800/60 flex flex-col gap-1', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className, ...props }) => {
  return (
    <h3
      className={cn('text-base font-semibold text-slate-100 tracking-tight flex items-center gap-2', className)}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription = ({ children, className, ...props }) => {
  return (
    <p
      className={cn('text-xs text-slate-400 font-normal leading-relaxed', className)}
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
      className={cn('p-4 pt-3 border-t border-slate-800/60 flex items-center justify-between bg-slate-950/20', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
