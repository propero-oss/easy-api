import { createService } from "src/index";

describe("index", () => {
  it("exports its members", () => {
    expect(createService).toBeDefined();
  });
});
