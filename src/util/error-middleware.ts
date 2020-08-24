import type { NextFunction, Request, Response } from "express";

export function errorMiddleware(
  errOrReq: unknown | Request,
  reqOrRes: Request | Response,
  resOrNext: Response | NextFunction,
  nextOrNone: NextFunction | undefined
): [Request, Response, NextFunction] {
  if (nextOrNone) {
    // Error middleware call
    (reqOrRes as Request).__error = errOrReq;
    return [reqOrRes as Request, resOrNext as Response, nextOrNone];
  } else return [errOrReq as Request, reqOrRes as Response, resOrNext as NextFunction];
}
