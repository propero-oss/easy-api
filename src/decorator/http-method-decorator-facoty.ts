import { addHandlerMeta } from "src/meta";
import { ErrorHandlerDecorator, ErrorHandlerOptions, ExpressMethod, HttpHandlerDecorator, HttpHandlerOptions, HttpMethod } from "src/types";

export function httpMethodDecorator(method: HttpMethod | ExpressMethod): HttpHandlerDecorator {
  return (path: string = "/", options?: HttpHandlerOptions) => (proto: unknown, handler: string | symbol) =>
    addHandlerMeta(proto, { method, options, path, handler });
}

export function errorMethodDecorator(): ErrorHandlerDecorator {
  return (path: string = "/", options?: ErrorHandlerOptions) => (proto: unknown, handler: string | symbol) =>
    addHandlerMeta(proto, { method: "USE", options, path, handler, errorHandler: true });
}
