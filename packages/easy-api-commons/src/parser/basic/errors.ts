export class ValueError extends Error {
  constructor(message = "value invalid") {
    super(message);
  }
}

export class ValueRequiredError extends ValueError {
  constructor(message = "value required") {
    super(message);
  }
}

export class ValueFormatError extends ValueError {
  constructor(message = "value format unsupported") {
    super(message);
  }
}

export class ValueRangeError extends ValueError {
  constructor(message = "value range exceeded") {
    super(message);
  }
}

export class ValueCardinalityError extends ValueError {
  constructor(message = "value cardinality mismatch") {
    super(message);
  }
}

export class ValueNotSingularError extends ValueCardinalityError {
  constructor(message = "value must be singular") {
    super(message);
  }
}

export class ValueSingularError extends ValueCardinalityError {
  constructor(message = "value must not be singular") {
    super(message);
  }
}

export class ValueMinLengthExceededError extends ValueRangeError {
  constructor(public max: number, message = `value must not be longer than ${max}`) {
    super(message);
  }
}

export class ValueMaxLengthExceededError extends ValueRangeError {
  constructor(public min: number, message = `value must have at least a length of ${min}`) {
    super(message);
  }
}
