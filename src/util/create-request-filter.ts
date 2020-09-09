import { Request } from "express";
import type { IncomingHttpHeaders } from "http";
import { ErrorHandlerOptions, HttpHandlerOptions, MaybeArray, RequestFilter } from "src/types";
import { arrayWrap } from "src/util/array-wrap";

export const filterRegistry: { [K in keyof ErrorHandlerOptions]: ((value: Required<ErrorHandlerOptions>[K]) => RequestFilter)[] } = {};

export function registerFilter<K extends keyof ErrorHandlerOptions>(
  option: K,
  filterGenerator: (value: Required<ErrorHandlerOptions>[K]) => RequestFilter
): void {
  // Typescript please the type of the expression before .push should be
  // ((value: Required<ErrorHandlerOptions>[K]) => RequestFilter)[]
  // and pushing filterGenerator should not be an issue because it matches this
  // signature but somehow an any[] cast is required to make this work...
  ((filterRegistry[option] ?? (filterRegistry[option] = [])) as any[]).push(filterGenerator);
}

export const needsRequestFilter = (options: HttpHandlerOptions): boolean => Object.keys(options).length > 0;

export function buildFilters(options: HttpHandlerOptions | ErrorHandlerOptions, method: string, errorHandler: boolean): RequestFilter[] {
  const checks: RequestFilter[] = [];
  const { classes } = options as ErrorHandlerOptions;

  for (const key of Object.keys(options))
    if (filterRegistry[key as keyof ErrorHandlerOptions])
      // Typing is solid but typing of Object.keys to not return keyof T but string[] is causing problems
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      checks.push(...filterRegistry[key as keyof ErrorHandlerOptions]!.map((it) => it(options[key])));

  if (errorHandler && classes) checks.push(filterClasses(classes));

  return checks;
}

export function stringOrRegExpMatch(original = "", options: MaybeArray<string | RegExp>): boolean {
  const lower = original.toLowerCase();
  return !!arrayWrap(options).find((option) =>
    typeof option === "string" ? lower.startsWith(option.toLowerCase()) : option.test(original)
  );
}

export function createRequestFilter(
  options: HttpHandlerOptions | ErrorHandlerOptions,
  method: string,
  errorHandler: boolean
): RequestFilter {
  const checks = buildFilters(options, method, errorHandler);
  return (req: Request): boolean => !checks.find((it) => !it(req));
}

registerFilter(
  "contentType",
  (contentType: MaybeArray<string | RegExp>): RequestFilter => (req) => stringOrRegExpMatch(req.headers["content-type"], contentType)
);

registerFilter(
  "accept",
  (accepts: MaybeArray<string | RegExp>): RequestFilter => (req) => !!req.accepts().find((it) => stringOrRegExpMatch(it, accepts))
);

registerFilter(
  "headers",
  (headers: IncomingHttpHeaders): RequestFilter => (req) => {
    for (const [header, value] of Object.entries(headers)) {
      const reqHeader = arrayWrap(req.headers[header]!);
      const headers = arrayWrap(value!);
      for (const header of headers) if (!reqHeader.includes(header)) return false;
    }
    return true;
  }
);

registerFilter("method", (method): RequestFilter => (req) => stringOrRegExpMatch(req.method, method));

export const filterClasses = (classes: MaybeArray<unknown>): RequestFilter => (req) =>
  !!arrayWrap(classes).find((cls) => req.__error instanceof (cls as any));
