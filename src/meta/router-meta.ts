import { ROUTER_META } from "src/constants";
import { WithRouterMeta, RouterMeta } from "src/types";

export function addRouterMeta(cls: unknown, meta: RouterMeta): void {
  (cls as WithRouterMeta)[ROUTER_META] = meta;
}

export function getRouterMeta(cls: unknown): RouterMeta {
  do {
    const meta = (cls as any)[ROUTER_META];
    if (meta) return meta;
    cls = Object.getPrototypeOf(cls)! as WithRouterMeta;
  } while (cls && cls !== Function.prototype && cls !== Object.prototype);
  throw new TypeError(`${cls && (cls as any).name} is not a mountable service`);
}
