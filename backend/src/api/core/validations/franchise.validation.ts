/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import * as Joi from 'joi';
import { email, id, uuid } from '@schemas'; // assuming your custom helpers

const createFranchise = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    address: Joi.string().trim().min(5).max(255).required(),
    city: Joi.string().trim().required(),
    state: Joi.string().trim().required(),
    postalCode: Joi.string().trim().required(),
    country: Joi.string().trim().required(),
    phone: Joi.string()
      .trim()
      .pattern(/^[+0-9(). -]{7,20}$/)
      .required(),
    email: email(),
  }),
};

const updateFranchise = {
  params: Joi.object({
    franchiseId: uuid('franchiseId'), // Matches route: /:id
  }),
  body: createFranchise.body,
};

const getFranchiseById = {
  params: Joi.object({
    franchiseId: uuid('franchiseId'),
  }),
};

const deactivateFranchise = {
  params: Joi.object({
    franchiseId: uuid('franchiseId'),
  }),
  body: Joi.object({
    isActive: Joi.boolean().valid(false).required(), // Assuming soft delete sets false
  }),
};

const getAllFranchises = {
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

export { createFranchise, getFranchiseById, updateFranchise, getAllFranchises, deactivateFranchise, list };
