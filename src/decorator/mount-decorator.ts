import { easyApi } from "src/easy-api";
import { getHandlerMeta } from "src/meta";
import { HttpHandlerOptions } from "src/types";
import { NextFunction, Request, Response, Router, RouterOptions } from "express";
import { createRequestFilter, needsRequestFilter } from "src/util/create-request-filter";

export type ParameterlessClass = new () => unknown;
export type ParameterlessClassDecorator = (cls: ParameterlessClass) => void;

function createMethodWrapper(
  instance: unknown,
  handler: string | symbol,
  options: HttpHandlerOptions
): (req: Request, res: Response, next: NextFunction) => void {
  const bound = (instance as any)[handler].bind(instance);
  const filter = needsRequestFilter(options) && createRequestFilter(options);
  return (req, res, next) => {
    if (filter && !filter(req)) return next();
    return bound(req, res, next);
  };
}

export function Mount(path: string, options?: RouterOptions): ParameterlessClassDecorator {
  return (cls: ParameterlessClass) => {
    const handlers = getHandlerMeta(cls);
    const router = Router(options);
    const instance = new cls();
    for (const { handler, method, path, options } of handlers)
      (router as any)[method.toLowerCase()].call(router, path, createMethodWrapper(instance, handler, options));
    easyApi().use(path, router);
  };
}
