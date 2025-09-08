import { User } from '@prisma/client';
import { IRequest, IMedia } from '@interfaces';

/**
 * @description Custom request interface for authenticated user
 */
export interface IUserRequest extends Omit<IRequest, 'logIn' | 'files' | 'file'> {
  user?: User | Record<string, unknown>;
  logIn: (user: User, done: (err: any) => void) => void;
  file?: IMedia;
  files?: IMedia[];
  body: {
    token?: string;
    password?: string;
    passwordConfirmation?: string;
    passwordToRevoke?: string;
    isUpdatePassword: boolean;
  };
  query: {
    email?: string;
    page?: string;
    perPage?: string;
  };
}
