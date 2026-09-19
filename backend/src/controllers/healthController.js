/**
 * Health Check Controller
 * Verifies backend operational status for monitoring and frontend connectivity.
 */

const getHealth = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "CampusCoins API is running"
  });
};

module.exports = {
  getHealth
};
