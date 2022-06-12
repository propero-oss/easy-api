import { createResponseGenerator, registerResponseType } from "src/decorator";
import { Redirect, redirect } from "src/util";

describe("decorator/response-generator.ts", () => {
  const middleware = async () => undefined;
  const middleware2 = async () => "foo";
  async function generator(name: string, req: any, res?: any, next?: any, status?: number, result?: any) {
    return await createResponseGenerator(() => result, name as any, status)(req, res, next);
  }
  const foo = { foo: "foo" };

  describe("createResponseGenerator(middleware, type, status)", () => {
    it("should return the provided middleware if no generator exists for the given type", () => {
      expect(createResponseGenerator(middleware2, "does-not-exist" as any)).toEqual(middleware2);
    });

    it("should return generated middleware if a generator exists", async () => {
      expect(createResponseGenerator(middleware2, "none")).not.toEqual(middleware2);
    });
  });

  describe("registerResponseType(type, generator)", () => {
    it("should register a generator for a given response type", () => {
      registerResponseType("test", () => middleware);
      expect(createResponseGenerator(middleware2, "test" as any)).toEqual(middleware);
    });
  });

  describe("response type [none]", () => {
    it("should end the request", async () => {
      const end = jest.fn();
      await generator("none", undefined, { end });
      expect(end).toHaveBeenCalled();
    });

    it("should set a status code if one is given", async () => {
      const status = jest.fn();
      const end = jest.fn();
      await generator("none", undefined, { end, status }, undefined, 404);
      expect(end).toHaveBeenCalled();
      expect(status).toHaveBeenCalledWith(404);
    });

    it("should redirect if a redirect is returned", async () => {
      const end = jest.fn();
      const writeHead = jest.fn();
      await generator("none", undefined, { end, writeHead }, undefined, undefined, redirect("/test", Redirect.PERMANENT));
      expect(writeHead).toHaveBeenCalledWith(Redirect.PERMANENT, { location: "/test" });
    });
  });

  describe("response type [raw]", () => {
    it("should send the response object as is", async () => {
      const send = jest.fn();
      const result = await generator("raw", undefined, { send }, undefined, undefined, foo);
      expect(send).toHaveBeenCalledWith(foo);
      expect(result).toEqual(foo);
    });

    it("should set a status code if one is given", async () => {
      const status = jest.fn();
      const send = jest.fn();
      const result = await generator("raw", undefined, { send, status }, undefined, 500, foo);
      expect(send).toHaveBeenCalledWith(foo);
      expect(result).toEqual(foo);
      expect(status).toHaveBeenCalledWith(500);
    });

    it("should redirect if a redirect is returned", async () => {
      const end = jest.fn();
      const writeHead = jest.fn();
      await generator("none", undefined, { end, writeHead }, undefined, undefined, redirect("/test", Redirect.PERMANENT));
      expect(writeHead).toHaveBeenCalledWith(Redirect.PERMANENT, { location: "/test" });
    });
  });

  describe("response type [json]", () => {
    it("should send the response object as json", async () => {
      const json = jest.fn();
      const result = await generator("json", undefined, { json }, undefined, undefined, foo);
      expect(json).toHaveBeenCalledWith(foo);
      expect(result).toEqual(foo);
    });

    it("should set a status code if one is given", async () => {
      const status = jest.fn();
      const json = jest.fn();
      const result = await generator("json", undefined, { json, status }, undefined, 401, foo);
      expect(json).toHaveBeenCalledWith(foo);
      expect(result).toEqual(foo);
      expect(status).toHaveBeenCalledWith(401);
    });

    it("should redirect if a redirect is returned", async () => {
      const end = jest.fn();
      const writeHead = jest.fn();
      await generator("none", undefined, { end, writeHead }, undefined, undefined, redirect("/test", Redirect.PERMANENT));
      expect(writeHead).toHaveBeenCalledWith(Redirect.PERMANENT, { location: "/test" });
    });
  });

  describe("response type [stream]", () => {
    it("should forward streams as responses", async () => {
      const end = jest.fn();
      const pipe = jest.fn();
      const on = (ev: string, fn: any) => {
        expect(ev).toEqual("end"); // make sure only end event
        fn();
      };
      const res = { end };
      await generator("stream", undefined, res, undefined, undefined, { on, pipe });
      expect(pipe).toHaveBeenCalledWith(res); // pipe to response
      expect(end).toHaveBeenCalled(); // call req.end() on end event
    });

    it("should set a status code if one is given", async () => {
      const on = jest.fn();
      const pipe = jest.fn();
      const status = jest.fn();
      await generator("stream", undefined, { status }, undefined, 400, { on, pipe });
      expect(status).toHaveBeenCalledWith(400);
    });

    it("should redirect if a redirect is returned", async () => {
      const end = jest.fn();
      const writeHead = jest.fn();
      await generator("none", undefined, { end, writeHead }, undefined, undefined, redirect("/test", Redirect.PERMANENT));
      expect(writeHead).toHaveBeenCalledWith(Redirect.PERMANENT, { location: "/test" });
    });
  });

  describe("response type [auto]", () => {
    it("should send an empty response for a undefined result", async () => {
      const send = jest.fn();
      await generator("auto", undefined, { send });
      expect(send).toHaveBeenCalledWith();
    });

    it("should send strings as is", async () => {
      const send = jest.fn();
      await generator("auto", undefined, { send }, undefined, undefined, "foo");
      expect(send).toHaveBeenCalledWith("foo");
    });

    it("should forward streams to the response object", async () => {
      const end = jest.fn();
      const pipe = jest.fn();
      const on = (ev: string, fn: any) => {
        expect(ev).toEqual("end"); // make sure only end event
        fn();
      };
      const res = { end };
      await generator("auto", undefined, res, undefined, undefined, { on, pipe });
      expect(pipe).toHaveBeenCalledWith(res); // pipe to response
      expect(end).toHaveBeenCalled(); // call req.end() on end event
    });

    it("should send everything else as json", async () => {
      const json = jest.fn();
      await generator("auto", undefined, { json }, undefined, undefined, foo);
      expect(json).toHaveBeenCalledWith(foo);
    });

    it("should set a status code if one is given", async () => {
      const status = jest.fn();
      const send = jest.fn();
      await generator("auto", undefined, { status, send }, undefined, 201);
      expect(status).toHaveBeenCalledWith(201);
    });

    it("should redirect if a redirect is returned", async () => {
      const end = jest.fn();
      const writeHead = jest.fn();
      await generator("none", undefined, { end, writeHead }, undefined, undefined, redirect("/test", Redirect.PERMANENT));
      expect(writeHead).toHaveBeenCalledWith(Redirect.PERMANENT, { location: "/test" });
    });
  });
});
