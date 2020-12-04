import { Body, createInjectorMiddleware, createRequestInjector, Get } from "src/decorator";

describe("decorator/request-meta-decorator-factory", () => {
  const foo = { foo: "foo" };
  const bar = { bar: "bar" };
  const baz = { baz: "baz" };

  describe("createInjectorMiddleware()", () => {
    it("should forward middleware arguments if no meta is defined", () => {
      // eslint-disable-next-line
      class Test { @Get() foo(req: any, res: any, next: any) { return [req, res, next]; } }
      const middleware = createInjectorMiddleware(Test.prototype, "foo", Test.prototype.foo);
      // @ts-expect-error
      expect(middleware(foo, bar, baz)).toEqual([foo, bar, baz]);
    });

    it("should create a decorator that injects parameter values from express middleware arguments", async () => {
      // eslint-disable-next-line
      class Test { @Get() foo(@Body() body: any) { return body; } }
      const middleware = createInjectorMiddleware(Test.prototype, "foo", Test.prototype.foo);
      // @ts-expect-error
      const result = await middleware({ body: foo }, {}, {});
      expect(result).toEqual(foo);
    });

    it("should call the next function if an error occurs in metadata resolution", async () => {
      // eslint-disable-next-line
      class Test { @Get() foo(@Body("test") body: any) { return body; } }
      const middleware = createInjectorMiddleware(Test.prototype, "foo", Test.prototype.foo);
      const next = jest.fn();
      // @ts-expect-error
      await middleware({}, {}, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe("createRequestInjector()", () => {
    it("should create a parameter injector based on express middleware arguments", async () => {
      const Decorator = createRequestInjector(() => (req, res, next) => [req, res, next]);
      // eslint-disable-next-line
      class Test { @Get() foo(@Decorator foo: any) { return foo; } }
      const middleware = createInjectorMiddleware(Test.prototype, "foo", Test.prototype.foo);
      // @ts-expect-error
      const result = await middleware(foo, bar, baz);
      expect(result).toEqual([foo, bar, baz]);
    });

    it("should provide correct context to the decorator generators", async () => {
      const Decorator = createRequestInjector((cls) => (req, res, next, cxt) => [cls, cxt]);
      // eslint-disable-next-line
      class Test { @Get() foo(@Decorator foo: any[]) { return foo; } }
      const instance = new Test();
      const middleware = createInjectorMiddleware(Test.prototype, "foo", Test.prototype.foo);
      // @ts-expect-error
      const result = await middleware.call(instance, foo, bar, baz);
      expect(result).toEqual([Test.prototype, instance]);
    });
  });
});
