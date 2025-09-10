export default function chooseParser(filePath: string): 'ts' | 'tsx' | 'css' | 'babel' {
  if (filePath.endsWith('css')) return 'css';
  if (filePath.endsWith('.tsx')) return 'tsx';
  if (filePath.endsWith('.ts')) return 'ts';
  return 'babel';
}
