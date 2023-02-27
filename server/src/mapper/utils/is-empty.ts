export const isEmpty = (objOrArray: any): boolean => {
  if (!objOrArray) return true;

  if (Array.isArray(objOrArray)) {
    return objOrArray.length === 0;
  } else if (typeof objOrArray === 'object') {
    return Object.keys(objOrArray).length === 0;
  }
  return true;
};
