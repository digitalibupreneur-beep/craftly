const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Remove the wrapper "async function startServer() {"
code = code.replace(/^async function startServer\(\) \{\s*/m, '');

// 2. Remove the Vercel app handler at the end and the return app;
const endRegex = /  return app;\n\}\n\nconst appPromise = startServer\(\);\n\nif \(!process\.env\.VERCEL\) \{\n  appPromise\.catch\(console\.error\);\n\}\n\nexport default async function \(req, res\) \{\n  const app = await appPromise;\n  app\(req, res\);\n\}/m;

const replacement = `export default app;

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
}`;

// We also need to remove the if (!process.env.VERCEL) block that was already in the file.
// Let's just find that block and replace it.
const blockToReplace = /  if \(!process\.env\.VERCEL\) \{[\s\S]*?app\(req, res\);\n\}/m;

if (blockToReplace.test(code)) {
  code = code.replace(blockToReplace, replacement);
  fs.writeFileSync('server.ts', code);
  console.log("Rewrote server.ts");
} else {
  console.log("Could not find the block to replace");
}
