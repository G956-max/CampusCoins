const express = require('express');
const {
  getAllComplaints,
  getAdminComplaintDetails,
  reviewComplaint,
  rejectComplaint,
  assignStaff,
  updatePriority,
  getStaffList,
  verifyComplaint,
  markSpam,
  markFake,
  linkDuplicateComplaint,
} = require('../controllers/adminComplaintController');
const { verifyAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Strict Admin role requirement
router.use(verifyAuth, requireRole(['admin']));

router.get('/', getAllComplaints);
router.get('/staff-list', getStaffList);
router.get('/:id', getAdminComplaintDetails);
router.patch('/:id/priority', updatePriority);
router.post('/:id/review', reviewComplaint);
router.post('/:id/verify', verifyComplaint);
router.post('/:id/reject', rejectComplaint);
router.post('/:id/spam', markSpam);
router.post('/:id/fake', markFake);
router.post('/:id/assign', assignStaff);
router.post('/:id/link-duplicate', linkDuplicateComplaint);

module.exports = router;
