import type { NextFunction, Request, Response, Router, RouterOptions } from "express";
import { IncomingHttpHeaders } from "http";
import { HTTP_HANDLER_META, ROUTER_META } from "src/constants";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
export type ExpressMethod = "USE" | "ALL";
export interface HttpHandlerDecorator {
  (path?: string, options?: HttpHandlerOptions): MethodDecorator;
  (options?: HttpHandlerOptions): MethodDecorator;
}
export interface ErrorHandlerDecorator {
  (path?: string, options?: ErrorHandlerOptions): MethodDecorator;
  (options?: ErrorHandlerOptions): MethodDecorator;
}
export type HttpHandlerSignature = (req: Request, res: Response, next: NextFunction) => unknown;
export type HttpErrorHandlerSignature = (err: unknown, req: Request, res: Response, next?: NextFunction) => unknown;
export type HttpHandlerMiddleware = HttpHandlerSignature | HttpErrorHandlerSignature;
export type ResponseGenerator = (middleware: HttpHandlerSignature, status?: number) => HttpHandlerSignature;
export type RequestFilter = (req: Request) => boolean;
export type MaybeArray<T> = T | T[];
export type MaybePromise<T> = T | Promise<T>;
export type Parser<T, From = string> = (it: From) => MaybePromise<T>;

export interface HttpHandlerOptions {
  contentType?: MaybeArray<string | RegExp>;
  accept?: MaybeArray<string | RegExp>;
  headers?: IncomingHttpHeaders;
  before?: HttpHandlerMiddleware[];
  after?: HttpHandlerMiddleware[];
  status?: number;
}

export interface ErrorHandlerOptions extends HttpHandlerOptions {
  classes?: MaybeArray<unknown>;
  method?: MaybeArray<HttpMethod>;
}

export interface HttpHandlerMeta {
  method: HttpMethod | ExpressMethod;
  options?: HttpHandlerOptions;
  path: string;
  handler: string | symbol;
  first?: boolean;
  last?: boolean;
  errorHandler?: boolean;
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

export interface ServiceOptions extends HttpHandlerOptions {
  routerOptions: RouterOptions;
}

declare module "express" {
  export interface Request {
    __error?: unknown;
  }
}

export interface HttpResponse<T = any> {
  status?: number;
  data?: T;
  redirect?: string;
  headers?: Record<string, string | string[]>;
  contentType?: string;
  raw?: boolean;
  contentLength?: number;
}

export type AsyncHttpResponse<T> = Promise<HttpResponse<T>>;
