export const hasOwnProperty = (it: unknown, property: string | symbol | number) => Object.prototype.hasOwnProperty.call(it, property);
