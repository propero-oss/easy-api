import { All, Catch, Delete, Get, Head, Options, Patch, Post, Put, Use } from "src/decorator";
import { getHandlerMeta } from "src/meta";

describe("decorator/http-method-decorators.ts", () => {
  function withDecoration(decoration: MethodDecorator) {
    // eslint-disable-next-line
    class Test { public foo() {} }
    decoration(Test.prototype, "foo", Object.getOwnPropertyDescriptor(Test.prototype, "foo") as any);
    return getHandlerMeta(Test)[0];
  }

  function optionsFor(method: string) {
    return { method, handler: "foo", options: {}, path: "/" };
  }

  describe("Get()", () => {
    it("should attach a GET request handler", () => {
      expect(withDecoration(Get())).toEqual(optionsFor("GET"));
    });
  });

  describe("Post()", () => {
    it("should attach a POST request handler", () => {
      expect(withDecoration(Post())).toEqual(optionsFor("POST"));
    });
  });

  describe("Patch()", () => {
    it("should attach a PATCH request handler", () => {
      expect(withDecoration(Patch())).toEqual(optionsFor("PATCH"));
    });
  });

  describe("Put()", () => {
    it("should attach a PUT request handler", () => {
      expect(withDecoration(Put())).toEqual(optionsFor("PUT"));
    });
  });

  describe("Delete()", () => {
    it("should attach a DELETE request handler", () => {
      expect(withDecoration(Delete())).toEqual(optionsFor("DELETE"));
    });
  });

  describe("Head()", () => {
    it("should attach a HEAD request handler", () => {
      expect(withDecoration(Head())).toEqual(optionsFor("HEAD"));
    });
  });

  describe("Options()", () => {
    it("should attach a OPTIONS request handler", () => {
      expect(withDecoration(Options())).toEqual(optionsFor("OPTIONS"));
    });
  });

  describe("Use()", () => {
    it("should attach an express USE handler", () => {
      expect(withDecoration(Use())).toEqual(optionsFor("USE"));
    });
  });

  describe("All()", () => {
    it("should attach an express ALL handler", () => {
      expect(withDecoration(All())).toEqual(optionsFor("ALL"));
    });
  });

  describe("Catch()", () => {
    it("should attach an express error handler", () => {
      expect(withDecoration(Catch())).toEqual({ ...optionsFor("USE"), errorHandler: true });
    });
  });
});
