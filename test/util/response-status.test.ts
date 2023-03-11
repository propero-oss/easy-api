import { getStatusCode, getStatusText, ResponseStatus } from "src/util";

describe("util/response-status.ts", () => {
  describe("getStatusText", () => {
    it("should get a status text for a given status code", async () => {
      expect(getStatusText(ResponseStatus.NETWORK_AUTHENTICATION_REQUIRED)).toEqual("Network Authentication Required");
    });
  });
  describe("getStatusCode", () => {
    it("should return status codes passed in as is", async () => {
      expect(getStatusCode(404)).toEqual(404);
    });
    it("should ignore status codes that are invalid", async () => {
      expect(getStatusCode(-9999)).toBeUndefined();
    });
    it("should ignore undefined, null and boolean values", async () => {
      expect(getStatusCode(undefined)).toBeUndefined();
      expect(getStatusCode(true)).toBeUndefined();
      expect(getStatusCode(false)).toBeUndefined();
      expect(getStatusCode(null)).toBeUndefined();
    });
    it("should ignore functions", async () => {
      expect(getStatusCode(() => 400)).toBeUndefined();
    });
    it("should return status codes for strings if applicable", async () => {
      expect(getStatusCode("400 OK")).toEqual(400);
      expect(getStatusCode("bad request")).toEqual(400);
      expect(getStatusCode("foo bar")).toBeUndefined();
      expect(getStatusCode("that is not acceptable")).toEqual(ResponseStatus.NOT_ACCEPTABLE);
    });
    it("should return status codes for errors", async () => {
      expect(getStatusCode(new Error())).toEqual(500);
      expect(getStatusCode(new Error("Bad Request"))).toEqual(400);
      expect(getStatusCode(new Error("403"))).toEqual(403);
      expect(getStatusCode(Object.assign(new Error("foo"), { status: 401 }))).toEqual(401);
    });
    it("should return status codes for 'status', 'response', 'error' and 'message' properties", async () => {
      expect(getStatusCode({ status: 400 })).toEqual(400);
      expect(getStatusCode({ response: 400 })).toEqual(400);
      expect(getStatusCode({ error: 400 })).toEqual(400);
      expect(getStatusCode({ message: 400 })).toEqual(400);

      expect(getStatusCode({ status: "bad request" })).toEqual(400);
      expect(getStatusCode({ error: "bad request" })).toEqual(400);
      expect(getStatusCode({ message: "bad request" })).toEqual(400);
      expect(getStatusCode({ response: "bad request" })).toEqual(400);

      expect(getStatusCode({ status: { status: 500 } })).toEqual(500);
      expect(getStatusCode({ response: { response: 500 } })).toEqual(500);
      expect(getStatusCode({ error: { error: 500 } })).toEqual(500);
      expect(getStatusCode({ message: { message: 500 } })).toEqual(500);

      expect(getStatusCode({ status: {} })).toBeUndefined();
      expect(getStatusCode({ response: {} })).toBeUndefined();
      expect(getStatusCode({ error: {} })).toBeUndefined();
      expect(getStatusCode({ message: {} })).toBeUndefined();

      expect(getStatusCode({ response: { status: 404 } })).toEqual(404);
    });
  });
});
