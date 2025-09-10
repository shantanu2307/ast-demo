// libs
import { withParser, FileInfo, CallExpression, API, ImportDeclaration } from 'jscodeshift';

// utils
import chooseParser from '../utils/parser';
import prettify from '../utils/prettify';
import diff from '../utils/diff';

const transform = async (fileInfo: FileInfo, api: API): Promise<string> => {
  const j = api.jscodeshift;
  const parser = chooseParser(fileInfo.path);
  const sourceNodes = withParser(parser)(fileInfo.source);
  if (!parser) return fileInfo.source; // No need to parse; has been flagged as do-not-parse

  // Add code here

  const newFile = await prettify(sourceNodes.toSource());
  return diff(fileInfo.path, fileInfo.source, newFile);
};

export default transform;
