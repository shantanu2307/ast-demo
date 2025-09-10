import { run } from 'jscodeshift/src/Runner';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import _uniq from 'lodash/uniq';
import { withParser, FileInfo, API } from 'jscodeshift';
import chooseParser from './parser';
import { ROOT_PATH, PATCH_FILE_PATH, CODEMOD_LOG_PATH } from '../constants';

type CommonOptions = {
  extensions: string[];
  filePaths?: Array<string | RegExp>;
  ignores?: Array<string | RegExp>;
  outputDir?: string;
};

type TransformContext = CommonOptions &
  (
    | {
        path: string;
      }
    | {
        transformer: (fileInfo: FileInfo, api: API) => Promise<string>;
      }
  );

const CODEMOD_OPTIONS = {
  dry: false,
  print: false,
  verbose: 0,
};

export default async function main(transformContext: TransformContext): Promise<void> {
  function getAllPaths(): string[] {
    const extensions = transformContext.extensions;
    const extensionPattern = new RegExp(`\\.(?:${extensions.join('|')})$`, 'i');
    const ignores = transformContext.ignores ?? [];
    return _uniq(
      execSync(`git ls-files . | grep ${extensions.map(extension => `-e '\\.${extension}$'`).join(' ')}`, {
        cwd: ROOT_PATH,
        maxBuffer: 100 * 1024 * 1024,
        encoding: 'utf8',
      })
        .trim()
        .split('\n')
        .map(file => path.resolve(ROOT_PATH, file))
    )
      .filter(
        file => !ignores.some(pattern => (typeof pattern === 'string' ? file.includes(pattern) : pattern.test(file)))
      )
      .filter(file => extensionPattern.test(file));
  }

  const filterFiles = (filePath: string): boolean => {
    if (filePath.endsWith('.d.ts')) return false; // Exclude definition files
    return true;
  };

  console.log('Fetching list of files...');

  const allPaths = getAllPaths();
  const filePaths = allPaths.filter(p => {
    if (!transformContext.filePaths) return true;
    return transformContext.filePaths.some(fp => {
      if (fp instanceof RegExp) {
        return fp.test(p);
      }
      // Assume string: match exactly or use includes
      return p === fp || p.includes(fp);
    });
  });

  const filesToShift = filePaths.filter(filterFiles);

  if (!fs.existsSync(CODEMOD_LOG_PATH)) {
    fs.mkdirSync(CODEMOD_LOG_PATH, { recursive: true });
  }
  fs.writeFileSync(PATCH_FILE_PATH, '');
  if ('transformer' in transformContext) {
    const transformer = transformContext.transformer;
    for (const filePath of filesToShift) {
      const input = fs.readFileSync(filePath, 'utf-8');
      const parser = chooseParser(filePath);
      const j = withParser(parser);
      const api: API = {
        jscodeshift: j,
        j,
        stats: () => {},
        report: () => {},
      };
      const output = await transformer({ source: input, path: filePath }, api);
      const fileName = path.basename(filePath);
      if (process.env.TEST === 'true' && transformContext.outputDir) {
        const outputFile = path.resolve(transformContext.outputDir, fileName);
        const outputFileContent = fs.readFileSync(outputFile, 'utf-8');
        expect(outputFileContent).toEqual(output);
      }
    }
  } else {
    await run(transformContext.path, filesToShift, CODEMOD_OPTIONS);
  }
}
