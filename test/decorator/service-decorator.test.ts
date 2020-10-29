import { createMethodWrapper, errorOrRequestHandler, Get, Post, Service } from "src/decorator";
import { createService } from "src/util";

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
    it("should create a middleware for a given handler definition", async () => {
      // eslint-disable-next-line
      class Test { foo() {} }
      const instance = new Test();
      const end = jest.fn();
      const wrapper = createMethodWrapper(Test, instance, "foo", { responseType: "none" }, false);
      await (wrapper as any)({}, { end }, {});
      expect(end).toHaveBeenCalledWith();
    });

    it("should forward errors to the next function", async () => {
      // eslint-disable-next-line
      class Test { foo() {} }
      const instance = new Test();
      const next = jest.fn();
      const wrapper = createMethodWrapper(Test, instance, "foo", { responseType: "none" }, false);
      await (wrapper as any)({}, {}, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe("Service(pathOrOptions, maybeOptions)", () => {
    it("should generate a factory for creating an express router for a given class", () => {
      // eslint-disable-next-line
      @Service() class Test { @Get() foo() {} @Get() bar() {} @Post() baz() {} }
      const service = createService(new Test());
      expect(service.stack).toHaveLength(3);
    });
  });
});
