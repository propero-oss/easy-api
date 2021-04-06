import { ValueNotSingularError, ValueRequiredError, ValueSingularError, ValueMaxLengthExceededError, ValueMinLengthExceededError } from "src/parser/basic/errors";

export function checkRequired<T>(value: T | undefined, flag?: boolean): T | undefined {
  if (value == null)
    if (flag) throw new ValueRequiredError();
    else return undefined;
  return value;
}

export function checkSingular<T>(value: T | T[], adjust?: boolean): T {
  if (Array.isArray(value))
    if (adjust) value = value[0];
    else throw new ValueNotSingularError();
  return value;
}

export function checkMultiple<T>(value: T | T[], adjust?: boolean): T[] {
  if (Array.isArray(value))
    if (adjust) value = [(value as unknown) as T];
    else throw new ValueSingularError();
  return value as T[];
}

export function checkLength<T extends string | unknown[] | undefined>(value: T, min?: number, max?: number, adjust?: boolean): T {
  if (value == null) return value;
  if (min != null && value.length < min) throw new ValueMinLengthExceededError(min);
  if (max != null && value.length > max)
    if (adjust) value = value.slice(0, max) as T;
    else throw new ValueMaxLengthExceededError(max);
  return value;
}
