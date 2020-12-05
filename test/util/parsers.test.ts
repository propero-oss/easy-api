import { parserIgnoreUndefined, parserRequire, intParser, floatParser, dateParser, ParseError } from "src/util";

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

  describe("parserRequire(parser)", () => {
    it("should pass values other than null or undefined to the given parser", () => {
      const intParser = parserRequire(parseInt);
      expect(intParser("4")).toEqual(4);
    });
    it("should throw for undefined or null values", () => {
      const intParser = parserRequire(parseInt);
      // @ts-expect-error
      expect(() => intParser(undefined)).toThrow(ParseError);
    });
  });

  describe("intParser(value)", () => {
    it("should parse integers in a given base", () => {
      expect(intParser(2)("11")).toEqual(3);
    });
  });

  describe("floatParser(value)", () => {
    it("should parse a float value and round to a given precision", () => {
      expect(floatParser()("1.111")).toEqual(1.111);
      expect(floatParser(2)("1.111")).toEqual(1.11);
      expect(floatParser(2)("1.116")).toEqual(1.12);
    });
  });

  describe("dateParser(value)", () => {
    it("should parse a date value", () => {
      const date = new Date("2020-01-01T00:00:00.000Z");
      expect(dateParser()(date.toISOString())).toEqual(date);
    });
  });
});
