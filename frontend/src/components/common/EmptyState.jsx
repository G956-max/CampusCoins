import React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '../../utils/cn';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are currently no items to display in this view.',
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-[#E1E9E2] bg-white shadow-2xs',
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-[#EAF6EE] border border-[#CBE7D4] flex items-center justify-center text-[#168451] mb-4 shadow-2xs">
        <Icon size={24} />
      </div>
      <h4 className="text-sm font-bold text-[#17211B] mb-1">{title}</h4>
      <p className="text-xs text-[#647168] max-w-sm mb-5 leading-relaxed">{description}</p>
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
};

export default EmptyState;
