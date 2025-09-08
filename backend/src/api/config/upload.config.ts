// src/config/upload.configuration.ts

import multer, { StorageEngine, FileFilterCallback } from 'multer';
import filenamify from 'filenamify';

import { existsSync, mkdirSync } from 'fs';
import { unsupportedMediaType } from '@hapi/boom';

import { UPLOAD, SCALING } from '@config/environment.config';

import {
  IUploadMulterOptions,
  IUploadOptions,
  IMedia,
  IStorage,
  IUpload,
} from '@interfaces';

import { foldername, extension, getTypeOfMedia } from '@utils/string.util';
import { FIELDNAME, IMAGE_MIME_TYPE } from '@enums';
import { list } from '@utils/enum.util';

import e, { Request } from 'express';

class UploadConfiguration {
  private static instance: UploadConfiguration;

  options: IUploadOptions = {
    destination: UPLOAD.PATH,
    maxFiles: UPLOAD.MAX_FILES,
    filesize: UPLOAD.MAX_FILE_SIZE,
    wildcards: UPLOAD.WILDCARDS,
  };

  engine = multer;

  private constructor() {}

  static get(): UploadConfiguration {
    if (!UploadConfiguration.instance) {
      UploadConfiguration.instance = new UploadConfiguration();
    }
    return UploadConfiguration.instance;
  }

  configuration(options: IUploadOptions = this.options): multer.Options {
    return {
      storage: this.storage(options.destination),
      limits: {
        fileSize: options.filesize,
      },
      fileFilter: (
        req: Request,
        file: Express.Multer.File,
        callback: FileFilterCallback
      ) => {
        if (!options?.wildcards?.includes(file.mimetype)) {
          // Pass an Error to Multer, not a Boom object
          return callback(unsupportedMediaType('File mimetype not supported'));
        }
        return callback(null, true);
      },
    };
  }

  private storage(destination = this.options.destination): StorageEngine {
    return multer.diskStorage({
      destination: (
        req: Request,
        file: Express.Multer.File,
        next: (e: Error | null, path: string) => void
      ) => {
        let path = `${destination}/${getTypeOfMedia(file.mimetype)}s`;
        if (Object.keys(IMAGE_MIME_TYPE).includes(file.mimetype)) {
          path += `/${SCALING.PATH_MASTER}`;
        }
        path += `/${file.fieldname}`;
        if (list(FIELDNAME).includes(file.fieldname) && !existsSync(path)) {
          mkdirSync(path, { recursive: true });
        }
        next(null, path);
      },
      filename: (
        req: Request,
        file: Express.Multer.File,
        next: (e: Error | null, filename: string) => void
      ) => {
        const name = filenamify(foldername(file.originalname), {
          replacement: '-',
          maxLength: 128,
        })
          .replace(/[\s_]+/g, '-')
          .toLowerCase()
          .concat('-')
          .concat(Date.now().toString())
          .concat('.')
          .concat(extension(file.originalname).toLowerCase());

        next(null, name);
      },
    });
  }
}

const configuration = UploadConfiguration.get();

export { configuration as UploadConfiguration };
