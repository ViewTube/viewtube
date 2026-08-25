export const checkParams = (...params: string[]): boolean => {
  return params.every(param => typeof param === 'string' && param.length > 0);
};
