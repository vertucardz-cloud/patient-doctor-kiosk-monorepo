/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import * as Joi from 'joi';

import { MIME_TYPE_LIST, MEDIA_TYPE } from '@enums';
import { id, pagination, fieldname, filename, path, mimetype, uuid } from '@schemas';
import { list } from '@utils/enum.util';

// GET /v1/medias
const listMedias = {
  query: Joi.object({
    page: pagination('page'),
    perPage: pagination('perPage'),
    fieldname: fieldname(),
    filename: filename(false),
    path: path(),
    mimetype: mimetype(MIME_TYPE_LIST as string[]),
    size: Joi.number(),
    type: Joi.any().valid(...list(MEDIA_TYPE)),
    owner: Joi.string().required(),
  }),
};

// POST /v1/medias
const insertMedia = {
  body: Joi.object({
    files: Joi.array().items(
      Joi.object().keys({
        fieldname: fieldname().required(),
        filename: filename().required(),
        path: path().required(),
        mimetype: mimetype(MIME_TYPE_LIST as string[]).required(),
        size: Joi.number().required(),
        owner: Joi.string().required(),
      })
    ),
  }),
};

// GET /v1/medias/:mediaId
const getMedia = {
  params: Joi.object({
    mediaId: uuid('mediaId'),
  }),
};

// PUT /v1/medias/:mediaId
const replaceMedia = {
  params: Joi.object({
    mediaId: uuid('mediaId'),
  }),
  body: Joi.object({
    file: {
      fieldname: fieldname().required(),
      filename: filename().required(),
      path: path().required(),
      mimetype: mimetype(MIME_TYPE_LIST as string[]).required(),
      size: Joi.number().required(),
      owner: Joi.string().required(),
    },
  }),
};

// PATCH /v1/medias/:mediaId
const updateMedia = {
  params: Joi.object({
    mediaId: id(),
  }),
  body: Joi.object({
    file: {
      fieldname: fieldname(),
      filename: filename(),
      path: path(),
      mimetype: mimetype(MIME_TYPE_LIST as string[]),
      size: Joi.number(),
      owner: Joi.string(),
    },
  }),
};

// DELETE /v1/medias/:mediaId
const removeMedia = {
  params: Joi.object({
    mediaId: uuid('mediaId'),
  }),
};

export { listMedias, insertMedia, getMedia, replaceMedia, updateMedia, removeMedia };
