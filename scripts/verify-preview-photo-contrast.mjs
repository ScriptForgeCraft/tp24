import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import { previewThemes } from '../src/preview/themes.js';

const results = [];
await fs.mkdir('qa/color-exploration', { recursive: true });
for (const theme of previewThemes) {
  const url = new URL(`design-preview/${theme.id}`, process.env.PREVIEW_URL || 'http://localhost:5173/');
  const file = `qa/color-exploration/contrast-${theme.id}.json`;
  console.log(`${theme.id} — ${theme.name}`);
  try {
    execFileSync(process.execPath, ['scripts/verify-photo-contrast.mjs'], { stdio: 'inherit', env: { ...process.env, PREVIEW_URL: url.href, CONTRAST_REPORT: file } });
  } finally {
    results.push({ theme: theme.name, scans: JSON.parse(await fs.readFile(file, 'utf8')) });
    await fs.writeFile('qa/color-exploration/photo-contrast-results.json', JSON.stringify(results, null, 2));
  }
}
