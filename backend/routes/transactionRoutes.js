const express = require('express');
const router = express.Router();
const {
  getTransactions,
  createTransaction,
  settleTransaction,
  deleteTransaction,
  getStats,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats', getStats);
router.route('/').get(getTransactions).post(createTransaction);
router.put('/:id/settle', settleTransaction);
router.route('/:id').delete(deleteTransaction);

module.exports = router;
