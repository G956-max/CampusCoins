const express = require('express');
const { getMyWallet, getMyTransactions } = require('../controllers/walletController');
const { verifyAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(verifyAuth);

router.get('/', getMyWallet);
router.get('/transactions', getMyTransactions);

module.exports = router;
