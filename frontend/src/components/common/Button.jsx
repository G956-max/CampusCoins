import React from 'react';
import { cn } from '../../utils/cn';
import LoadingSpinner from './LoadingSpinner';

const variantClasses = {
  primary:
    'bg-gradient-to-r from-campus-500 to-emerald-600 hover:from-campus-400 hover:to-emerald-500 text-slate-950 font-semibold shadow-lg shadow-campus-500/20 active:scale-[0.98]',
  secondary:
    'bg-slate-800/80 hover:bg-slate-700/80 text-slate-100 border border-slate-700/60 active:scale-[0.98]',
  brand:
    'bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-400 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-brand-500/25 active:scale-[0.98]',
  outline:
    'bg-transparent hover:bg-slate-800/60 text-slate-200 border border-slate-700 hover:border-slate-500 active:scale-[0.98]',
  ghost:
    'bg-transparent hover:bg-slate-800/50 text-slate-300 hover:text-white',
  danger:
    'bg-rose-600/90 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 active:scale-[0.98]',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
};

const Button = React.forwardRef(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      type = 'button',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-campus-500/40 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
          variantClasses[variant] || variantClasses.primary,
          sizeClasses[size] || sizeClasses.md,
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" color={variant === 'primary' ? 'text-slate-950' : 'text-current'} />
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
