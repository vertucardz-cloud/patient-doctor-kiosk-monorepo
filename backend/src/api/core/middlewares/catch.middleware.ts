// import { Request, Response, NextFunction } from 'express';
// import { Logger } from '@services/logger.service';
// import { ErrorFactory } from '@factories/error.factory';
// import { IHTTPError, IRequest } from '@interfaces';

// class Catch {
//   private static instance: Catch;

//   private constructor() {}

//   static get(): Catch {
//     if (!Catch.instance) {
//       Catch.instance = new Catch();
//     }
//     return Catch.instance;
//   }

//   factory(
//     err: Error,
//     req: Request,
//     res: Response,
//     next: (e: IHTTPError) => void
//   ): void {
//     next(ErrorFactory.get(err));
//   }

//   log(
//     err: IHTTPError,
//     req: IRequest,
//     res: Response,
//     next: (e: IHTTPError) => void
//   ): void {
//     const { user } = req;
//     const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
//     const logData = {
//       ip,
//       httpVersion: req.httpVersion,
//       statusCode: err.statusCode,
//       method: req.method,
//       url: req.url,
//       userId: user?.id || 'unknown',
//       error: err.message,
//       stack: err.stack,
//       payload: req.body ? JSON.stringify(req.body) : undefined,
//     };

//     Logger.log('error', JSON.stringify(logData));
//     next(err);
//   }

//   exit(err: IHTTPError, _req: Request, res: Response): void {
//     res.status(err.statusCode).json({
//       statusCode: err.statusCode,
//       statusText: err.statusText,
//       errors: err.errors,
//     });
//   }

//   notFound(_req: Request, res: Response): void {
//     res.status(404).json({
//       statusCode: 404,
//       statusText: 'Endpoint not found',
//       errors: ['Resource not available'],
//     });
//   }
// }

// const catcher = Catch.get();
// export { catcher as Catch };
import { Request, Response } from 'express';

import { Logger } from '@services/logger.service';
import { ErrorFactory } from '@factories/error.factory';
import { IHTTPError, IRequest } from '@interfaces';

/**
 * Error catch/output middleware
 *
 * @dependency libnotify-bin
 * @dependency node-notifier
 *
 * @see https://www.npmjs.com/package/node-notifier
 */
class Catch {
  /**
   * @description
   */
  private static instance: Catch;

  private constructor() {}

  /**
   * @description
   */
  static get(): Catch {
    if (!Catch.instance) {
      Catch.instance = new Catch();
    }
    return Catch.instance;
  }

  /**
   * @description
   *
   * @param err
   * @param req
   * @param res
   * @param next
   */
  factory(err: Error, req: Request, res: Response, next: (e: IHTTPError, req: any, res: any) => void): void {
    next(ErrorFactory.get(err), req, res);
  }

  /**
   * @description Write errors in a log file
   *
   * @param err Error object
   * @param req Express request object derived from http.incomingMessage
   * @param res Express response object
   * @param next Callback function
   */
  log(err: IHTTPError, req: IRequest, res: Response, next: (e: IHTTPError, req: any, res: any) => void): void {
    const { user } = req as { user: { id: number } };
    if (err.statusCode >= 500) {
      Logger.log(
        'error',
        `${(req.headers['x-forwarded-for'] as string) || req.connection.remoteAddress} HTTP/${req.httpVersion} ${err.statusCode} ${req.method} ${req.url} - ${err.message} (#${user ? user.id : 'unknown'}) : ${err.stack ? '\n  ' + err.stack : ''} ${req.body ? '\n  Payload :' + JSON.stringify(req.body) : ''}`
      );
    } else {
      Logger.log(
        'error',
        `${(req.headers['x-forwarded-for'] as string) || req.connection.remoteAddress} HTTP/${req.httpVersion} ${err.statusCode} ${req.method} ${req.url} - ${err.statusText} (#${user ? user.id : 'unknown'}) : ${err.errors.slice().shift()} ${req.body ? '\n  Payload :' + JSON.stringify(req.body) : ''}`
      );
    }
    next(err, req, res);
  }
  /**
   * @description Display clean error for final user
   *
   * @param err Error object
   * @param req Express request object derived from http.incomingMessage
   * @param res Express response object
   */
  exit(err: IHTTPError, req: Request, res: Response, next: (e: Error, req: any, res: any) => void): void {
    res.status(err.statusCode);
    res.json({
      statusCode: err.statusCode,
      statusText: err.statusText,
      errors: err.errors,
    });
  }

  /**
   * @description Display clean 404 error for final user
   *
   * @param req Express request object derived from http.incomingMessage
   * @param res Express response object
   */
  notFound(req: Request, res: Response): void {
    res.status(404);
    res.json({
      statusCode: 404,
      statusText: 'Ooops... end point was not found',
      errors: ["Looks like someone's gone mushroom picking'"],
    });
  }
}

const catcher = Catch.get();

export { catcher as Catch };
