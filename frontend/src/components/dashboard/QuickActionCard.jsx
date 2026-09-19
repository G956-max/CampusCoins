import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Card } from '../common/Card';
import { cn } from '../../utils/cn';

const QuickActionCard = ({
  icon: Icon,
  title,
  description,
  badge,
  onClick,
  color = 'campus',
  className,
}) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
      className={cn(
        'group cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-campus-500/40 rounded-2xl',
        className
      )}
    >
      <Card
        hover
        className="p-5 h-full flex flex-col justify-between border-slate-800/80 group-hover:border-slate-700/80 transition-all"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-campus-400 group-hover:scale-110 group-hover:bg-campus-500/10 group-hover:border-campus-500/30 transition-all">
            <Icon size={22} />
          </div>
          {badge && (
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              {badge}
            </span>
          )}
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-100 group-hover:text-campus-400 transition-colors flex items-center justify-between">
            {title}
            <ChevronRight
              size={16}
              className="text-slate-500 group-hover:text-campus-400 group-hover:translate-x-0.5 transition-all"
            />
          </h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {description}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default QuickActionCard;
