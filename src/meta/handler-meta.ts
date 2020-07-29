import { HTTP_HANDLER_META } from "src/constants";
import { HttpHandlerMeta, WithHandlerMeta } from "src/types";

export function addHandlerMeta(proto: unknown, meta: HttpHandlerMeta): void {
  if (!meta.options) meta.options = {};
  const cls = (proto as any).constructor as WithHandlerMeta;
  const metas = cls[HTTP_HANDLER_META] ?? ((cls[HTTP_HANDLER_META] = []) as HttpHandlerMeta[]);
  metas.push(meta);
}

export function getHandlerMeta(obj: unknown): Required<HttpHandlerMeta>[] {
  const metas: Required<HttpHandlerMeta>[] = [];
  do {
    const meta = (obj as any)[HTTP_HANDLER_META];
    if (meta) metas.push(...meta);
    obj = Object.getPrototypeOf(obj)! as WithHandlerMeta;
  } while (obj && obj !== Function.prototype && obj !== Object.prototype);
  return metas;
}
