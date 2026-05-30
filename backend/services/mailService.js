const { Resend } = require('resend');

/**
 * Send email using Resend.
 * Falls back to logging to console if Resend API key is not configured.
 */
const sendEmail = async ({ to, subject, text, html, attachments }) => {
  const apiKey = process.env.RESEND_API_KEY;

  // Fallback to console log if API key is missing
  if (!apiKey) {
    console.warn('⚠️ RESEND_API_KEY is not configured. Logging details to console:');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${text || html}`);
    return { success: true, logged: true };
  }

  // Initialize Resend
  const resend = new Resend(apiKey);
  
  // Use custom domain if configured, else fallback to Resend testing domain
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  const appName = process.env.APP_NAME || 'Digital Udhaar';

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail === 'onboarding@resend.dev' ? 'onboarding@resend.dev' : `"${appName}" <${fromEmail}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      text,
      html: html || text,
      attachments,
    });

    if (error) {
      console.error('❌ Resend API Error:', error);
      throw new Error(error.message);
    }

    console.log(`✉️ Email sent via Resend: ${data.id}`);
    
    return { success: true, messageId: data.id, info: data };
  } catch (error) {
    console.error('❌ Failed to send email via Resend:', error);
    throw error;
  }
};

module.exports = { sendEmail };
