import React from 'react';
import Badge from '../common/Badge';
import { COMPLAINT_PRIORITIES } from '../../constants/complaints';

const PriorityBadge = ({ priority = 'medium', size = 'sm', className }) => {
  const normalized = priority ? priority.toLowerCase() : 'medium';
  const item = COMPLAINT_PRIORITIES.find((p) => p.value === normalized) || {
    label: priority,
    variant: 'default',
  };

  return (
    <Badge
      variant={item.variant}
      size={size}
      className={className}
    >
      {item.label} Priority
    </Badge>
  );
};

export default PriorityBadge;
