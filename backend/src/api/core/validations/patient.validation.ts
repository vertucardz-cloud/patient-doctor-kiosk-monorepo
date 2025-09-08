/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import * as Joi from 'joi';
import { email, id, uuid, phoneNumber } from '@schemas';

const genderEnum = ["male", "female", "non_binary", "other", "undisclosed"] as const;

const createPatient = {
    body: Joi.object({
        firstname: Joi.string().trim().min(2).max(50).optional().allow(null, ""),
        lastname: Joi.string().trim().min(2).max(50).optional().allow(null, ""),
        phone: phoneNumber().required(),
        email: Joi.string().email().optional().allow(null, ""),
        age: Joi.number().integer().min(0).max(120).required(),
        franchiseId: uuid('franchiseId'),
    }),
};

const updatePatient = {
    params: Joi.object({
        patientId: uuid('patientId'),
    }),
    body: Joi.object({
        firstname: Joi.string().trim().min(2).max(50).required(),
        lastname: Joi.string().trim().min(2).max(50).required(),
        description: Joi.string().required(),
        gender: Joi.string().valid(...genderEnum).required(),
        age: Joi.number().integer().min(0).max(120).required(),
        email: email().optional().allow(null, ""),
        caseId: uuid('caseId'),
    }),
};

const getPatientById = {
    params: Joi.object({
        patientId: uuid('patientId'),
    }),
};

const getAllPatient = {
    query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        sort: Joi.string()
            .valid("firstname", "lastname", "fullname", "createdAt", "updatedAt", "age")
            .default("createdAt"),
        order: Joi.string().valid("asc", "desc").default("desc"),
        filter: Joi.object({
            firstname: Joi.string().trim().optional(),
            lastname: Joi.string().trim().optional(),
            fullname: Joi.string().trim().optional(),
            phone: Joi.string()
                .pattern(/^[0-9]{10,15}$/)
                .optional(),
            email: Joi.string().email().optional(),
            ageMin: Joi.number().integer().min(0).max(120).optional(),
            ageMax: Joi.number().integer().min(0).max(120).optional(),
            franchiseId: Joi.string().uuid().optional(),
        }).optional(),
    }),
};

const listPatients = {
    body: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        sort: {
            name: Joi.string()
                .valid("firstname", "lastname", "fullname", "createdAt", "updatedAt", "age")
                .default("createdAt"),
            order: Joi.string().valid("asc", "desc").default("desc"),
        },
        filter: Joi.object({
            firstname: Joi.string().trim().optional().allow('', null),
            lastname: Joi.string().trim().optional().allow('', null),
            fullname: Joi.string().trim().optional().allow('', null),
            phone: Joi.string()
                .pattern(/^[0-9]{10,15}$/)
                .optional()
                .allow('', null),
            email: Joi.string().email().optional().allow('', null),
            ageMin: Joi.number().integer().min(0).max(120).optional().allow(null),
            ageMax: Joi.number().integer().min(0).max(120).optional().allow(null),
            franchiseId: Joi.string().uuid().optional().allow('', null),
            isActive: Joi.boolean().optional(),
            includeFranchise: Joi.boolean().optional(),
            createdAtStart: Joi.string()
                .pattern(/^(\d{2})[-/](\d{2})[-/](\d{4})$/) // Supports both - and / separators
                .optional()
                .allow('', null)
                .custom((value, helpers) => {
                    if (!value || value.trim() === '') return value;

                    // Extract day, month, year from either DD-MM-YYYY or DD/MM/YYYY
                    const [day, month, year] = value.split(/[-/]/).map(Number);

                    // Validate date components
                    if (day < 1 || day > 31) {
                        return helpers.error('any.invalid', { message: 'Day must be between 1-31' });
                    }
                    if (month < 1 || month > 12) {
                        return helpers.error('any.invalid', { message: 'Month must be between 1-12' });
                    }
                    if (year < 1900 || year > 2100) {
                        return helpers.error('any.invalid', { message: 'Year must be between 1900-2100' });
                    }

                    // Check if date is valid (e.g., not 31-02-2023)
                    const date = new Date(year, month - 1, day);
                    if (date.getMonth() !== month - 1 || date.getDate() !== day) {
                        return helpers.error('any.invalid', { message: 'Invalid date' });
                    }

                    return value;
                }, 'Date format validation'),
            createdAtEnd: Joi.string()
                .pattern(/^(\d{2})[-/](\d{2})[-/](\d{4})$/) // Supports both - and / separators
                .optional()
                .allow('', null)
                .custom((value, helpers) => {
                    if (!value || value.trim() === '') return value;

                    const [day, month, year] = value.split(/[-/]/).map(Number);

                    if (day < 1 || day > 31) {
                        return helpers.error('any.invalid', { message: 'Day must be between 1-31' });
                    }
                    if (month < 1 || month > 12) {
                        return helpers.error('any.invalid', { message: 'Month must be between 1-12' });
                    }
                    if (year < 1900 || year > 2100) {
                        return helpers.error('any.invalid', { message: 'Year must be between 1900-2100' });
                    }

                    const date = new Date(year, month - 1, day);
                    if (date.getMonth() !== month - 1 || date.getDate() !== day) {
                        return helpers.error('any.invalid', { message: 'Invalid date' });
                    }

                    return value;
                }, 'Date format validation'),
        })
            .optional()
            .unknown(true)
            .custom(
                (value, helpers) => {
                    if (!value) return value;

                    // Custom validation for date range consistency
                    if (value.createdAtStart && value.createdAtStart.trim() && value.createdAtEnd && value.createdAtEnd.trim()) {
                        const parseDate = (dateStr: string) => {
                            const [day, month, year] = dateStr.split(/[-/]/).map(Number);
                            return new Date(year, month - 1, day);
                        };

                        const startDate = parseDate(value.createdAtStart);
                        const endDate = parseDate(value.createdAtEnd);

                        if (startDate > endDate) {
                            return helpers.error('any.invalid', {
                                message: 'createdAtStart cannot be after createdAtEnd'
                            });
                        }
                    }

                    // Custom validation for age range consistency
                    if (value.ageMin !== undefined && value.ageMin !== null && value.ageMax !== undefined && value.ageMax !== null) {
                        if (value.ageMin > value.ageMax) {
                            return helpers.error('any.invalid', {
                                message: 'ageMin cannot be greater than ageMax'
                            });
                        }
                    }

                    return value;
                },
                'Custom validation for date and age ranges'
            ),
    }),
};



export {
    createPatient,
    getPatientById,
    updatePatient,
    getAllPatient,
    listPatients
};
