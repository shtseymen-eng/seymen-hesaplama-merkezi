import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'dist');

await rm(output, { recursive: true, force: true });
await mkdir(resolve(output, 'server'), { recursive: true });
await mkdir(resolve(output, '.openai'), { recursive: true });
await cp(resolve(root, 'server'), resolve(output, 'server'), { recursive: true });
await cp(resolve(root, '.openai/hosting.json'), resolve(output, '.openai/hosting.json'));
await cp(resolve(root, 'drizzle'), resolve(output, '.openai/drizzle'), { recursive: true });
await writeFile(resolve(output, 'server/index.js'), "export { default } from './worker.mjs';\n");
