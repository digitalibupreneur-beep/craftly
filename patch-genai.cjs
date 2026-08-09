const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Remove the global instantiation
code = code.replace(/const apiKey = process\.env\.GEMINI_API_KEY;\s*const ai = new GoogleGenAI\({[\s\S]*?}\);\s*async function startServer\(\) {/m, 'async function startServer() {');

// Put it inside generateContentWithRetry
code = code.replace(/async function generateContentWithRetry\(ai, params, maxRetries = 3\) {/, `async function generateContentWithRetry(params, maxRetries = 3) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('401: Kunci API Gemini tidak valid atau belum diatur. Silakan masukkan Gemini API Key di environment variables.');
  }
  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });`);

// Update the calls to generateContentWithRetry
code = code.replace(/generateContentWithRetry\(ai, /g, 'generateContentWithRetry(');

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts for lazy genai instantiation");
