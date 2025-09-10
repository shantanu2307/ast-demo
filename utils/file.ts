import fs from 'fs';
import path from 'path';

export const removeFilesFromDirectory = (directory?: string): void => {
  if (!directory) return;

  const files = fs.readdirSync(directory);
  files.forEach(file => {
    const filePath = path.join(directory, file);
    if (fs.lstatSync(filePath).isDirectory()) {
      fs.rmdirSync(filePath, { recursive: true });
    } else {
      fs.unlinkSync(filePath);
    }
  });
};
