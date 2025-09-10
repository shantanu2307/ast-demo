import * as prettier from 'prettier/standalone';
import * as estreePlugin from 'prettier/plugins/estree';
import * as tsPlugin from 'prettier/plugins/typescript';
import { Plugin } from 'prettier';

const PRETTIER_CONFIG = {
  singleQuote: true,
  trailingComma: 'es5',
  printWidth: 120,
  arrowParens: 'avoid',
} as const;

const PLUGINS = [estreePlugin, tsPlugin] as Plugin<any>[];

export default async function prettify(file: string, path: string = 'default.tsx'): Promise<string> {
  return prettier.format(file, {
    ...PRETTIER_CONFIG,
    parser: 'typescript',
    plugins: PLUGINS,
    filepath: path,
  });
}
