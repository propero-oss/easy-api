import { NextFunction, Response, Request } from "express";
import { createParameterMetaAccessors, createParameterMetaDecoratorFactory } from "src/meta";

export type RequestMetaGenerator<T = unknown> = (req: Request, res: Response, next: NextFunction) => T;
export const { getMeta, setMeta } = createParameterMetaAccessors<RequestMetaGenerator>("request-meta");
export const createRequestInjector = createParameterMetaDecoratorFactory(setMeta);
export function createInjectorMiddleware(
  target: unknown,
  property: string | symbol,
  method: unknown
): (req: Request, res: Response, next: NextFunction) => unknown {
  const meta = Object.values(getMeta(target, property));
  if (meta.length === 0) return method as any;
  return (req, res, next) => res.json((method as any)(...meta.map((extract) => extract(req, res, next))));
}
