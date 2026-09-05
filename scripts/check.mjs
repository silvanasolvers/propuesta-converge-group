import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const html = await readFile(path.join(root, 'public/index.html'), 'utf8');
const css = await readFile(path.join(root, 'public/styles.css'), 'utf8');
const js = await readFile(path.join(root, 'public/app.js'), 'utf8');
const server = await readFile(path.join(root, 'server.mjs'), 'utf8');

const required = [
  'Converge Group Corp',
  '$2.000.000',
  '$3.500.000',
  '$200.000',
  'Finalización en Framer',
  'Desarrollo completo en código',
  '20 de septiembre de 2026',
];
for (const marker of required) {
  if (!html.includes(marker)) throw new Error(`Falta marcador: ${marker}`);
}
if (!server.includes("'/health'")) throw new Error('Falta endpoint /health');
if (!js.includes('Intl.NumberFormat')) throw new Error('Falta formateo de precios');
if (!css.includes('@media (max-width: 720px)')) throw new Error('Falta breakpoint móvil');
for (const file of ['Archivo-Variable.ttf', 'ArchivoBlack-Regular.ttf', 'JetBrainsMono-Variable.ttf']) {
  await access(path.join(root, 'public/fonts', file));
}
await access(path.join(root, 'public/assets/solvers-wordmark.svg'));
console.log('OK: contenido, precios, responsive, fuentes, marca y health verificados');
