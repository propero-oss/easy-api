import { Parser } from "@propero/easy-api";
import { ValueRangeError } from "src/parser/basic/errors";
import { checkLength, checkRequired, checkSingular } from "src/parser/basic/utils";

export class ValueNotMatchingError extends ValueRangeError {
  constructor(public regex: RegExp, message = `value must match pattern ${regex}`) {
    super(message);
  }
}

export function createCheckRegExp(pattern?: string, flags?: string): (value: string | undefined) => string | undefined {
  if (!pattern) return (value) => value;
  const regex = new RegExp(pattern, flags);
  return (value) => {
    if (value == null) return value;
    if (!regex.test(value)) throw new ValueNotMatchingError(regex);
    return value;
  };
}

export interface StringFieldOptions {
  minlength?: number;
  maxlength?: number;
  pattern?: string; // RegExp Pattern
  flags?: string; // RegExp Options
  required?: boolean;
  adjust?: boolean;
  default?: string;
}

export function stringField(options: StringFieldOptions = {}): Parser<string | undefined, string | string[] | undefined> {
  const { minlength, maxlength, pattern, flags, required, adjust, default: defaultValue } = options;
  const checkRegExp = createCheckRegExp(pattern, flags);
  return (value = defaultValue) => {
    value = checkRequired(value, required);
    value = checkSingular(value, adjust);
    value = checkLength(value, minlength, maxlength, adjust);
    value = checkRegExp(value);
    return value;
  };
}
