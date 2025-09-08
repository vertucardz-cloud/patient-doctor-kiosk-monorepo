/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import * as Joi from "joi";
import { uuid } from "@schemas"; // assuming you have uuid() helper like in your franchise example

const createTreatmentPlan = {
  body: Joi.object({
    caseId: uuid("caseId").required(),
    doctorId: uuid("doctorId").required(),
    summary: Joi.string().trim().min(5).max(500).required(),
    medication: Joi.string().trim().max(500).optional(),
    estimatedCost: Joi.number().positive().required(),
    status: Joi.string()
      .valid("PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED")
      .default("PLANNED"),
  }),
};

const updateTreatmentPlan = {
  params: Joi.object({
    treatmentPlanId: uuid("treatmentPlanId"), // Matches route: /:id
  }),
  body: Joi.object({
    summary: Joi.string().trim().min(5).max(500).optional(),
    medication: Joi.string().trim().max(500).optional(),
    estimatedCost: Joi.number().positive().optional(),
    status: Joi.string().valid(
      "PLANNED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED"
    ),
  }),
};

const getTreatmentPlanById = {
  params: Joi.object({
    treatmentPlanId: uuid("treatmentPlanId"),
  }),
};

const deleteTreatmentPlan = {
  params: Joi.object({
    treatmentPlanId: uuid("treatmentPlanId"),
  }),
};

const getAllTreatmentPlans = {
  query: Joi.object({
    skip: Joi.number().integer().min(0).default(0),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string()
      .valid("createdAt", "updatedAt", "estimatedCost", "status")
      .default("createdAt"),
    order: Joi.string().valid("asc", "desc").default("desc"),
    caseId: uuid('caseId').optional(),
    doctorId: uuid('doctorId').optional(),
    status: Joi.string()
      .valid("PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED")
      .optional(),
  }),
};

const listTreatmentPlans = {
  body: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(10),
    page: Joi.number().integer().min(1).default(1),
    sort: Joi.object({
      order: Joi.string().valid("asc", "desc").required(),
      name: Joi.string()
        .valid("createdAt", "updatedAt", "estimatedCost", "status")
        .required(),
    }),
    filter: Joi.object({
        caseId: uuid('caseId', false),
        doctorId: uuid('doctorId', false),
        status: Joi.string().valid(
            "PLANNED",
            "IN_PROGRESS",
            "COMPLETED",
            "CANCELLED"
        ),
    }),
  }),
};

export {
  createTreatmentPlan,
  updateTreatmentPlan,
  getTreatmentPlanById,
  deleteTreatmentPlan,
  getAllTreatmentPlans,
  listTreatmentPlans,
};
