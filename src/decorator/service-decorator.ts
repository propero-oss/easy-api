import { createInjectorMiddleware } from "src/decorator/request-meta-decorator-factory";
import { addRouterMeta, getHandlerMeta } from "src/meta";
import { HttpErrorHandlerSignature, HttpHandlerMiddleware, HttpHandlerOptions, HttpHandlerSignature, ServiceOptions } from "src/types";
import { Constructor, createRequestFilter, errorMiddleware, needsRequestFilter, normalizePathOptions } from "src/util";
import { NextFunction, Request, Response, Router } from "express";
import { handleResponse } from "src/util/http-response";

export function createMethodWrapper(
  cls: unknown,
  instance: unknown,
  handler: string | symbol,
  options: HttpHandlerOptions,
  errorHandler: boolean
): HttpHandlerMiddleware {
  const bound = (instance as any)[handler].bind(instance);
  const filter = needsRequestFilter(options) && createRequestFilter(options);
  let middleware = createInjectorMiddleware(cls, handler, bound, instance);
  middleware = handleResponse(middleware);
  return errorOrRequestHandler(errorHandler, async function (this: any, req, res, next) {
    if (filter && !filter(req)) return next(req.__error || undefined);
    return await middleware.call(this, req, res, next);
  });
}

export function errorOrRequestHandler(
  errorHandler: boolean,
  handler: HttpHandlerSignature
): HttpHandlerSignature | HttpErrorHandlerSignature {
  if (errorHandler)
    return ((err: unknown, req: Request, res: Response, next: NextFunction) =>
      handler(...errorMiddleware(err, req, res, next))) as HttpErrorHandlerSignature;
  else return (req: Request, res: Response, next: NextFunction) => handler(req, res, next);
}

export function Service(options?: ServiceOptions): ClassDecorator;
export function Service(path?: string, options?: ServiceOptions): ClassDecorator;
export function Service(pathOrOptions?: string | ServiceOptions, maybeOptions?: ServiceOptions): ClassDecorator {
  const [path, options] = normalizePathOptions(pathOrOptions, maybeOptions);
  const serviceOptions = options ?? ({} as Partial<ServiceOptions>);
  const { before: serviceBefore = [], after: serviceAfter = [] } = serviceOptions;
  return (cls) => {
    const factory = (instance: InstanceType<typeof cls & any>) => {
      const handlers = getHandlerMeta(cls as unknown as Constructor);
      const router = Router(options?.routerOptions);
      for (const { handler, method, path, options, errorHandler } of handlers) {
        const { before = [], after = [] } = options;
        const args = [
          path,
          ...serviceBefore,
          ...before,
          createMethodWrapper(cls, instance, handler, { ...serviceOptions, ...options }, errorHandler),
          ...after,
          ...serviceAfter,
        ];
        (router as any)[errorHandler ? "use" : method.toLowerCase()].call(router, ...args);
      }
      return router;
    };
    addRouterMeta(cls, { path, factory });
  };
}
