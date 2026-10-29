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
        'group cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#168451]/30 rounded-2xl',
        className
      )}
    >
      <Card
        hover
        className="p-5 h-full flex flex-col justify-between border-[#E1E9E2] group-hover:border-[#168451] transition-all bg-white"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-[#EAF6EE] border border-[#CBE7D4] flex items-center justify-center text-[#168451] group-hover:scale-105 group-hover:bg-[#168451] group-hover:text-white transition-all shadow-sm">
            <Icon size={20} />
          </div>
          {badge && (
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#EAF6EE] text-[#168451] border border-[#CBE7D4]">
              {badge}
            </span>
          )}
        </div>

        <div>
          <h4 className="text-sm font-semibold text-[#17211B] group-hover:text-[#168451] transition-colors flex items-center justify-between">
            {title}
            <ChevronRight
              size={16}
              className="text-[#647168] group-hover:text-[#168451] group-hover:translate-x-0.5 transition-all"
            />
          </h4>
          <p className="text-xs text-[#647168] mt-1 leading-relaxed">
            {description}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default QuickActionCard;
