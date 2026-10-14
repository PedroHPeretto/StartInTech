import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

async function findFiles(dir: string, pattern: RegExp): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findFiles(fullPath, pattern)));
    } else if (entry.isFile() && pattern.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

async function checkDistImports(): Promise<void> {
  const distDir = join(process.cwd(), 'dist');
  console.log(`Checking compiled artifacts in ${distDir}...`);

  // 1. Verify app.module.js
  const appModulePath = join(distDir, 'app.module.js');
  console.log(`Importing app.module: ${appModulePath}`);
  await import(pathToFileURL(appModulePath).href);

  // 2. Verify all entity files
  const entityFiles = await findFiles(distDir, /\.entity\.js$/);
  console.log(`Found ${entityFiles.length} entity files to check.`);
  for (const file of entityFiles) {
    await import(pathToFileURL(file).href);
  }

  console.log('Dist imports check passed with 0 errors.');
}

checkDistImports().catch((error) => {
  console.error('Failed to import compiled distribution modules:', error);
  process.exit(1);
});
