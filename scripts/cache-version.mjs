import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

export async function cacheVersion(root) {
  const hash = createHash('sha256');
  async function visit(relative = '') {
    const entries = await readdir(path.join(root, relative), { withFileTypes: true });
    entries.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
    for (const entry of entries) {
      const name = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isDirectory()) await visit(name);
      else {
        const content = await readFile(path.join(root, name));
        hash.update(JSON.stringify([name, content.length]));
        hash.update(content);
      }
    }
  }
  await visit();
  return hash.digest('hex');
}
