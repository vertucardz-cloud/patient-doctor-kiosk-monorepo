import { Router } from '@classes';
import { MediaController } from '@controllers/media.controller';
import { Guard } from '@middlewares/guard.middleware';
import { Uploader } from '@middlewares/uploader.middleware';
import { Validator } from '@middlewares/validator.middleware';
import { ROLE, MIME_TYPE } from '@enums';
import { list } from '@utils/enum.util';
import {
  listMedias,
  insertMedia,
  getMedia,
  replaceMedia,
  updateMedia,
  removeMedia,
} from '@validations/media.validation';
import { RequestHandler } from 'express';

export class MediaRouter extends Router {
  constructor() {
    super();
  }

  define(): void {
    this.router
      .route('/')
      .get(
        Guard.authorize([ROLE.admin, ROLE.user]),
        Validator.check(listMedias),
        MediaController.list as RequestHandler
      )
      .post(
        Guard.authorize([ROLE.admin, ROLE.user]),
        Uploader.upload({ wildcards: list(MIME_TYPE) }),
        Validator.check(insertMedia),
        MediaController.create as RequestHandler
      );

    this.router
      .route('/:mediaId')
      .get(Guard.authorize([ROLE.admin, ROLE.user]), Validator.check(getMedia), MediaController.get as RequestHandler)
      .put(
        Guard.authorize([ROLE.admin, ROLE.user]),
        Validator.check(replaceMedia),
        MediaController.get as RequestHandler,
        Uploader.upload({ wildcards: list(MIME_TYPE) }),
        Validator.check(insertMedia),
        MediaController.update as RequestHandler
      )
      .patch(
        Guard.authorize([ROLE.admin, ROLE.user]),
        Validator.check(updateMedia),
        MediaController.get as RequestHandler,
        Uploader.upload({ wildcards: list(MIME_TYPE) }),
        MediaController.update as RequestHandler
      )
      .delete(
        Guard.authorize([ROLE.admin, ROLE.user]),
        Validator.check(removeMedia),
        MediaController.get as RequestHandler,
        MediaController.remove as RequestHandler
      );
  }
}
