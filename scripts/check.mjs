import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const jsx = await readFile(path.join(root, 'src/main.jsx'), 'utf8');
const css = await readFile(path.join(root, 'src/styles.css'), 'utf8');
const server = await readFile(path.join(root, 'server.mjs'), 'utf8');
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));

const markers = [
  'Converge Group Corp',
  'Lo que ya construyeron tiene que empezar a',
  'Finalizar en Framer',
  'Desarrollar en código',
  '2_000_000',
  '3_500_000',
  '200_000',
  '20 de septiembre de 2026',
  'No pierden el avance actual',
  'Código y repositorio propios',
];
for (const marker of markers) {
  if (!(html + jsx).includes(marker)) throw new Error(`Falta marcador: ${marker}`);
}
if (!jsx.includes("from 'motion/react'")) throw new Error('Framer Motion no está implementado');
if (!jsx.includes('<svg') || (jsx.match(/<svg/g) || []).length < 4) throw new Error('Faltan recursos SVG');
if (!pkg.dependencies?.motion || !pkg.dependencies?.react) throw new Error('Faltan dependencias React/Motion');
if (!server.includes("'/health'") || !server.includes('version: 2')) throw new Error('Falta health v2');
if (!css.includes('@media(max-width:680px)')) throw new Error('Falta breakpoint móvil');
for (const file of ['Archivo-Variable.ttf', 'ArchivoBlack-Regular.ttf', 'JetBrainsMono-Variable.ttf']) {
  await access(path.join(root, 'public/fonts', file));
}
await access(path.join(root, 'public/assets/solvers-wordmark.svg'));
console.log('OK: copy de beneficios, 4+ SVG, React, Motion, responsive, fuentes y health v2');
