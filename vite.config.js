import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs/promises';
import path from 'node:path';
import { previewThemes } from './src/preview/themes.js';

// Real HTML entry points make every preview directly refreshable on static hosting.
function previewEntries() {
  let outDir;
  return {
    name: 'prospect24-preview-entries',
    configResolved(config) { outDir = path.resolve(config.root, config.build.outDir); },
    async closeBundle() {
      const original = await fs.readFile(path.join(outDir, 'index.html'), 'utf8');
      const entries = [{ id: '', name: 'Color system exploration' }, ...previewThemes];
      await Promise.all(entries.map(async entry => {
        const directory = path.join(outDir, 'design-preview', entry.id);
        await fs.mkdir(directory, { recursive: true });
        const html = original.replace(/<title>[^<]*<\/title>/, `<title>Prospect24 — ${entry.id} ${entry.name}</title>`)
          .replace('</head>', '<meta name="robots" content="noindex, nofollow" /></head>');
        await fs.writeFile(path.join(directory, 'index.html'), html);
      }));
    },
  };
}

export default defineConfig({
  plugins: [react(), previewEntries()],
  server: { host: '0.0.0.0', port: 5173, strictPort: true },
  preview: { host: '0.0.0.0', port: 4173 },
});
