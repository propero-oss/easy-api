import { Router } from "express";
import { Service, createMount } from "src/decorator";

describe("decorator/mount.ts", () => {
  const mountpoint = Router();
  const reuse = () => (mountpoint.use = jest.fn());

  it("should create a mounting decorator", async () => {
    reuse();
    const Mount = createMount(mountpoint);
    expect(typeof Mount).toEqual("function");
  });

  it("should instantiate and mount a service", async () => {
    const fn = reuse();
    const Mount = createMount(mountpoint);

    @Mount(undefined, "foo", "bar")
    @Mount("/test", "foo", "bar")
    @Service()
    class Test {
      constructor(foo: string, bar: string) {
        expect(foo).toEqual("foo");
        expect(bar).toEqual("bar");
      }
    }

    expect(fn).toHaveBeenCalledTimes(2);
  });
});
