import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

import { exec } from 'child_process';
import url from 'url';

function pythonMathPlugin() {
  return {
    name: 'python-math-endpoint',
    configureServer(server: any) {
      server.middlewares.use('/api/math/log', (req: any, res: any) => {
        const parsed = url.parse(req.url || '', true);
        const xVal = parseFloat((parsed.query.x as string) || '1');
        if (isNaN(xVal) || xVal <= 0) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ x: 0, rounded: 0, raw: 0, engine: 'python3' }));
          return;
        }
        // Strict number validation to prevent shell injection
        const safeX = Number(xVal.toFixed(4));
        exec(`python3 -c "import math; x = ${safeX}; raw = math.log(x); print(f'{raw},{round(raw)}')"` , (err, stdout) => {
          res.setHeader('Content-Type', 'application/json');
          if (err || !stdout) {
            const raw = Math.log(safeX);
            res.end(JSON.stringify({ x: safeX, rounded: Math.round(raw), raw, engine: 'fallback' }));
            return;
          }
          const parts = stdout.trim().split(',');
          res.end(JSON.stringify({
            x: safeX,
            raw: parseFloat(parts[0]),
            rounded: parseInt(parts[1], 10),
            engine: 'python3-math'
          }));
        });
      });
    }
  };
}

import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(() => {
  return {
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    plugins: [react(), tailwindcss(), pythonMathPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
