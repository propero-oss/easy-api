import { addRouterMeta, getRouterMeta } from "src/meta";
import { RouterMeta } from "src/types";

describe("meta/router-meta.ts", () => {
  const meta: RouterMeta = { path: "/", factory: () => undefined as any };
  describe("addRouterMeta(cls, meta)", () => {
    it("should add metadata to a given class", () => {
      class Test {}
      addRouterMeta(Test, meta);
      expect(getRouterMeta(Test)).toEqual(meta);
    });
  });
  describe("getRouterMeta(cls)", () => {
    class Parent {}
    class Child1 extends Parent {}
    class Child2 extends Child1 {}
    class Child3 extends Child2 {}
    addRouterMeta(Parent, meta);

    it("should get metadata for a given class", () => {
      expect(getRouterMeta(Parent)).toEqual(meta);
    });

    it("should get metadata from a given classes prototype chain", () => {
      expect(getRouterMeta(Child3)).toEqual(meta);
    });

    it("should throw for a class without router meta", () => {
      expect(() => getRouterMeta(class {})).toThrow();
    });
  });
});
