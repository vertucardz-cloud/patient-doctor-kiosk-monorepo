import * as Joi from 'joi';

/**
 * Phone number schema helper
 * Validates 10-digit numbers, optional country code (+91, +1, etc.)
 */
export const phoneNumber = () => 
  Joi.string()
    .pattern(/^(\+\d{1,3})?\d{10}$/)
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Phone number must be a valid 10-digit number with optional country code'
    });
