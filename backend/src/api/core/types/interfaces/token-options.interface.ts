import { RefreshToken } from '@prisma/client';

export interface ITokenOptions {
  password?: string;
  email: string;
  apikey?: string;
  refreshToken: Partial<RefreshToken>;
}
