import { Request } from "express";
import { IncomingHttpHeaders } from "http";
import { createRequestInjector } from "src/decorator/request-meta-decorator-factory";

export const Req: ParameterDecorator = createRequestInjector(() => (req) => req);
export const Res: ParameterDecorator = createRequestInjector(() => (req, res) => res);
export const Next: ParameterDecorator = createRequestInjector(() => (req, res, next) => next);

export const Param = (name: string, parser?: (str: any, req: Request, context: unknown) => unknown): ParameterDecorator =>
  createRequestInjector(() => (req, res, next, context) => {
    if (parser) return parser.call(context, req.params[name], req, context);
    return req.params[name];
  });
export const Query = (name: string, parser?: (str: any, req: Request, context: unknown) => unknown): ParameterDecorator =>
  createRequestInjector(() => (req, res, next, context) => {
    if (parser) return parser.call(context, req.query[name] as any, req, context);
    return req.query[name];
  });
export const Header = (name: keyof IncomingHttpHeaders): ParameterDecorator => createRequestInjector(() => (req) => req.headers[name]);

export const Ip = createRequestInjector(() => (req) => req.ip);
export const Hostname = createRequestInjector(() => (req) => req.hostname);
export const UserAgent = createRequestInjector(() => (req) => req.headers["user-agent"]);

export const Body = (field?: string): ParameterDecorator =>
  createRequestInjector(() => (req) => (field != null ? req.body[field] : req.body));
export const Session = (field?: string): ParameterDecorator =>
  createRequestInjector(() => (req) => (field != null ? (req as any).session?.[field] : (req as any).session));

export const Cookie = (field?: string): ParameterDecorator =>
  createRequestInjector(() => (req) => (field != null ? req.cookies[field] : req.cookies));
export const SignedCookie = (field?: string): ParameterDecorator =>
  createRequestInjector(() => (req) => (field != null ? req.signedCookies[field] : req.signedCookies));

export const CatchError = createRequestInjector(() => (req) => (req as any).__error);
