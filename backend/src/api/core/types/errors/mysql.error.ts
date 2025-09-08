import HTTP_STATUS from 'http-status';
import { IError, IHTTPError } from '@interfaces';
import { TypeplateError } from '@errors';

/**
 * @description Custom type MySQL error
 */
export class MySQLError extends TypeplateError implements IHTTPError {
  statusCode: number;
  statusText: string;
  errors: string[];

  constructor(error: IError) {
    super('MySQL engine was failed');
    const converted = this.convertError(
      error.errno as number,
      error.message as string
    );
    this.statusCode = converted.statusCode;
    this.statusText = converted.statusText;
    this.errors = [converted.error];
  }

  private convertError(
    errno: number,
    message: string
  ): { statusCode: number; statusText: string; error: string } {
    switch (errno) {
      case 1052:
      case 1054:
      case 1062:
      case 1452:
        return {
          statusCode: 409,
          statusText: HTTP_STATUS[409],
          error: message,
        };
      case 1364:
      case 1406:
      default:
        return {
          statusCode: 422,
          statusText: HTTP_STATUS[422],
          error: message,
        };
    }
  }
}
