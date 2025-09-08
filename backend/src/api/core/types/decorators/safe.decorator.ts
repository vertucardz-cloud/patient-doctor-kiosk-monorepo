import { Controller } from '@classes';
import { Media } from '@prisma/client';
import { MediaService } from '@services/media.service';
import { Request, Response, NextFunction } from 'express';

/**
 * @decorator Safe
 *
 * @description Endpoint decorator which catch errors fired while endpoint execution
 *
 * @param target Endpoint method reference
 * @param key Endpoint name
 */
const Safe = (): any => {
  return (target: Controller | any, propertyKey: string, descriptor: PropertyDescriptor): any => {
    const method = target[propertyKey] as (req: Request, res: Response, next: NextFunction) => Promise<void> | void;
    target[propertyKey] = function (...args: any[]): void {
      const { files } = args[0] as { files: any[] };
      const next = args[2] as (e?: Error) => void;
      const result = method.apply(this, args as [Request, Response, NextFunction]) as Promise<void> | void;
      if (result && result instanceof Promise) {
        result
          .then(() => next())
          .catch((e) => {
            const scopedError = e as Error;
            if (files && files.length > 0) {
              files.map((f: Media) => MediaService.remove(f.id));
            }
            next(scopedError);
          });
      }
    };
    return target[propertyKey] as (req: Request, res: Response, next: NextFunction) => void;
  };
};

export { Safe };
