// تست SDK جدید Google AI
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function main() {
  try {
    console.log('🧪 Testing new Google AI SDK...\n');
    
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: "سلام! لطفاً یک جمله کوتاه به فارسی بنویس."
    });
    
    console.log('✅ Response:', response.text);
    console.log('\n✅ Test successful!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message?.includes('API_KEY_INVALID')) {
      console.error('💡 API Key نامعتبر است. لطفاً .env را چک کنید.');
    }
  }
}

main();
