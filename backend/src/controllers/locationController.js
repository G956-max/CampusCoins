const complaintService = require('../services/complaintService');
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

module.exports = {
  getBuildings,
  getFloors,
  getRooms,
};
