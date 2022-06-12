import { ROUTER_META } from "src/constants";
import { WithRouterMeta, RouterMeta } from "src/types";
import { Constructor, getHierarchy, hasOwnProperty } from "src/util";

export function addRouterMeta(cls: unknown, meta: RouterMeta): void {
  (cls as WithRouterMeta)[ROUTER_META] = meta;
}

export function getRouterMeta(cls: Constructor): RouterMeta {
  const ctor = getHierarchy(cls).find((it) => hasOwnProperty(it, ROUTER_META));
  if (!ctor) throw new TypeError(`${cls && (cls as any).name} is not a mountable service`);
  return (ctor as unknown as WithRouterMeta)[ROUTER_META]!;
}
