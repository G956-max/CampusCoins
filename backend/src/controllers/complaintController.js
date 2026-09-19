const complaintService = require('../services/complaintService');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const {
  createComplaintSchema,
  reopenComplaintSchema,
} = require('../validators/complaintValidator');

/**
 * POST /api/complaints - Create new complaint (Student only)
 */
const createComplaint = async (req, res, next) => {
  try {
    const parseResult = createComplaintSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: parseResult.error.errors[0]?.message || 'Validation error',
        errors: parseResult.error.errors,
      });
    }

    const { title, description, category, priority, building_id, floor_id, room_id, general_location } = parseResult.data;

    const complaint = await complaintService.createComplaint({
      studentId: req.user.id,
      title,
      description,
      category,
      priority,
      buildingId: building_id,
      floorId: floor_id,
      roomId: room_id,
      generalLocation: general_location,
    });

    return sendSuccess(res, 'Complaint created successfully', complaint, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/complaints/my - List complaints submitted by logged-in student
 */
const getMyComplaints = async (req, res, next) => {
  try {
    const { status, category, priority, search, page = 1, limit = 10 } = req.query;
    const result = await complaintService.getStudentComplaints(req.user.id, {
      status,
      category,
      priority,
      search,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });

    return res.status(200).json({
      success: true,
      message: 'Complaints retrieved',
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
 * GET /api/complaints/:id - View complaint details (ownership verified)
 */
const getComplaintDetails = async (req, res, next) => {
  try {
    const complaint = await complaintService.getComplaintById(req.params.id, req.user);
    return sendSuccess(res, 'Complaint details retrieved', complaint);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/complaints/:id/evidence - Upload evidence attachment
 */
const uploadEvidence = async (req, res, next) => {
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

/**
 * POST /api/complaints/:id/verify - Student verifies resolution (resolved -> verified)
 */
const verifyResolution = async (req, res, next) => {
  try {
    const complaint = await complaintService.verifyResolution(req.params.id, req.user);
    return sendSuccess(res, 'Resolution verified successfully. Ticket closed.', complaint);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/complaints/:id/reopen - Student reopens unresolved ticket (resolved -> reopened)
 */
const reopenComplaint = async (req, res, next) => {
  try {
    const parseResult = reopenComplaintSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: parseResult.error.errors[0]?.message || 'A reason for reopening is required',
        errors: parseResult.error.errors,
      });
    }

    const complaint = await complaintService.reopenComplaint(
      req.params.id,
      parseResult.data.reopen_reason,
      req.user
    );

    return sendSuccess(res, 'Complaint reopened. Administration and staff notified.', complaint);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaintDetails,
  uploadEvidence,
  verifyResolution,
  reopenComplaint,
};
