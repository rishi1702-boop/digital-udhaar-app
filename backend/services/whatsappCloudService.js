const sendWhatsAppCloud = async (to, templateName, languageCode = 'en_US', components = []) => {
    const token = process.env.WHATSAPP_CLOUD_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;

    if (!token || !phoneId) {
        console.log(`[WhatsApp Mock] To: ${to} | Template: ${templateName} | Components: ${JSON.stringify(components)}`);
        return { status: 'mock', message: 'WhatsApp Cloud API not configured' };
    }

    // Clean phone number and ensure country code
    let cleanPhone = to.replace(/[\+\s\-]/g, '');
    if (cleanPhone.length === 10) {
        cleanPhone = '91' + cleanPhone;
    }

    const payload = {
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'template',
        template: {
            name: templateName,
            language: {
                code: languageCode,
            },
            components: components
        }
    };

    try {
        const response = await fetch(`https://graph.facebook.com/v17.0/${phoneId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('WhatsApp Cloud API Error:', data.error);
            throw new Error(data.error?.message || 'Failed to send WhatsApp message via Cloud API');
        }

        return { status: 'sent', data };
    } catch (err) {
        console.error('WhatsApp send error:', err.message);
        throw err;
    }
};

module.exports = { sendWhatsAppCloud };
