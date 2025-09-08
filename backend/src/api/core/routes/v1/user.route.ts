import { Router } from '@classes';
import { RequestHandler } from 'express';
import { UserController } from '@controllers/user.controller';
import { Guard } from '@middlewares/guard.middleware';
import { Uploader } from '@middlewares/uploader.middleware';
import { Validator } from '@middlewares/validator.middleware';
import { IMAGE_MIME_TYPE, ROLE } from '@enums';
import { listUsers, getUser, createUser, replaceUser, updateUser, removeUser } from '@validations/user.validation';
import { list } from '@utils/enum.util';

export class UserRouter extends Router {
  constructor() {
    super();
  }

  define(): void {
    this.router
      .route('/')
      .get(Guard.authorize([ROLE.admin]), Validator.check(listUsers), UserController.list as RequestHandler)
      .post(
        Guard.authorize([ROLE.admin]) as RequestHandler,
        Validator.check(createUser),
        UserController.create as RequestHandler
      );

    this.router
      .route('/profile')
      .get(Guard.authorize([ROLE.admin, ROLE.user]), UserController.loggedIn as RequestHandler);

    this.router
      .route('/:userId')
      .get(Guard.authorize([ROLE.admin]), Validator.check(getUser), UserController.get as RequestHandler)
      .put(
        Guard.authorize([ROLE.admin, ROLE.user]) as RequestHandler,
        Uploader.upload({ wildcards: list(IMAGE_MIME_TYPE) }),
        Validator.check(replaceUser),
        UserController.update as RequestHandler
      )
      .patch(
        Guard.authorize([ROLE.admin, ROLE.user]),
        Uploader.upload({ wildcards: list(IMAGE_MIME_TYPE) }),
        Validator.check(updateUser),
        UserController.update as RequestHandler
      )
      .delete(Guard.authorize([ROLE.admin]), Validator.check(removeUser), UserController.remove as RequestHandler);
  }
}
