import { Response } from "express";
import { applyHttpResponse, createExpressErrorHandler, handleError, handleResponse, isHttpResponse } from "src/util";

function responseStub(): Response {
  return {
    status: jest.fn(),
    redirect: jest.fn(),
    end: jest.fn(),
    write: jest.fn(),
    send: jest.fn(),
    json: jest.fn(),
    setHeader: jest.fn(),
  } as any;
}

describe("util/http-response.ts", () => {
  describe("isHttpResponse(it)", () => {
    it("should return false for non-object values", async () => {
      expect(isHttpResponse("foo")).toBeFalsy();
    });

    it("should return false for objects missing data, status and redirect", async () => {
      expect(isHttpResponse({})).toBeFalsy();
      expect(isHttpResponse({ foo: "bar" })).toBeFalsy();
    });

    it("should return false for objects with invalid status or redirect fields", async () => {
      expect(isHttpResponse({ status: "no" })).toBeFalsy();
      expect(isHttpResponse({ redirect: 200 })).toBeFalsy();
    });

    it("should return true for objects with valid configurations", async () => {
      expect(isHttpResponse({ status: 200 })).toBeTruthy();
      expect(isHttpResponse({ redirect: "/test" })).toBeTruthy();
      expect(isHttpResponse({ data: {} })).toBeTruthy();
      expect(isHttpResponse({ data: undefined })).toBeTruthy();
    });
  });

  describe("applyHttpResponse(it, res)", () => {
    it("should set a status code if one is given", async () => {
      const res = responseStub();
      applyHttpResponse({ status: 200 }, res as Response);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should redirect if a path is provided", async () => {
      const res = responseStub();
      applyHttpResponse({ redirect: "/foo" }, res as Response);
      expect(res.redirect).toHaveBeenCalledWith("/foo");
    });

    it("should apply content-type and content-length headers", async () => {
      const res = responseStub();
      applyHttpResponse({ status: 200, contentType: "image/png", contentLength: 1024 }, res as Response);
      expect(res.setHeader).toHaveBeenCalledTimes(2);
      expect(res.setHeader).toHaveBeenNthCalledWith(1, "content-type", "image/png");
      expect(res.setHeader).toHaveBeenNthCalledWith(2, "content-length", "1024");
    });

    it("should send raw or string responses as is", async () => {
      const res = responseStub();
      applyHttpResponse({ data: "foo" }, res as Response);
      expect(res.send).toHaveBeenLastCalledWith("foo");
      const data = { foo: "bar" };
      applyHttpResponse({ raw: true, data }, res as Response);
      expect(res.send).toHaveBeenLastCalledWith(data);
    });

    it("should end requests on empty data", async () => {
      const res = responseStub();
      applyHttpResponse({ data: undefined }, res as Response);
      expect(res.end).toHaveBeenCalled();
    });

    it("should send objects and numbers as json", async () => {
      const res = responseStub();
      const data = { foo: "bar" };
      applyHttpResponse({ data }, res as Response);
      expect(res.json).toHaveBeenCalledWith(data);
      applyHttpResponse({ data: 5 }, res as Response);
      expect(res.json).toHaveBeenLastCalledWith(5);
    });

    it("should pipe streams to the response and end them on end", async () => {
      const res = responseStub();
      const stream = { pipe: jest.fn(), on: (ev: string, handler: () => void) => handler() };
      applyHttpResponse({ data: stream }, res as Response);
      expect(stream.pipe).toHaveBeenCalledWith(res);
      expect(res.end).toHaveBeenCalled();
    });

    it("should pass through things it has no idea how to handle", async () => {
      const res = responseStub();
      const data = Symbol("foo");
      applyHttpResponse({ data }, res as Response);
      expect(res.send).toHaveBeenCalledWith(data);
    });
  });

  describe("handleResponse(middleware)", () => {
    it("should handle http responses", async () => {
      const res = responseStub();
      const mw = handleResponse(() => ({ status: 200 }));
      await mw(undefined as any, res as Response, undefined as any);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should handle streams", async () => {
      const res = responseStub();
      const stream = { pipe: jest.fn(), on: (ev: string, handler: () => void) => handler() };
      const mw = handleResponse(() => stream);
      await mw(undefined as any, res as Response, undefined as any);
      expect(stream.pipe).toHaveBeenCalledWith(res);
      expect(res.end).toHaveBeenCalled();
    });

    it("should send plain strings", async () => {
      const res = responseStub();
      const mw = handleResponse(() => "foo");
      await mw(undefined as any, res as Response, undefined as any);
      expect(res.send).toHaveBeenCalledWith("foo");
    });

    it("should end when no result is defined", async () => {
      const res = responseStub();
      const mw = handleResponse(() => undefined);
      await mw(undefined as any, res as Response, undefined as any);
      expect(res.end).toHaveBeenCalled();
    });

    it("should treat everything else as json", async () => {
      const res = responseStub();
      let value: any;
      const mw = handleResponse(() => value);
      const run = async (val: any) => {
        value = val;
        await mw(undefined as any, res as Response, undefined as any);
        expect(res.json).toHaveBeenLastCalledWith(val);
      };
      await run(5);
      await run({ foo: "bar" });
      await run(null);
    });

    it("should pass errors to the next function", async () => {
      const error = new Error("foo");
      const mw = handleResponse(() => {
        throw error;
      });
      const next = jest.fn();
      await mw(undefined as any, undefined as any, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("handleError", () => {
    it("should set the status code of a response appropriately", async () => {
      const res = responseStub();
      handleError("ok", res);
      expect(res.status).toHaveBeenLastCalledWith(200);
      handleError(new Error("Bad Request"), res);
      expect(res.status).toHaveBeenLastCalledWith(400);
      handleError(new Error(), res);
      expect(res.status).toHaveBeenLastCalledWith(500);
    });
    it("should send strings as is", async () => {
      const res = responseStub();
      handleError("this is a text", res);
      expect(res.send).toHaveBeenCalledWith("this is a text");
    });
    it("should end the response for undefined", async () => {
      const res = responseStub();
      handleError(undefined, res);
      expect(res.end).toHaveBeenCalled();
    });
    it("should pass through streams", async () => {
      const res = responseStub();
      const stream = { pipe: jest.fn(), on: (ev: string, handler: () => void) => handler() };
      handleError(stream, res);
      expect(stream.pipe).toHaveBeenCalledWith(res);
      expect(res.end).toHaveBeenCalled();
    });
    it("should not give out too many details on errors in production mode", async () => {
      const res = responseStub();
      handleError(new Error("foo"), res);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal Server Error",
        detail: "foo",
        type: "Error",
        status: 500,
      });
    });
    it("should give out the entire error object in debug mode", () => {
      const res = responseStub();
      const err = new Error("foo");
      handleError(err, res, true);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal Server Error",
        detail: err,
        type: "Error",
        status: 500,
      });
    });
    it("should treat non-error objects as json payloads", async () => {
      const res = responseStub();
      handleError({ foo: "bar" }, res);
      expect(res.json).toHaveBeenCalledWith({ foo: "bar" });
    });
  });

  describe("createExpressErrorHandler", () => {
    it("should create an express error handler", async () => {
      const spy = jest.fn(() => true);
      const res = responseStub();
      const req = { foo: "bar" } as any;
      const err = new Error("unauthorized");
      const handler = createExpressErrorHandler(spy);
      handler(err, req, res, () => undefined);
      expect(spy).toHaveBeenCalledWith(req, err);
    });
  });
});
