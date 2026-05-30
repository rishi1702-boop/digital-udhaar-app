const nodemailer = require('nodemailer');
const dns = require('dns');

/**
 * Force DNS to resolve to an IPv4 address.
 * Node 17+ defaults to IPv6, which breaks on Render's free tier.
 */
const getIPv4Host = (hostname) => {
  return new Promise((resolve) => {
    dns.lookup(hostname, 4, (err, address) => {
      if (err) resolve(hostname);
      else resolve(address);
    });
  });
};

/**
 * Send email using Nodemailer.
 * Falls back to logging to console if SMTP details are not configured.
 */
const sendEmail = async ({ to, subject, text, html, attachments }) => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // Fallback to console log if server SMTP settings are missing
  if (!host || !user || !pass) {
    console.warn('⚠️ SMTP settings are not configured. Logging details to console:');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${text || html}`);
    return { success: true, logged: true };
  }

  // Resolve IPv4 address to fix Render's ENETUNREACH IPv6 bug
  const ipv4Host = await getIPv4Host(host);

  // Create Nodemailer SMTP transporter
  const transporter = nodemailer.createTransport({
    host: ipv4Host,
    port,
    secure: port == 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
    tls: {
      servername: host, // Ensure TLS uses 'smtp.gmail.com' and not the raw IP
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
  });

  const fromEmail = process.env.SMTP_FROM || user;
  const appName = process.env.APP_NAME || 'Udhaar App';

  // Send mail using transporter
  try {
    const info = await transporter.sendMail({
      from: `"${appName}" <${fromEmail}>`,
      to,
      subject,
      text,
      html,
      attachments,
    });

    console.log(`✉️ Email sent: ${info.messageId}`);
    
    if (host === 'smtp.ethereal.email') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      info.previewUrl = nodemailer.getTestMessageUrl(info);
    }

    return { success: true, messageId: info.messageId, info };
  } catch (error) {
    console.error('❌ Nodemailer Error:', error.message);
    console.error(error);
    throw error;
  }
};

module.exports = { sendEmail };
