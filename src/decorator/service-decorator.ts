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
} from "src/types";
import { createRequestFilter, errorMiddleware, needsRequestFilter } from "src/util";
import { NextFunction, Request, Response, Router, RouterOptions } from "express";

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
  return errorOrRequestHandler(errorHandler, (req, res, next) =>
    filter && !filter(req) ? next(req.__error ? req.__error : undefined) : middleware(req, res, next)
  );
}

function errorOrRequestHandler(errorHandler: boolean, handler: HttpHandlerSignature): HttpHandlerSignature | HttpErrorHandlerSignature {
  if (errorHandler)
    return ((err: unknown, req: Request, res: Response, next: NextFunction) =>
      handler(...errorMiddleware(err, req, res, next))) as HttpErrorHandlerSignature;
  else return (req: Request, res: Response, next: NextFunction) => handler(req, res, next);
}

export function Service(path: string = "/", options?: RouterOptions): ClassDecorator {
  return (cls) => {
    const factory = (instance: InstanceType<typeof cls & any>) => {
      const handlers = getHandlerMeta(cls);
      const router = Router(options);
      for (const { handler, method, path, options, errorHandler } of handlers) {
        const { before = [], after = [] } = options;
        const args = [path, ...before, createMethodWrapper(cls, instance, handler, options, errorHandler, method), ...after];
        (router as any)[errorHandler ? "use" : method.toLowerCase()].call(router, ...args);
      }
      return router;
    };
    addRouterMeta(cls, { path, factory });
  };
}
