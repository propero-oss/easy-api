import { createMount } from "src/index";

describe("index", () => {
  it("exports its members", () => {
    expect(createMount).toBeDefined();
  });
});
