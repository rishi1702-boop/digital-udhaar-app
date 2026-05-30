const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');

/**
 * Calculate and update a customer's risk level based on payment behavior.
 * - Low: Average repayment within 7 days
 * - Medium: Average repayment between 7-30 days
 * - High: Average repayment > 30 days or no payments in 30+ days
 */
const updateRiskLevel = async (customerId) => {
  try {
    const customer = await Customer.findById(customerId);
    if (!customer) return;

    const transactions = await Transaction.find({ customer: customerId }).sort({ date: 1 });

    if (transactions.length < 2) {
      // Not enough data — keep at low
      customer.riskLevel = 'low';
      await customer.save();
      return customer.riskLevel;
    }

    // Find pairs of credit followed by debit (udhaar then payment)
    const delays = [];
    let lastCreditDate = null;

    for (const txn of transactions) {
      if (txn.type === 'credit') {
        lastCreditDate = txn.date;
      } else if (txn.type === 'debit' && lastCreditDate) {
        const daysDiff = (txn.date - lastCreditDate) / (1000 * 60 * 60 * 24);
        delays.push(daysDiff);
        lastCreditDate = null;
      }
    }

    let riskLevel = 'low';

    if (delays.length > 0) {
      const avgDelay = delays.reduce((a, b) => a + b, 0) / delays.length;
      if (avgDelay > 30) riskLevel = 'high';
      else if (avgDelay > 7) riskLevel = 'medium';
    }

    // If customer has outstanding balance and no payment in 30+ days
    if (customer.balance > 0 && customer.lastPaymentDate) {
      const daysSincePayment = (Date.now() - customer.lastPaymentDate) / (1000 * 60 * 60 * 24);
      if (daysSincePayment > 30) riskLevel = 'high';
      else if (daysSincePayment > 14) riskLevel = 'medium';
    }

    // If customer has balance but never paid
    if (customer.balance > 0 && !customer.lastPaymentDate && customer.totalTransactions > 2) {
      riskLevel = 'high';
    }

    customer.riskLevel = riskLevel;
    await customer.save();
    return riskLevel;
  } catch (error) {
    console.error('Risk calculation error:', error.message);
  }
};

module.exports = { updateRiskLevel };
