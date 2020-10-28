import { Service } from "src/decorator";
import { createService } from "src/util";

describe("util/create-service.ts", () => {
  describe("createService(instance)", () => {
    it("should create a router for a given service instance", () => {
      @Service()
      class Test {}
      const instance = new Test();
      expect(createService(instance).stack).toHaveLength(0);
    });
    it("should wrap routers with provided paths", () => {
      @Service("test")
      class Test {}
      const instance = new Test();
      expect(createService(instance).stack).toHaveLength(1);
    });
  });
});
