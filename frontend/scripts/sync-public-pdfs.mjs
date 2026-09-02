import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = join(frontendRoot, '..');
const publicRoot = join(frontendRoot, 'public', 'assets');

const groups = [
  {
    source: join(repositoryRoot, 'docs', 'platform'),
    target: join(publicRoot, 'platform'),
    names: ['PLATFORM_EXPLAINED_EN.pdf', 'PLATFORM_EXPLAINED_RU.pdf'],
  },
  {
    source: join(repositoryRoot, 'docs', '60-40', 'pdf', 'en'),
    target: join(publicRoot, 'financial-models', 'en'),
  },
  {
    source: join(repositoryRoot, 'docs', '60-40', 'pdf', 'ru'),
    target: join(publicRoot, 'financial-models', 'ru'),
  },
];

for (const group of groups) {
  await rm(group.target, { recursive: true, force: true });
  await mkdir(group.target, { recursive: true });
  const names = group.names ?? (await readdir(group.source)).filter((name) => name.endsWith('.pdf'));
  for (const name of names) {
    await cp(join(group.source, name), join(group.target, name));
  }
}

console.log('Synchronized canonical public PDFs from docs/.');
