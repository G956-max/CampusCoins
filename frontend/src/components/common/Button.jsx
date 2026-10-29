import React from 'react';
import { cn } from '../../utils/cn';
import LoadingSpinner from './LoadingSpinner';

const variantClasses = {
  primary:
    'bg-[#168451] hover:bg-[#116B42] text-white font-medium shadow-sm hover:shadow active:scale-[0.98]',
  secondary:
    'bg-[#EAF6EE] hover:bg-[#CBE7D4] text-[#168451] border border-[#E1E9E2] font-medium active:scale-[0.98]',
  brand:
    'bg-[#168451] hover:bg-[#116B42] text-white font-medium shadow-sm active:scale-[0.98]',
  outline:
    'bg-white hover:bg-[#F7FAF7] text-[#17211B] border border-[#E1E9E2] hover:border-[#168451] active:scale-[0.98]',
  ghost:
    'bg-transparent hover:bg-[#EAF6EE] text-[#647168] hover:text-[#168451]',
  danger:
    'bg-[#C43D3D] hover:bg-[#A93232] text-white font-medium shadow-sm active:scale-[0.98]',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-xl gap-2',
  lg: 'px-6 py-2.5 text-base rounded-xl gap-2.5',
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
          'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#168451]/30 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
          variantClasses[variant] || variantClasses.primary,
          sizeClasses[size] || sizeClasses.md,
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" color={variant === 'outline' || variant === 'ghost' ? 'text-[#168451]' : 'text-white'} />
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
