import { HTTP_HANDLER_META } from "src/constants";
import { HttpHandlerMeta, WithHandlerMeta } from "src/types";
import { Constructor, getHierarchy, hasOwnProperty } from "src/util";

export function addHandlerMeta(proto: unknown, meta: HttpHandlerMeta): void {
  if (!meta.options) meta.options = {};
  const cls = (proto as any).constructor as WithHandlerMeta;
  if (!hasOwnProperty(cls, HTTP_HANDLER_META)) cls[HTTP_HANDLER_META] = [];
  cls[HTTP_HANDLER_META]!.push(meta);
}

export function getHandlerMeta(ctor: Constructor): Required<HttpHandlerMeta>[] {
  const ctors = getHierarchy(ctor).filter((ctor) => hasOwnProperty(ctor, HTTP_HANDLER_META));
  const metaArrays = ctors.map((ctor) => (ctor as any)[HTTP_HANDLER_META]) as Required<HttpHandlerMeta>[];
  const metas = metaArrays.flat();
  const firsts = metas.filter((it) => it.first);
  const lasts = metas.filter((it) => it.last);
  const rest = metas.filter((it) => !it.first && !it.last);
  return [...firsts, ...rest, ...lasts] as Required<HttpHandlerMeta>[];
}
