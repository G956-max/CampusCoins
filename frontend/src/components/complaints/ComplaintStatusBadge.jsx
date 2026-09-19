import React from 'react';
import Badge from '../common/Badge';
import { STATUS_CONFIG } from '../../constants/complaints';

const ComplaintStatusBadge = ({ status, size = 'md', className }) => {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    variant: 'default',
  };

  return (
    <Badge
      variant={config.variant}
      size={size}
      withDot
      className={className}
    >
      {config.label}
    </Badge>
  );
};

export default ComplaintStatusBadge;
