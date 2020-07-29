import { addHandlerMeta } from "src/meta";
import { HttpHandlerDecorator, HttpHandlerOptions, HttpMethod } from "src/types";

export function httpMethodDecorator(method: HttpMethod): HttpHandlerDecorator {
  return (path: string, options?: HttpHandlerOptions) => (proto: unknown, handler: string | symbol) =>
    addHandlerMeta(proto, { method, options, path, handler });
}
