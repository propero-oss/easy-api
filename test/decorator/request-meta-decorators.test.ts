import {
  Body,
  CatchError,
  Cookie,
  createInjectorMiddleware,
  Get,
  Header,
  Hostname,
  Ip,
  Next,
  Param,
  Query,
  Req,
  Res,
  Session,
  SignedCookie,
  UserAgent,
} from "src/decorator";

describe("decorator/request-meta-decorators.ts", () => {
  const foo = { foo: "foo" };
  const bar = { bar: "bar" };
  const baz = { baz: "baz" };

  async function decorated(decorator: ParameterDecorator, req: any, res?: any, next?: any) {
    // eslint-disable-next-line
    class Test { @Get() foo(param: any) { return param; } }
    decorator(Test.prototype, "foo", 0);
    const middleware = createInjectorMiddleware(Test.prototype, "foo", Test.prototype.foo);
    return await middleware(req, res, next);
  }

  describe("Req", () => {
    it("should inject the request object", async () => {
      expect(await decorated(Req, foo)).toEqual(foo);
    });
  });

  describe("Res", () => {
    it("should inject the response object", async () => {
      expect(await decorated(Res, foo, bar)).toEqual(bar);
    });
  });

  describe("Next", () => {
    it("should inject the next function", async () => {
      expect(await decorated(Next, foo, bar, baz)).toEqual(baz);
    });
  });

  describe("Param(name, parser)", () => {
    it("should inject a given request parameter", async () => {
      expect(await decorated(Param("foo"), { params: foo })).toEqual("foo");
    });

    it("should use a given parser on parameters", async () => {
      expect(await decorated(Param("foo", parseInt as any), { params: { foo: "2" } })).toEqual(2);
    });
  });

  describe("Query(name, parser)", () => {
    it("should inject a given query parameter", async () => {
      expect(await decorated(Query("foo"), { query: foo })).toEqual("foo");
    });

    it("should use a given parse on parameters", async () => {
      expect(await decorated(Query("foo", parseInt as any), { query: { foo: "2" } })).toEqual(2);
    });
  });

  describe("Header", () => {
    it("should inject a given header", async () => {
      expect(await decorated(Header("accept"), { headers: { accept: foo } })).toEqual(foo);
    });
  });

  describe("Ip", () => {
    it("should inject the client ip", async () => {
      expect(await decorated(Ip, { ip: "::1" })).toEqual("::1");
    });
  });

  describe("Hostname", () => {
    it("should inject the client hostname", async () => {
      expect(await decorated(Hostname, { hostname: "foo" })).toEqual("foo");
    });
  });

  describe("UserAgent", () => {
    it("should inject the user agent header value", async () => {
      expect(await decorated(UserAgent, { headers: { "user-agent": "foo" } })).toEqual("foo");
    });
  });

  describe("Body", () => {
    it("should inject the request body if no field is provided", async () => {
      expect(await decorated(Body(), { body: foo })).toEqual(foo);
    });

    it("should inject a field of the body if it is provided", async () => {
      expect(await decorated(Body("foo"), { body: foo })).toEqual("foo");
    });
  });

  describe("Session", () => {
    it("should inject the express session if no field is provided", async () => {
      expect(await decorated(Session(), { session: foo })).toEqual(foo);
    });

    it("should inject a field of the session if it is provided", async () => {
      expect(await decorated(Session("foo"), { session: foo })).toEqual("foo");
    });
  });

  describe("CatchError", () => {
    it("should inject the middleware error", async () => {
      expect(await decorated(CatchError, { __error: foo })).toEqual(foo);
    });
  });

  describe("Cookie", () => {
    it("should inject a cookie", async () => {
      expect(await decorated(Cookie("foo"), { cookies: foo })).toEqual("foo");
    });

    it("should inject all cookies", async () => {
      expect(await decorated(Cookie(), { cookies: foo })).toEqual(foo);
    });
  });

  describe("SignedCookie", () => {
    it("should inject a cookie", async () => {
      expect(await decorated(SignedCookie("foo"), { signedCookies: foo })).toEqual("foo");
    });

    it("should inject all cookies", async () => {
      expect(await decorated(SignedCookie(), { signedCookies: foo })).toEqual(foo);
    });
  });
});
