const express = require('express');
const {
  createComplaint,
  getMyComplaints,
  getComplaintDetails,
  uploadEvidence,
  verifyResolution,
  reopenComplaint,
} = require('../controllers/complaintController');
const { verifyAuth, requireRole } = require('../middleware/authMiddleware');
const { upload, validateFileSize } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Require authenticated user for all complaint routes
router.use(verifyAuth);

// Student specific endpoints
router.post('/', requireRole(['student']), createComplaint);
router.get('/my', requireRole(['student']), getMyComplaints);
router.get('/:id', getComplaintDetails); // Permissions verified inside controller
router.post('/:id/evidence', upload.single('file'), validateFileSize, uploadEvidence);
router.post('/:id/verify', requireRole(['student']), verifyResolution);
router.post('/:id/reopen', requireRole(['student']), reopenComplaint);

module.exports = router;
