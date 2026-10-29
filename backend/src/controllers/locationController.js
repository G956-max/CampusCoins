const complaintService = require('../services/complaintService');
const { getCampusMapData, findShortestPath, CAMPUS_BUILDINGS, CAMPUS_FACILITIES } = require('../services/campusMapService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const getBuildings = async (req, res, next) => {
  try {
    const buildings = await complaintService.getBuildings();
    return sendSuccess(res, 'Buildings retrieved', buildings);
  } catch (err) {
    next(err);
  }
};

const getFloors = async (req, res, next) => {
  try {
    const { buildingId } = req.query;
    const floors = await complaintService.getFloors(buildingId);
    return sendSuccess(res, 'Floors retrieved', floors);
  } catch (err) {
    next(err);
  }
};

const getRooms = async (req, res, next) => {
  try {
    const { floorId } = req.query;
    const rooms = await complaintService.getRooms(floorId);
    return sendSuccess(res, 'Rooms retrieved', rooms);
  } catch (err) {
    next(err);
  }
};

const getMap = async (req, res, next) => {
  try {
    const mapData = await getCampusMapData();
    return sendSuccess(res, 'Campus map data retrieved', mapData);
  } catch (err) {
    next(err);
  }
};

const getFacilities = async (req, res, next) => {
  try {
    const mapData = await getCampusMapData();
    // Return unified array formatted for the frontend map dropdowns and pins
    const items = [
      ...mapData.buildings.map((b) => ({
        id: b.id,
        name: b.name,
        code: b.code,
        type: b.facility_type || 'Academic Block',
        description: b.description,
        lat: b.coordinates[0],
        lng: b.coordinates[1],
        floorsCount: b.floorsCount || 1,
        is_accessible: true,
      })),
      ...mapData.facilities.map((f) => ({
        id: f.id,
        name: f.name,
        code: f.code || 'FAC',
        type: f.category || 'Facility',
        description: f.category + ' facility at Erode Sengunthar Engineering College',
        lat: f.coordinates[0],
        lng: f.coordinates[1],
        floorsCount: 1,
        is_accessible: f.is_accessible ?? true,
      })),
    ];
    return sendSuccess(res, 'Facilities retrieved', items);
  } catch (err) {
    next(err);
  }
};

const getRoute = async (req, res, next) => {
  try {
    const from = req.query?.from || req.body?.fromId || req.body?.from;
    const to = req.query?.to || req.body?.toId || req.body?.to;
    const accessible = req.query?.accessible === 'true' || req.body?.accessibleOnly === true;

    if (!from || !to) {
      return sendError(res, 'Parameters "from" and "to" location identifiers are required', 400);
    }
    const route = findShortestPath(from, to, accessible);
    return sendSuccess(res, 'Navigation route calculated', route);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getBuildings,
  getFloors,
  getRooms,
  getMap,
  getFacilities,
  getRoute,
};
