import { HelloWorld } from "src/index";

describe("index", () => {
  it("exports its members", () => {
    expect(HelloWorld).toBe("Hello World");
  });
});
