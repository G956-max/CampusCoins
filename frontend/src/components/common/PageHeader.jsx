import React from 'react';
import { cn } from '../../utils/cn';

const PageHeader = ({
  title,
  subtitle,
  badge,
  actions,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-2.5 pb-4 border-b border-[#E1E9E2] mb-5',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17211B] leading-tight">
              {title}
            </h1>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#647168] line-clamp-2 sm:line-clamp-none">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2 shrink-0 pt-1 sm:pt-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
