import { Router } from "express";
import { getRouterMeta } from "src/meta";

export function createService(instance: unknown): Router {
  const { path, factory } = getRouterMeta(Object.getPrototypeOf(instance).constructor);
  const router = factory(instance);
  if (path && path !== "" && path !== "/") {
    const wrapper = Router();
    wrapper.use(path, router);
    return wrapper;
  }
  return router;
}
