import { normalizePathOptions } from "src/util";

describe("util/normalize-path-options.ts", () => {
  describe("normalizePathOptions(pathOrOptions, maybeOptions)", () => {
    it("should return path '/', no options, if called without arguments", () => {
      expect(normalizePathOptions()).toEqual(["/", undefined]);
    });
    it("should return path '/', provided options, if called with an options argument", () => {
      const opts = { foo: "bar" };
      expect(normalizePathOptions(opts)).toEqual(["/", opts]);
    });
    it("should return provided path, no options, if called with a string argument", () => {
      expect(normalizePathOptions("/users")).toEqual(["/users", undefined]);
    });
    it("should return provided path and options", () => {
      const opts = { foo: "bar" };
      expect(normalizePathOptions("/users", opts)).toEqual(["/users", opts]);
    });
  });
});
