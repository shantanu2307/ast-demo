import { execSync } from 'child_process';
import path from 'path';

export const ROOT_PATH = execSync('git rev-parse --show-toplevel', { encoding: 'utf-8' }).trim();
export const CODEMOD_LOG_PATH = path.resolve(__dirname, './logs');
export const PATCH_FILE_PATH = path.join(CODEMOD_LOG_PATH, 'diffs.patch');
