import React from 'react';
import { cn } from '../../utils/cn';

const variantClasses = {
  default: 'bg-slate-800 text-slate-300 border-slate-700',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  danger: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  info: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  purple: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  gold: 'bg-amber-400/15 text-amber-300 border-amber-400/40',
};

const dotColors = {
  default: 'bg-slate-400',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger: 'bg-rose-400',
  info: 'bg-sky-400',
  purple: 'bg-indigo-400',
  gold: 'bg-amber-300 animate-pulse',
};

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  withDot = false,
  className,
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border rounded-full tracking-wide',
        size === 'sm' ? 'px-2 py-0.5 text-[11px] gap-1.5' : 'px-2.5 py-1 text-xs gap-1.5',
        variantClasses[variant] || variantClasses.default,
        className
      )}
      {...props}
    >
      {withDot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
            dotColors[variant] || dotColors.default
          )}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
