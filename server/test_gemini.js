require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function run() {
  const keys = [
    process.env.GEMINI_API_KEY_1, process.env.GEMINI_API_KEY_2, process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4, process.env.GEMINI_API_KEY_5, process.env.GEMINI_API_KEY_6,
    process.env.GEMINI_API_KEY_7, process.env.GEMINI_API_KEY_8, process.env.GEMINI_API_KEY_9,
    process.env.GEMINI_API_KEY_10
  ];
  
  for (let i = 0; i < keys.length; i++) {
      if (!keys[i]) continue;
      console.log(`\nTesting Key ${i+1}:`, keys[i]);
      const genAI = new GoogleGenerativeAI(keys[i]);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      try {
        const result = await model.generateContent("Hello!");
        console.log("Success with Key", i+1);
      } catch (e) {
        console.error("Error with Key", i+1, ":", e.message);
      }
  }
}
run();
