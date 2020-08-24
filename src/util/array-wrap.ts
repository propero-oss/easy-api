export function arrayWrap<T>(obj: T): T extends unknown[] ? T : T[] {
  return Array.isArray(obj) ? obj : ([obj] as any);
}
