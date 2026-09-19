/**
 * Complaint System Constants & Enums (Phase 3)
 */

export const COMPLAINT_CATEGORIES = [
  'Classroom',
  'Laboratory',
  'Electrical',
  'Plumbing',
  'Cleaning',
  'Wi-Fi / Internet',
  'Furniture',
  'Security',
  'Transport',
  'Canteen',
  'Hostel',
  'Library',
  'Restroom',
  'Water',
  'Safety',
  'Other',
];

export const COMPLAINT_PRIORITIES = [
  { value: 'low', label: 'Low', variant: 'default', description: 'Minor non-urgent inconvenience' },
  { value: 'medium', label: 'Medium', variant: 'info', description: 'Standard maintenance issue' },
  { value: 'high', label: 'High', variant: 'warning', description: 'Impairs learning or facility operations' },
  { value: 'critical', label: 'Critical', variant: 'danger', description: 'Urgent safety or hazard risk' },
];

export const COMPLAINT_STATUSES = {
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  VERIFIED: 'verified',
  REOPENED: 'reopened',
  REJECTED: 'rejected',
};

export const STATUS_CONFIG = {
  [COMPLAINT_STATUSES.SUBMITTED]: {
    label: 'Submitted',
    variant: 'default',
    color: 'slate',
    description: 'Complaint submitted by student, awaiting review',
  },
  [COMPLAINT_STATUSES.UNDER_REVIEW]: {
    label: 'Under Review',
    variant: 'info',
    color: 'sky',
    description: 'Being reviewed and triaged by campus administration',
  },
  [COMPLAINT_STATUSES.ASSIGNED]: {
    label: 'Assigned',
    variant: 'purple',
    color: 'indigo',
    description: 'Assigned to department technician',
  },
  [COMPLAINT_STATUSES.IN_PROGRESS]: {
    label: 'In Progress',
    variant: 'warning',
    color: 'amber',
    description: 'Technician is actively working on the resolution',
  },
  [COMPLAINT_STATUSES.RESOLVED]: {
    label: 'Resolved',
    variant: 'success',
    color: 'emerald',
    description: 'Work completed by staff; awaiting student verification',
  },
  [COMPLAINT_STATUSES.VERIFIED]: {
    label: 'Verified & Closed',
    variant: 'gold',
    color: 'emerald',
    description: 'Student verified that the issue was successfully fixed',
  },
  [COMPLAINT_STATUSES.REOPENED]: {
    label: 'Reopened',
    variant: 'danger',
    color: 'rose',
    description: 'Student reported issue still persists',
  },
  [COMPLAINT_STATUSES.REJECTED]: {
    label: 'Rejected',
    variant: 'danger',
    color: 'rose',
    description: 'Complaint could not be approved by administration',
  },
};
