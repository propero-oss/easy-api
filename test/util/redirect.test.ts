import { isRedirect, redirect } from "src/util";

describe("util/redirect.ts", () => {
  it("should generate redirect objects", async () => {
    const red = redirect("/");
    expect(isRedirect(red)).toBeTruthy();
    expect(isRedirect({ path: "/", status: 302 })).toBeFalsy();
  });
});
