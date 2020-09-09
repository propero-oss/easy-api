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
  // Get parameter metadata values for parameter injection
  const meta = Object.values(getMeta(target, property));

  // If there is nothing to be injected, pass on the method as is (treated as middleware or handler)
  if (meta.length === 0) return method as any;

  // Else return a wrapper middleware where all parameters are already resolved
  return async (req, res, next) => {
    try {
      const parameters = await Promise.all(meta.map((extract) => extract(req, res, next)));
      return await (method as any)(...parameters);
    } catch (e) {
      return next(e);
    }
  };
}
