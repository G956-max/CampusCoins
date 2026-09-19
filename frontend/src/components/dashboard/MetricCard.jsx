import React from 'react';
import { Card } from '../common/Card';
import { cn } from '../../utils/cn';

const colorStyles = {
  emerald: {
    iconBg: 'bg-campus-500/10 border-campus-500/30 text-campus-400',
    glow: 'from-campus-500/10',
  },
  amber: {
    iconBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    glow: 'from-amber-500/10',
  },
  indigo: {
    iconBg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
    glow: 'from-indigo-500/10',
  },
  rose: {
    iconBg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    glow: 'from-rose-500/10',
  },
  sky: {
    iconBg: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
    glow: 'from-sky-500/10',
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
        'relative p-5 transition-all overflow-hidden',
        `before:absolute before:top-0 before:right-0 before:w-32 before:h-32 before:bg-gradient-to-bl ${style.glow} before:to-transparent before:rounded-full before:blur-2xl before:pointer-events-none`,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
            {title}
          </p>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-extrabold text-slate-100 tracking-tight">
              {value}
            </span>
            {badgeText && (
              <span className="text-[11px] font-semibold text-slate-400 font-mono">
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-400 pt-1 flex items-center gap-1.5">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={cn(
              'w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-inner',
              style.iconBg
            )}
          >
            <Icon size={22} />
          </div>
        )}
      </div>
    </Card>
  );
};

export default MetricCard;
