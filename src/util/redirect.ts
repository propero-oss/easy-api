export class Redirect {
  static PERMANENT = 308 as const;
  static PERMANENT_LOOSE = 301 as const;
  static TEMPORARY = 307 as const;
  static TEMPORARY_LOOSE = 303 as const;
  static TEMPORARY_LEGACY = 302 as const;

  constructor(public path: string, public status: 301 | 308 | 302 | 303 | 307 = Redirect.TEMPORARY) {}
}

export function redirect(path: string, status?: 301 | 308 | 302 | 303 | 307): Redirect {
  return new Redirect(path, status);
}

export function isRedirect(obj: unknown): obj is Redirect {
  return !!obj && typeof obj === "object" && obj instanceof Redirect;
}
