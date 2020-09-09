import { createInjectorMiddleware } from "src/decorator/request-meta-decorator-factory";
import { createResponseGenerator } from "src/decorator/response-generator";
import { addRouterMeta, getHandlerMeta } from "src/meta";
import {
  ExpressMethod,
  HttpErrorHandlerSignature,
  HttpHandlerMiddleware,
  HttpHandlerOptions,
  HttpHandlerSignature,
  HttpMethod,
  ServiceOptions
} from "src/types";
import { createRequestFilter, errorMiddleware, needsRequestFilter, normalizePathOptions } from "src/util";
import { NextFunction, Request, Response, Router } from "express";

function createMethodWrapper(
  cls: unknown,
  instance: unknown,
  handler: string | symbol,
  options: HttpHandlerOptions,
  errorHandler: boolean,
  method: ExpressMethod | HttpMethod
): HttpHandlerMiddleware {
  const bound = (instance as any)[handler].bind(instance);
  const filter = needsRequestFilter(options) && createRequestFilter(options, method, errorHandler);
  let middleware = createInjectorMiddleware(cls, handler, bound);
  middleware = createResponseGenerator(middleware, options.responseType ?? "auto", options.status);
  return errorOrRequestHandler(errorHandler, async (req, res, next) => {
    if (filter && !filter(req)) return next(req.__error || undefined);
    try {
      return await middleware(req, res, next);
    } catch (e) {
      next(e);
    }
  });
}

function errorOrRequestHandler(errorHandler: boolean, handler: HttpHandlerSignature): HttpHandlerSignature | HttpErrorHandlerSignature {
  if (errorHandler)
    return ((err: unknown, req: Request, res: Response, next: NextFunction) =>
      handler(...errorMiddleware(err, req, res, next))) as HttpErrorHandlerSignature;
  else return (req: Request, res: Response, next: NextFunction) => handler(req, res, next);
}

export function Service(options?: ServiceOptions): ClassDecorator;
export function Service(path?: string, options?: ServiceOptions): ClassDecorator;
export function Service(pathOrOptions?: string | ServiceOptions, maybeOptions?: ServiceOptions): ClassDecorator {
  const [path, options] = normalizePathOptions(pathOrOptions, maybeOptions);
  const serviceOptions = options ?? {} as Partial<ServiceOptions>;
  const { before: serviceBefore = [], after: serviceAfter = [] } = serviceOptions;
  return (cls) => {
    const factory = (instance: InstanceType<typeof cls & any>) => {
      const handlers = getHandlerMeta(cls);
      const router = Router(options?.routerOptions);
      for (const { handler, method, path, options, errorHandler } of handlers) {
        const { before = [], after = [] } = options;
        const args = [
          path,
          ...serviceBefore,
          ...before,
          createMethodWrapper(cls, instance, handler, { ...serviceOptions, ...options }, errorHandler, method),
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
