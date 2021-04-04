import "reflect-metadata";
import { createParameterMetaAccessors, createParameterMetaDecoratorFactory } from "src/meta";

describe("meta/parameter-meta.ts", () => {
  const meta = { foo: "bar" };

  describe("createParameterMetaAccessors(name)", () => {
    const { getMeta, setMeta } = createParameterMetaAccessors<any>();

    it("should attach metadata to a given parameter", () => {
      // eslint-disable-next-line
      class Test { foo() {} }
      setMeta(Test, "foo", 0, meta);
      expect(getMeta(Test, "foo")).toEqual({ 0: meta });
    });

    it("should overwrite existing parameter metadata", () => {
      // eslint-disable-next-line
      class Test { foo() {} }
      setMeta(Test, "foo", 0, { bar: "baz" });
      setMeta(Test, "foo", 0, meta);
      expect(getMeta(Test, "foo")).toEqual({ 0: meta });
    });
  });
  describe("createParameterMetaDecoratorFactory(setMeta)(generator)", () => {
    const { getMeta, setMeta } = createParameterMetaAccessors<any>();
    const factory = createParameterMetaDecoratorFactory<any>(setMeta);

    it("should create a parameter decorator for a given generator", () => {
      const ParamDecorator = factory(() => meta);
      // eslint-disable-next-line
      class Test { foo(@ParamDecorator param: any) {} }
      expect(getMeta(Test, "foo")).toEqual({ 0: meta });
    });

    it("should provide method information including method type if 'reflect-metadata' has been installed", () => {
      const ParamDecorator = factory((target, key, typehint) => [target, key, typehint]);
      const Noop: (target: unknown, key: string | symbol) => void = () => undefined;
      // eslint-disable-next-line
      class Test { @Noop foo(@ParamDecorator param: string) {} }
      expect(getMeta(Test, "foo")).toEqual({ 0: [Test.prototype, "foo", String] });
    });
  });
});
