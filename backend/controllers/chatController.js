const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');

// @desc    Handle chat messages
// @route   POST /api/chat
const handleChat = async (req, res, next) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: 'Invalid messages format' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        message: 'GEMINI_API_KEY is missing from environment variables. Please add it to your .env file.' 
      });
    }

    // Fetch the user's data to give the AI context
    const customers = await Customer.find({ owner: req.user._id }).select('name phone balance riskLevel');
    const recentTransactions = await Transaction.find({ owner: req.user._id })
      .sort({ date: -1 })
      .limit(10)
      .populate('customer', 'name');

    // Format history for the raw API
    const history = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const systemInstruction = `You are a helpful and polite AI assistant built specifically for the "Udhaar Khata" application, a digital ledger for Kirana store owners to manage customer credit (udhaar). 
Your goal is to help store owners understand the app, explain basic concepts of ledger management, and provide friendly support based on their actual store data.
Keep your answers concise, professional, and easy to understand.
The current store owner logged in is: ${req.user.name || 'Store Owner'}.

Here is their current store data context:
Customers: ${JSON.stringify(customers)}
Recent Transactions: ${JSON.stringify(recentTransactions.map(t => ({ amount: t.amount, type: t.type, date: t.date, customer: t.customer?.name, description: t.description })))}

When the user asks about their customers or transactions, use this data to give them an accurate answer.`;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': process.env.GEMINI_API_KEY
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: history
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to fetch from Gemini API');
    }

    const aiText = data.candidates[0].content.parts[0].text;

    res.status(200).json({
      success: true,
      message: aiText
    });

  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = { handleChat };
