import { ExpressResponseType, HttpHandlerSignature, ResponseGenerator } from "src/types";

const responseTypes: Partial<Record<ExpressResponseType, ResponseGenerator>> = {};
export function registerResponseType(responseType: string, generator: ResponseGenerator): void {
  responseTypes[responseType as ExpressResponseType] = generator;
}

registerResponseType("auto", (middleware, status) => async (req, res, next) => {
  const result = await middleware(req, res, next);
  if (status) res.status(status);
  if (result == null) return res.send();
  if (typeof result === "string") return res.send(result);
  if (typeof result === "object" && result && "pipe" in result && typeof (result as any).pipe === "function") {
    // Assume stream
    (result as any).on("end", () => res.end());
    (result as any).pipe(res);
  }
  res.json(result);
});

registerResponseType("stream", (middleware, status) => async (req, res, next) => {
  const result: any = await middleware(req, res, next);
  if (status) res.status(status);
  result.on("enc", () => res.end());
  result.pipe(res);
});

registerResponseType("json", (middleware, status) => async (req, res, next) => {
  const result = await middleware(req, res, next);
  if (status) res.status(status);
  res.json(result);
  return result;
});

registerResponseType("raw", (middleware, status) => async (req, res, next) => {
  const result = await middleware(req, res, next);
  if (status) res.status(status);
  res.send(result);
  return result;
});

registerResponseType("none", (middleware, status) => async (req, res, next) => {
  await middleware(req, res, next);
  if (status) res.status(status);
  res.end();
});

export function createResponseGenerator(
  middleware: HttpHandlerSignature,
  responseType: ExpressResponseType,
  status?: number
): HttpHandlerSignature {
  const generator = responseTypes[responseType];
  return generator ? generator(middleware, status) : middleware;
}
