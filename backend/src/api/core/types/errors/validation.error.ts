import { ValidationErrorItem } from 'joi';
import * as HTTP_STATUS from 'http-status';

import { IError, IHTTPError } from '@interfaces';
import { TypeplateError } from '@errors';

/**
 * Type upload error
 */
export class ValidationError extends TypeplateError implements IHTTPError {
  statusCode: number;
  statusText: string;
  errors: Array<string>;

  constructor(error: IError & { details: ValidationErrorItem[] }) {
    super('A validation error was occurred');
    this.statusCode = 400;
    this.statusText = 'Validation failed';
    this.errors = this.convertError(error.details);
  }

  private convertError(errors: ValidationErrorItem[]): string[] {
    return errors.map((err) => err.message.replace(/"/g, "'"));
  }
}
