import { createInjectorMiddleware } from "src/decorator/request-meta-decorator-factory";
import { easyApi } from "src/easy-api";
import { getHandlerMeta } from "src/meta";
import { HttpHandlerOptions } from "src/types";
import { createRequestFilter, needsRequestFilter } from "src/util";
import { NextFunction, Request, Response, Router, RouterOptions } from "express";

export type ParameterlessClass = new () => unknown;
export type ParameterlessClassDecorator = (cls: ParameterlessClass) => void;

function createMethodWrapper(
  cls: unknown,
  instance: unknown,
  handler: string | symbol,
  options: HttpHandlerOptions
): (req: Request, res: Response, next: NextFunction) => void {
  const bound = (instance as any)[handler].bind(instance);
  const filter = needsRequestFilter(options) && createRequestFilter(options);
  const middleware = createInjectorMiddleware(cls, handler, bound);
  return (req, res, next) => (filter && !filter(req) ? next() : middleware(req, res, next));
}

export function Mount(path: string, options?: RouterOptions): ParameterlessClassDecorator {
  return (cls: ParameterlessClass) => {
    const handlers = getHandlerMeta(cls);
    const router = Router(options);
    const instance = new cls();
    for (const { handler, method, path, options } of handlers)
      (router as any)[method.toLowerCase()].call(router, path, createMethodWrapper(cls, instance, handler, options));
    easyApi().use(path, router);
  };
}
