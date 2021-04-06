export const hasOwnProperty = (it: unknown, property: string | symbol | number): boolean =>
  Object.prototype.hasOwnProperty.call(it, property);
