/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import * as Joi from 'joi';
import { email, id, uuid } from '@schemas'; // assuming your custom helpers

const createQRCode = {
  body: Joi.object({
    franchiseId: uuid('qrcodeId'),
  }),
};

const updateQRCode = {
  params: Joi.object({
    qrcodeId: uuid('qrcodeId'), // Matches route: /:id
  }),
  body: createQRCode.body,
};

const getQRCodeById = {
  params: Joi.object({
    qrcodeId: uuid('qrcodeId'),
  }),
};
const getQRCodeByCode = {
  params: Joi.object({
    qrCode: Joi.string().required(),
  }),
};

const deactivateQRCode = {
  params: Joi.object({
    qrcodeId: uuid('qrcodeId'),
  }),
  body: Joi.object({
    isActive: Joi.boolean().valid(false).required(), // Assuming soft delete sets false
  }),
};

const getAllQRCodes = {
  query: Joi.object({
    skip: Joi.number().integer().min(0).default(0),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().valid('name', 'createdAt', 'city', 'state').default('createdAt'),
    order: Joi.string().valid('asc', 'desc').default('desc'),
    name: Joi.string().trim().optional(),
    city: Joi.string().trim().optional(),
    state: Joi.string().trim().optional(),
    isActive: Joi.boolean().optional(),
  }),
};

const list = {
  body: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(10),
    page: Joi.number().integer().min(1).max(100).default(1),
    sort: {
      order: Joi.string().required(),
      name: Joi.string().required(),
    },
    filter: {
      name: Joi.string().trim().optional(),
      city: Joi.string().trim().optional(),
      state: Joi.string().trim().optional(),
      isActive: Joi.boolean().optional(),
    },
  }),
};

export { createQRCode, getAllQRCodes, getQRCodeById, getQRCodeByCode, updateQRCode, deactivateQRCode, list };
