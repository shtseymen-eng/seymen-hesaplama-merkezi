import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import vm from 'node:vm';

const root = resolve(import.meta.dirname, '..');
const source = await readFile(resolve(root, 'app.js'), 'utf8');

function extractArray(name) {
  const marker = `const ${name} = `;
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`${name} bulunamadı.`);
  const arrayStart = source.indexOf('[', start + marker.length);
  let depth = 0;
  let quote = '';
  let escaped = false;

  for (let index = arrayStart; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === quote) quote = '';
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === '[') depth += 1;
    if (character === ']') {
      depth -= 1;
      if (depth === 0) return vm.runInNewContext(source.slice(arrayStart, index + 1));
    }
  }
  throw new Error(`${name} dizisi tamamlanmamış.`);
}

const products = extractArray('BASE_PRODUCTS');
const correlations = extractArray('BASE_CORRELATIONS');
if (products.length !== 62) throw new Error(`Beklenen 62 ürün yerine ${products.length} ürün bulundu.`);
if (correlations.length < 90) throw new Error('EK-11 verisi eksik görünüyor.');

const output = `export const DEFAULT_DATA = ${JSON.stringify({ products, correlations }, null, 2)};\n`;
await writeFile(resolve(root, 'server/default-data.mjs'), output);
