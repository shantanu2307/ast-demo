import fs from 'fs';
import ts from 'typescript';
import path from 'path';
import { ROOT_PATH } from '../constants';

const tsConfigCache = new Map<string, ts.ParsedCommandLine>();

const getNearestTsconfigPath = (startDir: string): string | null => {
  let current = path.normalize(startDir);
  // eslint-disable-next-line no-constant-condition --- Needed here
  while (true) {
    const candidate = path.join(current, 'tsconfig.json');
    if (fs.existsSync(candidate)) {
      return candidate;
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return null;
};

// Load and parse the tsconfig.json
const generateConfig = (configPath: string): ts.ParsedCommandLine | undefined => {
  try {
    if (tsConfigCache.has(configPath)) {
      return tsConfigCache.get(configPath);
    }
    const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
    if (configFile.error) {
      console.warn('Failed to read tsconfig:', configPath);
      return undefined;
    }
    const basePath = path.dirname(configPath);
    const config = ts.parseJsonConfigFileContent(configFile.config, ts.sys, basePath, undefined, configPath);
    if (config.errors.length > 0) {
      console.warn('Errors parsing tsconfig:', config.errors);
    }
    tsConfigCache.set(configPath, config);
    return config;
  } catch (err) {
    console.warn('Error generating config:', err);
    return undefined;
  }
};

export const resolveImport = (importPath: string, currentFile: string): string => {
  try {
    if (!importPath || !currentFile) return importPath;
    const currentDir = path.dirname(currentFile);
    const configPath = getNearestTsconfigPath(currentDir);
    if (!configPath) return importPath;
    const config = generateConfig(configPath);
    if (!config) return importPath;
    const resolved = ts.resolveModuleName(importPath, currentFile, config.options, ts.sys);
    const resolvedPath = resolved.resolvedModule?.resolvedFileName;
    if (!resolvedPath) return importPath;
    // Library imports
    if (resolvedPath.includes('node_modules')) {
      return importPath;
    }
    return resolvedPath || importPath;
  } catch (err) {
    console.warn('Error resolving import:', err);
    return importPath;
  }
};

export const normalizeImportPath = (importPath: string): string => {
  if (!importPath) return '';
  // Remove /index if it's at the end of the path
  let normalized = importPath.replace(/\/index$/, '');
  // Normalize path separators
  normalized = normalized.replace(/\\/g, '/');
  return normalized;
};

export const removeFileExtension = (filePath: string): string => {
  if (!filePath) return '';
  return filePath.replace(/\.(ts|tsx|js|jsx|mjs|cjs|d.ts)$/, '');
};

export const toMinifiedPath = (absolutePath: string, currentFile: string): string => {
  try {
    if (!absolutePath) return '';

    if (!absolutePath.includes(ROOT_PATH)) {
      return absolutePath;
    }
    const currentDir = path.dirname(currentFile);
    const configPath = getNearestTsconfigPath(currentDir);
    if (!configPath) return normalizeImportPath(absolutePath);

    const config = generateConfig(configPath);
    if (!config) return normalizeImportPath(absolutePath);

    const { paths = {} } = config.options;
    const reverseMap: Record<string, string[]> = {};

    Object.entries(paths).forEach(([key, values]) => {
      const cleanKey = key.replace(/\*$/, '');
      values.forEach(value => {
        const pattern = value.replace(/\*$/, '');
        const identifier = path.resolve(path.dirname(configPath), pattern);
        reverseMap[identifier] ??= [];
        reverseMap[identifier].push(cleanKey);
      });
    });

    let finalPath = path.normalize(absolutePath);

    const sortedPatterns = Object.keys(reverseMap);

    for (const pattern of sortedPatterns) {
      if (finalPath.startsWith(pattern)) {
        const sortedKeys = reverseMap[pattern];
        const alias = sortedKeys[0];
        finalPath = path.join(alias, path.relative(pattern, finalPath));
        break;
      }
    }
    return normalizeImportPath(finalPath);
  } catch (err) {
    console.warn('Error minifying path:', err);
    return normalizeImportPath(absolutePath);
  }
};
