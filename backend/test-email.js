require('dotenv').config();
const { Resend } = require('resend');

const testResend = async () => {
  console.log('Testing Resend connection...');
  console.log('API Key:', process.env.RESEND_API_KEY ? '********' : 'NOT SET');

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is missing in your .env file');
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  try {
    // Attempting to send a test email to the onboarding testing address (or to itself if custom domain)
    // For Resend, if using onboarding@resend.dev, it can only send to the verified email of the account.
    // We'll use the fromEmail as the toEmail as a safe test if it's the verified account email.
    // Otherwise, we just rely on Resend throwing an error if the key is invalid.
    
    // Instead of actually sending an email just to verify, Resend doesn't have a direct "verify()" method like Nodemailer.
    // However, we can try to fetch the domains to verify the API key is working.
    
    const { data, error } = await resend.domains.list();
    
    if (error) {
      console.error('❌ Resend Connection Failed:');
      console.error(error.message);
      return;
    }

    console.log('✅ Resend Connection Successful!');
    console.log('Configured Domains on Resend:', data?.data?.map(d => d.name) || 'None');
    
  } catch (error) {
    console.error('❌ Resend Connection Failed:');
    console.error(error.message);
  }
};

testResend();
