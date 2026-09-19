const { z } = require('zod');

const VALID_CATEGORIES = [
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

const VALID_PRIORITIES = ['low', 'medium', 'high', 'critical'];

const idRegex = /^[0-9a-zA-Z_-]+$/;

const optionalUuid = z.string().refine((val) => !val || (val.length >= 3 && idRegex.test(val)), {
  message: 'Must be a valid identifier or empty',
}).nullable().optional();

// Schema for complaint creation (student only)
const createComplaintSchema = z.object({
  title: z
    .string({ required_error: 'Complaint title is required' })
    .trim()
    .min(2, 'Title must be between 2 and 150 characters')
    .max(150, 'Title must be between 2 and 150 characters'),
  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(20, 'Description must be between 20 and 5000 characters')
    .max(5000, 'Description must be between 20 and 5000 characters'),
  category: z
    .string({ required_error: 'Category is required' })
    .refine((cat) => VALID_CATEGORIES.includes(cat), {
      message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
    }),
  priority: z
    .string()
    .optional()
    .default('medium')
    .refine((p) => VALID_PRIORITIES.includes(p.toLowerCase()), {
      message: `Priority must be one of: ${VALID_PRIORITIES.join(', ')}`,
    }),
  building_id: optionalUuid,
  floor_id: optionalUuid,
  room_id: optionalUuid,
  general_location: z.string().max(300).optional().nullable(),
  additional_notes: z.string().max(2000).optional(),
}).refine((data) => {
  const hasStructured = data.building_id || data.floor_id || data.room_id;
  const hasGeneral = Boolean(data.general_location && data.general_location.trim().length > 0);
  return hasStructured || hasGeneral;
}, {
  message: 'Either structured location (building/floor/room) or general location must be specified',
  path: ['general_location'],
});

// Schema for admin rejection (requires reason)
const rejectComplaintSchema = z.object({
  rejection_reason: z
    .string({ required_error: 'Rejection reason is required' })
    .trim()
    .min(3, 'Rejection reason must be at least 3 characters')
    .max(2000, 'Rejection reason cannot exceed 2000 characters'),
});

// Schema for admin assigning staff
const assignComplaintSchema = z.object({
  staff_id: z
    .string({ required_error: 'Staff ID is required' })
    .min(3, 'Staff ID must be at least 3 characters'),
  notes: z.string().max(2000).optional(),
});

// Schema for admin priority update
const updatePrioritySchema = z.object({
  priority: z
    .string({ required_error: 'Priority is required' })
    .refine((p) => VALID_PRIORITIES.includes(p.toLowerCase()), {
      message: `Priority must be one of: ${VALID_PRIORITIES.join(', ')}`,
    }),
});

// Schema for staff progress update
const progressUpdateSchema = z.object({
  comment: z
    .string({ required_error: 'Update comment is required' })
    .trim()
    .min(2, 'Comment must be at least 2 characters')
    .max(2000, 'Comment cannot exceed 2000 characters'),
});

// Schema for staff marking resolved
const resolveComplaintSchema = z.object({
  resolution_comment: z
    .string({ required_error: 'Resolution comment is required' })
    .trim()
    .min(3, 'Resolution comment must be at least 3 characters')
    .max(2000, 'Resolution comment cannot exceed 2000 characters'),
});

// Schema for student reopening complaint
const reopenComplaintSchema = z.object({
  reopen_reason: z
    .string({ required_error: 'Reopen reason is required' })
    .trim()
    .min(3, 'Reopen reason must be at least 3 characters')
    .max(2000, 'Reopen reason cannot exceed 2000 characters'),
});

module.exports = {
  VALID_CATEGORIES,
  VALID_PRIORITIES,
  createComplaintSchema,
  rejectComplaintSchema,
  assignComplaintSchema,
  updatePrioritySchema,
  progressUpdateSchema,
  resolveComplaintSchema,
  reopenComplaintSchema,
};
