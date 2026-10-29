const {
  getBounties,
  claimBounty,
  verifyBounty,
  createBounty,
} = require('../services/bountyService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const getAllBounties = async (req, res, next) => {
  try {
    const list = await getBounties();
    return sendSuccess(res, 'Community bounties retrieved', list);
  } catch (err) {
    next(err);
  }
};

const claimCommunityBounty = async (req, res, next) => {
  try {
    const result = await claimBounty(req.params.id, req.user);
    return sendSuccess(res, 'Bounty claimed successfully', result);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
};

const verifyCommunityBounty = async (req, res, next) => {
  try {
    const result = await verifyBounty(req.params.id, req.user);
    return sendSuccess(res, 'Bounty verified and coins awarded', result);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
};

const createCommunityBounty = async (req, res, next) => {
  try {
    const result = await createBounty(req.body, req.user);
    return sendSuccess(res, 'Bounty created successfully', result, 201);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
};

module.exports = {
  getAllBounties,
  claimCommunityBounty,
  verifyCommunityBounty,
  createCommunityBounty,
};
