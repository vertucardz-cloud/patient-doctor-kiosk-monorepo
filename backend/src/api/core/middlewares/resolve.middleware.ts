import { Request, Response, NextFunction } from 'express';
import httpsStatus from 'http-status';
import { expectationFailed } from '@hapi/boom';

import { IResponse } from '@interfaces';
import { getStatusCode } from '@utils/http.util';
import { CacheService } from '@services/cache.service';

class Resolve {
  private static instance: Resolve;

  private constructor() {}

  static get(): Resolve {
    if (!Resolve.instance) {
      Resolve.instance = new Resolve();
    }
    return Resolve.instance;
  }

  write(req: Request, res: IResponse, next: NextFunction): void {
    const { data, meta } = res.locals;
    const hasContent = data !== undefined;
    const hasNullContent = data === null;
    const status = getStatusCode(req.method, hasContent && !hasNullContent);

    if (req.method === 'DELETE') {
      const id = req.url.split('/').pop();
      if (!id || isNaN(parseInt(id, 10))) {
        return next(expectationFailed('ID parameter must be a number'));
      }
      res.status(status as number).end();
      return;
    }

    if (!hasContent) {
      return next();
    }

    if (CacheService.isCachable(req)) {
      CacheService.engine.put(
        CacheService.key(req),
        data,
        CacheService.duration
      );
    }

    res.status(status as number);
    if (meta) {
      res.json({ data, meta });
    } else {
      res.json(data);
    }
  }
}

const resolve = Resolve.get();
export { resolve as Resolve };
