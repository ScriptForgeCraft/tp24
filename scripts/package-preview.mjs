import fs from 'node:fs/promises';
import path from 'node:path';

// A portable presentation: one HTML file with embedded scripts, fonts and images.
// Build first. The recipient can open the resulting HTML directly in a browser.
const root = process.cwd();
const dist = path.join(root, 'dist');
const output = path.join(root, 'output');
await fs.mkdir(output, { recursive: true });
const mime = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.woff': 'font/woff' };
async function dataUrl(file) {
  const bytes = await fs.readFile(file);
  return `data:${mime[path.extname(file)] || 'application/octet-stream'};base64,${bytes.toString('base64')}`;
}
let html = await fs.readFile(path.join(dist, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g)];
const styles = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)];
for (const match of styles) {
  let css = await fs.readFile(path.join(dist, match[1]), 'utf8');
  for (const url of [...new Set([...css.matchAll(/url\(["']?([^)'"\s]+)["']?\)/g)].map(m => m[1]))]) {
    if (!url.startsWith('data:')) css = css.replaceAll(url, await dataUrl(path.join(dist, url)));
  }
  html = html.replace(match[0], () => `<style>${css}</style>`);
}
const images = {};
for (const file of await fs.readdir(path.join(dist, 'images'))) images[`/images/${file}`] = await dataUrl(path.join(dist, 'images', file));
for (const match of scripts) {
  const js = (await fs.readFile(path.join(dist, match[1]), 'utf8')).replaceAll('</script', '<\\/script');
  html = html.replace(match[0], () => `<script>window.__PROSPECT_ASSETS__=${JSON.stringify(images)}</script><script type="module">${js}</script>`);
}
html = html.replace('/favicon.png', await dataUrl(path.join(dist, 'favicon.png')));
await fs.writeFile(path.join(output, 'Prospect24-Preview.html'), html);
await fs.writeFile(path.join(output, 'ОТКРОЙТЕ-СНАЧАЛА.txt'), `PROSPECT24 — ИНТЕРАКТИВНЫЙ ДИЗАЙН-КОНЦЕПТ

Откройте файл Prospect24-Preview.html двойным щелчком в Chrome, Edge или Safari.
Установка программ и интернет не требуются. Изображения и шрифты уже внутри файла.

Можно перетаскивать разделитель «до / после», открывать пакеты и сравнение,
переключать проекты, пользоваться меню и смотреть мобильную версию.
На телефоне сохраните и откройте HTML в браузере, если приложение почты
показывает только предварительный просмотр вложения.

Это демонстрационный дизайн главной страницы, а не опубликованный сайт.
Цены иллюстративные. Заявка создаёт черновик в вашей почтовой программе.
Изображение на первом экране — иллюстрация будущего развития.
`);
console.log(`Portable preview created: ${path.join(output, 'Prospect24-Preview.html')}`);
