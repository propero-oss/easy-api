import { ExpressResponseType, HttpHandlerSignature, ResponseGenerator } from "src/types";

const responseTypes: Partial<Record<ExpressResponseType, ResponseGenerator>> = {};
export function registerResponseType(responseType: string, generator: ResponseGenerator): void {
  responseTypes[responseType as ExpressResponseType] = generator;
}

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
