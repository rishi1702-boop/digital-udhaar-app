const handleVoiceParsing = async (req, res, next) => {
  try {
    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({ success: false, message: 'Transcript is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        message: 'GEMINI_API_KEY is missing from environment variables. Please add it to your .env file.' 
      });
    }

    const systemInstruction = `You are an AI assistant designed to extract transaction details from a voice transcript for a digital ledger app.
The user will speak a sentence in English, Hindi, or Hinglish (e.g. "Ramesh ko 500 udhar diye", "Received 300 from Suresh", "Suresh se 200 jama").
Your task is to extract three fields:
1. customerName: The name of the customer (String, capitalized).
2. amount: The transaction amount (Number).
3. type: Either "credit" (udhaar/gave) or "debit" (jama/received).

You MUST reply ONLY with a valid JSON object matching exactly this schema, and nothing else (no markdown wrappers like \`\`\`json):
{
  "customerName": "String",
  "amount": Number,
  "type": "credit" | "debit"
}
If you cannot determine a field, set it to null.`;

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
        contents: [
          {
            role: 'user',
            parts: [{ text: transcript }]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to fetch from Gemini API');
    }

    let aiText = data.candidates[0].content.parts[0].text;
    
    // Clean up potential markdown formatting if Gemini disobeys instructions
    aiText = aiText.replace(/```json/gi, '').replace(/```/g, '').trim();

    const parsedData = JSON.parse(aiText);

    res.status(200).json({
      success: true,
      data: parsedData
    });

  } catch (error) {
    console.error("Voice Parsing Error:", error);
    res.status(500).json({ success: false, message: 'Failed to parse voice command' });
  }
};

module.exports = { handleVoiceParsing };
