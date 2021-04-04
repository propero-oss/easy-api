export type ParameterMetaRecord<Meta = unknown> = Record<number, Meta>;
export interface ParameterMetaGenerator<Meta = unknown> {
  (target: unknown, key: string | symbol, typehint: unknown): Meta;
}

export function reflectParameterType(proto: unknown, key: string | symbol, index: number): unknown {
  return proto ? Reflect.getMetadata?.("design:paramtypes", proto as any, key)?.[index] : undefined;
}

export function createParameterMetaAccessors<Meta = unknown>(
  name?: string
): {
  getMeta(target: unknown, property: string | symbol): ParameterMetaRecord<Meta>;
  setMeta(target: unknown, property: string | symbol, index: number, value: Meta): Meta;
  key: symbol;
} {
  const key = Symbol(name);
  const getMeta = (target: unknown, property: string | symbol): ParameterMetaRecord<Meta> => {
    if (typeof target !== "function") target = (target as any).constructor;
    const allMeta = (target as any)[key] ?? ((target as any)[key] = {});
    return allMeta[property] ?? (allMeta[property] = {});
  };
  const setMeta = (target: unknown, property: string | symbol, index: number, value: Meta): Meta =>
    (getMeta(target, property)[index] = value);
  return { getMeta, setMeta, key };
}

export function createParameterMetaDecoratorFactory<Meta = unknown>(
  setMeta: (target: unknown, property: string | symbol, index: number, value: Meta) => Meta | void
): (generator: ParameterMetaGenerator<Meta>) => ParameterDecorator {
  return (generator) => (target, property, index) => {
    setMeta(target, property, index, generator(target, property, reflectParameterType(target, property, index)));
  };
}
