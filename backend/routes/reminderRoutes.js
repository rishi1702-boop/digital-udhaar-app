const express = require('express');
const router = express.Router();
const { sendReminder, sendBulkReminders, getCheckoutDetails, confirmPayment } = require('../controllers/reminderController');
const { protect } = require('../middleware/authMiddleware');
const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');
const { generateStatement } = require('../services/pdfService');

// Public endpoints for checkout
router.get('/checkout/:customerId', getCheckoutDetails);
router.post('/checkout/:customerId/confirm-payment', confirmPayment);

router.use(protect);

// Reminders
router.post('/send/:customerId', sendReminder);
router.post('/send-bulk', sendBulkReminders);

// PDF statement download
router.get('/statement/:customerId', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const customer = await Customer.findOne({
      _id: req.params.customerId,
      owner: req.user._id,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Default to current month if no dates provided
    const now = new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate
      ? new Date(endDate)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const transactions = await Transaction.find({
      customer: customer._id,
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 });

    const store = {
      storeName: req.user.storeName,
      name: req.user.name,
      phone: req.user.phone,
    };

    const dateRange = {
      startDate: start.toLocaleDateString('en-IN'),
      endDate: end.toLocaleDateString('en-IN'),
    };

    generateStatement(store, customer, transactions, dateRange, res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
