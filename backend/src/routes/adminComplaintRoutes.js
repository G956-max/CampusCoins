const express = require('express');
const {
  getAllComplaints,
  getAdminComplaintDetails,
  reviewComplaint,
  rejectComplaint,
  assignStaff,
  updatePriority,
  getStaffList,
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
router.post('/:id/reject', rejectComplaint);
router.post('/:id/assign', assignStaff);

module.exports = router;
