import { addHandlerMeta } from "src/meta";
import { ErrorHandlerDecorator, ErrorHandlerOptions, ExpressMethod, HttpHandlerDecorator, HttpHandlerOptions, HttpMethod } from "src/types";
import { normalizePathOptions } from "src/util";

export function HttpHandler(method: ExpressMethod | HttpMethod, path: string, options?: HttpHandlerOptions): MethodDecorator;
export function HttpHandler(method: ExpressMethod | HttpMethod, options?: HttpHandlerOptions): MethodDecorator;
export function HttpHandler(
  method: ExpressMethod | HttpMethod,
  pathOrOptions?: string | HttpHandlerOptions,
  maybeOptions?: HttpHandlerOptions
): MethodDecorator {
  const [path, options] = normalizePathOptions(pathOrOptions, maybeOptions);
  return (proto, handler) => addHandlerMeta(proto, { method, options, path, handler });
}

export function ErrorHandler(method: ExpressMethod | HttpMethod, path: string, options?: ErrorHandlerOptions): MethodDecorator;
export function ErrorHandler(method: ExpressMethod | HttpMethod, options?: HttpHandlerOptions): MethodDecorator;
export function ErrorHandler(
  method: ExpressMethod | HttpMethod,
  pathOrOptions?: string | HttpHandlerOptions,
  maybeOptions?: HttpHandlerOptions
): MethodDecorator {
  const [path, options] = normalizePathOptions(pathOrOptions, maybeOptions);
  return (proto, handler) => addHandlerMeta(proto, { method, options, path, handler, errorHandler: true });
}

export function httpMethodDecorator(method: HttpMethod | ExpressMethod): HttpHandlerDecorator {
  return HttpHandler.bind(undefined, method) as HttpHandlerDecorator;
}

export function errorMethodDecorator(): ErrorHandlerDecorator {
  return ErrorHandler.bind(undefined, "USE") as ErrorHandlerDecorator;
}
