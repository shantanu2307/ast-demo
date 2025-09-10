// utils
import shift from '../utils/shift'
import path from 'path';

describe('Change function invocation codemod', () => {
  it('should fix imports correctly', async () => {
    const absolutePath = path.resolve(__dirname, '..', 'scripts', 'change-function-invocation.ts');
    const outputDir = path.resolve(__dirname, '..', '__fixtures__', 'output');
    process.env.TEST = 'true';
    const { default: transformer } = await import(absolutePath);
    await shift({
      transformer,
      extensions: ['js'], 
      outputDir, 
    })
    delete process.env.test; 
  });
});
