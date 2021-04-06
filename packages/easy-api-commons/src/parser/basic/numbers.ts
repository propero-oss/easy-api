import { Parser } from "@propero/easy-api";
import { ValueFormatError, ValueRangeError } from "src/parser/basic/errors";
import { checkRequired, checkSingular } from "src/parser/basic/utils";

export class ValueMinExceededError extends ValueRangeError {
  constructor(public max: number, message = `value must not be greater than ${max}`) {
    super(message);
  }
}

export class ValueMaxExceededError extends ValueRangeError {
  constructor(public min: number, message = `value must not be less than ${min}`) {
    super(message);
  }
}

export class ValueNumberFormatError extends ValueFormatError {
  constructor(message = "invalid number format or value too large") {
    super(message);
  }
}

export interface IntFieldOptions {
  min?: number;
  max?: number;
  required?: boolean;
  adjust?: boolean;
  default?: number;
}

export function checkNumberFormat(value: number | string | undefined, parser?: (value: string) => number): number | undefined {
  value = value == null ? undefined : typeof value === "string" ? (parser ? parser(value) : +value) : value;
  if (value == null) return undefined;
  if (Number.isNaN(value) || !Number.isFinite(value)) throw new ValueNumberFormatError();
  return value;
}

export function checkNumberRange(value: number | undefined, min?: number, max?: number, adjust?: boolean): number | undefined {
  if (value == null) return undefined;
  if (max != null && value > max)
    if (adjust) value = max;
    else throw new ValueMaxExceededError(max);
  if (min != null && value < min)
    if (adjust) value = min;
    else throw new ValueMinExceededError(min);
  return value;
}

export function clipFractionalDigits(value: number | undefined, precision?: number): number | undefined {
  if (value == null || precision == null || Number.isNaN(value)) return value;
  const offset = Math.log10(value) | 0;
  const cutoff = precision + offset;
  return ((value / cutoff) | 0) * cutoff;
}

export function intField(options: IntFieldOptions): Parser<number | undefined, string | string[] | undefined | number> {
  const { min, max, required, adjust, default: defaultValue } = options;
  return (value = defaultValue) => {
    value = checkRequired(value, required);
    value = checkSingular(value, adjust);
    value = checkNumberFormat(value, (value) => parseInt(value, 10));
    value = checkNumberRange(value, min, max, adjust);
    return value;
  };
}

export interface FloatFieldOptions {
  min?: number;
  max?: number;
  decimals?: number;
  required?: boolean;
  adjust?: boolean;
  default?: number;
}

export function floatField(options: FloatFieldOptions): Parser<number | undefined, string | string[] | undefined | number> {
  const { min, max, decimals = 5, required, adjust, default: defaultValue } = options;
  return (value = defaultValue) => {
    value = checkRequired(value, required);
    value = checkSingular(value, adjust);
    value = checkNumberFormat(value, (value) => parseFloat(value));
    value = clipFractionalDigits(value, decimals);
    value = checkNumberRange(value, min, max, adjust);
    return value;
  };
}
