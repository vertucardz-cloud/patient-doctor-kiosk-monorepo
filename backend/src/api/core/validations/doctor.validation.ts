/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import * as Joi from 'joi';
import { ROLE, FIELDNAME, STATUS } from '@enums';
import { list } from '@utils/enum.util';

import { email, id, username, password, file, uuid, phoneNumber } from '@schemas';

// GET api/v1/doctors
const listDoctors = {
  query: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    perPage: Joi.number().integer().min(1).optional(),
    username: username(),
    email: email(),
    status: Joi.any().valid(...list(STATUS)),
    specialty: Joi.string().optional()
  })
};

// GET api/v1/doctors/:doctorId
const getDoctor = {
  params: Joi.object({
    doctorId: uuid('doctorId'),
  })
};

// POST api/v1/doctors
const createDoctor = {
  body: Joi.object({
    username: username().required(),
    email: email().required(),
    password: password('user'),
    name: Joi.string().required(),
    specialty: Joi.string().required(),
    phone: phoneNumber().required(),
    status: Joi.any().valid(...list(STATUS)).optional(),
    avatar: file(FIELDNAME.avatar).allow(null),
  })
};

// PUT api/v1/doctors/:doctorId
const replaceDoctor = {
  params: Joi.object({
    doctorId: uuid('doctorId'),
  }),
  body: Joi.object({
    username: username().required(),
    email: email().required(),
    password: password('user').required(),
    apikey: Joi.string().optional(),
    name: Joi.string().required(),
    specialty: Joi.string().required(),
    phone: phoneNumber().required(),
    status: Joi.any().valid(...list(STATUS)).required(),
    avatar: file(FIELDNAME.avatar).allow(null),
    role: Joi.any().valid(ROLE.doctor).required()
  })
};

// PATCH api/v1/doctors/:doctorId
const updateDoctor = {
  params: Joi.object({
    doctorId: uuid('doctorId'),
  }),
  body: Joi.object({
    username: username(),
    email: email(),
    isUpdatePassword: Joi.boolean().optional(),
    password: password('user'),
    passwordConfirmation: Joi.when('password', {
      is: password('user').required(),
      then: Joi.any().equal(Joi.ref('password')).required().label('Confirm password').messages({
        'any.only': '{{#label}} does not match'
      }),
      otherwise: Joi.optional()
    }),
    passwordToRevoke: Joi.when('isUpdatePassword', {
      is: Joi.any().equal(true).required(),
      then: password('user').required(),
      otherwise: Joi.optional()
    }),
    name: Joi.string().optional(),
    specialty: Joi.string().optional(),
    phone: phoneNumber().optional(),
    status: Joi.any().valid(...list(STATUS)).optional(),
    avatar: file(FIELDNAME.avatar).allow(null),
  })
};

// DELETE api/v1/doctors/:doctorId
const removeDoctor = {
  params: Joi.object({
    doctorId: uuid('doctorId'),
  })
};

export { listDoctors, getDoctor, createDoctor, replaceDoctor, updateDoctor, removeDoctor };
