import { parserIgnoreUndefined } from "src/util";

describe("util/parsers.ts", () => {
  describe("parserIgnoreUndefined(parser)", () => {
    it("should ignore a parser if the passed value is undefined or null", () => {
      const intParser = parserIgnoreUndefined(parseInt);
      expect(intParser(undefined)).toEqual(undefined);
    });

    it("should pass values not equal to null or undefined to the provided parser", () => {
      const intParser = parserIgnoreUndefined(parseInt);
      expect(intParser("5")).toEqual(5);
    });
  });
});
