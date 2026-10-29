import React from 'react';
import { cn } from '../../utils/cn';

const variantClasses = {
  default: 'bg-[#F7FAF7] text-[#647168] border-[#E1E9E2]',
  success: 'bg-[#EAF6EE] text-[#168451] border-[#CBE7D4]',
  warning: 'bg-[#FEF9EE] text-[#B7791F] border-[#F8E7C5]',
  danger: 'bg-[#FDF2F2] text-[#C43D3D] border-[#F8D2D2]',
  info: 'bg-[#F0F7FF] text-[#1E6091] border-[#D0E5FA]',
  purple: 'bg-[#F5F3FF] text-[#5B21B6] border-[#DDD6FE]',
  gold: 'bg-[#FEF9EE] text-[#B7791F] border-[#F8E7C5] font-semibold',
};

const dotColors = {
  default: 'bg-[#647168]',
  success: 'bg-[#168451]',
  warning: 'bg-[#B7791F]',
  danger: 'bg-[#C43D3D]',
  info: 'bg-[#1E6091]',
  purple: 'bg-[#5B21B6]',
  gold: 'bg-[#B7791F] animate-pulse',
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
        'inline-flex items-center font-medium border rounded-full tracking-normal',
        size === 'sm' ? 'px-2 py-0.5 text-[11px] gap-1.5' : 'px-2.5 py-0.5 text-xs gap-1.5',
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
