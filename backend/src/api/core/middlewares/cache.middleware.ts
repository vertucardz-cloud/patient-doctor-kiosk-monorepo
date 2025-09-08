import { Request, Response, NextFunction } from 'express';
import { CacheService } from '@services/cache.service';

class Cache {
  private static instance: Cache;

  private constructor() {}

  static get(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }

  read(req: Request, res: Response, next: NextFunction): void {
    if (!CacheService.isCachable(req)) {
      return next();
    }

    const cacheKey = CacheService.key(req);
    const cached = CacheService.engine.get(cacheKey);

    if (cached) {
      res.status(200).json(cached);
      return;
    }

    next();
  }
}

const cache = Cache.get();
export { cache as Cache };
