import { Request } from "express";
import { IncomingHttpHeaders } from "http";
import { ErrorHandlerOptions, HttpHandlerOptions } from "src/types";
import { arrayWrap } from "src/util/array-wrap";

export const needsRequestFilter = (options: HttpHandlerOptions): boolean => Object.keys(options).length > 0;

export function checkContentType(req: Request, contentType: string | string[]): boolean {
  return arrayWrap(contentType).includes(req.headers["content-type"] ?? "");
}

export function checkAccept(req: Request, accepts: string | string[]): boolean {
  const value = req.accepts();
  for (const accept of arrayWrap(accepts)) if (value.includes(accept)) return true;
  return false;
}

export function checkHeaderValues(req: Request, headers: IncomingHttpHeaders): boolean {
  for (const [header, value] of Object.entries(headers)) {
    const reqHeader = arrayWrap(req.headers[header]!);
    const headers = arrayWrap(value!);
    for (const header of headers) if (!reqHeader.includes(header)) return false;
  }
  return true;
}

export function checkErrorClasses(req: Request, classes: unknown[]): boolean {
  return !!classes.find((cls) => req.__error instanceof (cls as any));
}

export function createRequestFilter(options: HttpHandlerOptions | ErrorHandlerOptions, method: string, errorHandler: boolean) {
  return (req: Request): boolean => {
    if (options.contentType && !checkContentType(req, options.contentType)) return false;
    if (options.accept && !checkAccept(req, options.accept)) return false;
    if (options.headers && !checkHeaderValues(req, options.headers)) return false;
    if ((errorHandler && !req.__error) || (!errorHandler && req.__error && method !== "USE")) return false;
    if ((options as ErrorHandlerOptions).classes && !checkErrorClasses(req, (options as ErrorHandlerOptions).classes!)) return false;
    // TODO: Further checks
    return true;
  };
}
