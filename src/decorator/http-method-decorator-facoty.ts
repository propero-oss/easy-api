import { addHandlerMeta } from "src/meta";
import { ExpressMethod, HttpHandlerDecorator, HttpHandlerOptions, HttpMethod } from "src/types";

export function httpMethodDecorator(method: HttpMethod | ExpressMethod): HttpHandlerDecorator {
  return (path: string, options?: HttpHandlerOptions) => (proto: unknown, handler: string | symbol) =>
    addHandlerMeta(proto, { method, options, path, handler });
}
