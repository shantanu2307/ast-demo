import { createPatch } from 'diff';
import fs from 'fs';
import { ROOT_PATH, PATCH_FILE_PATH } from '../constants';

export default function diff(filePath: string, oldFile: string, newFile: string): string {
  if (oldFile === newFile || process.env.TEST === 'true') return newFile;
  const diffs = createPatch(filePath, oldFile, newFile);
  fs.appendFileSync(PATCH_FILE_PATH, `${diffs.replaceAll(ROOT_PATH || /^[^/]*/, '@')}\n\n\n`);
  return newFile;
}
