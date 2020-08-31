export type Projection<T> = {
  [P in keyof T]?: 1;
};

export function createProjectionObject<T>(object: T) {
  const projectionObj: Projection<T> = {};
  Object.keys(object).forEach(val => {
    projectionObj[val] = 1;
  });
  console.log(projectionObj);
  return projectionObj;
}