const express = require('express');
const {
  getAssignedComplaints,
  getStaffComplaintDetails,
  startWork,
  addProgressUpdate,
  resolveComplaint,
  uploadStaffEvidence,
} = require('../controllers/staffComplaintController');
const { verifyAuth, requireRole } = require('../middleware/authMiddleware');
const { upload, validateFileSize } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Strict Staff (or Admin) role requirement
router.use(verifyAuth, requireRole(['staff', 'admin']));

router.get('/', getAssignedComplaints);
router.get('/:id', getStaffComplaintDetails);
router.post('/:id/start', startWork);
router.post('/:id/update', addProgressUpdate);
router.post('/:id/resolve', resolveComplaint);
router.post('/:id/evidence', upload.single('file'), validateFileSize, uploadStaffEvidence);

module.exports = router;
