import { Request } from 'express';
import { User } from '@prisma/client';
import { IMedia, IRequest } from '@interfaces';

/**
 * @description Extended request for media uploads
 */
export interface IMediaRequest extends Omit<IRequest, 'file' | 'files'> {
  body: { files?: IMedia[]; file?: IMedia };
  file?: IMedia;
  files?: IMedia[];
  user?: User;
}

// export interface IMediaRequest extends Omit<IRequest, 'file' | 'files'> {
//   user?: User;
//   files?: Express.Multer.File[] | IMedia[];
//   file?: Express.Multer.File | IMedia;
//   // body: Record<string, any> | { files?: IMedia[]; file?: IMedia };
//   body: Record<string, any>;
// }
