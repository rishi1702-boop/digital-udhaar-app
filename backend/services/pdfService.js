const PDFDocument = require('pdfkit');

/**
 * Generate a monthly statement PDF and stream it to the HTTP response
 * @param {Object} store - Store owner info { storeName, name, phone }
 * @param {Object} customer - Customer info { name, phone, address, balance }
 * @param {Array} transactions - Array of transaction objects
 * @param {Object} dateRange - { startDate, endDate }
 * @param {Object} res - Express response object
 */
const generateStatement = (store, customer, transactions, dateRange, res) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Set response headers
  const filename = `statement_${customer.name.replace(/\s+/g, '_')}_${dateRange.startDate}_${dateRange.endDate}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  // Pipe to response
  doc.pipe(res);

  // ─── HEADER ───
  doc
    .fontSize(22)
    .font('Helvetica-Bold')
    .text(store.storeName, { align: 'center' });
  doc.fontSize(10).font('Helvetica').text(`Owner: ${store.name}`, { align: 'center' });
  if (store.phone) {
    doc.text(`Phone: ${store.phone}`, { align: 'center' });
  }
  doc.moveDown(0.5);

  // Divider
  doc
    .strokeColor('#10b981')
    .lineWidth(2)
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .stroke();
  doc.moveDown(0.8);

  // ─── STATEMENT TITLE ───
  doc
    .fontSize(16)
    .font('Helvetica-Bold')
    .fillColor('#1e293b')
    .text('Monthly Statement (Khata)', { align: 'center' });
  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#64748b')
    .text(`Period: ${dateRange.startDate} to ${dateRange.endDate}`, { align: 'center' });
  doc.moveDown(1);

  // ─── CUSTOMER INFO ───
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor('#1e293b')
    .text('Customer Details');
  doc.moveDown(0.3);
  doc.fontSize(10).font('Helvetica').fillColor('#334155');
  doc.text(`Name: ${customer.name}`);
  doc.text(`Phone: ${customer.phone}`);
  if (customer.address) {
    doc.text(`Address: ${customer.address}`);
  }
  doc.moveDown(1);

  // ─── TRANSACTIONS TABLE ───
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor('#1e293b')
    .text('Transaction Details');
  doc.moveDown(0.5);

  // Table header
  const tableTop = doc.y;
  const col1 = 50; // Date
  const col2 = 150; // Type
  const col3 = 220; // Description
  const col4 = 400; // Amount
  const col5 = 480; // Balance

  // Header background
  doc
    .rect(col1 - 5, tableTop - 3, 505, 20)
    .fill('#0f172a');

  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .fillColor('#ffffff');
  doc.text('Date', col1, tableTop, { width: 90 });
  doc.text('Type', col2, tableTop, { width: 60 });
  doc.text('Description', col3, tableTop, { width: 170 });
  doc.text('Amount (₹)', col4, tableTop, { width: 70, align: 'right' });
  doc.text('Balance (₹)', col5, tableTop, { width: 65, align: 'right' });

  doc.moveDown(0.5);

  // Table rows
  let runningBalance = 0;
  let yPos = tableTop + 22;

  transactions.forEach((txn, index) => {
    // Check if we need a new page
    if (yPos > 700) {
      doc.addPage();
      yPos = 50;
    }

    // Alternate row background
    if (index % 2 === 0) {
      doc
        .rect(col1 - 5, yPos - 3, 505, 18)
        .fill('#f8fafc');
    }

    // Update running balance
    if (txn.type === 'credit') {
      runningBalance += txn.amount;
    } else {
      runningBalance -= txn.amount;
    }

    const dateStr = new Date(txn.date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const typeColor = txn.type === 'credit' ? '#ef4444' : '#10b981';

    doc.fontSize(9).font('Helvetica').fillColor('#334155');
    doc.text(dateStr, col1, yPos, { width: 90 });

    doc.fillColor(typeColor).font('Helvetica-Bold');
    doc.text(txn.type === 'credit' ? 'UDHAAR' : 'JAMA', col2, yPos, { width: 60 });

    doc.fillColor('#334155').font('Helvetica');
    doc.text(txn.description || '-', col3, yPos, { width: 170 });
    doc.text(txn.amount.toFixed(2), col4, yPos, { width: 70, align: 'right' });
    doc.text(runningBalance.toFixed(2), col5, yPos, { width: 65, align: 'right' });

    yPos += 20;
  });

  // ─── SUMMARY ───
  doc.y = yPos + 15;

  // Divider
  doc
    .strokeColor('#10b981')
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .stroke();
  doc.moveDown(0.8);

  const totalCredit = transactions
    .filter((t) => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalDebit = transactions
    .filter((t) => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e293b');
  doc.text(`Total Udhaar (Credit): ₹${totalCredit.toFixed(2)}`, 50);
  doc.text(`Total Jama (Debit): ₹${totalDebit.toFixed(2)}`, 50);
  doc.moveDown(0.3);

  const netBalance = totalCredit - totalDebit;
  const balanceColor = netBalance > 0 ? '#ef4444' : '#10b981';
  doc
    .fontSize(13)
    .fillColor(balanceColor)
    .text(
      `Net Balance: ₹${Math.abs(netBalance).toFixed(2)} ${netBalance > 0 ? '(Due)' : '(Advance)'}`,
      50
    );

  doc.moveDown(2);

  // ─── FOOTER ───
  doc
    .fontSize(8)
    .font('Helvetica')
    .fillColor('#94a3b8')
    .text(
      `Generated on ${new Date().toLocaleDateString('en-IN')} | Digital Udhaar Khata`,
      50,
      doc.y,
      { align: 'center' }
    );

  // Finalize
  doc.end();
};

/**
 * Generate a cashbook statement PDF and stream it to the HTTP response
 * @param {Object} store - Store owner info { storeName, name, phone }
 * @param {Array} entries - Array of cashbook entry objects
 * @param {Object} dateRange - { label, startDate, endDate }
 * @param {Object} res - Express response object
 */
const generateCashbookStatement = (store, entries, dateRange, res) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Set response headers
  const filename = `cashbook_statement_${dateRange.label.replace(/\s+/g, '_')}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  // Pipe to response
  doc.pipe(res);

  // ─── HEADER ───
  doc
    .fontSize(22)
    .font('Helvetica-Bold')
    .text(store.storeName, { align: 'center' });
  doc.fontSize(10).font('Helvetica').text(`Owner: ${store.name}`, { align: 'center' });
  if (store.phone) {
    doc.text(`Phone: ${store.phone}`, { align: 'center' });
  }
  doc.moveDown(0.5);

  // Divider
  doc
    .strokeColor('#10b981')
    .lineWidth(2)
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .stroke();
  doc.moveDown(0.8);

  // ─── STATEMENT TITLE ───
  doc
    .fontSize(16)
    .font('Helvetica-Bold')
    .fillColor('#1e293b')
    .text('Cashbook Daily Ledger', { align: 'center' });
  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#64748b')
    .text(`Period: ${dateRange.label}`, { align: 'center' });
  doc.moveDown(1.5);

  // ─── TRANSACTIONS TABLE ───
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor('#1e293b')
    .text('Cashbook Entries');
  doc.moveDown(0.5);

  // Table header
  const tableTop = doc.y;
  const col1 = 50;   // Date
  const col2 = 140;  // Mode
  const col3 = 200;  // Remarks / Description
  const col4 = 380;  // Cash In (Got)
  const col5 = 465;  // Cash Out (Paid)

  // Header background
  doc
    .rect(col1 - 5, tableTop - 3, 505, 20)
    .fill('#0f172a');

  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .fillColor('#ffffff');
  doc.text('Date & Time', col1, tableTop, { width: 85 });
  doc.text('Mode', col2, tableTop, { width: 55 });
  doc.text('Remarks', col3, tableTop, { width: 175 });
  doc.text('Cash In (₹)', col4, tableTop, { width: 80, align: 'right' });
  doc.text('Cash Out (₹)', col5, tableTop, { width: 80, align: 'right' });

  doc.moveDown(0.5);

  let yPos = tableTop + 22;

  entries.forEach((entry, index) => {
    // Check if we need a new page
    if (yPos > 700) {
      doc.addPage();
      yPos = 50;
    }

    // Alternate row background
    if (index % 2 === 0) {
      doc
        .rect(col1 - 5, yPos - 3, 505, 18)
        .fill('#f8fafc');
    }

    const dateStr = new Date(entry.date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const isCashIn = entry.type === 'in';
    const amountColor = isCashIn ? '#10b981' : '#ef4444';

    doc.fontSize(8.5).font('Helvetica').fillColor('#334155');
    doc.text(dateStr, col1, yPos, { width: 85 });

    doc.fillColor('#475569');
    doc.text(entry.paymentMode.toUpperCase(), col2, yPos, { width: 55 });

    doc.fillColor('#334155');
    doc.text(entry.description || '-', col3, yPos, { width: 175 });

    // Cash In Amount
    doc.fillColor(isCashIn ? amountColor : '#94a3b8').font(isCashIn ? 'Helvetica-Bold' : 'Helvetica');
    doc.text(isCashIn ? `+${entry.amount.toFixed(2)}` : '-', col4, yPos, { width: 80, align: 'right' });

    // Cash Out Amount
    doc.fillColor(!isCashIn ? amountColor : '#94a3b8').font(!isCashIn ? 'Helvetica-Bold' : 'Helvetica');
    doc.text(!isCashIn ? `-${entry.amount.toFixed(2)}` : '-', col5, yPos, { width: 80, align: 'right' });

    yPos += 20;
  });

  // ─── SUMMARY ───
  doc.y = yPos + 15;

  // Divider
  doc
    .strokeColor('#10b981')
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .stroke();
  doc.moveDown(0.8);

  const totalIn = entries
    .filter((e) => e.type === 'in')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalOut = entries
    .filter((e) => e.type === 'out')
    .reduce((sum, e) => sum + e.amount, 0);

  doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e293b');
  doc.text(`Total Cash In:  ₹${totalIn.toFixed(2)}`, 50);
  doc.text(`Total Cash Out: ₹${totalOut.toFixed(2)}`, 50);
  doc.moveDown(0.4);

  const cashInHand = totalIn - totalOut;
  const balanceColor = cashInHand >= 0 ? '#10b981' : '#ef4444';
  doc
    .fontSize(12)
    .fillColor(balanceColor)
    .text(
      `Net Cash in Hand: ₹${cashInHand.toFixed(2)}`,
      50
    );

  doc.moveDown(2);

  // ─── FOOTER ───
  doc
    .fontSize(8)
    .font('Helvetica')
    .fillColor('#94a3b8')
    .text(
      `Generated on ${new Date().toLocaleDateString('en-IN')} | Digital Udhaar Khata Cashbook`,
      50,
      doc.y,
      { align: 'center' }
    );

  // Finalize
  doc.end();
};

module.exports = { generateStatement, generateCashbookStatement };

