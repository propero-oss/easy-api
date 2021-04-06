import { Parser } from "@propero/easy-api";
import { checkLength, checkMultiple, checkRequired } from "src/parser/basic/utils";

export interface ListOptions<T> {
  minlength?: number;
  maxlength?: number;
  adjust?: boolean;
  required?: boolean;
  default?: T[];
}

export function list<T>(type: Parser<T>, options: ListOptions<T> = {}): Parser<T[] | undefined, unknown> {
  const { minlength, maxlength, adjust, required, default: defaultValue } = options;
  return (value = defaultValue) => {
    value = checkRequired(value, required);
    value = checkMultiple(value, adjust);
    value = checkLength(value as T[] | undefined, minlength, maxlength, adjust);
    value = (value as T[] | undefined)?.map((item) => type(item as any));
    return value as T[];
  };
}

export type WrapParsers<Array extends unknown[]> = {
  [Key in keyof Array]: Parser<Array[Key], any>;
};

export function tuple<Array extends unknown[]>(...parsers: WrapParsers<Array>): Parser<Array, any> {
  return (value) => {
    if (value == null) return undefined;
    value = checkMultiple(value, true);
    return value.map((item: unknown, index: number) => parsers[index](item));
  };
}
