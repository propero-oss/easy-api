import { Parser } from "@propero/easy-api";

export function map<T>(parser: Parser<T, any>): Parser<Record<string, T>, unknown> {
  return (value = {}) => Object.fromEntries(Object.entries(value as any).map(([key, value]) => [key, parser(value)])) as any;
}

export type StructureParsers<T> = {
  [Key in keyof T]: Parser<T, any>;
};

export function structure<T>(parsers: StructureParsers<T>): Parser<T | undefined, Record<string, unknown> | undefined> {
  const keys: (keyof T)[] = Object.keys(parsers) as any;
  return (value) => {
    if (!value) return undefined;
    return (Object.fromEntries(keys.map((key) => [key, parsers[key]((value as any)[key])])) as unknown) as T;
  };
}
