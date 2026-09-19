const express = require('express');
const healthRoutes = require('./healthRoutes');

const router = express.Router();

// Mount API subroutes
router.use('/', healthRoutes);

module.exports = router;
