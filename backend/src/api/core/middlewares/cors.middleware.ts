import { notAcceptable } from '@hapi/boom';
import { Request, Response, NextFunction } from 'express';
import { CONTENT_TYPE } from '@config/environment.config';
import { CONTENT_TYPE as CONTENT_TYPE_ENUM } from '@enums';

class Cors {
  private static instance: Cors;

  private constructor() { }

  static get(): Cors {
    if (!Cors.instance) {
      Cors.instance = new Cors();
    }
    return Cors.instance;
  }

  validate(req: Request, res: Response, next: NextFunction): void {
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin');
      res.setHeader('Access-Control-Allow-Methods', '*');
      res.status(200).end();
      return;
    }

    if (req.method === 'GET' || req.method === 'DELETE' || req.path === '/api/v1/webhooks') { //! Todo: need to modify this in future
      req.headers['content-type'] = 'application/json';
    }

    let contentType = req.headers['content-type'];

    if (contentType?.includes(';')) {
      contentType = (contentType.split(';').filter(ct => ct === 'application/json')[0]).trim();
    }

    if (!contentType) {
      return next(notAcceptable(`Content-Type header must be ${CONTENT_TYPE} or 'multipart/form-data'`));
    }

    if (CONTENT_TYPE !== contentType && !contentType.includes('multipart/form-data')) {
      return next(notAcceptable(`Content-Type must be ${CONTENT_TYPE} or 'multipart/form-data'`));
    }

    // if (!req.headers.origin) {
    //   return next(notAcceptable('Origin header must be specified'));
    // }

    next();
  }
}

const cors = Cors.get();
export { cors as Cors };
