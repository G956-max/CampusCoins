const complaintService = require('../services/complaintService');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const {
  progressUpdateSchema,
  resolveComplaintSchema,
} = require('../validators/complaintValidator');

/**
 * GET /api/staff/complaints - List complaints assigned to logged-in staff
 */
const getAssignedComplaints = async (req, res, next) => {
  try {
    const { status, priority, category, search, page = 1, limit = 10 } = req.query;
    const result = await complaintService.getStaffComplaints(req.user.id, {
      status,
      priority,
      category,
      search,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });

    return res.status(200).json({
      success: true,
      message: 'Assigned complaints retrieved',
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
 * GET /api/staff/complaints/:id - View assigned complaint details
 */
const getStaffComplaintDetails = async (req, res, next) => {
  try {
    const complaint = await complaintService.getComplaintById(req.params.id, req.user);
    return sendSuccess(res, 'Complaint details retrieved', complaint);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/staff/complaints/:id/start - Start work (assigned -> in_progress)
 */
const startWork = async (req, res, next) => {
  try {
    const complaint = await complaintService.startWork(req.params.id, req.user);
    return sendSuccess(res, 'Work started on complaint', complaint);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/staff/complaints/:id/update - Add progress update note
 */
const addProgressUpdate = async (req, res, next) => {
  try {
    const parseResult = progressUpdateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: parseResult.error.errors[0]?.message || 'Update comment is required',
        errors: parseResult.error.errors,
      });
    }

    const update = await complaintService.addProgressUpdate(
      req.params.id,
      parseResult.data.comment,
      req.user
    );

    return sendSuccess(res, 'Progress update recorded', update, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/staff/complaints/:id/resolve - Mark resolved (in_progress -> resolved)
 */
const resolveComplaint = async (req, res, next) => {
  try {
    const parseResult = resolveComplaintSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: parseResult.error.errors[0]?.message || 'Resolution comment is required',
        errors: parseResult.error.errors,
      });
    }

    const complaint = await complaintService.resolveComplaint(
      req.params.id,
      parseResult.data.resolution_comment,
      req.user
    );

    return sendSuccess(res, 'Complaint marked as resolved. Student verification pending.', complaint);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/staff/complaints/:id/evidence - Staff upload resolution proof evidence
 */
const uploadStaffEvidence = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'No evidence file uploaded', 400);
    }

    const evidence = await complaintService.addEvidence(req.params.id, req.file, req.user);
    return sendSuccess(res, 'Evidence uploaded successfully', evidence, 201);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAssignedComplaints,
  getStaffComplaintDetails,
  startWork,
  addProgressUpdate,
  resolveComplaint,
  uploadStaffEvidence,
};
