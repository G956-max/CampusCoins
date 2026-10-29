const coinService = require('../services/coinService');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * GET /api/wallet - Get current authenticated user's wallet
 */
const getMyWallet = async (req, res, next) => {
  try {
    const wallet = await coinService.getWallet(req.user.id);
    return sendSuccess(res, 'Wallet retrieved successfully', wallet);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/wallet/transactions - Get paginated & filtered transactions
 */
const getMyTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, type, eventType, search } = req.query;
    const result = await coinService.getTransactions(req.user.id, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      type,
      eventType,
      search,
    });

    return res.status(200).json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: result.transactions,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyWallet,
  getMyTransactions,
};
