export enum ResponseStatus {
  CONTINUE = 100,
  SWITCHING_PROTOCOLS = 101,
  PROCESSING = 102,
  EARLY_HINTS = 103,
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NON_AUTHORITATIVE_INFORMATION = 203,
  NO_CONTEXT = 204,
  RESET_CONTENT = 205,
  PARTIAL_CONTENT = 206,
  MULTI_STATUS = 207,
  ALREADY_REPORTED = 208,
  IM_USER = 226,
  MULTIPLE_CHOICES = 300,
  MOVED_PERMANENTLY = 301,
  FOUND = 302,
  SEE_OTHER = 303,
  NOT_MODIFIED = 304,
  USE_PROXY = 305,
  UNUSED = 306,
  TEMPORARY_REDIRECT = 307,
  PERMANENT_REDIRECT = 308,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  PAYMENT_REQUIRED = 402,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  NOT_ACCEPTABLE = 406,
  PROXY_AUTHENTICATION_REQUIRED = 407,
  REQUEST_TIMED_OUT = 408,
  CONFLICT = 409,
  GONE = 410,
  LENGTH_REQUIRED = 411,
  PRECONDITION_FAILED = 412,
  PAYLOAD_TOO_LARGE = 413,
  URI_TOO_LONG = 414,
  UNSUPPORTED_MEDIA_TYPE = 415,
  RANGE_NOT_SATISFIABLE = 416,
  EXPECTATION_FAILED = 417,
  IM_A_TEAPOT = 418,
  MISDIRECTED_REQUEST = 421,
  UNPROCESSABLE_ENTITY = 422,
  LOCKED = 423,
  FAILED_DEPENDENCY = 424,
  TOO_EARLY = 425,
  UPGRADE_REQUIRED = 426,
  PRECONDITION_REQUIRED = 428,
  TOO_MANY_REQUESTS = 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE = 431,
  UNAVAILABLE_FOR_LEGAL_REASONS = 451,
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
  HTTP_VERSION_NOT_SUPPORTED = 505,
  VARIANT_ALSO_NEGOTIATES = 506,
  INSUFFICIENT_STORAGE = 507,
  LOOP_DETECTED = 508,
  NOT_EXTENDED = 510,
  NETWORK_AUTHENTICATION_REQUIRED = 511,
}

const statusTexts: Record<ResponseStatus, string> = Object.fromEntries(
  Object.entries(ResponseStatus).map(([text, status]) => [
    status,
    text.replace(/[A-Z]+/g, (match) => match.slice(0, 1) + match.slice(1).toLowerCase()).replace(/_/g, " "),
  ])
) as any;

export function getStatusText(code: ResponseStatus): string {
  return statusTexts[code];
}

export function getStatusCode(data: unknown): ResponseStatus | undefined {
  switch (typeof data) {
    case "bigint":
    case "number":
      return data.toString() in statusTexts ? (data as ResponseStatus) : undefined;
    case "boolean":
    case "undefined":
      return;
    case "object":
      if (!data) return;
      if (Array.isArray(data)) return data.map(getStatusCode).find((it) => it) ?? undefined;
      return objectStatus(data);
    case "string":
      return stringStatus(data);
    case "function":
      return;
  }
}

const statusRegex = new RegExp(
  Object.keys(ResponseStatus)
    .map((it) => `\\b${it.replace(/_/g, "[ _]").toLowerCase()}\\b`)
    .join("|"),
  "i"
);

function stringStatus(str: string): ResponseStatus | undefined {
  str = str.trim().toLowerCase();
  if (!str) return;
  const code = /^[0-9]+/.exec(str);
  if (code && code[0] in statusTexts) return +code[0];
  const match = statusRegex.exec(str);
  if (match) return (ResponseStatus as any)[match[0].toUpperCase().replace(/\s/g, "_")];
}

function objectStatus(data: any | null): ResponseStatus | undefined {
  if (!data) return;
  for (const key of ["status", "response", "error", "message"])
    if (key in data && data[key]) {
      const status = getStatusCode(data[key]);
      if (status) return status;
    }
  if (data instanceof Error) return ResponseStatus.INTERNAL_SERVER_ERROR;
}
