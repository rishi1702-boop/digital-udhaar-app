const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');
const { sendEmail: mailServiceSendEmail } = require('../services/mailService');

const sendReminderEmail = async (customer, storeName, upiId) => {
  if (!customer.email) {
    throw new Error('Customer does not have an email address');
  }

  // Use the production Vercel URL as the default fallback
  const checkoutUrl = `${process.env.FRONTEND_URL || 'https://digital-udhaar-app.vercel.app'}/checkout/${customer._id}`;

  const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #dc2626;">Payment Reminder</h2>
      <p>Dear <strong>${customer.name}</strong>,</p>
      <p>This is a friendly reminder from <strong>${storeName}</strong> regarding your outstanding balance.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 14px; color: #666; text-transform: uppercase;">Outstanding Amount</span><br/>
        <span style="font-size: 32px; font-weight: 800; color: #dc2626;">₹${customer.balance.toFixed(2)}</span>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${checkoutUrl}" style="background-color: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Pay Now
        </a>
      </div>

      <p style="margin-top: 30px;">Please arrange for the payment at your earliest convenience. Thank you for your business!</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="font-size: 12px; color: #999; text-align: center;">Powered by Digital Udhaar Khata</p>
    </div>
  `;

  return await mailServiceSendEmail({
    to: customer.email,
    subject: `Payment Reminder from ${storeName}`,
    html: html,
  });
};

// @desc    Send payment reminder to a customer
// @route   POST /api/reminders/send/:customerId
const sendReminder = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.customerId,
      owner: req.user._id,
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    if (customer.balance <= 0) {
      return res.status(400).json({ success: false, message: 'Customer has no outstanding balance' });
    }

    if (!customer.email) {
      return res.status(400).json({ success: false, message: 'Please add an email address to this customer first' });
    }

    const storeName = req.user.storeName;
    const upiId = req.user.upiId;

    const result = await sendReminderEmail(customer, storeName, upiId);

    res.status(200).json({
      success: true,
      message: `Reminder email sent to ${customer.name}`,
      previewUrl: result.info?.previewUrl || null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send bulk reminders to all customers with balance > 0
// @route   POST /api/reminders/send-bulk
const sendBulkReminders = async (req, res, next) => {
  try {
    const customers = await Customer.find({
      owner: req.user._id,
      balance: { $gt: 0 },
    });

    if (customers.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No customers with outstanding balance',
        data: { sent: 0, failed: 0 },
      });
    }

    const storeName = req.user.storeName;
    const upiId = req.user.upiId;
    let sent = 0;
    let failed = 0;
    const results = [];

    for (const customer of customers) {
      try {
        if (!customer.email) {
          throw new Error('No email address provided');
        }
        await sendReminderEmail(customer, storeName, upiId);
        sent++;
        results.push({ customer: customer.name, status: 'sent' });
      } catch (err) {
        failed++;
        results.push({ customer: customer.name, status: 'failed', error: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Reminders sent: ${sent}, Failed: ${failed}`,
      data: { sent, failed, results },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public checkout details for a customer
// @route   GET /api/reminders/checkout/:customerId
const getCheckoutDetails = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.customerId).populate('owner', 'storeName upiId phone');
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    if (!customer.owner) {
      return res.status(404).json({ success: false, message: 'Store owner not found.' });
    }

    res.status(200).json({
      success: true,
      data: {
        customerId: customer._id,
        name: customer.name,
        balance: customer.balance,
        storeName: customer.owner.storeName,
        upiId: customer.owner.upiId,
        storePhone: customer.owner.phone
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm and settle simulated payment
// @route   POST /api/reminders/checkout/:customerId/confirm-payment
const confirmPayment = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const { utr, amount } = req.body;
    
    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found.' });
    
    // Create debit/Jama transaction in database
    const transaction = await Transaction.create({
      owner: customer.owner,
      customer: customer._id,
      type: 'debit',
      amount: parseFloat(amount),
      description: `Online UPI Payment (UTR: ${utr})`,
      date: new Date(),
      paymentStatus: 'SETTLED',
      paymentMode: 'upi',
    });
    
    // Clear outstanding customer balance
    customer.balance = Math.max(0, customer.balance - parseFloat(amount));
    customer.lastPaymentDate = new Date();
    await customer.save();
    
    res.status(200).json({
      success: true,
      message: 'Payment recorded successfully.',
      data: { balance: customer.balance, transaction }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendReminder, sendBulkReminders, getCheckoutDetails, confirmPayment };
