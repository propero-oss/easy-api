import { createInjectorMiddleware, createResponseGenerator } from "src/decorator/request-meta-decorator-factory";
import { addRouterMeta, getHandlerMeta } from "src/meta";
import { HttpHandlerOptions } from "src/types";
import { createRequestFilter, needsRequestFilter } from "src/util";
import { NextFunction, Request, Response, Router, RouterOptions } from "express";

function createMethodWrapper(
  cls: unknown,
  instance: unknown,
  handler: string | symbol,
  options: HttpHandlerOptions
): (req: Request, res: Response, next: NextFunction) => void {
  const bound = (instance as any)[handler].bind(instance);
  const filter = needsRequestFilter(options) && createRequestFilter(options);
  let middleware = createInjectorMiddleware(cls, handler, bound);
  middleware = createResponseGenerator(middleware, options.responseType ?? "json");
  return (req, res, next) => (filter && !filter(req) ? next() : middleware(req, res, next));
}

export function Service(path: string = "/", options?: RouterOptions): ClassDecorator {
  return (cls) => {
    const factory = (instance: InstanceType<typeof cls & any>) => {
      const handlers = getHandlerMeta(cls);
      const router = Router(options);
      for (const { handler, method, path, options } of handlers)
        (router as any)[method.toLowerCase()].call(router, path, createMethodWrapper(cls, instance, handler, options));
      return router;
    };
    addRouterMeta(cls, { path, factory });
  };
}
