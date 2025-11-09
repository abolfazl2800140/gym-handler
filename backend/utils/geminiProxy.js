const { GoogleGenAI } = require('@google/genai');
const { HttpsProxyAgent } = require('https-proxy-agent');

// اگه VPN داری و می‌خوای فقط Gemini از proxy استفاده کنه
const createGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  // اگه proxy داری، اینجا تنظیم کن
  // مثال: const proxyUrl = 'http://127.0.0.1:10809';
  const proxyUrl = process.env.GEMINI_PROXY_URL;
  
  if (proxyUrl) {
    const agent = new HttpsProxyAgent(proxyUrl);
    
    // Custom fetch با proxy
    const customFetch = (url, options = {}) => {
      return fetch(url, {
        ...options,
        agent: agent
      });
    };
    
    return new GoogleGenAI({
      apiKey: apiKey,
      fetch: customFetch
    });
  }
  
  return new GoogleGenAI({
    apiKey: apiKey
  });
};

module.exports = { createGeminiClient };
