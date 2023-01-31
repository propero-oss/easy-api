import { Response } from "express";
import { HttpHandlerSignature, HttpResponse } from "src/types";

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
