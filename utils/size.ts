// formats size
export const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formattedSize = parseFloat((bytes / k ** i).toFixed(2));
  return `${formattedSize} ${sizes[i]}`;
};

// give object as input and get json size
export const calculateJSONSize = (obj: any): number => {
  const jsonString = JSON.stringify(obj);
  const size = new Blob([jsonString]).size;
  return size;
};

export const calculatePercentage = (a: number, b: number): number => {
  if (b === 0) return 0; // Handle division by zero
  const percentage = (a / b) * 100;
  return parseFloat(percentage.toFixed(2)); // Format to 2 decimal places
};
