export const desanitize = (str: string) => {
  if (typeof str !== 'string') return '';

  decodeURIComponent(str.trim());
};
