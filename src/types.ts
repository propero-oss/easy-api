import { IncomingHttpHeaders } from "http";
import { HTTP_HANDLER_META } from "src/constants";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "OPTIONS";

export interface HttpHandlerOptions {
  contentType?: string | string[];
  accept?: string | string[];
  headers?: IncomingHttpHeaders;
}

export interface HttpHandlerMeta {
  method: HttpMethod;
  options?: HttpHandlerOptions;
  path: string;
  handler: string | symbol;
}

export interface WithHandlerMeta {
  [HTTP_HANDLER_META]?: HttpHandlerMeta[];
}

export type HttpHandlerDecorator = (path: string, options?: HttpHandlerOptions) => MethodDecorator;
