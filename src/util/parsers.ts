import { Parser } from "src/types";

export class ParseError extends Error {
  constructor(public readonly parserId: string, ...args: any[]) {
    super(...args);
  }
}

export function parserIgnoreUndefined<T, From = string>(parser: Parser<T, From>): Parser<T | undefined, From | undefined> {
  return (it) => (it == null ? undefined : parser(it));
}

export function intParser(radix: number = 10): Parser<number | undefined, string | undefined> {
  return parserIgnoreUndefined((value) => parseInt(value, radix));
}

export function floatParser(precision?: number): Parser<number | undefined, string | undefined> {
  if (precision == null) return parserIgnoreUndefined(parseFloat);
  const factor = Math.pow(10, precision);
  return parserIgnoreUndefined((it) => Math.round(parseFloat(it) * factor) / factor);
}

export function parserRequire<T, From = string | undefined>(parser: Parser<T | undefined, From>): Parser<T, From> {
  return (it) => {
    if (it == null) throw new ParseError("required", `'${it}' is not defined`);
    return parser(it) as T;
  };
}

export function dateParser(): Parser<Date | undefined, string | undefined> {
  return parserIgnoreUndefined((it) => new Date(it));
}
