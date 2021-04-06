import { createService } from "@propero/easy-api";
import { IRouter } from "express";

export type ExtractPromises<Array> = {
  [Key in keyof Array]: Array[Key] extends Promise<infer T> ? T : Array[Key];
};

export type ConstructorWithArgs<Args extends unknown[] = unknown[], Type = unknown> = new (...args: ExtractPromises<Args>) => Type;

export interface ServiceStatistic {
  path: string;
  args: unknown[];
  cls: ConstructorWithArgs;
  time: number;
  start: Date;
  end: Date;
}

export type ServiceStatistics = Record<string, ServiceStatistic>;

export interface Mount {
  Mount<Args extends unknown[]>(path: string, ...args: Args): (cls: ConstructorWithArgs<Args>) => void;
  initialized: () => Promise<ServiceStatistics>;
}

export function createMount(app: IRouter): Mount {
  const promises: Record<string, Promise<ServiceStatistic>> = {};

  function Mount<Args extends unknown[]>(path: string, ...args: Args): (cls: ConstructorWithArgs<Args>) => void {
    return (cls) => {
      const start = new Date();
      promises[`${cls.name ?? "<anonymous>"} - ${path}`] = Promise.all(args).then(
        (args): ServiceStatistic => {
          const instance = new cls(...(args as ExtractPromises<Args>));
          const end = new Date();
          app.use(path, createService(instance));
          return { path, args, cls: cls as ConstructorWithArgs, time: +end - +start, start, end };
        }
      );
    };
  }

  async function initialized(): Promise<ServiceStatistics> {
    const entryPromises = Object.entries(promises).map(([key, promise]) => promise.then((value) => [key, value]));
    return Object.fromEntries(await Promise.all(entryPromises));
  }

  return { Mount, initialized };
}
