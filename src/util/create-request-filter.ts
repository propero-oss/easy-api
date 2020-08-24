import { Request } from "express";
import type { IncomingHttpHeaders } from "http";
import { ErrorHandlerOptions, HttpHandlerOptions, RequestFilter } from "src/types";
import { arrayWrap } from "src/util/array-wrap";

export const needsRequestFilter = (options: HttpHandlerOptions): boolean => Object.keys(options).length > 0;

export function buildFilters(options: HttpHandlerOptions | ErrorHandlerOptions, method: string, errorHandler: boolean): RequestFilter[] {
  const checks: RequestFilter[] = [];
  const { contentType, accept, headers, classes } = options as ErrorHandlerOptions;

  if (contentType) checks.push(filterContentType(contentType));
  if (accept) checks.push(filterAccept(accept));
  if (headers) checks.push(filterHeaders(headers));
  if (errorHandler && classes) checks.push(filterClasses(classes));

  return checks;
}

export function createRequestFilter(
  options: HttpHandlerOptions | ErrorHandlerOptions,
  method: string,
  errorHandler: boolean
): RequestFilter {
  const checks = buildFilters(options, method, errorHandler);
  return (req: Request): boolean => !checks.find((it) => !it(req));
}

export const filterContentType = (contentType: string | string[]): RequestFilter => (req) =>
  arrayWrap(contentType).includes(req.headers["content-type"] ?? "");

export const filterAccept = (accepts: string | string[]): RequestFilter => (req) => {
  const value = req.accepts();
  for (const accept of arrayWrap(accepts)) if (value.includes(accept)) return true;
  return false;
};

export const filterHeaders = (headers: IncomingHttpHeaders): RequestFilter => (req) => {
  for (const [header, value] of Object.entries(headers)) {
    const reqHeader = arrayWrap(req.headers[header]!);
    const headers = arrayWrap(value!);
    for (const header of headers) if (!reqHeader.includes(header)) return false;
  }
  return true;
};

export const filterClasses = (classes: unknown[]): RequestFilter => (req) => !!classes.find((cls) => req.__error instanceof (cls as any));
