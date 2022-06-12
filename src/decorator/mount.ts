import { Router } from "express";
import { createService } from "./create-service";
import { Constructor } from "../util";

export function createMount(root: Router): (path?: string, ...args: unknown[]) => ClassDecorator {
  return (path, ...args) => {
    return (ctor) => {
      const instance = new (ctor as unknown as Constructor)(...args);
      if (path) root.use(path, createService(instance));
      else root.use(createService(instance));
    };
  };
}
