import { Parser } from "@propero/easy-api";
import { ValueFormatError, ValueRangeError } from "src/parser/basic/errors";
import { checkRequired, checkSingular } from "src/parser/basic/utils";

export class ValueMinDateExceededError extends ValueRangeError {
  constructor(public min: Date, message = `value must be before ${min.toISOString()}`) {
    super(message);
  }
}

export class ValueMaxDateExceededError extends ValueRangeError {
  constructor(public max: Date, message = `value must be after ${max.toISOString()}`) {
    super(message);
  }
}

export class ValueDateFormatError extends ValueFormatError {
  constructor(message = "invalid date or date format") {
    super(message);
  }
}

export class ValueDateStepError extends ValueRangeError {
  constructor(
    public step: TimeUnit,
    public condition: [number, number],
    public ms: number,
    message = `date must be divisible by ${condition[0]} ${step}, offset by ${condition[1]} ${step}`
  ) {
    super(message);
  }
}

export type TimeUnit = "hours" | "minutes" | "seconds" | "millis";
export interface TimeAccessors {
  setter: (this: Date, value: number) => void;
  getter: (this: Date) => number;
  ms: number;
}
export const timeAccessors: Record<TimeUnit, TimeAccessors> = {
  millis: {
    setter: Date.prototype.setMilliseconds,
    getter: Date.prototype.getMilliseconds,
    ms: 0,
  },
  seconds: {
    setter: Date.prototype.setSeconds,
    getter: Date.prototype.getSeconds,
    ms: 1000,
  },
  minutes: {
    setter: Date.prototype.setMinutes,
    getter: Date.prototype.getMinutes,
    ms: 60000,
  },
  hours: {
    setter: Date.prototype.setHours,
    getter: Date.prototype.getHours,
    ms: 3600000,
  },
};

export interface DateFieldOptions {
  required?: boolean;
  before?: Date | string;
  after?: Date | string;
  adjust?: boolean;
  default?: Date;
  steps?: Record<TimeUnit, number | [number, number] | true>;
}

export function checkDateRange(value: Date | undefined, before?: Date | string, after?: Date | string, adjust?: boolean): Date | undefined {
  if (typeof before === "string") before = new Date(before);
  if (typeof after === "string") after = new Date(after);
  if (value == null) return undefined;
  if (before && value < before)
    if (adjust) return new Date(+before - 1);
    else throw new ValueMinDateExceededError(before);
  if (after && value > after)
    if (adjust) return new Date(+after + 1);
    else throw new ValueMaxDateExceededError(after);
  return value;
}

export function checkDateFormat(value: string | Date | undefined): Date | undefined {
  if (value == null) return undefined;
  value = new Date(value);
  if (Number.isNaN(value.getTime())) throw new ValueDateFormatError();
}

export function checkSteps(
  value: Date | undefined,
  steps?: Record<TimeUnit, number | boolean | [number, number]>,
  adjust?: boolean
): Date | undefined {
  if (!steps || !value) return value;
  for (const [step, condition] of Object.entries(steps)) {
    const { ms } = timeAccessors[step as TimeUnit];
    const [mod, offset] = (Array.isArray(condition) ? condition : [typeof condition === "number" ? condition : 1, 0]).map(
      (num) => num * ms
    );
    const limited = (((+value + offset) / mod) | 0) * mod - offset;
    if (+value !== limited)
      if (adjust) return new Date(limited);
      else throw new ValueDateStepError(step as TimeUnit, [mod / ms, offset / ms], ms);
  }
  return value;
}

export function dateField(options: DateFieldOptions = {}): Parser<Date | undefined, string | string[] | Date | undefined> {
  const { required, before, after, adjust, steps, default: defaultValue } = options;
  return (value = defaultValue) => {
    value = checkRequired(value, required);
    value = checkSingular(value);
    value = checkDateFormat(value);
    value = checkDateRange(value, before, after, adjust);
    value = checkSteps(value, steps, adjust);
    return new Date(value as any);
  };
}
