export type Constructor<T = unknown> = new(...args: any[]) => T;

export function getHierarchy(ctor: Constructor): Constructor[] {
  const ctors: Constructor[] = [];
  do {
    ctors.push(ctor);
    ctor = Object.getPrototypeOf(ctor.prototype)?.constructor as Constructor;
  } while (ctor && ctor !== Function && ctor !== Object);
  return ctors;
}
