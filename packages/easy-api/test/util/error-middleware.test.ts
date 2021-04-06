import { errorMiddleware } from "src/util";

describe("util/error-middleware.ts", () => {
  describe("errorMiddleware(errOrReq, reqOrRes, resOrNext, nextOrNone)", () => {
    /* eslint-disable */
    const err = new Error();
    const next = () => {/* next */};
    const middlewareArgs: any[] = [{ req: true }, { res: true }, next];
    const middlewareArgsWithError: any[] = [{ req: true, __error: err }, { res: true }, next];
    const errorMiddlewareArgs: any[] = [err, { req: true }, { res: true }, next];
    /* eslint-enable */

    it("should forward regular middleware arguments", () => {
      // @ts-expect-error
      expect(errorMiddleware(...middlewareArgs)).toEqual(middlewareArgs);
    });

    it("should attach errors to the request object", () => {
      // @ts-expect-error
      expect(errorMiddleware(...errorMiddlewareArgs)).toEqual(middlewareArgsWithError);
    });
  });
});
