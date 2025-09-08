import { User } from '@prisma/client';
import { MimeType } from '@types';

export interface IMedia {
  path: string;
  filename: string;
  size: number;
  destination: string;
  encoding?: string;
  mimetype: MimeType;
  originalname?: string;
  fieldname?: string;
  owner?: number | User | Partial<User>;
}
