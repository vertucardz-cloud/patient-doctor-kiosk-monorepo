import { Request, Response, NextFunction } from 'express';

import { CONTENT_TYPE } from '@config/environment.config';
import { CONTENT_TYPE as CONTENT_TYPE_ENUM } from '@enums';
import { IResponse } from '@interfaces';
import { SanitizeService } from '@services/sanitizer.service';

class Sanitize {
  private static instance: Sanitize;

  private constructor() {}

  static get(): Sanitize {
    if (!Sanitize.instance) {
      Sanitize.instance = new Sanitize();
    }
    return Sanitize.instance;
  }

  sanitize(req: Request, res: IResponse, next: NextFunction): void {
    const { data } = res.locals;

    if (
      req.method === 'DELETE' ||
      CONTENT_TYPE !== CONTENT_TYPE_ENUM['application/json'] ||
      data === undefined ||
      data === null
      // ||
      // !SanitizeService.hasEligibleMember(data)
    ) {
      return next();
    }

    res.locals.data; //= SanitizeService.process(data);
    next();
  }
}

const sanitize = Sanitize.get();
export { sanitize as Sanitize };
