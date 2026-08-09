const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace import { createServer as createViteServer } from "vite";
code = code.replace('import { createServer as createViteServer } from "vite";\n', '');
code = code.replace('import { createServer as createViteServer } from "vite";', '');

// Replace the end part
const endRegex = /  if \(process\.env\.NODE_ENV !== "production"\) {[\s\S]*?startServer\(\);/;

const replacement = `  if (!process.env.VERCEL) {
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

  return app;
}

const appPromise = startServer();

if (!process.env.VERCEL) {
  appPromise.catch(console.error);
}

export default async function (req, res) {
  const app = await appPromise;
  app(req, res);
}`;

if (endRegex.test(code)) {
    code = code.replace(endRegex, replacement);
    fs.writeFileSync('server.ts', code);
    console.log("Patched server.ts");
} else {
    console.log("Regex did not match");
}
