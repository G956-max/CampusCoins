const express = require('express');
const { getBuildings, getFloors, getRooms } = require('../controllers/locationController');

const router = express.Router();

router.get('/buildings', getBuildings);
router.get('/floors', getFloors);
router.get('/rooms', getRooms);

module.exports = router;
