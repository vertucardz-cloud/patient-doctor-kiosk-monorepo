import { MulterError } from 'multer';

import { UploadConfiguration } from '@config/upload.config';
import { Media, MimeType as MIME_TYPE, Prisma as PrismaClient } from '@prisma/client';
import { IMediaRequest, IRequest, IResponse, IUploadOptions, IMedia } from '@interfaces';
import { Fieldname, MimeType } from '@types';

import { Request } from 'express';
import { Multer } from 'multer';
import { Prisma } from '@services/prisma.service';

class Uploader {
  private static instance: Uploader;

  private options: IUploadOptions;

  private constructor(options: IUploadOptions) {
    this.options = options;
  }

  static get(options: IUploadOptions): Uploader {
    if (!Uploader.instance) {
      Uploader.instance = new Uploader(options);
    }
    return Uploader.instance;
  }

  upload =
    (options?: IUploadOptions) =>
    (req: IRequest, res: IResponse, next: (error?: Error) => void): void => {
      this.options = options
        ? (Object.keys(options) as (keyof IUploadOptions)[]).reduce(
            (acc, current) => {
              const value = options[current];
              if (value !== undefined) {
                (acc as Record<string, unknown>)[current as string] = value;
              }
              return acc;
            },
            { ...this.options }
          )
        : this.options;

      if (!req || !res || !this.options) {
        return next(new Error('Middleware requirements not found'));
      }

      const middleware: Multer = UploadConfiguration.engine(UploadConfiguration.configuration(this.options));

      if (!middleware) {
        return next(new Error('Multer middleware not initialized'));
      }

      middleware.any()(req, res, (err: any) => {
        if (err) {
          return next(err instanceof MulterError ? err : new Error(err.message));
        } else if (typeof req.files === 'undefined') {
          if (req.url.includes('medias')) {
            return next(new Error('Binary data cannot be found'));
          }
          return next();
        }

        if (req.baseUrl.includes('medias')) {
          Object.keys(req.body)
            .filter((key) => key !== 'files')
            .forEach((key) => {
              delete (req.body as Record<string, unknown>)[key];
            });

          req.body.files = Array.isArray(req.files)
            ? (req.files as Express.Multer.File[]).slice(0, this.options.maxFiles).map((media: Express.Multer.File) => {
                (media as any).owner = (req as any).user?.id;
                delete (media as any).originalname;
                delete (media as any).encoding;
                delete (media as any).destination;
                return media;
              })
            : [];
        } else {
          const files = req.files as Express.Multer.File[];

          (async () => {
            for (const field of [...new Set(files.map((file) => file.fieldname))]) {
              const media = files.find((file) => file.fieldname === field);
              if (media) {
                try {
                  const data: Omit<Media, 'id' | 'caseId' | 'deletedAt'> = {
                    fieldname: media.fieldname as Fieldname,
                    filename: media.filename,
                    mimetype: media.mimetype as MIME_TYPE,
                    size: media.size,
                    path: media.path,
                    ownerId: req.user.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  };
                  const mediaData = await Prisma.client.media.create({ data });
                  (req.body as Record<string, any>)[field] = mediaData;
                } catch (createErr) {
                  return next(new Error(`Prisma create failed: ${String(createErr)}`));
                }
              }
            }
            next();
          })();
          return;
        }

        next();
      });
    };
}

const upload = Uploader.get(UploadConfiguration.options);

export { upload as Uploader };
