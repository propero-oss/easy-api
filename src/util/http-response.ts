import { NextFunction, Request, Response } from "express";
import { HttpHandlerSignature, HttpResponse } from "src/types";
import { getStatusCode, getStatusText } from "src/util/response-status";

export function isHttpResponse(it: unknown): it is HttpResponse {
  if (!it || typeof it !== "object") return false;
  if ("status" in it || "data" in it || "redirect" in it) {
    if ("status" in it && it["status"] != null && typeof it["status"] !== "number") return false;
    return !("redirect" in it && it["redirect"] != null && typeof it["redirect"] !== "string");
  }
  return false;
}

export function applyHttpResponse(it: HttpResponse, res: Response) {
  const { status, data, headers, redirect, contentType, contentLength, raw } = it;
  if (status != null) res.status(status);
  if (headers != null || contentType != null || contentLength != null)
    applyHeaders(res, { "content-type": contentType, "content-length": contentLength }, headers);
  if (redirect) res.redirect(redirect);
  else if ("data" in it) {
    if (raw || typeof data === "string") return res.send(data);
    if (isStream(data)) return applyStream(data, res);
    if (typeof data === "object" || typeof data === "number") return res.json(data);
    if (typeof data === "undefined") return res.end();
    return res.send(data);
  }
}

export function handleResponse(middleware: HttpHandlerSignature): HttpHandlerSignature {
  return async function (req, res, next) {
    try {
      const result = await middleware(req, res, next);
      if (isHttpResponse(result)) return applyHttpResponse(result, res);
      else if (isStream(result)) return applyStream(result, res);
      else if (typeof result === "string") return res.send(result);
      else if (typeof result === "undefined") return res.end();
      else return res.json(result);
    } catch (e) {
      next(e);
    }
  };
}

export function handleError(err: unknown, res: Response, debug = false) {
  const statusCode = getStatusCode(err);
  if (statusCode) res.status(statusCode);
  if (typeof err === "string") return res.send(err);
  else if (isStream(err)) return applyStream(err, res);
  else if (typeof err === "undefined") return res.end();
  else if (typeof err === "object" && err != null && err instanceof Error)
    return res.json({
      error: getStatusText(statusCode!),
      detail: debug ? err : err.message,
      type: err.name ?? err.constructor?.name,
      status: statusCode,
    });
  else return res.json(err);
}

export function createExpressErrorHandler(debug: boolean | ((req: Request, err: unknown) => boolean) = false) {
  const isDebug = typeof debug === "function" ? debug : () => debug;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (err: unknown, req: Request, res: Response, next: NextFunction) => handleError(err, res, isDebug(req, err));
}

interface ReadableStream {
  pipe(target: any): void;
  on(ev: "end", handler: () => void): void;
}

export function applyHeaders(res: Response, ...headers: (Record<string, undefined | number | string | string[]> | undefined)[]) {
  const normalised: Record<string, string | string[]> = {};
  for (const header of headers)
    if (header)
      for (const [key, value] of Object.entries(header)) {
        const val = Array.isArray(value) ? value.filter((it) => it).map((it) => it.toString()) : value;
        if (val == null || (Array.isArray(val) && !val.length)) continue;
        normalised[key.toLowerCase()] = Array.isArray(val) ? val : val.toString();
      }
  for (const [key, value] of Object.entries(normalised)) res.setHeader(key, value);
}

export function isStream(data: unknown): data is ReadableStream {
  return typeof data === "object" && !!data && "pipe" in data && typeof data["pipe"] === "function";
}

export function applyStream(stream: ReadableStream, res: Response) {
  stream.on("end", () => res.end());
  stream.pipe(res);
}
