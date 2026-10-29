const express = require('express');
const {
  getBuildings,
  getFloors,
  getRooms,
  getMap,
  getFacilities,
  getRoute,
} = require('../controllers/locationController');

const router = express.Router();

router.get('/buildings', getBuildings);
router.get('/floors', getFloors);
router.get('/rooms', getRooms);
router.get('/facilities', getFacilities);
router.get('/map', getMap);
router.get('/route', getRoute);
router.post('/route', getRoute);

module.exports = router;
