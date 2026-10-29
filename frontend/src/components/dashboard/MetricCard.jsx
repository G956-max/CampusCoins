import React from 'react';
import { Card } from '../common/Card';
import { cn } from '../../utils/cn';

const colorStyles = {
  emerald: {
    iconBg: 'bg-[#EAF6EE] border-[#CBE7D4] text-[#168451]',
    glow: 'from-[#EAF6EE]/40',
  },
  amber: {
    iconBg: 'bg-[#FEF9EE] border-[#F8E7C5] text-[#B7791F]',
    glow: 'from-[#FEF9EE]/40',
  },
  indigo: {
    iconBg: 'bg-[#F5F3FF] border-[#DDD6FE] text-[#5B21B6]',
    glow: 'from-[#F5F3FF]/40',
  },
  rose: {
    iconBg: 'bg-[#FDF2F2] border-[#F8D2D2] text-[#C43D3D]',
    glow: 'from-[#FDF2F2]/40',
  },
  sky: {
    iconBg: 'bg-[#F0F7FF] border-[#D0E5FA] text-[#1E6091]',
    glow: 'from-[#F0F7FF]/40',
  },
};

const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'emerald',
  badgeText,
  trend,
  className,
}) => {
  const style = colorStyles[color] || colorStyles.emerald;

  return (
    <Card
      hover
      className={cn(
        'relative p-3.5 sm:p-5 transition-all overflow-hidden bg-white border border-[#E1E9E2]',
        `before:absolute before:top-0 before:right-0 before:w-32 before:h-32 before:bg-gradient-to-bl ${style.glow} before:to-transparent before:rounded-full before:blur-2xl before:pointer-events-none`,
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 sm:space-y-1 min-w-0">
          <p className="text-[10px] sm:text-xs font-semibold text-[#647168] tracking-wider uppercase truncate">
            {title}
          </p>
          <div className="flex items-baseline gap-1.5 sm:gap-2 pt-0.5">
            <span className="text-xl sm:text-3xl font-extrabold text-[#17211B] tracking-tight">
              {value}
            </span>
            {badgeText && (
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#647168] font-mono">
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[10px] sm:text-xs text-[#647168] pt-0.5 flex items-center gap-1 truncate">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={cn(
              'w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl border flex items-center justify-center shrink-0 shadow-2xs',
              style.iconBg
            )}
          >
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default MetricCard;
