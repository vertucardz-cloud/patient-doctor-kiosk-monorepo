import { RequestHandler } from 'express';
import { Router } from '@classes';
import { Validator } from '@middlewares/validator.middleware';
import { Guard } from '@middlewares/guard.middleware';
import { AuthController } from '@controllers/auth.controller';
import { register, login, refresh, oauthCb, confirm, requestPassword } from '@validations/auth.validation';
import { ROLE } from '@enums';

export class AuthRouter extends Router {
  constructor() {
    super();
  }

  define(): void {
    this.router.route('/register').post(Validator.check(register), AuthController.register);

    this.router.route('/login').post(Validator.check(login), AuthController.login);

    this.router
      .route('/logout')
      .post(Guard.authorize([ROLE.admin, ROLE.user]), AuthController.logout as RequestHandler);

    this.router.route('/confirm').patch(Validator.check(confirm), AuthController.confirm as RequestHandler);

    this.router
      .route('/request-password')
      .get(Validator.check(requestPassword), AuthController.requestPassword as RequestHandler);

    this.router.route('/refresh-token').post(Validator.check(refresh), AuthController.refresh as RequestHandler);

    this.router.route('/facebook').get(Guard.oAuth('facebook') as RequestHandler);

    this.router
      .route('/facebook/callback')
      .get(Validator.check(oauthCb), Guard.oAuthCallback('facebook'), AuthController.oAuth as RequestHandler);

    this.router.route('/google').get(Guard.oAuth('google') as RequestHandler, AuthController.oAuth as RequestHandler);

    this.router
      .route('/google/callback')
      .get(Validator.check(oauthCb), Guard.oAuthCallback('google'), AuthController.oAuth as RequestHandler);

    this.router.route('/github').get(Guard.oAuth('github') as RequestHandler, AuthController.oAuth as RequestHandler);

    this.router
      .route('/github/callback')
      .get(Validator.check(oauthCb), Guard.oAuthCallback('github'), AuthController.oAuth as RequestHandler);

    this.router
      .route('/linkedin')
      .get(Guard.oAuth('linkedin') as RequestHandler, AuthController.oAuth as RequestHandler);

    this.router
      .route('/linkedin/callback')
      .get(Validator.check(oauthCb), Guard.oAuthCallback('linkedin'), AuthController.oAuth as RequestHandler);
  }
}
