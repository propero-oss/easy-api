import express from "express";
import { createService } from "src";

export const app = express();
export const mount = (path: string | undefined, instance: unknown): void => {
  path ? app.use(path, createService(instance)) : app.use(createService(instance));
};
export const Mount =
  (path?: string, ...args: unknown[]): ClassDecorator =>
  (Cls) =>
    mount(path, new (Cls as any)(...args));
