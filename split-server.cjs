const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf8');

// The file has imports at the top
const imports = `import express from "express";
import { GoogleGenAI } from "@google/genai";
`;

// It has generateContentWithRetry
const generateContentFuncStr = `
async function generateContentWithRetry(params, maxRetries = 3) {
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
  });
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await ai.models.generateContent(params);
    } catch (error) {
      const is503 = error.status === 503 || (error.message && error.message.includes('503'));
      const is429 = error.status === 429 || (error.message && error.message.includes('429')) || (error.message && error.message.includes('Quota exceeded'));
      
      if (is503 || is429) {
        console.warn(\`Gemini API error (503/429), retrying (\${i + 1}/\${maxRetries})...\`);
        if (i === maxRetries - 1) throw error;
        
        let delay = is429 ? 16000 : 2000 * (i + 1);
        if (is429 && error.message) {
          const match = error.message.match(/retry in ([\\d\\.]+)s/);
          if (match && match[1]) {
            delay = Math.ceil(parseFloat(match[1])) * 1000 + 1000;
          }
        }
        
        await new Promise(res => setTimeout(res, delay));
      } else {
        throw error;
      }
    }
  }
}
`;

// Extract all the app.post routes from server.ts
// We'll replace `app.post` with `apiRouter.post`
const routesStartIdx = code.indexOf('app.post("/api/generate-prompt"');
const routesEndIdx = code.indexOf('export default app;');

if (routesStartIdx === -1 || routesEndIdx === -1) {
    console.error("Could not find routes boundaries");
    process.exit(1);
}

let routesCode = code.substring(routesStartIdx, routesEndIdx);

// Ensure the routes use relative paths if we mount it at /api
// But actually, vercel rewrites /api/(.*) to /api/index.ts. If we mount the router at /, we need to use /api/xxx routes if we export it, OR we just mount it as app.post("/api/...")

const apiRouterFile = imports + generateContentFuncStr + `
export const apiRouter = express.Router();
apiRouter.use(express.json());

` + routesCode.replace(/app\.post\(/g, 'apiRouter.post(');

fs.writeFileSync('api-router.ts', apiRouterFile);

// Now rewrite server.ts
const newServerTs = `import express from "express";
import path from "path";
import { apiRouter } from "./api-router";

const app = express();
const PORT = 3000;

// Mount the API router
app.use(apiRouter);

if (!process.env.VERCEL) {
  async function startLocalServer() {
    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(\`Server running on http://localhost:\${PORT}\`);
    });
  }
  startLocalServer().catch(console.error);
}
`;
fs.writeFileSync('server.ts', newServerTs);
console.log("Splitting done");
