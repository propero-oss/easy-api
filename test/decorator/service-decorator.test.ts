import { errorOrRequestHandler } from "src/decorator";

describe("decorator/service-decorator.ts", () => {
  describe("errorOrRequestHandler(errorHandler, handler)", () => {
    it("should return a 3 argument function for regular handlers", () => {
      expect(errorOrRequestHandler(false, () => undefined)).toHaveLength(3);
    });

    it("should return a 4 argument function for error handlers", () => {
      expect(errorOrRequestHandler(true, () => undefined)).toHaveLength(4);
    });

    it("should remove the error argument for the list and attach it to the request object", () => {
      const err = new Error();
      const req = { foo: "foo" };
      const middleware = errorOrRequestHandler(true, (req) => req);
      // @ts-expect-error
      expect(middleware(err, req, true, true).__error).toEqual(err);
    });
  });

  describe("createMethodWrapper(cls, instance, handler, options, errorHandler)", () => {
    it.todo("should create a middleware for a given handler definition");
    it.todo("should forward errors to the next function");
  });

  describe("Service(pathOrOptions, maybeOptions)", () => {
    it.todo("should generate a factory for creating an express router for a given class");
  });
});
