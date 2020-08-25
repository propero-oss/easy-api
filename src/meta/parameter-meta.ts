export type ParameterMetaRecord<Meta = unknown> = Record<number, Meta>;
export interface ParameterMetaGenerator<Meta = unknown> {
  (target: unknown, key: string | symbol, index: number): Meta;
}
export interface ParameterMetaCollector<Meta = unknown> {
  // eslint-disable-next-line no-empty-pattern
  ({}: { target: unknown; property: string | symbol; desc: TypedPropertyDescriptor<any>; meta: ParameterMetaRecord<Meta> }): void;
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
    setMeta(target, property, index, generator(target, property, index));
  };
}

export function createParameterMetaCollector<Meta = unknown>(
  getMeta: (target: unknown, property: string | symbol) => ParameterMetaRecord<Meta>,
  collector: ParameterMetaCollector<Meta>
): (target: unknown, property: string | symbol, desc: TypedPropertyDescriptor<any>) => void {
  return (target, property, desc) => collector({ target, property, desc, meta: getMeta(target, property) });
}
