require('dotenv').config();
const Groq = require('groq-sdk');
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

(async () => {
  try {
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: 'Test question' }]
    });
  } catch (err) {
    process.exit(1);
  }
})();
