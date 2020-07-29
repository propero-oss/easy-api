export function getClassOf(obj: unknown): unknown {
  if (obj == null) return undefined;
  if (typeof obj !== "object") return Object.getPrototypeOf(obj) ?? undefined;
  return "prototype" in obj! ? obj! : "constructor" in obj! ? obj!.constructor : Object.getPrototypeOf(obj) ?? undefined;
}
