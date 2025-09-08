import { Request } from 'express';
import { badRequest, notFound } from '@hapi/boom';

import * as Jwt from 'jwt-simple';

import { ACCESS_TOKEN } from '@config/environment.config';
import { IResponse, IUserRequest, ITokenOptions } from '@interfaces';
import { User, RefreshToken, STATUS } from '@prisma/client';
import { AuthService } from '@services/auth.service';
import { Safe } from '@decorators/safe.decorator';
import { ROLE } from '@enums';
import { EmailEmitter } from '@events';
import { RefreshTokenRepository } from '@repositories/refresh-token.repository';
import { UserRepository } from '@repositories/user.repository';

/**
 * Manage incoming requests from api/{version}/auth
 */
class AuthController {
  /**
   * @description
   */
  private static instance: AuthController;

  private constructor() { }

  /**
   * @description
   */
  static get(): AuthController {
    if (!AuthController.instance) {
      AuthController.instance = new AuthController();
    }
    return AuthController.instance;
  }

  /**
   * @description Creates and save new user
   *
   * @param req Express request object derived from http.incomingMessage
   * @param res Express response object
   */
  @Safe()
  async register(req: Request, res: IResponse): Promise<void> {
    const repository = UserRepository;
    const count = await repository.count();
    if (count === 0) {
      req.body.role = ROLE.admin;
    }
    const user = await repository.create(req.body as User);
    const accessToken = await repository.token(user.id);
    if (!accessToken) {
      throw badRequest('Access token generation failed');
    }
    const token = await AuthService.generateTokenResponse(user, accessToken);
    res.locals.data = { token, user };
  }

  /**
   * @description Login with an existing user or creates a new one if valid accessToken token
   *
   * @param req Express request object derived from http.incomingMessage
   * @param res Express response object
   */
  @Safe()
  async login(req: Request, res: IResponse): Promise<void> {
    const { user, accessToken } = await UserRepository.findAndGenerateToken(req.body as ITokenOptions);

    const token = await AuthService.generateTokenResponse(user, accessToken);
    res.locals.data = { token, user };
  }

  /**
   * @description Logout user
   *
   * @param req Express request object derived from http.incomingMessage
   * @param res Express response object
   */
  @Safe()
  async logout(req: IUserRequest, res: IResponse): Promise<void> {
    await AuthService.revokeRefreshToken(req.user as User);
    res.locals.data = {};
  }

  /**
   * @description Login with an existing user or creates a new one if valid accessToken token
   *
   * @param req Express request object derived from http.incomingMessage
   * @param res Express response object
   */
  @Safe()
  async oAuth(req: IUserRequest, res: IResponse): Promise<void> {
    const user = req.user as User;
    const accessToken = await UserRepository.token(user.id);
    const token = await AuthService.generateTokenResponse(user, accessToken);
    res.locals.data = { token, user };
  }

  /**
   * @description Refresh JWT access token by RefreshToken removing, and re-creating
   *
   * @param req Express request object derived from http.incomingMessage
   * @param res Express response object
   */
  @Safe()
  async refresh(req: Request, res: IResponse, next: (e?: Error) => void): Promise<void> {
    const refreshTokenRepository = RefreshTokenRepository;

    const { token } = req.body as { token: { refreshToken?: string } };

    const refreshToken = await refreshTokenRepository.findByToken(token.refreshToken as string);

    if (typeof refreshToken === 'undefined' || !refreshToken) {
      return next(notFound('RefreshToken not found'));
    }

    await refreshTokenRepository.remove(refreshToken.token.token as string);

    // Get owner user of the token
    const { user, accessToken } = await UserRepository.findAndGenerateToken({
      email: refreshToken.user.email,
      refreshToken: refreshToken.token,
    });
    const response = await AuthService.generateTokenResponse(user, accessToken);

    res.locals.data = { token: response };
  }

  /**
   * @description Confirm email address of a registered user
   *
   * @param req Express request object derived from http.incomingMessage
   * @param res Express response object
   *
   * @fixme token should be temp: 24h
   */
  @Safe()
  async confirm(req: IUserRequest, res: IResponse): Promise<void> {
    const repository = UserRepository;

    const decoded = Jwt.decode(req.body.token as string, ACCESS_TOKEN.SECRET) as { sub: string | number };
    if (!decoded) {
      throw badRequest('User token cannot be read');
    }
    if (!decoded.sub) {
      throw badRequest('User token is invalid');
    }

    const user = await repository.findById(decoded.sub as string);
    if (!user) {
      throw notFound('User not found');
    }

    if (user.status !== STATUS.REGISTERED && user.status !== STATUS.REVIEWED) {
      throw badRequest('User status cannot be confirmed');
    }

    user.status = STATUS.CONFIRMED;

    await repository.update(user.id, user);
    const accessToken = await repository.token(user.id);
    if (!accessToken) {
      throw badRequest('Access token generation failed');
    }
    const token = await AuthService.generateTokenResponse(user, accessToken);
    res.locals.data = { token, user };
  }

  /**
   * @description Request a temporary token to change password
   *
   * @param req Express request object derived from http.incomingMessage
   * @param res Express response object
   */
  // @Safe()
  async requestPassword(req: IUserRequest, res: IResponse): Promise<void> {
    const repository = UserRepository;
    if (!req.query.email) {
      throw badRequest('Email is required to request a password reset');
    }
    const user = await repository.findByEmail(req.query.email);

    if (user && user.status === STATUS.CONFIRMED) {
      void AuthService.revokeRefreshToken(user);
      EmailEmitter.emit('password.request', user);
    }

    res.locals.data = {};
  }
}

const authController = AuthController.get();

export { authController as AuthController };
