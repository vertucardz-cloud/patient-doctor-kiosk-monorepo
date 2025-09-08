import { Response } from 'express';
import { IModel } from '@interfaces';
import { UserResponseDto } from '@dtos/user.dto'
export interface IResponse extends Response {
  locals: {
    data?:
    | Record<string, unknown>
    | Record<string, unknown>[]
    | IModel
    | IModel[]
    | UserResponseDto
    | UserResponseDto[]
    | null;
    meta?: {
      total: number;
      pagination?: {
        current?: number;
        next?: number | null;
        prev?: number | null;
      };
    };
  };
}
