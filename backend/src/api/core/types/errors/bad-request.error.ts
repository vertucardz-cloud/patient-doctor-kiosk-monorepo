// src/errors/bad-request.error.ts

import httpStatus from 'http-status';

export class BadRequestError extends Error {
  public statusCode: number;
  public details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = 'BadRequestError';
    this.statusCode = httpStatus.BAD_REQUEST;
    this.details = details;

    // Maintains proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BadRequestError);
    }
  }
}
