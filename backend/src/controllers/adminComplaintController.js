const complaintService = require('../services/complaintService');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const {
  rejectComplaintSchema,
  assignComplaintSchema,
  updatePrioritySchema,
} = require('../validators/complaintValidator');

/**
 * GET /api/admin/complaints - List all complaints with filters
 */
const getAllComplaints = async (req, res, next) => {
  try {
    const { status, priority, category, buildingId, assigned, search, page = 1, limit = 10 } = req.query;
    const result = await complaintService.getAdminComplaints({
      status,
      priority,
      category,
      buildingId,
      assigned,
      search,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });

    return res.status(200).json({
      success: true,
      message: 'All complaints retrieved',
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/complaints/:id - Admin view full details
 */
const getAdminComplaintDetails = async (req, res, next) => {
  try {
    const complaint = await complaintService.getComplaintById(req.params.id, req.user);
    return sendSuccess(res, 'Complaint details retrieved', complaint);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/complaints/:id/review - Review complaint (submitted -> under_review)
 */
const reviewComplaint = async (req, res, next) => {
  try {
    const complaint = await complaintService.reviewComplaint(req.params.id, req.user);
    return sendSuccess(res, 'Complaint moved to under review', complaint);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/complaints/:id/reject - Reject complaint with reason
 */
const rejectComplaint = async (req, res, next) => {
  try {
    const parseResult = rejectComplaintSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: parseResult.error.errors[0]?.message || 'Rejection reason is required',
        errors: parseResult.error.errors,
      });
    }

    const complaint = await complaintService.rejectComplaint(
      req.params.id,
      parseResult.data.rejection_reason,
      req.user
    );

    return sendSuccess(res, 'Complaint rejected successfully', complaint);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/complaints/:id/assign - Assign staff member
 */
const assignStaff = async (req, res, next) => {
  try {
    const parseResult = assignComplaintSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: parseResult.error.errors[0]?.message || 'Staff ID is required',
        errors: parseResult.error.errors,
      });
    }

    const complaint = await complaintService.assignStaff(
      req.params.id,
      parseResult.data.staff_id,
      parseResult.data.notes,
      req.user
    );

    return sendSuccess(res, 'Staff assigned successfully', complaint);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/complaints/:id/priority - Adjust priority
 */
const updatePriority = async (req, res, next) => {
  try {
    const parseResult = updatePrioritySchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: parseResult.error.errors[0]?.message || 'Invalid priority',
        errors: parseResult.error.errors,
      });
    }

    const complaint = await complaintService.updatePriority(
      req.params.id,
      parseResult.data.priority,
      req.user
    );

    return sendSuccess(res, 'Priority updated successfully', complaint);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/staff-list - Retrieve active staff members for assignment
 */
const getStaffList = async (req, res, next) => {
  try {
    const staff = await complaintService.getStaffList();
    return sendSuccess(res, 'Staff list retrieved', staff);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllComplaints,
  getAdminComplaintDetails,
  reviewComplaint,
  rejectComplaint,
  assignStaff,
  updatePriority,
  getStaffList,
};
