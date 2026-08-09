const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');

const replacement = `  server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          }
        }
      }
    }
  };
});`;

code = code.replace(/  server: \{[\s\S]*?  \};\n\}\);/, replacement);
fs.writeFileSync('vite.config.ts', code);
