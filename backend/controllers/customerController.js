const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');
const PDFDocument = require('pdfkit');

// @desc    Get all customers for logged-in owner
// @route   GET /api/customers
const getCustomers = async (req, res, next) => {
  try {
    const { search, sort } = req.query;
    let query = { owner: req.user._id };

    // Search by name or phone
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    // Sort options
    let sortOption = { createdAt: -1 };
    if (sort === 'name') sortOption = { name: 1 };
    if (sort === 'balance-high') sortOption = { balance: -1 };
    if (sort === 'balance-low') sortOption = { balance: 1 };

    const customers = await Customer.find(query).sort(sortOption);

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single customer with transactions
// @route   GET /api/customers/:id
const getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    const transactions = await Transaction.find({
      customer: customer._id,
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: { customer, transactions },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new customer
// @route   POST /api/customers
const createCustomer = async (req, res, next) => {
  try {
    const { name, phone, email, address } = req.body;

    // Check for duplicate phone under same owner
    const existing = await Customer.findOne({ phone, owner: req.user._id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A customer with this phone number already exists',
      });
    }

    const customer = await Customer.create({
      name,
      phone,
      email,
      address,
      owner: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
const updateCustomer = async (req, res, next) => {
  try {
    const { name, phone, email, address } = req.body;

    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { name, phone, email, address },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete customer and all their transactions
// @route   DELETE /api/customers/:id
const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Delete all transactions for this customer
    await Transaction.deleteMany({ customer: customer._id });

    // Delete the customer
    await Customer.findByIdAndDelete(customer._id);

    res.status(200).json({
      success: true,
      message: 'Customer and all related transactions deleted',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download customer statement as PDF
// @route   GET /api/customers/:id/statement
const downloadStatement = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const transactions = await Transaction.find({ customer: customer._id }).sort({ date: 1 });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Statement-${customer.name.replace(/\s+/g, '-')}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Digital Udhaar Khata', { align: 'center' });
    doc.fontSize(14).text(`Account Statement: ${customer.name}`, { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12).text(`Phone: ${customer.phone}`);
    doc.text(`Current Outstanding Balance: ₹${customer.balance.toLocaleString('en-IN')}`);
    doc.text(`Generated On: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN')}`);
    doc.moveDown(2);

    // Table Header
    doc.fontSize(12).font('Helvetica-Bold');
    
    const startY = doc.y;
    doc.text('Date', 50, startY, { width: 100 });
    doc.text('Description', 150, startY, { width: 200 });
    doc.text('Type', 350, startY, { width: 80 });
    doc.text('Amount', 450, startY);
    
    doc.moveDown(0.5);

    // Draw Line
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    doc.font('Helvetica');
    let totalCredit = 0;
    let totalDebit = 0;

    transactions.forEach(txn => {
      // Add page if near bottom
      if (doc.y > 700) {
        doc.addPage();
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);
      }

      const dateStr = new Date(txn.date).toLocaleDateString('en-IN');
      const desc = txn.description || '-';
      const typeStr = txn.type === 'credit' ? 'Udhaar' : 'Jama';
      
      if (txn.type === 'credit') totalCredit += txn.amount;
      else totalDebit += txn.amount;

      const y = doc.y;
      doc.text(dateStr, 50, y, { width: 100 });
      doc.text(desc, 150, y, { width: 200 });
      
      // Use color for type
      doc.fillColor(txn.type === 'credit' ? '#ef4444' : '#10b981')
         .text(typeStr, 350, y, { width: 80 });
         
      doc.text(`₹${txn.amount.toLocaleString('en-IN')}`, 450, y);
      
      doc.fillColor('black'); // Reset color
      doc.moveDown(0.5);
    });

    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // Summary
    doc.font('Helvetica-Bold');
    doc.text(`Total Udhaar Given: ₹${totalCredit.toLocaleString('en-IN')}`, 50, doc.y);
    doc.text(`Total Jama Received: ₹${totalDebit.toLocaleString('en-IN')}`, 50, doc.y);

    doc.end();

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  downloadStatement,
};
