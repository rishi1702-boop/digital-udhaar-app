const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash-latest',
      contents: 'hello'
    });
    console.log("Success:", response.text);
  } catch (err) {
    console.log("Error:", err.message);
  }
}
test();
