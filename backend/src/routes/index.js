const express = require('express');
const healthRoutes = require('./healthRoutes');
const locationRoutes = require('./locationRoutes');
const complaintRoutes = require('./complaintRoutes');
const adminComplaintRoutes = require('./adminComplaintRoutes');
const staffComplaintRoutes = require('./staffComplaintRoutes');

const router = express.Router();

// Mount API subroutes
router.use('/', healthRoutes);
router.use('/locations', locationRoutes);
router.use('/complaints', complaintRoutes);
router.use('/admin/complaints', adminComplaintRoutes);
router.use('/staff/complaints', staffComplaintRoutes);

module.exports = router;
