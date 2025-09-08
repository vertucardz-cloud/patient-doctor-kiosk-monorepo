import { badImplementation, Boom } from '@hapi/boom';
import { ValidationErrorItem } from 'joi';
import {
  MySQLError,
  NotFoundError,
  UploadError,
  ValidationError,
  ServerError,
  BusinessError,
} from '@errors';
import { IError, IHTTPError } from '@interfaces';
import { getErrorStatusCode } from '@utils/error.util';

/**
 * @description Factory for creating standardized HTTP errors
 */
export class ErrorFactory {
  /**
   * @description Creates appropriate HTTP error based on input error
   *
   * @param error The error to process
   * @returns Properly formatted HTTP error
   */
  static get(error: IError): IHTTPError {
    // Custom errors first
    switch (error.name) {
      case 'QueryFailedError':
        return new MySQLError(error);
      case 'MulterError':
        return new UploadError(error);
      case 'EntityNotFound':
      case 'EntityNotFoundError':
      case 'MustBeEntityError':
        return new NotFoundError(error);
      case 'ValidationError':
        const validationError = error as IError & {
          details: ValidationErrorItem[];
        };
        return new ValidationError(validationError);
      case 'BusinessError':
        return error as BusinessError;
    }

    // JS native errors (Error | EvalError | RangeError | SyntaxError | TypeError | URIError)
    if (
      !error.httpStatusCode &&
      !error.statusCode &&
      !error.status &&
      !(error as Boom).output?.statusCode
    ) {
      switch (error.constructor.name) {
        case 'Error':
        case 'EvalError':
        case 'TypeError':
        case 'SyntaxError':
        case 'RangeError':
        case 'URIError':
          return new ServerError(error);
        default:
          const boomError = badImplementation(error.message);
          return {
            statusCode: getErrorStatusCode(boomError),
            statusText: boomError.output.payload.error,
            errors: [boomError.output.payload.message],
          };
      }
    }

    // Fallback with Boom error
    if ((error as Boom).isBoom) {
      const boomError = error as Boom;
      return {
        statusCode: getErrorStatusCode(boomError),
        statusText: boomError.output.payload.error,
        errors: [boomError.output.payload.message],
      };
    }

    // Default case for unexpected errors
    const defaultError = badImplementation('Unexpected error occurred');
    return {
      statusCode: getErrorStatusCode(defaultError),
      statusText: defaultError.output.payload.error,
      errors: [defaultError.output.payload.message],
    };
  }
}
