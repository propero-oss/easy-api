import { arrayWrap } from "src/util/array-wrap";

describe("util/array-wrap.ts", () => {
  describe("arrayWrap()", () => {
    it("should wrap non-array arguments as single element arrays", () => {
      expect(arrayWrap("test")).toEqual(["test"]);
      expect(arrayWrap(5)).toEqual([5]);
      expect(arrayWrap({})).toEqual([{}]);
    });

    it("should not wrap existing arrays", () => {
      expect(arrayWrap(["test"])).toEqual(["test"]);
      expect(arrayWrap([5])).toEqual([5]);
      expect(arrayWrap([{}])).toEqual([{}]);
    });
  });
});
