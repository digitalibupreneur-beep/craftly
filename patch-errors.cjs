const fs = require('fs');
let code = fs.readFileSync('api-router.ts', 'utf-8');

// Replace the generateContentWithRetry error
code = code.replace(
  /const apiKey = process\.env\.GEMINI_API_KEY;\s*if \(!apiKey\) {\s*throw new Error\('401: Kunci API Gemini tidak valid atau belum diatur. Silakan masukkan Gemini API Key di environment variables.'\);\s*}/,
  `const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('MISSING_API_KEY');
  }`
);

// Replace the catch blocks
const catchBlockRegex = /if \(error\.status === 401 \|\| \(error\.message && error\.message\.includes\('401'\)\)\) \{ return res\.status\(401\)\.json\(\{ error: 'Kunci API Gemini tidak valid atau belum diatur\. Silakan masukkan Gemini API Key yang benar melalui menu Pengaturan \(ikon gir di pojok\)\.' \}\); \} if \(error\.status === 503 \|\| \(error\.message && error\.message\.includes\('503'\)\)\) \{ return res\.status\(503\)\.json\(\{ error: 'Server AI sedang sibuk \(kapasitas penuh\)\. Silakan coba lagi dalam beberapa saat\.' \}\); \}/g;

const newCatchBlock = `if (error.message === 'MISSING_API_KEY') {
        return res.status(401).json({ error: 'Kunci API Gemini tidak tersedia. Silakan masukkan variabel GEMINI_API_KEY di Environment Variables Vercel.' });
      }
      if (error.status === 401 || error.status === 403 || (error.message && (error.message.includes('401') || error.message.includes('403') || error.message.includes('API_KEY_INVALID')))) {
        return res.status(401).json({ error: 'Kunci API Gemini tidak valid. Pastikan GEMINI_API_KEY yang dimasukkan benar.' });
      }
      if (error.status === 503 || (error.message && error.message.includes('503'))) {
        return res.status(503).json({ error: 'Server AI sedang sibuk (kapasitas penuh). Silakan coba lagi dalam beberapa saat.' });
      }`;

code = code.replace(catchBlockRegex, newCatchBlock);

fs.writeFileSync('api-router.ts', code);
console.log('patched');
