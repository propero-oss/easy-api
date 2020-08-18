import type { NextFunction, Request, Response, Router } from "express";
import { IncomingHttpHeaders } from "http";
import { HTTP_HANDLER_META, ROUTER_META } from "src/constants";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
export type ExpressMethod = "USE";
export type ExpressResponseType = "none" | "raw" | "json";

export interface HttpHandlerOptions {
  contentType?: string | string[];
  accept?: string | string[];
  headers?: IncomingHttpHeaders;
  responseType?: ExpressResponseType;
}

export interface HttpHandlerMeta {
  method: HttpMethod | ExpressMethod;
  options?: HttpHandlerOptions;
  path: string;
  handler: string | symbol;
}

export interface WithHandlerMeta {
  [HTTP_HANDLER_META]?: HttpHandlerMeta[];
}

export interface RouterMeta {
  path: string;
  factory: (instance: unknown) => Router;
}

export interface WithRouterMeta {
  [ROUTER_META]?: RouterMeta;
}

export type HttpHandlerDecorator = (path: string, options?: HttpHandlerOptions) => MethodDecorator;
export type HttpHandlerSignature = (req: Request, res: Response, next: NextFunction) => unknown;
