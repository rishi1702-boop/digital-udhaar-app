const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');
const { updateRiskLevel } = require('../services/riskService');

// @desc    Get all transactions for logged-in owner
// @route   GET /api/transactions
const getTransactions = async (req, res, next) => {
  try {
    const { type, customer, startDate, endDate, limit, status } = req.query;
    let query = { owner: req.user._id };

    if (type && ['credit', 'debit'].includes(type)) {
      query.type = type;
    }

    if (customer) {
      query.customer = customer;
    }

    if (status && ['PENDING', 'SETTLED'].includes(status)) {
      query.paymentStatus = status;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const queryLimit = parseInt(limit) || 100;

    const transactions = await Transaction.find(query)
      .populate('customer', 'name phone')
      .sort({ date: -1 })
      .limit(queryLimit);

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create transaction and update customer balance
// @route   POST /api/transactions
const createTransaction = async (req, res, next) => {
  try {
    const { customer: customerId, type, amount, description, date, billImageUrl } = req.body;

    // Verify customer belongs to this owner
    const customer = await Customer.findOne({
      _id: customerId,
      owner: req.user._id,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Create transaction
    const transaction = await Transaction.create({
      customer: customerId,
      owner: req.user._id,
      type,
      amount: parseFloat(amount),
      description,
      billImageUrl: billImageUrl || '',
      paymentStatus: type === 'debit' ? 'SETTLED' : 'PENDING',
      date: date || Date.now(),
    });

    // Update customer balance
    if (type === 'credit') {
      customer.balance += parseFloat(amount);
    } else if (type === 'debit') {
      customer.balance -= parseFloat(amount);
      customer.lastPaymentDate = new Date();
    }
    customer.totalTransactions = (customer.totalTransactions || 0) + 1;
    await customer.save();

    // Update risk level asynchronously
    updateRiskLevel(customerId).catch(() => {});

    // Populate customer info for response
    await transaction.populate('customer', 'name phone balance');

    res.status(201).json({
      success: true,
      data: transaction,
      updatedBalance: customer.balance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark transaction as settled
// @route   PUT /api/transactions/:id/settle
const settleTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    transaction.paymentStatus = 'SETTLED';
    await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Transaction marked as settled',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction and reverse balance
// @route   DELETE /api/transactions/:id
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    // Reverse the balance
    const customer = await Customer.findById(transaction.customer);
    if (customer) {
      if (transaction.type === 'credit') {
        customer.balance -= transaction.amount;
      } else if (transaction.type === 'debit') {
        customer.balance += transaction.amount;
      }
      customer.totalTransactions = Math.max(0, (customer.totalTransactions || 0) - 1);
      await customer.save();

      // Update risk level
      updateRiskLevel(customer._id).catch(() => {});
    }

    await Transaction.findByIdAndDelete(transaction._id);

    res.status(200).json({
      success: true,
      message: 'Transaction deleted and balance reversed',
      updatedBalance: customer ? customer.balance : null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/transactions/stats
const getStats = async (req, res, next) => {
  try {
    const ownerId = req.user._id;

    const totalCustomers = await Customer.countDocuments({ owner: ownerId });

    const balanceAgg = await Customer.aggregate([
      { $match: { owner: ownerId } },
      {
        $group: {
          _id: null,
          youWillGet: { $sum: { $cond: [{ $gt: ['$balance', 0] }, '$balance', 0] } },
          youWillGive: { $sum: { $cond: [{ $lt: ['$balance', 0] }, { $abs: '$balance' }, 0] } },
        },
      },
    ]);

    // Today's transactions
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayTransactions = await Transaction.countDocuments({
      owner: ownerId,
      date: { $gte: todayStart },
    });

    const todayAgg = await Transaction.aggregate([
      { $match: { owner: ownerId, date: { $gte: todayStart } } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const todayCredit = todayAgg.find((a) => a._id === 'credit')?.total || 0;
    const todayDebit = todayAgg.find((a) => a._id === 'debit')?.total || 0;

    // Customers with outstanding balance
    const customersWithDues = await Customer.countDocuments({
      owner: ownerId,
      balance: { $gt: 0 },
    });

    // High risk customers count
    const highRiskCount = await Customer.countDocuments({
      owner: ownerId,
      riskLevel: 'high',
    });

    // Pending transactions
    const pendingTransactions = await Transaction.countDocuments({
      owner: ownerId,
      paymentStatus: 'PENDING',
      type: 'credit',
    });

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        youWillGet: balanceAgg[0]?.youWillGet || 0,
        youWillGive: balanceAgg[0]?.youWillGive || 0,
        todayTransactions,
        todayCredit,
        todayDebit,
        customersWithDues,
        highRiskCount,
        pendingTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  settleTransaction,
  deleteTransaction,
  getStats,
};
