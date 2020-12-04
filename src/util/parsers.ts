import { Parser } from "src/types";

export function parserIgnoreUndefined<T, From = string>(parser: Parser<T, From>): Parser<T | undefined, From | undefined> {
  return (it) => (it == null) ? undefined: parser(it);
}
