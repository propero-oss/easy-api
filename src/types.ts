import type { NextFunction, Request, Response, Router } from "express";
import { IncomingHttpHeaders } from "http";
import { HTTP_HANDLER_META, ROUTER_META } from "src/constants";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
export type ExpressMethod = "USE" | "ALL";
export type ExpressResponseType = "none" | "raw" | "json";
export type HttpHandlerDecorator = (path?: string, options?: HttpHandlerOptions) => MethodDecorator;
export type ErrorHandlerDecorator = (path?: string, options?: ErrorHandlerOptions) => MethodDecorator;
export type HttpHandlerSignature = (req: Request, res: Response, next: NextFunction) => unknown;
export type HttpErrorHandlerSignature = (err: unknown, req: Request, res: Response, next?: NextFunction) => unknown;
export type HttpHandlerMiddleware = HttpHandlerSignature | HttpErrorHandlerSignature;
export type ResponseGenerator = (middleware: HttpHandlerSignature, status?: number) => HttpHandlerSignature;

export interface HttpHandlerOptions {
  contentType?: string | string[];
  accept?: string | string[];
  headers?: IncomingHttpHeaders;
  responseType?: ExpressResponseType;
  before?: HttpHandlerMiddleware[];
  after?: HttpHandlerMiddleware[];
  status?: number;
}

export interface ErrorHandlerOptions extends HttpHandlerOptions {
  classes?: unknown[];
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

declare module "express" {
  export interface Request {
    __error?: unknown;
  }
}
