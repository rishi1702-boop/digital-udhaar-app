/**
 * Send email using Google Apps Script Web App.
 * Bypasses Render's Free Tier SMTP port blocking by using HTTPS (port 443).
 */
const sendEmail = async ({ to, subject, text, html }) => {
  // Use the provided Google Apps Script URL or one from the environment variables
  const scriptUrl = process.env.GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbywooMzsrH_d3xunT0sF3NBTyvv-LUKL_smKNJ1TcxXQ80J7kjeHufAVLJ0hCl0XJUr/exec';

  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        text,
        html,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Unknown error from Google Script');
    }

    console.log(`✉️ Email sent successfully via Google Apps Script to: ${to}`);
    return { success: true, messageId: 'google-script-' + Date.now() };
  } catch (error) {
    console.error('❌ Google Apps Script Email Error:', error.message);
    throw error;
  }
};

module.exports = { sendEmail };
