export function normalizePathOptions<Options>(pathOrOptions?: string | Options, maybeOptions?: Options): [string, Options | undefined] {
  let options: Options | undefined = undefined;
  let path = "/";
  if (maybeOptions) options = maybeOptions;
  if (typeof pathOrOptions === "string") path = pathOrOptions;
  if (typeof pathOrOptions === "object") options = pathOrOptions;
  return [path, options];
}
