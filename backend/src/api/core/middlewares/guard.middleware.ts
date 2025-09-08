import { Request, Response, RequestHandler, NextFunction } from 'express';
import passport from 'passport';
import { promisify } from 'util';
import { forbidden, badRequest, notFound } from '@hapi/boom';

import { User } from '@prisma/client';
import { ROLE } from '@enums';
import { list } from '@utils/enum.util';
import { IUserRequest, IResponse } from '@interfaces';
import { OAuthProvider } from '@types';

class Guard {
  private static instance: Guard;

  private constructor() {}

  static get(): Guard {
    if (!Guard.instance) {
      Guard.instance = new Guard();
    }
    return Guard.instance;
  }

  private async handleJWT(
    req: IUserRequest,
    res: Response,
    next: NextFunction,
    roles: ROLE[],
    err: Error,
    user: User,
    info: string
  ): Promise<void> {
    const error = err || info;
    const logIn = promisify(req.logIn) as (user: User, { session }: { session: boolean }) => Promise<void>;
    try {
      if (error || !user) throw error;
      await logIn(user, { session: false });
    } catch (e) {
      return next(forbidden((e as Error).message));
    }

    if (!roles.includes(user.role as ROLE)) {
      return next(forbidden('Forbidden area'));
    }
    const role = user.role as ROLE;
    const userId = req.params.userId;
    if (role !== ROLE.admin && userId && userId !== user.id) {
      return next(forbidden('Forbidden area'));
    }

    (req as IUserRequest).user = user;
    next();
  }

  private handleOauth(req: Request, res: Response, next: NextFunction, err: Error, user: User): void {
    if (err) {
      return next(badRequest(err.message));
    }
    if (!user) {
      return next(notFound('User not found'));
    }
    if (!list(ROLE).includes(user.role)) {
      return next(forbidden('Forbidden area'));
    }
    (req as IUserRequest).user = user;
    next();
  }

  authorize(roles: ROLE | ROLE[]): RequestHandler {
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return (req: Request, res: Response, next: NextFunction) => {
      passport.authenticate('jwt', { session: false }, (err: Error, user: User, info: string) =>
        this.handleJWT(req as IUserRequest, res, next, roleArray, err, user, info)
      )(req, res, next);
    };
  }

  oAuth(service: OAuthProvider) {
    return passport.authenticate(service, { session: false });
  }

  oAuthCallback(service: OAuthProvider) {
    return (req: Request, res: Response, next: NextFunction) => {
      passport.authenticate(service, { session: false }, (err: Error, user: User) =>
        this.handleOauth(req, res, next, err, user)
      )(req, res, next);
    };
  }
}

const guard = Guard.get();
export { guard as Guard };
