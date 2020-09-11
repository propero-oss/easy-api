import {
  buildFilters,
  createRequestFilter,
  filterRegistry,
  needsRequestFilter,
  registerFilter,
  stringOrRegExpMatch,
} from "src/util/create-request-filter";

describe("util/create-test-filter.ts", () => {
  describe("registerFilter(string, filterFn)", () => {
    it("should register a filter for a given option", () => {
      const filterFn = () => () => false;
      registerFilter("method", filterFn);
      expect(filterRegistry.method).toContain(filterFn);
      filterRegistry.method?.splice(filterRegistry.method?.indexOf(filterFn), 1);
    });
  });

  describe("needsRequestFilter(HandlerOptions)", () => {
    it("should return true if any handler option keys are set", () => {
      expect(needsRequestFilter({ accept: "foo/bar" })).toBeTruthy();
      expect(needsRequestFilter({ contentType: "foo/bar", foo: "bar" } as any)).toBeTruthy();
    });

    it("should return false if no or only unknown option keys are set", () => {
      expect(needsRequestFilter({})).toBeFalsy();
      expect(needsRequestFilter({ foo: "bar" } as any)).toBeFalsy();
    });
  });

  describe("buildFilters(HandlerOptions)", () => {
    it("should compile all registered request checks into an array", () => {
      expect(buildFilters({ accept: "foo/bar" })).toHaveLength(1);
      expect(buildFilters({ method: "GET", classes: [] })).toHaveLength(2);
    });

    it("should not compile unregistered request checks", () => {
      expect(buildFilters({ foo: "bar" } as any)).toHaveLength(0);
    });
  });

  describe("stringOrRegExpMatch(string, MaybeArray<string | Regexp>)", () => {
    it("should compare strings case insensitively with startsWith", () => {
      expect(
        stringOrRegExpMatch(
          "Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW",
          "content-type: multipart/form-data"
        )
      ).toBeTruthy();
      expect(stringOrRegExpMatch("foo", "bar")).toBeFalsy();
    });
    it("should test regular expressions against strings", () => {
      expect(stringOrRegExpMatch("foobar", /^foo.*r$/)).toBeTruthy();
      expect(stringOrRegExpMatch("foo", /bar/)).toBeFalsy();
    });
    it("should test if one or more members of arrays match against a string", () => {
      expect(stringOrRegExpMatch("foobar", [/foo/, "bar"])).toBeTruthy();
      expect(stringOrRegExpMatch("foo", [/^bar/, "foo"])).toBeTruthy();
      expect(stringOrRegExpMatch("foo", ["bar", /baz/])).toBeFalsy();
      expect(stringOrRegExpMatch("foobar", [/^bar/, "bar"])).toBeFalsy();
    });
  });

  describe("createRequestFilters(HandlerOptions)", () => {
    it("should compile a filter function for given handler options", () => {
      expect(createRequestFilter({ method: "GET" })({ method: "GET" } as any)).toBeTruthy();
      expect(createRequestFilter({ method: "GET" })({ method: "POST" } as any)).toBeFalsy();
      expect(createRequestFilter({ method: "GET", classes: Error })({ method: "GET", __error: new Error() } as any)).toBeTruthy();
      expect(createRequestFilter({ method: "GET", classes: Error })({ method: "POST", __error: new Error() } as any)).toBeFalsy();
      expect(createRequestFilter({ method: "GET", classes: TypeError })({ method: "GET", __error: new SyntaxError() } as any)).toBeFalsy();
    });
  });

  describe("filterRegistry", () => {
    describe(".contentType", () => {
      it("should create a filter function that checks the content-type header", () => {
        expect(filterRegistry.contentType?.[0]?.("image/")({ headers: { "content-type": "image/png" } } as any)).toBe(true);
        expect(filterRegistry.contentType?.[0]?.("text/")({ headers: { "content-type": "image/png" } } as any)).toBe(false);
      });
    });

    describe(".accept", () => {
      it("should create a filter function that checks the result of Request#accepts()", () => {
        expect(filterRegistry.accept?.[0]?.("application/json")({ accepts: () => ["application/json"] } as any)).toBe(true);
        expect(
          filterRegistry.accept?.[0]?.("application/json")({ accepts: () => ["application/pdf", "image/jpeg", "text/html"] } as any)
        ).toBe(false);
      });
    });

    describe(".headers", () => {
      it("should create a filter function that checks if given headers are set", () => {
        const headers = filterRegistry.headers?.[0];
        expect(headers?.({ "content-type": "application/json" })({ headers: { "content-type": "application/json" } } as any)).toBe(true);
        expect(headers?.({ "content-type": "application/json" })({ headers: { "content-type": "text/html" } } as any)).toBe(false);
        expect(
          headers?.({ "content-type": "application/json", "accept-language": "en-US" })({
            headers: { "content-type": "application/json", "accept-language": "en-US" },
          } as any)
        ).toBe(true);
        expect(
          headers?.({ "content-type": "application/json", "accept-language": "en-US" })({
            headers: { "content-type": "application/json" },
          } as any)
        ).toBe(false);
        expect(
          headers?.({ "content-type": "application/json", "accept-language": "en-US" })({
            headers: { "content-type": "application/pdf", "accept-language": "en-US" },
          } as any)
        ).toBe(false);
      });
    });

    describe(".method", () => {
      it("should create a filter function that checks the request method", () => {
        expect(filterRegistry.method?.[0]?.("GET")({ method: "GET" } as any)).toBe(true);
        expect(filterRegistry.method?.[0]?.("GET")({ method: "POST" } as any)).toBe(false);
      });
    });

    describe(".classes", () => {
      it("should create a filter function that checks the instance type of an error object", () => {
        expect(filterRegistry.classes?.[0]?.(Error)({ __error: new Error() } as any)).toBe(true);
        expect(filterRegistry.classes?.[0]?.(TypeError)({ __error: new RangeError() } as any)).toBe(false);
      });
    });
  });
});
