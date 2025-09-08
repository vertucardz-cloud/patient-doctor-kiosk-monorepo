import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import { BadRequestError } from '@errors/bad-request.error';

class Validator {
  private static instance: Validator;

  private constructor() {}

  static get(): Validator {
    if (!Validator.instance) {
      Validator.instance = new Validator();
    }
    return Validator.instance;
  }

  check(schema: Record<string, ObjectSchema>) {
    return (req: Request, res: Response, next: NextFunction) => {
      const properties = ['query', 'body', 'params'] as const;

      for (const property of properties) {
        if (schema[property]) {
          const { error } = schema[property].validate(req[property], {
            abortEarly: false,
            allowUnknown: false,
          });

          if (error) {
            return next(error);
          }
        }
      }
      next();
    };
  }
}

const validator = Validator.get();
export { validator as Validator };
