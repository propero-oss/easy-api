import { ErrorHandler, errorMethodDecorator, HttpHandler, httpMethodDecorator } from "src/decorator";
import { getHandlerMeta } from "src/meta";

describe("decorator/http-method-decorator-factory.ts", () => {
  describe("HttpHandler", () => {
    it("should attach handler meta to a given method", () => {
      // eslint-disable-next-line
      class Test { @HttpHandler("GET") public foo() {} }
      expect(getHandlerMeta(Test)).toEqual([
        {
          handler: "foo",
          method: "GET",
          options: {},
          path: "/",
        },
      ]);
    });
  });

  describe("ErrorHandler", () => {
    it("should attach error handler meta to a given method", () => {
      // eslint-disable-next-line
      class Test { @ErrorHandler("GET") public foo() {} }
      expect(getHandlerMeta(Test)).toEqual([
        {
          handler: "foo",
          method: "GET",
          options: {},
          path: "/",
          errorHandler: true,
        },
      ]);
    });
  });

  describe("httpMethodDecorator", () => {
    it("should create a http method decorator", () => {
      const Decorator = httpMethodDecorator("POST");
      // eslint-disable-next-line
      class A { @HttpHandler("POST") public foo() {} }
      // eslint-disable-next-line
      class B { @Decorator() public foo() {} }
      expect(getHandlerMeta(A)).toEqual(getHandlerMeta(B));
    });
  });

  describe("errorMethodDecorator", () => {
    const Decorator = errorMethodDecorator();
    // eslint-disable-next-line
    class A { @ErrorHandler("USE") public foo() {} }
    // eslint-disable-next-line
    class B { @Decorator() public foo() {} }
    expect(getHandlerMeta(A)).toEqual(getHandlerMeta(B));
  });
});
