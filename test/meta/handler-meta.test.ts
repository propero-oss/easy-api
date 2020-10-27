import { addHandlerMeta, getHandlerMeta } from "src/meta";

describe("meta/handler-meta.ts", () => {
  const meta = { method: "GET", path: "/", handler: "foo", options: {} } as const;
  const meta2 = { method: "POST", path: "/", handler: "foo", options: {} } as const;
  const first = { ...meta, first: true } as const;
  const last = { ...meta, last: true } as const;

  describe("addHandlerMeta(proto, meta)", () => {
    it("should attach handler meta to a class", () => {
      // eslint-disable-next-line
      class Test { foo() {} }
      addHandlerMeta(Test.prototype, meta);
      expect(getHandlerMeta(Test)).toEqual([meta]);
    });

    it("should prioritize handlers with first attribute", () => {
      // eslint-disable-next-line
      class Test { foo() {} }
      addHandlerMeta(Test.prototype, meta);
      addHandlerMeta(Test.prototype, first);
      expect(getHandlerMeta(Test)).toEqual([first, meta]);
    });

    it("should prioritize every over handler with last attribute", () => {
      // eslint-disable-next-line
      class Test { foo() {} }
      addHandlerMeta(Test.prototype, last);
      addHandlerMeta(Test.prototype, meta);
      expect(getHandlerMeta(Test)).toEqual([meta, last]);
    });
  });

  describe("getHandlerMeta(obj)", () => {
    it("should get handler meta for an object", () => {
      // eslint-disable-next-line
      class Test { foo() {} }
      addHandlerMeta(Test.prototype, meta);
      expect(getHandlerMeta(Test)).toEqual([meta]);
    });
    it("should add options if none are present", () => {
      const meta = { method: "GET", path: "/", handler: "foo" } as const;
      // eslint-disable-next-line
      class Test { foo() {} }
      addHandlerMeta(Test.prototype, meta);
      expect(getHandlerMeta(Test)).toEqual([{ ...meta, options: {} }]);
    });
    it("should get handler meta from the class prototype chain", () => {
      /* eslint-disable */
      class Parent { foo() {} }
      class Child1 extends Parent {}
      class Child2 extends Child1 {}
      class Child3 extends Child2 {}
      class Child4 extends Child3 {}
      /* eslint-enable */
      addHandlerMeta(Parent.prototype, meta);
      addHandlerMeta(Child1.prototype, meta2);
      addHandlerMeta(Child2.prototype, first);
      addHandlerMeta(Child3.prototype, last);

      expect(getHandlerMeta(Child4)).toEqual([first, meta2, meta, last]);
    });
  });
});
